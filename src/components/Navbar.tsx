'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { DEMO_USERS, ROLE_LABELS } from '@/lib/constants';
import { Building2, CheckSquare, ShieldCheck, LogOut, RotateCcw, UserCheck, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentTab: 'objects' | 'my-tasks' | 'info';
  setCurrentTab: (tab: 'objects' | 'my-tasks' | 'info') => void;
}

export function Navbar({ currentTab, setCurrentTab }: NavbarProps) {
  const { currentUser, switchUser, logout } = useAuth();
  const { resetDatabase, setSelectedObjectId } = useCRM();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  if (!currentUser) return null;

  const isAssignee = currentUser.role === 'assignee';

  const handleReset = () => {
    if (confirm('Сбросить базу данных к исходным демонстрационным данным?')) {
      resetDatabase();
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => {
              setSelectedObjectId(null);
              setCurrentTab('objects');
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-100 text-sm">
              2B
            </div>
            <div>
              <span className="font-semibold text-zinc-100 text-sm tracking-tight block">
                СтройCRM
              </span>
              <span className="text-[10px] text-zinc-400 block -mt-0.5">
                Объекты и задачи
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedObjectId(null);
                setCurrentTab('objects');
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'objects'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Объекты
            </button>

            {isAssignee && (
              <button
                onClick={() => setCurrentTab('my-tasks')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'my-tasks'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Мои задачи
              </button>
            )}

            <button
              onClick={() => setCurrentTab('info')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'info'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Безопасность & RLS
            </button>
          </nav>
        </div>

        {/* Right Controls: Role Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 flex items-center gap-2 transition-colors"
              title="Быстрое переключение тестового пользователя"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left hidden sm:block">
                <span className="font-medium text-zinc-200 block truncate max-w-[130px]">
                  {currentUser.full_name.split(' ')[0]} {currentUser.full_name.split(' ')[1] || ''}
                </span>
                <span className="text-[10px] text-zinc-400 block -mt-0.5">
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 rounded border border-zinc-800 bg-zinc-900 shadow-xl py-2 z-50 text-xs"
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                  Сменить тестовую роль (ТЗ 2.1)
                </div>
                {DEMO_USERS.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-zinc-800 transition-colors ${
                        isCurrent ? 'bg-zinc-800/80 text-zinc-100 font-medium' : 'text-zinc-300'
                      }`}
                    >
                      <UserCheck
                        className={`w-4 h-4 mt-0.5 ${
                          isCurrent ? 'text-emerald-400' : 'text-zinc-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-zinc-200">{user.full_name}</div>
                        <div className="text-[11px] text-zinc-400">
                          {ROLE_LABELS[user.role]} • {user.email}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="border-t border-zinc-800 mt-2 pt-2 px-3">
                  <div className="text-[10px] text-zinc-500 leading-tight">
                    Постановщик видит всё. Исполнитель видит только свои задачи и объекты, где у него есть задачи.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            title="Сбросить тестовые данные"
            className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Выйти"
            className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-800 px-4 py-2 bg-zinc-950">
        <button
          onClick={() => {
            setSelectedObjectId(null);
            setCurrentTab('objects');
          }}
          className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 ${
            currentTab === 'objects' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Объекты
        </button>
        {isAssignee && (
          <button
            onClick={() => setCurrentTab('my-tasks')}
            className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 ${
              currentTab === 'my-tasks' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Мои задачи
          </button>
        )}
        <button
          onClick={() => setCurrentTab('info')}
          className={`px-3 py-1 rounded text-xs flex items-center gap-1.5 ${
            currentTab === 'info' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          RLS
        </button>
      </div>
    </header>
  );
}
