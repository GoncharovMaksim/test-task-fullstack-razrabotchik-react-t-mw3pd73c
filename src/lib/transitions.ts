import { Task, TaskStatus, TransitionValidationResult, UserProfile } from '@/types';

/**
 * Валидация перехода статуса задачи в соответствии с ТЗ (раздел 2.3):
 * 1. — -> Новая: постановщик при создании задачи
 * 2. Новая -> В работе: назначенный исполнитель
 * 3. В работе -> На проверке: назначенный исполнитель
 * 4. На проверке -> Принята: постановщик
 * 5. На проверке -> На доработке: постановщик (комментарий обязателен)
 * 6. На доработке -> В работе: назначенный исполнитель
 * Другие переходы запрещены.
 */
export function validateTransition(
  task: Pick<Task, 'status' | 'assignee_id'>,
  targetStatus: TaskStatus,
  user: Pick<UserProfile, 'id' | 'role'>,
  comment?: string | null
): TransitionValidationResult {
  const currentStatus = task.status;
  const isAssignee = user.role === 'assignee' && task.assignee_id === user.id;
  const isManager = user.role === 'manager';

  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  // 1) Новая -> В работе
  if (currentStatus === 'new' && targetStatus === 'in_progress') {
    if (!isAssignee) {
      return {
        allowed: false,
        reason: 'Перевести задачу в статус "В работе" может только назначенный исполнитель',
      };
    }
    return { allowed: true };
  }

  // 2) В работе -> На проверке
  if (currentStatus === 'in_progress' && targetStatus === 'in_review') {
    if (!isAssignee) {
      return {
        allowed: false,
        reason: 'Отправить задачу на проверку может только назначенный исполнитель',
      };
    }
    return { allowed: true };
  }

  // 3) На проверке -> Принята
  if (currentStatus === 'in_review' && targetStatus === 'accepted') {
    if (!isManager) {
      return {
        allowed: false,
        reason: 'Принять задачу может только постановщик',
      };
    }
    return { allowed: true };
  }

  // 4) На проверке -> На доработке (комментарий обязателен!)
  if (currentStatus === 'in_review' && targetStatus === 'rework') {
    if (!isManager) {
      return {
        allowed: false,
        reason: 'Вернуть задачу на доработку может только постановщик',
      };
    }
    if (!comment || comment.trim().length === 0) {
      return {
        allowed: false,
        reason: 'При возврате на доработку комментарий обязателен',
        requiresComment: true,
      };
    }
    return { allowed: true, requiresComment: true };
  }

  // 5) На доработке -> В работе
  if (currentStatus === 'rework' && targetStatus === 'in_progress') {
    if (!isAssignee) {
      return {
        allowed: false,
        reason: 'Взять задачу в работу после доработки может только назначенный исполнитель',
      };
    }
    return { allowed: true };
  }

  // Любой другой переход строго запрещен
  return {
    allowed: false,
    reason: `Переход из статуса "${currentStatus}" в "${targetStatus}" запрещен правилами бизнес-логики`,
  };
}

/**
 * Получение списка доступных переходов для текущего пользователя
 */
export function getAllowedTransitions(
  task: Pick<Task, 'status' | 'assignee_id'>,
  user: Pick<UserProfile, 'id' | 'role'>
): TaskStatus[] {
  const allStatuses: TaskStatus[] = ['new', 'in_progress', 'in_review', 'accepted', 'rework'];
  return allStatuses.filter((target) => {
    if (target === task.status) return false;
    const check = validateTransition(task, target, user, 'Тестовый комментарий для проверки');
    return check.allowed;
  });
}

/**
 * Человекопонятное название кнопки действия
 */
export function getTransitionActionLabel(targetStatus: TaskStatus): string {
  switch (targetStatus) {
    case 'in_progress':
      return 'Взять в работу';
    case 'in_review':
      return 'Отправить на проверку';
    case 'accepted':
      return 'Принять задачу';
    case 'rework':
      return 'Вернуть на доработку';
    default:
      return `Перевести в ${targetStatus}`;
  }
}
