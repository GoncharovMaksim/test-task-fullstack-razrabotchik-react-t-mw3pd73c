import { describe, it, expect } from 'vitest';
import { validateTransition, getAllowedTransitions } from '../lib/transitions';
import { Task, UserProfile } from '../types';

describe('Business Logic: Task Status State Machine (ТЗ 2.3)', () => {
  const managerUser: UserProfile = {
    id: 'mgr-1',
    email: 'director@stroydom.ru',
    full_name: 'Руководитель',
    role: 'manager',
  };

  const assignedWorker: UserProfile = {
    id: 'worker-1',
    email: 'ivanov@stroydom.ru',
    full_name: 'Иван Иванов',
    role: 'assignee',
  };

  const otherWorker: UserProfile = {
    id: 'worker-2',
    email: 'petrov@stroydom.ru',
    full_name: 'Петр Петров',
    role: 'assignee',
  };

  const baseTask: Pick<Task, 'status' | 'assignee_id'> = {
    status: 'new',
    assignee_id: 'worker-1',
  };

  describe('Transition: "Новая" -> "В работе"', () => {
    const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'new', assignee_id: 'worker-1' };

    it('allows assigned worker to take task in progress', () => {
      const res = validateTransition(task, 'in_progress', assignedWorker);
      expect(res.allowed).toBe(true);
    });

    it('forbids other worker from taking task in progress', () => {
      const res = validateTransition(task, 'in_progress', otherWorker);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('только назначенный исполнитель');
    });

    it('forbids manager from taking task in progress directly', () => {
      const res = validateTransition(task, 'in_progress', managerUser);
      expect(res.allowed).toBe(false);
    });
  });

  describe('Transition: "В работе" -> "На проверке"', () => {
    const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'in_progress', assignee_id: 'worker-1' };

    it('allows assigned worker to submit task for review', () => {
      const res = validateTransition(task, 'in_review', assignedWorker);
      expect(res.allowed).toBe(true);
    });

    it('forbids other worker from submitting task for review', () => {
      const res = validateTransition(task, 'in_review', otherWorker);
      expect(res.allowed).toBe(false);
    });

    it('forbids manager from submitting task for review', () => {
      const res = validateTransition(task, 'in_review', managerUser);
      expect(res.allowed).toBe(false);
    });
  });

  describe('Transition: "На проверке" -> "Принята"', () => {
    const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'in_review', assignee_id: 'worker-1' };

    it('allows manager to accept task', () => {
      const res = validateTransition(task, 'accepted', managerUser);
      expect(res.allowed).toBe(true);
    });

    it('forbids worker from accepting task', () => {
      const res = validateTransition(task, 'accepted', assignedWorker);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('только постановщик');
    });
  });

  describe('Transition: "На проверке" -> "На доработке"', () => {
    const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'in_review', assignee_id: 'worker-1' };

    it('allows manager with non-empty comment to send task to rework', () => {
      const res = validateTransition(task, 'rework', managerUser, 'Исправить стыки плитки');
      expect(res.allowed).toBe(true);
    });

    it('REJECTS manager without comment or with whitespace-only comment', () => {
      const resEmpty = validateTransition(task, 'rework', managerUser, '');
      expect(resEmpty.allowed).toBe(false);
      expect(resEmpty.reason).toContain('комментарий обязателен');

      const resSpaces = validateTransition(task, 'rework', managerUser, '   ');
      expect(resSpaces.allowed).toBe(false);
      expect(resSpaces.reason).toContain('комментарий обязателен');
    });

    it('forbids worker from returning task to rework', () => {
      const res = validateTransition(task, 'rework', assignedWorker, 'Комментарий');
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('только постановщик');
    });
  });

  describe('Transition: "На доработке" -> "В работе"', () => {
    const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'rework', assignee_id: 'worker-1' };

    it('allows assigned worker to resume task into work', () => {
      const res = validateTransition(task, 'in_progress', assignedWorker);
      expect(res.allowed).toBe(true);
    });

    it('forbids other worker from resuming task', () => {
      const res = validateTransition(task, 'in_progress', otherWorker);
      expect(res.allowed).toBe(false);
    });

    it('forbids manager from resuming task', () => {
      const res = validateTransition(task, 'in_progress', managerUser);
      expect(res.allowed).toBe(false);
    });
  });

  describe('Forbidden transitions', () => {
    it('strictly forbids "new" -> "accepted"', () => {
      const res = validateTransition(baseTask, 'accepted', managerUser);
      expect(res.allowed).toBe(false);
    });

    it('strictly forbids "new" -> "in_review"', () => {
      const res = validateTransition(baseTask, 'in_review', assignedWorker);
      expect(res.allowed).toBe(false);
    });

    it('strictly forbids "in_progress" -> "accepted"', () => {
      const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'in_progress', assignee_id: 'worker-1' };
      const res = validateTransition(task, 'accepted', managerUser);
      expect(res.allowed).toBe(false);
    });

    it('strictly forbids "accepted" -> "in_progress"', () => {
      const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'accepted', assignee_id: 'worker-1' };
      const res = validateTransition(task, 'in_progress', assignedWorker);
      expect(res.allowed).toBe(false);
    });

    it('strictly forbids "rework" -> "accepted"', () => {
      const task: Pick<Task, 'status' | 'assignee_id'> = { status: 'rework', assignee_id: 'worker-1' };
      const res = validateTransition(task, 'accepted', managerUser);
      expect(res.allowed).toBe(false);
    });
  });

  describe('getAllowedTransitions helper', () => {
    it('returns ["in_progress"] for assigned worker when task is "new"', () => {
      const actions = getAllowedTransitions({ status: 'new', assignee_id: 'worker-1' }, assignedWorker);
      expect(actions).toEqual(['in_progress']);
    });

    it('returns empty array for manager when task is "new"', () => {
      const actions = getAllowedTransitions({ status: 'new', assignee_id: 'worker-1' }, managerUser);
      expect(actions).toEqual([]);
    });

    it('returns ["accepted", "rework"] for manager when task is "in_review"', () => {
      const actions = getAllowedTransitions({ status: 'in_review', assignee_id: 'worker-1' }, managerUser);
      expect(actions).toEqual(['accepted', 'rework']);
    });

    it('returns empty array for worker when task is "in_review"', () => {
      const actions = getAllowedTransitions({ status: 'in_review', assignee_id: 'worker-1' }, assignedWorker);
      expect(actions).toEqual([]);
    });

    it('returns empty array for all when task is "accepted"', () => {
      expect(getAllowedTransitions({ status: 'accepted', assignee_id: 'worker-1' }, managerUser)).toEqual([]);
      expect(getAllowedTransitions({ status: 'accepted', assignee_id: 'worker-1' }, assignedWorker)).toEqual([]);
    });
  });
});
