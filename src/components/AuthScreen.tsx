'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DEMO_USERS, ROLE_LABELS } from '@/lib/constants';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AuthScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('director@stroydom.ru');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Ошибка входа');
    }
    setIsSubmitting(false);
  };

  const handleQuickLogin = (demoUser: (typeof DEMO_USERS)[0]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    login(demoUser.email, demoUser.password);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
            2B
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            СтройCRM: Объекты и задачи
          </h1>
          <p className="text-xs text-zinc-400">
            Корпоративная система управления строительными проектами
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-200">Вход в систему</h2>
            <span className="text-[11px] text-zinc-500 font-mono">Строгий доступ</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1.5">
                Электронная почта
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@stroydom.ru"
                  className="w-full pl-9 pr-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'Проверка доступов...' : 'Войти в личный кабинет'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Notice: Open Registration Disabled */}
          <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
              Открытая регистрация отключена (ТЗ 3.5)
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Учетные записи сотрудников создаются администратором. Для проверки используйте готовые доступы ниже.
            </p>
          </div>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="border-t border-zinc-800 pt-4 space-y-2.5">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Быстрый вход для проверки тестового (1 клик):
            </div>
            <div className="space-y-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className="w-full p-2.5 rounded bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-left transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                      {demo.full_name}
                    </div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="text-zinc-400 font-mono">{demo.email}</span>
                      <span>•</span>
                      <span className="text-zinc-400">{ROLE_LABELS[demo.role]}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 font-medium shrink-0 ml-2">
                    Войти →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-600">
          Тестовое задание для 2B Studio • React + TypeScript + Supabase Architecture
        </div>
      </div>
    </div>
  );
}
