'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { BuildingObject } from '@/types';
import { X, Edit3 } from 'lucide-react';

interface EditObjectModalProps {
  object: BuildingObject;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditObjectModal({ object, onClose, onSuccess }: EditObjectModalProps) {
  const { updateObject } = useCRM();
  const [title, setTitle] = useState(object.title);
  const [address, setAddress] = useState(object.address);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !address.trim()) {
      setErrorMsg('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateObject(object.id, title, address);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ошибка обновления объекта');
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md shadow-2xl text-zinc-100 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-zinc-400" />
            Редактировать объект
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
              Название объекта <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Адрес объекта <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
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
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
