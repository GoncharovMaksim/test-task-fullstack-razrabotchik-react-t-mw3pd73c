'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { BuildingObject, Task } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Plus,
  CheckSquare,
  User,
  Calendar,
  Edit3,
  Trash2,
} from 'lucide-react';

interface ObjectDetailViewProps {
  objectId: string;
  onBack: () => void;
  onCreateTask: (objectId: string) => void;
  onEditObject: (object: BuildingObject) => void;
  onOpenTask: (task: Task) => void;
}

export function ObjectDetailView({
  objectId,
  onBack,
  onCreateTask,
  onEditObject,
  onOpenTask,
}: ObjectDetailViewProps) {
  const { currentUser } = useAuth();
  const { objects, tasks, deleteObject } = useCRM();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!currentUser) return null;

  const currentObject = objects.find((o) => o.id === objectId);
  const isManager = currentUser.role === 'manager';

  if (!currentObject) {
    return (
      <div className="p-8 text-center rounded border border-zinc-800 bg-zinc-900/50">
        <Building2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-zinc-300">Объект не найден или нет доступа</h3>
        <p className="text-xs text-zinc-500 mt-1 mb-4">
          Возможно, объект был удален или у вашей учетной записи нет назначенных задач на этом объекте.
        </p>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
        >
          Вернуться к объектам
        </button>
      </div>
    );
  }

  const objectTasks = tasks.filter((t) => t.object_id === objectId);
  const filteredTasks = objectTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const handleDeleteObject = async () => {
    if (confirm(`Удалить объект «${currentObject.title}» и все связанные задачи?`)) {
      await deleteObject(currentObject.id);
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <button
          onClick={onBack}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Назад ко всем объектам
        </button>

        {/* Object Header Card */}
        <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Строительный объект
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-mono">
                #{currentObject.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100">{currentObject.title}</h1>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{currentObject.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isManager && (
              <>
                <button
                  onClick={() => onEditObject(currentObject)}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Изменить
                </button>
                <button
                  onClick={handleDeleteObject}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-rose-950/80 border border-zinc-700 hover:border-rose-800 text-zinc-300 hover:text-rose-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Удалить
                </button>
                <button
                  onClick={() => onCreateTask(currentObject.id)}
                  className="px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Создать задачу
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs for Object's Tasks */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zinc-400 font-medium mr-2">Статус:</span>
          {[
            { id: 'all', label: 'Все' },
            { id: 'new', label: 'Новые' },
            { id: 'in_progress', label: 'В работе' },
            { id: 'in_review', label: 'На проверке' },
            { id: 'rework', label: 'На доработке' },
            { id: 'accepted', label: 'Принятые' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterStatus === tab.id
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500">
          Задач в списке: <strong className="text-zinc-300">{filteredTasks.length}</strong>
        </span>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center rounded border border-zinc-800 bg-zinc-900/40">
          <CheckSquare className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-zinc-300">Задач пока нет</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {isManager
              ? 'Нажмите «Создать задачу», чтобы поставить новую задачу по этому объекту.'
              : 'По этому объекту у вас нет назначенных задач в выбранном фильтре.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const statusConfig = STATUS_COLORS[task.status];
            return (
              <div
                key={task.id}
                onClick={() => onOpenTask(task)}
                className="group p-4 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-850 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${statusConfig.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      #{task.id.slice(0, 8)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-white transition-colors truncate">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-300 font-medium">
                      {task.assignee_name || 'Не назначен'}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-zinc-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(task.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
