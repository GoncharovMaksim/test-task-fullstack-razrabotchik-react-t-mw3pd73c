'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import { getAllowedTransitions } from '@/lib/transitions';
import {
  X,
  Clock,
  User,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Send,
  Trash2,
  Edit2,
} from 'lucide-react';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export function TaskModal({ task, onClose, onEdit }: TaskModalProps) {
  const { currentUser } = useAuth();
  const { transitionStatus, deleteTask } = useCRM();

  const [comment, setComment] = useState('');
  const [targetStatusForComment, setTargetStatusForComment] = useState<TaskStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager';
  const allowedTransitions = getAllowedTransitions(task, currentUser);

  const handleAction = async (targetStatus: TaskStatus) => {
    setErrorMsg(null);

    // Если переход в статус "На доработке", комментарий обязателен по ТЗ 2.3
    if (targetStatus === 'rework') {
      setTargetStatusForComment(targetStatus);
      return;
    }

    try {
      setIsSubmitting(true);
      await transitionStatus(task.id, targetStatus);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка изменения статуса');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Комментарий обязателен при возврате на доработку');
      return;
    }

    try {
      setIsSubmitting(true);
      await transitionStatus(task.id, 'rework', comment.trim());
      setTargetStatusForComment(null);
      setComment('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка возврата на доработку');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    }
  };

  const statusStyle = STATUS_COLORS[task.status];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${statusStyle.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {STATUS_LABELS[task.status]}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                #{task.id.slice(0, 8)}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">{task.title}</h2>
          </div>

          <div className="flex items-center gap-1">
            {isManager && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                    title="Редактировать задачу"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                  title="Удалить задачу"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {errorMsg && (
            <div className="p-3 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Описание задачи
            </h4>
            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 whitespace-pre-wrap leading-relaxed text-sm">
              {task.description || 'Описание отсутствует'}
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-400 block text-[11px]">Объект</span>
                <span className="font-medium text-zinc-200 truncate block">
                  {task.object_title}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
              <User className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-400 block text-[11px]">Исполнитель</span>
                <span className="font-medium text-zinc-200 truncate block">
                  {task.assignee_name || 'Не назначен'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
              <User className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-400 block text-[11px]">Автор задачи</span>
                <span className="font-medium text-zinc-200 truncate block">
                  {task.author_name}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800/80 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-zinc-400 block text-[11px]">Создана</span>
                <span className="font-medium text-zinc-200 block">
                  {new Date(task.created_at).toLocaleString('ru-RU', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="pt-2 border-t border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
              Доступные действия (по роли и текущему статусу)
            </h4>

            {allowedTransitions.length === 0 ? (
              <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 text-zinc-400 text-xs">
                {task.status === 'accepted' ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Задача успешно принята. Дальнейшие переходы запрещены.
                  </span>
                ) : (
                  <span>
                    В текущем статусе ({STATUS_LABELS[task.status]}) для вашей роли ({currentUser.role === 'manager' ? 'Постановщик' : 'Исполнитель'}) действий нет. Ожидайте действий со стороны {currentUser.role === 'manager' ? 'исполнителя' : 'руководителя'}.
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {allowedTransitions.map((status) => {
                  if (status === 'in_progress') {
                    return (
                      <button
                        key={status}
                        disabled={isSubmitting}
                        onClick={() => handleAction(status)}
                        className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Взять в работу
                      </button>
                    );
                  }
                  if (status === 'in_review') {
                    return (
                      <button
                        key={status}
                        disabled={isSubmitting}
                        onClick={() => handleAction(status)}
                        className="px-3.5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Отправить на проверку
                      </button>
                    );
                  }
                  if (status === 'accepted') {
                    return (
                      <button
                        key={status}
                        disabled={isSubmitting}
                        onClick={() => handleAction(status)}
                        className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Принять задачу
                      </button>
                    );
                  }
                  if (status === 'rework') {
                    return (
                      <button
                        key={status}
                        disabled={isSubmitting}
                        onClick={() => handleAction(status)}
                        className="px-3.5 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Вернуть на доработку (комментарий обязателен)
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Rework Comment Modal Inline Form */}
            {targetStatusForComment === 'rework' && (
              <form
                onSubmit={handleReworkSubmit}
                className="mt-4 p-4 rounded bg-zinc-950 border border-rose-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400">
                    Возврат на доработку: укажите замечания
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatusForComment(null);
                      setComment('');
                      setErrorMsg(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    Отмена
                  </button>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Обязательно укажите, что именно нужно исправить или доделать..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatusForComment(null);
                      setComment('');
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs"
                  >
                    Отменить
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs disabled:opacity-50 transition-colors"
                  >
                    Подтвердить возврат на доработку
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Immutable Task History Section */}
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>История изменений статусов</span>
              <span className="text-[11px] text-zinc-500 font-normal">
                Защищена от изменения/удаления (ТЗ 3.4)
              </span>
            </h4>

            {(!task.history || task.history.length === 0) ? (
              <div className="text-xs text-zinc-500">История отсутствует</div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
                {task.history.map((item) => (
                  <div key={item.id} className="relative pl-7 text-xs space-y-1">
                    <span className="absolute left-2 top-1.5 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-500 ring-4 ring-zinc-900" />
                    <div className="flex flex-wrap items-center gap-1.5 text-zinc-300">
                      <span className="font-medium text-zinc-200">
                        {item.changer_name || 'Пользователь'}
                      </span>
                      {item.from_status ? (
                        <>
                          <span className="text-zinc-500">перевёл из</span>
                          <span className="text-zinc-400 font-mono">
                            {STATUS_LABELS[item.from_status]}
                          </span>
                          <span className="text-zinc-500">в</span>
                          <span className="text-zinc-100 font-semibold font-mono">
                            {STATUS_LABELS[item.to_status]}
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-400">
                          создал задачу со статусом{' '}
                          <span className="text-zinc-100 font-medium font-mono">
                            {STATUS_LABELS[item.to_status]}
                          </span>
                        </span>
                      )}
                      <span className="text-zinc-500 text-[11px] ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString('ru-RU', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {item.comment && (
                      <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 text-zinc-300 text-xs italic">
                        «{item.comment}»
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
