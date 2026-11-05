export type UserRole = 'manager' | 'assignee';

export type TaskStatus = 'new' | 'in_progress' | 'in_review' | 'accepted' | 'rework';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export interface BuildingObject {
  id: string;
  title: string;
  address: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  tasks_count?: number;
}

export interface TaskHistoryItem {
  id: string;
  task_id: string;
  from_status: TaskStatus | null;
  to_status: TaskStatus;
  changed_by: string;
  changer_name?: string;
  comment?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  object_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id: string | null;
  author_id: string;
  rework_comment?: string | null;
  created_at: string;
  updated_at: string;
  object_title?: string;
  assignee_name?: string;
  author_name?: string;
  history?: TaskHistoryItem[];
}

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
  requiresComment?: boolean;
}
