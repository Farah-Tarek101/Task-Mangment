import { FilterQuery } from 'mongoose';
import { TaskPriority, TaskListQuery, PaginatedResponse, PaginationMeta } from '../types';
import { ITask } from '../models/Task';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const SORTABLE_TASK_FIELDS = ['due_date', 'priority', 'created_at'] as const;

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export interface PaginationParams {
  limit: number;
  page: number;
  offset: number;
  skip: number;
}

export function parsePagination(query: TaskListQuery): PaginationParams {
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10) || 10, 1), 100);
  const page = Math.max(parseInt(query.page || '1', 10) || 1, 1);
  const offset =
    query.offset !== undefined
      ? Math.max(parseInt(query.offset, 10) || 0, 0)
      : (page - 1) * limit;

  return { limit, page, offset, skip: offset };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResponse<T> {
  const { limit, page, offset } = pagination;
  const totalPages = Math.ceil(total / limit) || 1;

  const paginationMeta: PaginationMeta = {
    total,
    limit,
    page,
    offset,
    total_pages: totalPages,
    has_next: offset + data.length < total,
    has_prev: offset > 0,
  };

  return { data, pagination: paginationMeta };
}

export function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isDueDateValid(dueDate: string | Date | null | undefined): boolean {
  if (dueDate === undefined || dueDate === null || dueDate === '') {
    return true;
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed >= startOfToday();
}

export interface SortResult {
  sortBy: string;
  sortOrder: 1 | -1;
  isPrioritySort: boolean;
  error?: string;
}

export function parseSort(
  query: TaskListQuery,
  allowedFields: readonly string[] = SORTABLE_TASK_FIELDS
): SortResult {
  const sortBy = query.sort_by || 'created_at';
  const sortOrder = (query.sort_order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  if (!allowedFields.includes(sortBy)) {
    return {
      sortBy,
      sortOrder,
      isPrioritySort: false,
      error: `sort_by must be one of: ${allowedFields.join(', ')}`,
    };
  }

  if (sortBy === 'priority') {
    return { sortBy, sortOrder, isPrioritySort: true };
  }

  return { sortBy, sortOrder, isPrioritySort: false };
}

export function buildTaskFilters(query: TaskListQuery): FilterQuery<ITask> {
  const filters: FilterQuery<ITask> = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.priority) {
    filters.priority = query.priority;
  }

  if (query.due_date_from || query.due_date_to) {
    const dueDateFilter: Record<string, Date> = {};
    if (query.due_date_from) {
      dueDateFilter.$gte = new Date(query.due_date_from);
    }
    if (query.due_date_to) {
      dueDateFilter.$lte = new Date(query.due_date_to);
    }
    filters.due_date = dueDateFilter as FilterQuery<ITask>['due_date'];
  }

  if (query.q) {
    filters.$or = [
      { title: { $regex: query.q, $options: 'i' } },
      { description: { $regex: query.q, $options: 'i' } },
    ];
  }

  return filters;
}


