'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { Task } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import { CheckSquare, Building2, Calendar, ArrowRight } from 'lucide-react';

interface MyTasksViewProps {
  onOpenTask: (task: Task) => void;
}

export function MyTasksView({ onOpenTask }: MyTasksViewProps) {
  const { currentUser } = useAuth();
  const { tasks } = useCRM();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!currentUser) return null;

  // Исполнитель видит только свои задачи
  const myTasks = tasks.filter((t) => t.assignee_id === currentUser.id);

  const filteredTasks = myTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const countByStatus = {
    all: myTasks.length,
    new: myTasks.filter((t) => t.status === 'new').length,
    in_progress: myTasks.filter((t) => t.status === 'in_progress').length,
    in_review: myTasks.filter((t) => t.status === 'in_review').length,
    rework: myTasks.filter((t) => t.status === 'rework').length,
    accepted: myTasks.filter((t) => t.status === 'accepted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-zinc-400" />
          Мои задачи
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Задачи, назначенные на вас: {currentUser.full_name}. Выполняйте работы и отправляйте результаты на проверку руководителю.
        </p>
      </div>

      {/* Filter Tabs with Badges */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-800 pb-3">
        {[
          { id: 'all', label: 'Все', count: countByStatus.all },
          { id: 'in_progress', label: 'В работе', count: countByStatus.in_progress },
          { id: 'rework', label: 'На доработке', count: countByStatus.rework },
          { id: 'new', label: 'Новые', count: countByStatus.new },
          { id: 'in_review', label: 'На проверке', count: countByStatus.in_review },
          { id: 'accepted', label: 'Принятые', count: countByStatus.accepted },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterStatus === tab.id
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === tab.id ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center rounded border border-zinc-800 bg-zinc-900/40">
          <CheckSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-zinc-300">Нет задач в этой категории</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Все задачи по выбранному статусу выполнены или еще не назначены.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const statusConfig = STATUS_COLORS[task.status];
            return (
              <div
                key={task.id}
                onClick={() => onOpenTask(task)}
                className="group p-4 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-850 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${statusConfig.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      {task.object_title}
                    </span>
                  </div>

                  <h3 className="font-semibold text-zinc-100 text-sm group-hover:text-white transition-colors truncate">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-xs">
                  <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(task.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>

                  <span className="text-zinc-400 group-hover:text-zinc-100 font-medium flex items-center gap-1 text-xs">
                    Действие <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
