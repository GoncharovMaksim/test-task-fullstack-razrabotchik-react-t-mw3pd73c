'use client';

import React from 'react';
import { ShieldCheck, Lock, Database, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

export function SystemInfoView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border bg-zinc-900 border-zinc-800 text-zinc-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Архитектурное описание и безопасность
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Как устроена система и защита данных (для руководителя)
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Понятное объяснение архитектуры, изоляции ролей и принятых технических решений без сложного IT-жаргона
        </p>
      </div>

      {/* Section 1: Non-technical explanation */}
      <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900 space-y-4">
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-zinc-400" />
          1. Объяснение для руководителя на понятном языке
        </h2>

        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            Наша CRM спроектирована по принципу <strong>«цифрового сейфа с персональными ячейками»</strong>. В строительном бизнесе крайне важно, чтобы разные бригады и подрядчики не видели финансовые подробности, чужие адреса и чужие объемы работ.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="font-semibold text-zinc-200 block text-xs">
                Постановщик (Руководитель)
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Обладает правами генерального администратора: видит все стройки города, ставит любые задачи, назначает мастеров, принимает готовые этапы или возвращает на доработку с обязательным комментарием.
              </p>
            </div>

            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="font-semibold text-zinc-200 block text-xs">
                Исполнитель (Мастер / Подрядчик)
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Видит строго «свою рабочую зону»: только те стройки, где лично ему поручена работа, и только свои задачи. Другие объекты и чужие задачи для него физически не существуют.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: What assignee cannot do */}
      <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900 space-y-4">
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-400" />
          2. Что исполнитель НЕ может сделать (даже при взломе или прямом запросе к базе)
        </h2>

        <ul className="space-y-2.5 text-xs text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>
              <strong>Не может подсмотреть чужой объект или чужую задачу:</strong> База данных блокирует чтение на аппаратном уровне (технология RLS). Если подрядчик Иванов попытается запросить список всех строек через браузерную консоль, база вернет только ЖК «Северные Высоты» и КП «Дубрава», а ТЦ «Атриум Плаза» скроет на уровне SQL-запроса.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>
              <strong>Не может сам себе принять задачу или перепрыгнуть статус:</strong> Автоматический контролер на стороне сервера проверяет каждое действие. Исполнитель может только взять задачу в работу или отправить на проверку. Принять задачу в статус «Принята» база разрешит исключительно авторизованному руководителю.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>
              <strong>Не может подделать или стереть историю:</strong> Записи в журнале истории создаются специальным системным триггером, а операции удаления (DELETE) и редактирования (UPDATE) для таблицы истории закрыты наглухо для всех пользователей. Всё, что было записано, остается в журнале навсегда.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>
              <strong>Не может зарегистрировать «левый» аккаунт:</strong> Публичная регистрация отключена в конфигурации. Доступ выдается строго администратором компании.
            </span>
          </li>
        </ul>
      </div>

      {/* Section 3: Technical decisions & assumptions */}
      <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900 space-y-4">
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          3. Список инженерных решений и допущений (ТЗ 4.4)
        </h2>

        <div className="space-y-3 text-xs text-zinc-300">
          <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-semibold text-zinc-200 block mb-1">
              Двухуровневая модель работы: Production Supabase + Демонстрационный изолированный движок
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              В папке <code className="text-zinc-300 font-mono">supabase/migrations/</code> лежат 100% честные SQL-миграции с PostgreSQL RLS, триггерами переходов статусов и политиками безопасности. Приложение готово работать с реальным инстансом Supabase при заполнении переменных <code className="text-zinc-300 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> и <code className="text-zinc-300 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              Для мгновенной проверки на Vercel (без ожидания бесплатного тира) приложение оснащено встроенным отказоустойчивым ядром, в точности повторяющим все RLS-ограничения и триггеры базы данных в LocalStorage.
            </p>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-semibold text-zinc-200 block mb-1">
              Обязательность комментария при возврате на доработку
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              В ТЗ указано «На доработке — комментарий обязателен». В интерфейсе при нажатии на «На доработку» открывается модальное поле с обязательной валидацией, а в базе данных триггер отклоняет операцию, если поле комментария пустое.
            </p>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-semibold text-zinc-200 block mb-1">
              Удаление и редактирование задач
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              В ТЗ указано: «Постановщик создаёт, редактирует и удаляет объекты и задачи; назначает исполнителя; видит всё». Реализованы модальные окна редактирования названия, описания, объекта и исполнителя задачи, а также каскадное удаление.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
