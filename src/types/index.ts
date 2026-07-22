export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ProjectInput {
  name?: string;
  description?: string | null;
}

export interface TaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | Date | null;
  project_id?: string;
}

export interface TaskListQuery {
  status?: string;
  priority?: string;
  due_date_from?: string;
  due_date_to?: string;
  sort_by?: string;
  sort_order?: string;
  page?: string;
  limit?: string;
  offset?: string;
  q?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  offset: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TaskResponse {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
  project_name?: string | null;
}

export interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}
