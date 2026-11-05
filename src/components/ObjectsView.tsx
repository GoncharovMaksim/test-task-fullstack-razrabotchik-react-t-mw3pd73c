'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { BuildingObject } from '@/types';
import { Building2, Plus, MapPin, Search, ChevronRight, Edit3, Trash2 } from 'lucide-react';

interface ObjectsViewProps {
  onSelectObject: (id: string) => void;
  onCreateObject: () => void;
  onEditObject: (object: BuildingObject) => void;
}

export function ObjectsView({ onSelectObject, onCreateObject, onEditObject }: ObjectsViewProps) {
  const { currentUser } = useAuth();
  const { objects, deleteObject } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager';

  const filteredObjects = objects.filter(
    (obj) =>
      obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, obj: BuildingObject) => {
    e.stopPropagation();
    if (confirm(`Удалить объект «${obj.title}» и все его задачи?`)) {
      await deleteObject(obj.id);
    }
  };

  const handleEdit = (e: React.MouseEvent, obj: BuildingObject) => {
    e.stopPropagation();
    onEditObject(obj);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-zinc-400" />
            Объекты (Стройки)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isManager
              ? 'Полный список всех строительных площадок и проектов компании'
              : 'Объекты, на которых у вас есть назначенные задачи (согласно RLS)'}
          </p>
        </div>

        {isManager && (
          <button
            onClick={onCreateObject}
            className="px-4 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Создать объект
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию или адресу..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {/* Objects Grid / List */}
      {filteredObjects.length === 0 ? (
        <div className="p-8 text-center rounded border border-zinc-800 bg-zinc-900/50">
          <Building2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-zinc-300">
            {searchQuery ? 'Объекты не найдены' : 'Список объектов пуст'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {isManager
              ? 'Создайте первый строительный объект, нажав кнопку «Создать объект» выше.'
              : 'У вас пока нет задач на строительных объектах. Когда руководитель назначит вам задачу, объект отобразится здесь.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onSelectObject(obj.id)}
              className="group p-5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-850 cursor-pointer transition-all flex flex-col justify-between shadow-sm relative"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-zinc-100 text-sm group-hover:text-white transition-colors">
                    {obj.title}
                  </h3>
                  {isManager && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleEdit(e, obj)}
                        className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800"
                        title="Редактировать объект"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, obj)}
                        className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800"
                        title="Удалить объект"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-zinc-400 flex items-start gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{obj.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  Задач: <strong className="text-zinc-300 font-semibold">{obj.tasks_count || 0}</strong>
                </span>
                <span className="text-zinc-400 group-hover:text-zinc-200 flex items-center gap-1 font-medium transition-colors">
                  Открыть <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
