'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { DEMO_USERS } from '@/lib/constants';
import { X, CheckSquare } from 'lucide-react';

interface CreateTaskModalProps {
  initialObjectId?: string | null;
  onClose: () => void;
  onSuccess: (taskId: string) => void;
}

export function CreateTaskModal({ initialObjectId, onClose, onSuccess }: CreateTaskModalProps) {
  const { objects, createTask } = useCRM();

  const [objectId, setObjectId] = useState(initialObjectId || (objects[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Список исполнителей для назначения
  const assignees = DEMO_USERS.filter((u) => u.role === 'assignee');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !objectId) {
      setErrorMsg('Пожалуйста, выберите объект и укажите название задачи');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createTask({
        object_id: objectId,
        title: title.trim(),
        description: description.trim(),
        assignee_id: assigneeId || null,
      });
      onSuccess(created.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка создания задачи');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl text-zinc-100 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-zinc-400" />
            Новая задача
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Объект (Стройка) <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-600"
            >
              <option value="" disabled>
                Выберите объект...
              </option>
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.title} ({obj.address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Название задачи <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Монтаж электрощита 1 этажа"
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Описание задачи
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробности, требования, примечания к выполнению..."
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Назначить исполнителя
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-600"
            >
              <option value="">Без исполнителя (назначить позже)</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Исполнитель увидит этот объект и задачу в своём кабинете сразу после назначения.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Создание...' : 'Создать задачу (Новая)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
