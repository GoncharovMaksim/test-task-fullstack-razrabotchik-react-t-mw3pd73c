import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskModal } from '../components/TaskModal';
import { Task, UserProfile } from '../types';
import * as AuthContextModule from '../context/AuthContext';
import * as CRMContextModule from '../context/CRMContext';

describe('UI Component: TaskModal (ТЗ 2.5)', () => {
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

  const sampleReviewTask: Task = {
    id: 't-test-1',
    object_id: 'obj-1',
    title: 'Штукатурка стен',
    description: 'Маячная штукатурка',
    status: 'in_review',
    assignee_id: ivanovWorker.id,
    author_id: managerUser.id,
    created_at: '2026-11-01T10:00:00.000Z',
    updated_at: '2026-11-02T10:00:00.000Z',
    object_title: 'ЖК «Северные Высоты»',
    assignee_name: 'Иван Иванов',
    author_name: 'Алексей Смирнов',
    history: [
      {
        id: 'h1',
        task_id: 't-test-1',
        from_status: null,
        to_status: 'new',
        changed_by: managerUser.id,
        changer_name: 'Алексей Смирнов',
        comment: 'Создание задачи',
        created_at: '2026-11-01T10:00:00.000Z',
      },
      {
        id: 'h2',
        task_id: 't-test-1',
        from_status: 'new',
        to_status: 'in_progress',
        changed_by: ivanovWorker.id,
        changer_name: 'Иван Иванов',
        comment: 'Взял в работу',
        created_at: '2026-11-01T12:00:00.000Z',
      },
      {
        id: 'h3',
        task_id: 't-test-1',
        from_status: 'in_progress',
        to_status: 'in_review',
        changed_by: ivanovWorker.id,
        changer_name: 'Иван Иванов',
        comment: 'Готово к сдаче',
        created_at: '2026-11-02T10:00:00.000Z',
      },
    ],
  };

  it('renders task details, status and history correctly', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: managerUser,
      login: vi.fn(),
      switchUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    vi.spyOn(CRMContextModule, 'useCRM').mockReturnValue({
      objects: [],
      tasks: [],
      activeTask: sampleReviewTask,
      selectedObjectId: null,
      setSelectedObjectId: vi.fn(),
      openTaskModal: vi.fn(),
      closeTaskModal: vi.fn(),
      createObject: vi.fn(),
      updateObject: vi.fn(),
      deleteObject: vi.fn(),
      createTask: vi.fn(),
      updateTaskDetails: vi.fn(),
      deleteTask: vi.fn(),
      transitionStatus: vi.fn(),
      resetDatabase: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskModal task={sampleReviewTask} onClose={vi.fn()} />);

    expect(screen.getByText('Штукатурка стен')).toBeInTheDocument();
    expect(screen.getAllByText('На проверке').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ЖК «Северные Высоты»')).toBeInTheDocument();
    expect(screen.getByText('Маячная штукатурка')).toBeInTheDocument();
    // History items
    expect(screen.getByText(/Готово к сдаче/)).toBeInTheDocument();
  });

  it('shows "Принять задачу" and "На доработку" only for manager when status is "in_review"', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: managerUser,
      login: vi.fn(),
      switchUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(<TaskModal task={sampleReviewTask} onClose={vi.fn()} />);

    expect(screen.getByText(/Принять задачу/)).toBeInTheDocument();
    expect(screen.getByText(/Вернуть на доработку/)).toBeInTheDocument();
  });

  it('hides transition buttons from assignee when task is "in_review"', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: ivanovWorker,
      login: vi.fn(),
      switchUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(<TaskModal task={sampleReviewTask} onClose={vi.fn()} />);

    expect(screen.queryByText(/Принять задачу/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Вернуть на доработку/)).not.toBeInTheDocument();
    expect(screen.getByText(/В текущем статусе/)).toBeInTheDocument();
  });

  it('requires comment when manager clicks "Вернуть на доработку"', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: managerUser,
      login: vi.fn(),
      switchUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(<TaskModal task={sampleReviewTask} onClose={vi.fn()} />);

    const reworkBtn = screen.getByText(/Вернуть на доработку/);
    fireEvent.click(reworkBtn);

    expect(screen.getByPlaceholderText(/Обязательно укажите, что именно нужно исправить/)).toBeInTheDocument();
    expect(screen.getByText('Подтвердить возврат на доработку')).toBeInTheDocument();
  });
});
