import {
    ProjectInput,
    TaskInput,
    TaskListQuery,
    TaskStatus,
    ValidationErrorDetail,
} from '../types';
import { AppError } from '../utils/AppError';
import {
    TASK_PRIORITIES,
    TASK_STATUSES,
    isDueDateValid,
    parseDateValue,
} from '../utils/helpers';
import logger from '../utils/logger';

export function validateProjectCreate(body: ProjectInput) {
  const errors: ValidationErrorDetail[] = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Project name is required' });
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== 'string'
  ) {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  if (errors.length) {
    throw new AppError('Validation failed', 400, errors);
  }

  return {
    name: body.name!.trim(),
    description: body.description?.trim() || null,
  };
}

export function validateProjectUpdate(body: ProjectInput) {
  const errors: ValidationErrorDetail[] = [];
  const updates: Partial<{ name: string; description: string | null }> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.push({ field: 'name', message: 'Project name cannot be empty' });
    } else {
      updates.name = body.name.trim();
    }
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else {
      updates.description = body.description?.trim() || null;
    }
  }

  if (!Object.keys(updates).length) {
    errors.push({ field: '_', message: 'At least one field must be provided for update' });
  }

  if (errors.length) {
    throw new AppError('Validation failed', 400, errors);
  }

  return updates;
}

export function validateTaskCreate(body: TaskInput) {
  const errors: ValidationErrorDetail[] = [];
  const data: Partial<{
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: string;
    due_date: Date;
  }> = {};

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Task title is required' });
  } else {
    data.title = body.title.trim();
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else {
      data.description = body.description.trim() || null;
    }
  }

  if (body.status !== undefined) {
    if (!TASK_STATUSES.includes(body.status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      });
    } else {
      data.status = body.status;
    }
  }

  if (body.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(body.priority)) {
      errors.push({
        field: 'priority',
        message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
      });
    } else {
      data.priority = body.priority;
    }
  }

  if (body.due_date !== undefined && body.due_date !== null && body.due_date !== '') {
    if (!isDueDateValid(body.due_date)) {
      errors.push({ field: 'due_date', message: 'Due date must be today or in the future' });
    } else {
      data.due_date = parseDateValue(body.due_date)!;
    }
  }

  if (errors.length) {
    throw new AppError('Validation failed', 400, errors);
  }

  return data;
}

export function validateTaskUpdate(body: TaskInput, currentStatus: TaskStatus) {
  const errors: ValidationErrorDetail[] = [];
  const updates: Partial<{
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: string;
    due_date: Date | null;
  }> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push({ field: 'title', message: 'Task title cannot be empty' });
    } else {
      updates.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else {
      updates.description = body.description?.trim() || null;
    }
  }

  if (body.status !== undefined) {
    if (!TASK_STATUSES.includes(body.status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      });
    } else {
      updates.status = body.status;
      validateStatusTransition(currentStatus, body.status);
    }
  }

  if (body.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(body.priority)) {
      errors.push({
        field: 'priority',
        message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
      });
    } else {
      updates.priority = body.priority;
    }
  }

  if (body.due_date !== undefined) {
    if (body.due_date === null || body.due_date === '') {
      updates.due_date = null;
    } else if (!isDueDateValid(body.due_date)) {
      errors.push({ field: 'due_date', message: 'Due date must be today or in the future' });
    } else {
      updates.due_date = parseDateValue(body.due_date)!;
    }
  }

  if (!Object.keys(updates).length) {
    errors.push({ field: '_', message: 'At least one field must be provided for update' });
  }

  if (errors.length) {
    throw new AppError('Validation failed', 400, errors);
  }

  return updates;
}

export function validateStatusTransition(fromStatus: TaskStatus, toStatus: TaskStatus): void {
  if (fromStatus === 'done' && toStatus === 'todo') {
    logger.warn(`Unusual status transition: done → todo (from: ${fromStatus}, to: ${toStatus})`);
  }
}

export function validateTaskListQuery(query: TaskListQuery): void {
  const errors: ValidationErrorDetail[] = [];

  if (query.status && !TASK_STATUSES.includes(query.status as TaskStatus)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
    });
  }

  if (query.priority && !TASK_PRIORITIES.includes(query.priority as typeof TASK_PRIORITIES[number])) {
    errors.push({
      field: 'priority',
      message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
    });
  }

  if (query.due_date_from && Number.isNaN(new Date(query.due_date_from).getTime())) {
    errors.push({ field: 'due_date_from', message: 'due_date_from must be a valid date' });
  }

  if (query.due_date_to && Number.isNaN(new Date(query.due_date_to).getTime())) {
    errors.push({ field: 'due_date_to', message: 'due_date_to must be a valid date' });
  }

  if (query.sort_order && !['asc', 'desc'].includes(query.sort_order.toLowerCase())) {
    errors.push({ field: 'sort_order', message: 'sort_order must be asc or desc' });
  }

  if (errors.length) {
    throw new AppError('Validation failed', 400, errors);
  }
}
