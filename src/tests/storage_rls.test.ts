import { describe, it, expect, beforeEach } from 'vitest';
import { CRMStore } from '../lib/storage';
import { UserProfile } from '../types';

describe('Storage Engine and RLS Security (ТЗ Раздел 3)', () => {
  let store: CRMStore;

  const managerUser: UserProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'director@stroydom.ru',
    full_name: 'Алексей Смирнов',
    role: 'manager',
  };

  const ivanovWorker: UserProfile = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'ivanov@stroydom.ru',
    full_name: 'Иван Иванов',
    role: 'assignee',
  };

  const petrovWorker: UserProfile = {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'petrov@stroydom.ru',
    full_name: 'Петр Петров',
    role: 'assignee',
  };

  beforeEach(() => {
    store = new CRMStore(true); // isolated mock instance
  });

  describe('Objects RLS: Visibility Rules', () => {
    it('manager sees all objects in the system', () => {
      const objects = store.getObjects(managerUser);
      expect(objects.length).toBe(3);
    });

    it('assignee sees only objects where they have assigned tasks', () => {
      // Ivanov has tasks in ЖК «Северные Высоты» and КП «Дубрава»
      const ivanovObjects = store.getObjects(ivanovWorker);
      expect(ivanovObjects.length).toBe(2);
      const titles = ivanovObjects.map((o) => o.title);
      expect(titles).toContain('ЖК «Северные Высоты»');
      expect(titles).toContain('КП «Дубрава»');
      expect(titles).not.toContain('ТЦ «Атриум Плаза»'); // Hidden!
    });

    it('petrov sees only ТЦ «Атриум Плаза» where his tasks are assigned', () => {
      const petrovObjects = store.getObjects(petrovWorker);
      expect(petrovObjects.length).toBe(1);
      expect(petrovObjects[0].title).toBe('ТЦ «Атриум Плаза»');
    });

    it('assignee cannot access forbidden object directly by ID', () => {
      // ТЦ «Атриум Плаза» id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      const obj = store.getObjectById('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', ivanovWorker);
      expect(obj).toBeNull();
    });
  });

  describe('Tasks RLS: Visibility & Isolation Rules', () => {
    it('manager sees all tasks across all objects', () => {
      const tasks = store.getTasks(managerUser);
      expect(tasks.length).toBe(5);
    });

    it('assignee sees strictly only their assigned tasks', () => {
      const ivanovTasks = store.getTasks(ivanovWorker);
      expect(ivanovTasks.length).toBe(3);
      for (const t of ivanovTasks) {
        expect(t.assignee_id).toBe(ivanovWorker.id);
      }
    });

    it('assignee cannot read someone else’s task via direct getTaskById', () => {
      // Task 1 belongs to Petrov
      const taskForIvanov = store.getTaskById('t1111111-1111-1111-1111-111111111111', ivanovWorker);
      expect(taskForIvanov).toBeNull();
    });

    it('assignee cannot update someone else’s task status', () => {
      // Task 1 belongs to Petrov, Ivanov tries to take it
      expect(() => {
        store.transitionTaskStatus('t1111111-1111-1111-1111-111111111111', 'in_progress', ivanovWorker);
      }).toThrow('Запрещено изменять статус задачи другого исполнителя');
    });
  });

  describe('Mutation Permissions (Manager vs Assignee)', () => {
    it('only manager can create objects', () => {
      expect(() => {
        store.createObject({ title: 'Новый склад', address: 'ул. Складская 1' }, ivanovWorker);
      }).toThrow('Только постановщик может создавать объекты');

      const newObj = store.createObject({ title: 'Новый склад', address: 'ул. Складская 1' }, managerUser);
      expect(newObj.id).toBeDefined();
      expect(newObj.title).toBe('Новый склад');
    });

    it('only manager can create tasks and initial status is always "new"', () => {
      expect(() => {
        store.createTask(
          { object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'Хакнуть систему' },
          ivanovWorker
        );
      }).toThrow('Только постановщик может создавать задачи');

      const created = store.createTask(
        {
          object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          title: 'Установка дверей',
          assignee_id: ivanovWorker.id,
        },
        managerUser
      );

      expect(created.status).toBe('new');
      expect(created.author_id).toBe(managerUser.id);
      expect(created.history?.length).toBeGreaterThanOrEqual(1);
      expect(created.history?.[0].to_status).toBe('new');
    });

    it('only manager can edit task details or delete tasks', () => {
      expect(() => {
        store.updateTaskDetails('t2222222-2222-2222-2222-222222222222', { title: 'Переименование' }, ivanovWorker);
      }).toThrow('Только постановщик имеет право редактировать параметры задачи');

      expect(() => {
        store.deleteTask('t2222222-2222-2222-2222-222222222222', ivanovWorker);
      }).toThrow('Только постановщик имеет право удалять задачи');
    });
  });

  describe('Immutable Task History Audit Log (ТЗ 2.4 & 3.4)', () => {
    it('appends history record automatically on valid transition', () => {
      // Petrov has task 5 in "new" status
      const updated = store.transitionTaskStatus(
        't5555555-5555-5555-5555-555555555555',
        'in_progress',
        petrovWorker
      );

      expect(updated.status).toBe('in_progress');
      const latestHistory = updated.history?.[0];
      expect(latestHistory).toBeDefined();
      expect(latestHistory?.from_status).toBe('new');
      expect(latestHistory?.to_status).toBe('in_progress');
      expect(latestHistory?.changed_by).toBe(petrovWorker.id);
    });

    it('saves comment in history when sending to rework', () => {
      // Ivanov has task 2 in "in_review" status
      const commentText = 'Некачественная затирка швов на 3 этаже';
      const updated = store.transitionTaskStatus(
        't2222222-2222-2222-2222-222222222222',
        'rework',
        managerUser,
        commentText
      );

      expect(updated.status).toBe('rework');
      const latestHistory = updated.history?.[0];
      expect(latestHistory?.to_status).toBe('rework');
      expect(latestHistory?.comment).toBe(commentText);
      expect(latestHistory?.changed_by).toBe(managerUser.id);
    });
  });
});
