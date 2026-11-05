import { TaskStatus, UserProfile, UserRole } from '@/types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  in_review: 'На проверке',
  accepted: 'Принята',
  rework: 'На доработке',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: 'Постановщик',
  assignee: 'Исполнитель',
};

export const STATUS_COLORS: Record<TaskStatus, { badge: string; dot: string; border: string }> = {
  new: {
    badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    dot: 'bg-zinc-400',
    border: 'border-zinc-700',
  },
  in_progress: {
    badge: 'bg-blue-950/70 text-blue-300 border-blue-800',
    dot: 'bg-blue-400',
    border: 'border-blue-900',
  },
  in_review: {
    badge: 'bg-amber-950/70 text-amber-300 border-amber-800',
    dot: 'bg-amber-400',
    border: 'border-amber-900',
  },
  accepted: {
    badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
    dot: 'bg-emerald-400',
    border: 'border-emerald-900',
  },
  rework: {
    badge: 'bg-rose-950/70 text-rose-300 border-rose-800',
    dot: 'bg-rose-400',
    border: 'border-rose-900',
  },
};

export const DEMO_USERS: (UserProfile & { password: string })[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'director@stroydom.ru',
    password: 'Password123!',
    full_name: 'Алексей Смирнов (Руководитель проектов)',
    role: 'manager',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'ivanov@stroydom.ru',
    password: 'Password123!',
    full_name: 'Иван Иванов (Отделочные работы)',
    role: 'assignee',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'petrov@stroydom.ru',
    password: 'Password123!',
    full_name: 'Пётр Петров (Электромонтаж)',
    role: 'assignee',
  },
];
