import { BuildingObject, Task, TaskHistoryItem, TaskStatus, UserProfile } from '@/types';
import { DEMO_USERS } from './constants';
import { validateTransition } from './transitions';

const STORAGE_KEY_OBJECTS = 'stroycrm_objects_v1';
const STORAGE_KEY_TASKS = 'stroycrm_tasks_v1';
const STORAGE_KEY_HISTORY = 'stroycrm_history_v1';

export const INITIAL_OBJECTS: BuildingObject[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'ЖК «Северные Высоты»',
    address: 'г. Москва, ул. Ленина, д. 45, корп. 2',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'ТЦ «Атриум Плаза»',
    address: 'г. Москва, пр-т Мира, д. 12',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'КП «Дубрава»',
    address: 'Московская обл., д. Новая, уч. 7',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1111111-1111-1111-1111-111111111111',
    object_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Монтаж силового кабеля и щитовой',
    description: 'Проложить силовой кабель 3x2.5 по лоткам на 2 этаже и собрать распределительный щит ЩР-2.',
    status: 'in_progress',
    assignee_id: '33333333-3333-3333-3333-333333333333',
    author_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 't2222222-2222-2222-2222-222222222222',
    object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Штукатурка стен 3 этажа',
    description: 'Выполнить маячную штукатурку гипсовым раствором в коридорах и квартирах 31-36.',
    status: 'in_review',
    assignee_id: '22222222-2222-2222-2222-222222222222',
    author_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 't3333333-3333-3333-3333-333333333333',
    object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Установка сантехнических стояков',
    description: 'Монтаж стояков ГВС и ХВС в санузлах секции 1.',
    status: 'rework',
    assignee_id: '22222222-2222-2222-2222-222222222222',
    author_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 't4444444-4444-4444-4444-444444444444',
    object_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Черновая стяжка пола',
    description: 'Заливка полусухой стяжки по маякам толщиной 70 мм с демпферной лентой.',
    status: 'accepted',
    assignee_id: '22222222-2222-2222-2222-222222222222',
    author_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 't5555555-5555-5555-5555-555555555555',
    object_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Слаботочные сети и видеонаблюдение',
    description: 'Прокладка витой пары FTP cat 5e к точкам установки купольных камер.',
    status: 'new',
    assignee_id: '33333333-3333-3333-3333-333333333333',
    author_id: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export const INITIAL_HISTORY: TaskHistoryItem[] = [
  {
    id: 'h1',
    task_id: 't1111111-1111-1111-1111-111111111111',
    from_status: null,
    to_status: 'new',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Создание задачи',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'h2',
    task_id: 't1111111-1111-1111-1111-111111111111',
    from_status: 'new',
    to_status: 'in_progress',
    changed_by: '33333333-3333-3333-3333-333333333333',
    comment: 'Приступил к прокладке кабеля',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'h3',
    task_id: 't2222222-2222-2222-2222-222222222222',
    from_status: null,
    to_status: 'new',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Создание задачи',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'h4',
    task_id: 't2222222-2222-2222-2222-222222222222',
    from_status: 'new',
    to_status: 'in_progress',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Штукатурная станция доставлена, начали работы',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'h5',
    task_id: 't2222222-2222-2222-2222-222222222222',
    from_status: 'in_progress',
    to_status: 'in_review',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Штукатурка завершена, стены просушены, готовы к осмотру',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'h6',
    task_id: 't3333333-3333-3333-3333-333333333333',
    from_status: null,
    to_status: 'new',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Создание задачи',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'h7',
    task_id: 't3333333-3333-3333-3333-333333333333',
    from_status: 'new',
    to_status: 'in_progress',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Монтаж начат',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'h8',
    task_id: 't3333333-3333-3333-3333-333333333333',
    from_status: 'in_progress',
    to_status: 'in_review',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Стояки смонтированы, прошу проверить',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'h9',
    task_id: 't3333333-3333-3333-3333-333333333333',
    from_status: 'in_review',
    to_status: 'rework',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Требуется дополнительная гидроизоляция проходов перекрытий перед сдачей',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'h10',
    task_id: 't4444444-4444-4444-4444-444444444444',
    from_status: null,
    to_status: 'new',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Создание задачи',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'h11',
    task_id: 't4444444-4444-4444-4444-444444444444',
    from_status: 'new',
    to_status: 'in_progress',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Начали заливку стяжки',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'h12',
    task_id: 't4444444-4444-4444-4444-444444444444',
    from_status: 'in_progress',
    to_status: 'in_review',
    changed_by: '22222222-2222-2222-2222-222222222222',
    comment: 'Стяжка набрала прочность, плоскость проверена',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'h13',
    task_id: 't4444444-4444-4444-4444-444444444444',
    from_status: 'in_review',
    to_status: 'accepted',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Отличная работа, перепады в пределах допуска',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'h14',
    task_id: 't5555555-5555-5555-5555-555555555555',
    from_status: null,
    to_status: 'new',
    changed_by: '11111111-1111-1111-1111-111111111111',
    comment: 'Создание задачи',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export class CRMStore {
  private objects: BuildingObject[];
  private tasks: Task[];
  private history: TaskHistoryItem[];

  constructor(isMock = false) {
    if (typeof window !== 'undefined' && !isMock) {
      const storedObjects = localStorage.getItem(STORAGE_KEY_OBJECTS);
      const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

      this.objects = storedObjects ? JSON.parse(storedObjects) : [...INITIAL_OBJECTS];
      this.tasks = storedTasks ? JSON.parse(storedTasks) : [...INITIAL_TASKS];
      this.history = storedHistory ? JSON.parse(storedHistory) : [...INITIAL_HISTORY];
    } else {
      this.objects = JSON.parse(JSON.stringify(INITIAL_OBJECTS));
      this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
      this.history = JSON.parse(JSON.stringify(INITIAL_HISTORY));
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_OBJECTS, JSON.stringify(this.objects));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history));
    }
  }

  public resetToDefaults(): void {
    this.objects = JSON.parse(JSON.stringify(INITIAL_OBJECTS));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.history = JSON.parse(JSON.stringify(INITIAL_HISTORY));
    this.save();
  }

  // --- RLS-защищенное получение объектов ---
  public getObjects(user: UserProfile): BuildingObject[] {
    if (user.role === 'manager') {
      return this.objects.map((obj) => ({
        ...obj,
        tasks_count: this.tasks.filter((t) => t.object_id === obj.id).length,
      }));
    }

    // Исполнитель видит только те объекты, в которых у него есть назначенные задачи
    const userTaskObjectIds = new Set(
      this.tasks.filter((t) => t.assignee_id === user.id).map((t) => t.object_id)
    );

    return this.objects
      .filter((obj) => userTaskObjectIds.has(obj.id))
      .map((obj) => ({
        ...obj,
        tasks_count: this.tasks.filter(
          (t) => t.object_id === obj.id && t.assignee_id === user.id
        ).length,
      }));
  }

  public getObjectById(id: string, user: UserProfile): BuildingObject | null {
    const list = this.getObjects(user);
    return list.find((o) => o.id === id) || null;
  }

  // --- Управление объектами (Только для постановщика) ---
  public createObject(data: { title: string; address: string }, user: UserProfile): BuildingObject {
    if (user.role !== 'manager') {
      throw new Error('Только постановщик может создавать объекты');
    }
    const newObj: BuildingObject = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      address: data.address.trim(),
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.objects.unshift(newObj);
    this.save();
    return newObj;
  }

  public updateObject(
    id: string,
    data: { title?: string; address?: string },
    user: UserProfile
  ): BuildingObject {
    if (user.role !== 'manager') {
      throw new Error('Только постановщик может редактировать объекты');
    }
    const index = this.objects.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Объект не найден');

    this.objects[index] = {
      ...this.objects[index],
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.address ? { address: data.address.trim() } : {}),
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.objects[index];
  }

  public deleteObject(id: string, user: UserProfile): void {
    if (user.role !== 'manager') {
      throw new Error('Только постановщик может удалять объекты');
    }
    this.objects = this.objects.filter((o) => o.id !== id);
    // Каскадное удаление задач
    this.tasks = this.tasks.filter((t) => t.object_id !== id);
    this.save();
  }

  // --- RLS-защищенное получение задач ---
  public getTasks(user: UserProfile, objectId?: string): Task[] {
    let allowed = this.tasks;

    if (user.role === 'assignee') {
      allowed = allowed.filter((t) => t.assignee_id === user.id);
    }

    if (objectId) {
      allowed = allowed.filter((t) => t.object_id === objectId);
    }

    return allowed.map((t) => this.hydrateTask(t));
  }

  public getTaskById(id: string, user: UserProfile): Task | null {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;

    if (user.role === 'assignee' && task.assignee_id !== user.id) {
      return null; // RLS: Исполнитель не может прочитать чужую задачу
    }

    return this.hydrateTask(task);
  }

  private hydrateTask(task: Task): Task {
    const object = this.objects.find((o) => o.id === task.object_id);
    const assignee = DEMO_USERS.find((u) => u.id === task.assignee_id);
    const author = DEMO_USERS.find((u) => u.id === task.author_id);
    const taskHistory = this.history
      .filter((h) => h.task_id === task.id)
      .map((h) => {
        const changer = DEMO_USERS.find((u) => u.id === h.changed_by);
        return {
          ...h,
          changer_name: changer ? changer.full_name : 'Система',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...task,
      object_title: object ? object.title : 'Неизвестный объект',
      assignee_name: assignee ? assignee.full_name : 'Не назначен',
      author_name: author ? author.full_name : 'Неизвестный автор',
      history: taskHistory,
    };
  }

  // --- Создание задачи (Только для Постановщика, статус строго 'new') ---
  public createTask(
    data: {
      object_id: string;
      title: string;
      description?: string;
      assignee_id?: string | null;
    },
    user: UserProfile
  ): Task {
    if (user.role !== 'manager') {
      throw new Error('Только постановщик может создавать задачи');
    }

    const object = this.objects.find((o) => o.id === data.object_id);
    if (!object) {
      throw new Error('Указанный объект не существует');
    }

    const taskId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newTask: Task = {
      id: taskId,
      object_id: data.object_id,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      status: 'new', // Начальный статус строго "Новая"
      assignee_id: data.assignee_id || null,
      author_id: user.id,
      created_at: now,
      updated_at: now,
    };

    this.tasks.unshift(newTask);

    // Автоматическая фиксация в истории создания задачи
    const initialHistoryItem: TaskHistoryItem = {
      id: crypto.randomUUID(),
      task_id: taskId,
      from_status: null,
      to_status: 'new',
      changed_by: user.id,
      comment: 'Создание задачи',
      created_at: now,
    };
    this.history.unshift(initialHistoryItem);

    this.save();
    return this.hydrateTask(newTask);
  }

  // --- Редактирование параметров задачи (Только Постановщик) ---
  public updateTaskDetails(
    id: string,
    data: {
      title?: string;
      description?: string;
      assignee_id?: string | null;
      object_id?: string;
    },
    user: UserProfile
  ): Task {
    if (user.role !== 'manager') {
      throw new Error('Только постановщик имеет право редактировать параметры задачи');
    }
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Задача не найдена');

    this.tasks[index] = {
      ...this.tasks[index],
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(data.assignee_id !== undefined ? { assignee_id: data.assignee_id } : {}),
      ...(data.object_id ? { object_id: data.object_id } : {}),
      updated_at: new Date().toISOString(),
    };

    this.save();
    return this.hydrateTask(this.tasks[index]);
  }

  // --- Удаление задачи (Только Постановщик) ---
  public deleteTask(id: string, user: UserProfile): void {
    if (user.role !== 'manager') {
      throw new Error('Только постановщик имеет право удалять задачи');
    }
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.history = this.history.filter((h) => h.task_id !== id);
    this.save();
  }

  // --- Переход статуса задачи со строгой валидацией и логированием истории ---
  public transitionTaskStatus(
    id: string,
    targetStatus: TaskStatus,
    user: UserProfile,
    comment?: string | null
  ): Task {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Задача не найдена');

    const currentTask = this.tasks[index];

    // RLS: Исполнитель не может изменять чужую задачу
    if (user.role === 'assignee' && currentTask.assignee_id !== user.id) {
      throw new Error('Запрещено изменять статус задачи другого исполнителя');
    }

    // Проверка бизнес-правил переходов
    const validation = validateTransition(currentTask, targetStatus, user, comment);
    if (!validation.allowed) {
      throw new Error(validation.reason || 'Запрещенный переход статуса');
    }

    const previousStatus = currentTask.status;
    const now = new Date().toISOString();

    // Обновляем статус
    this.tasks[index] = {
      ...currentTask,
      status: targetStatus,
      updated_at: now,
    };

    // Автоматическая неизменяемая запись в историю
    const historyItem: TaskHistoryItem = {
      id: crypto.randomUUID(),
      task_id: id,
      from_status: previousStatus,
      to_status: targetStatus,
      changed_by: user.id,
      comment: comment ? comment.trim() : null,
      created_at: now,
    };
    this.history.unshift(historyItem);

    this.save();
    return this.hydrateTask(this.tasks[index]);
  }
}

let storeInstance: CRMStore | null = null;

export function getCRMStore(): CRMStore {
  if (!storeInstance) {
    storeInstance = new CRMStore();
  }
  return storeInstance;
}
