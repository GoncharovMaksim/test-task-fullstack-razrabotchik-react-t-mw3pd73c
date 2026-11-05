-- ============================================================================
-- Мини-CRM «Объекты и задачи» для строительной компании (2B Studio)
-- Схема базы данных PostgreSQL + Supabase RLS, триггеры и безопасность
-- ============================================================================

-- 1. Пользовательские типы и перечисления (Enums)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('manager', 'assignee');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('new', 'in_progress', 'in_review', 'accepted', 'rework');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Таблица профилей пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'assignee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Функция проверки текущей роли пользователя (SECURITY DEFINER для предотвращения рекурсии)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS для profiles:
-- Постановщик видит всех пользователей (чтобы назначать исполнителей).
-- Исполнитель видит свой профиль и профили постановщиков/коллег по своим задачам.
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
CREATE POLICY "Profiles read policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Таблица объектов (строек)
CREATE TABLE IF NOT EXISTS public.objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;

-- 4. Таблица задач
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES public.objects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status task_status NOT NULL DEFAULT 'new',
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  rework_comment TEXT, -- Временное поле для комментария при отправке на доработку
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Таблица истории статусов задач
CREATE TABLE IF NOT EXISTS public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  from_status task_status,
  to_status task_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ПОЛИТИКИ ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- ОБЪЕКТЫ:
-- Постановщик видит все объекты.
-- Исполнитель видит ТОЛЬКО объекты, в которых у него есть назначенные задачи.
DROP POLICY IF EXISTS "Objects select policy" ON public.objects;
CREATE POLICY "Objects select policy" ON public.objects
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() = 'manager'
    OR
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE public.tasks.object_id = public.objects.id
        AND public.tasks.assignee_id = auth.uid()
    )
  );

-- Изменять, создавать и удалять объекты может только Постановщик
DROP POLICY IF EXISTS "Objects insert policy" ON public.objects;
CREATE POLICY "Objects insert policy" ON public.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'manager');

DROP POLICY IF EXISTS "Objects update policy" ON public.objects;
CREATE POLICY "Objects update policy" ON public.objects
  FOR UPDATE
  TO authenticated
  USING (public.get_current_user_role() = 'manager')
  WITH CHECK (public.get_current_user_role() = 'manager');

DROP POLICY IF EXISTS "Objects delete policy" ON public.objects;
CREATE POLICY "Objects delete policy" ON public.objects
  FOR DELETE
  TO authenticated
  USING (public.get_current_user_role() = 'manager');

-- ЗАДАЧИ:
-- Постановщик видит всё.
-- Исполнитель видит ТОЛЬКО свои задачи.
DROP POLICY IF EXISTS "Tasks select policy" ON public.tasks;
CREATE POLICY "Tasks select policy" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() = 'manager'
    OR
    public.tasks.assignee_id = auth.uid()
  );

-- Создавать задачи может ТОЛЬКО Постановщик, статус при создании строго 'new'
DROP POLICY IF EXISTS "Tasks insert policy" ON public.tasks;
CREATE POLICY "Tasks insert policy" ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() = 'manager'
    AND NEW.status = 'new'
  );

-- Обновлять задачи: Постановщик или назначенный Исполнитель (валидация переходов на триггере)
DROP POLICY IF EXISTS "Tasks update policy" ON public.tasks;
CREATE POLICY "Tasks update policy" ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() = 'manager'
    OR
    public.tasks.assignee_id = auth.uid()
  )
  WITH CHECK (
    public.get_current_user_role() = 'manager'
    OR
    public.tasks.assignee_id = auth.uid()
  );

-- Удалять задачи может ТОЛЬКО Постановщик
DROP POLICY IF EXISTS "Tasks delete policy" ON public.tasks;
CREATE POLICY "Tasks delete policy" ON public.tasks
  FOR DELETE
  TO authenticated
  USING (public.get_current_user_role() = 'manager');

-- ИСТОРИЯ ЗАДАЧ:
-- Чтение доступно обеим ролям, но строго для тех задач, к которым есть доступ
DROP POLICY IF EXISTS "Task history select policy" ON public.task_history;
CREATE POLICY "Task history select policy" ON public.task_history
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() = 'manager'
    OR
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE public.tasks.id = public.task_history.task_id
        AND public.tasks.assignee_id = auth.uid()
    )
  );

-- Историю статусов ЗАПРЕЩЕНО изменять или удалять через API (политики USING(false))
DROP POLICY IF EXISTS "Task history no direct insert" ON public.task_history;
CREATE POLICY "Task history no direct insert" ON public.task_history
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Task history no update" ON public.task_history;
CREATE POLICY "Task history no update" ON public.task_history
  FOR UPDATE
  TO authenticated
  USING (false);

DROP POLICY IF EXISTS "Task history no delete" ON public.task_history;
CREATE POLICY "Task history no delete" ON public.task_history
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- БИЗНЕС-ЛОГИКА И ТРИГГЕРЫ НА СТОРОНЕ БАЗЫ ДАННЫХ
-- ============================================================================

-- Триггер проверки переходов статусов задачи
CREATE OR REPLACE FUNCTION public.validate_task_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role user_role;
  v_caller_id UUID;
BEGIN
  -- Если статус не менялся, переход не проверяем
  IF OLD.status = NEW.status THEN
    NEW.updated_at = NOW();
    RETURN NEW;
  END IF;

  v_caller_id := auth.uid();
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;

  -- Исполнитель не может менять поля кроме статуса (и rework_comment)
  IF v_caller_role = 'assignee' THEN
    IF OLD.title <> NEW.title OR OLD.description <> NEW.description OR OLD.object_id <> NEW.object_id OR OLD.assignee_id <> NEW.assignee_id THEN
      RAISE EXCEPTION 'Исполнитель не имеет права редактировать параметры задачи (название, описание, объект, исполнителя)';
    END IF;
  END IF;

  -- Проверка разрешенных переходов по ТЗ:
  -- 1) 'new' -> 'in_progress': только назначенный исполнитель
  IF OLD.status = 'new' AND NEW.status = 'in_progress' THEN
    IF v_caller_id IS NULL OR v_caller_id <> OLD.assignee_id THEN
      RAISE EXCEPTION 'Перевод из статуса "Новая" в "В работе" разрешен только назначенному исполнителю';
    END IF;

  -- 2) 'in_progress' -> 'in_review': только назначенный исполнитель
  ELSIF OLD.status = 'in_progress' AND NEW.status = 'in_review' THEN
    IF v_caller_id IS NULL OR v_caller_id <> OLD.assignee_id THEN
      RAISE EXCEPTION 'Перевод из статуса "В работе" в "На проверке" разрешен только назначенному исполнителю';
    END IF;

  -- 3) 'in_review' -> 'accepted': только постановщик
  ELSIF OLD.status = 'in_review' AND NEW.status = 'accepted' THEN
    IF v_caller_role <> 'manager' THEN
      RAISE EXCEPTION 'Прием задачи разрешен только постановщику';
    END IF;

  -- 4) 'in_review' -> 'rework': только постановщик, комментарий обязателен!
  ELSIF OLD.status = 'in_review' AND NEW.status = 'rework' THEN
    IF v_caller_role <> 'manager' THEN
      RAISE EXCEPTION 'Возврат на доработку разрешен только постановщику';
    END IF;
    IF NEW.rework_comment IS NULL OR length(trim(NEW.rework_comment)) = 0 THEN
      RAISE EXCEPTION 'Для возврата на доработку комментарий обязателен';
    END IF;

  -- 5) 'rework' -> 'in_progress': только назначенный исполнитель
  ELSIF OLD.status = 'rework' AND NEW.status = 'in_progress' THEN
    IF v_caller_id IS NULL OR v_caller_id <> OLD.assignee_id THEN
      RAISE EXCEPTION 'Взять задачу в работу после доработки может только назначенный исполнитель';
    END IF;

  -- Все остальные переходы категорически запрещены
  ELSE
    RAISE EXCEPTION 'Запрещенный переход статуса: % -> % (пользователь: %, роль: %)',
      OLD.status, NEW.status, v_caller_id, v_caller_role;
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_task_status_transition ON public.tasks;
CREATE TRIGGER trg_validate_task_status_transition
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_status_transition();

-- Автоматическое добавление записи в историю при смене статуса (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_task_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_comment TEXT;
BEGIN
  v_user_id := COALESCE(auth.uid(), NEW.author_id);

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.task_history (task_id, from_status, to_status, changed_by, comment, created_at)
    VALUES (NEW.id, NULL, NEW.status, v_user_id, 'Создание задачи', NOW());
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status <> NEW.status THEN
      v_comment := NEW.rework_comment;
      INSERT INTO public.task_history (task_id, from_status, to_status, changed_by, comment, created_at)
      VALUES (NEW.id, OLD.status, NEW.status, v_user_id, v_comment, NOW());
      NEW.rework_comment = NULL; -- сбрасываем комментарий после записи
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_task_history_insert ON public.tasks;
CREATE TRIGGER trg_log_task_history_insert
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_task_history();

DROP TRIGGER IF EXISTS trg_log_task_history_update ON public.tasks;
CREATE TRIGGER trg_log_task_history_update
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_task_history();
