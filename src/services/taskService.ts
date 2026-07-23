import Project from '../models/Project';
import Task from '../models/Task';
import { TaskInput, TaskListQuery, TaskPriority, TaskResponse } from '../types';
import { AppError } from '../utils/AppError';
import {
  buildPaginatedResponse,
  buildTaskFilters,
  isValidObjectId,
  parsePagination,
  parseSort,
  PRIORITY_ORDER,
} from '../utils/helpers';
import {
  validateTaskCreate,
  validateTaskListQuery,
  validateTaskUpdate,
} from '../validators';
import { assertProjectExists } from './projectService';

interface TaskLean {
  _id: { toString(): string };
  project_id: { toString(): string };
  title: string;
  description: string | null;
  status: TaskResponse['status'];
  priority: TaskPriority;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export function formatTask(task: TaskLean, projectName: string | null = null): TaskResponse {
  const formatted: TaskResponse = {
    id: task._id.toString(),
    project_id: task.project_id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };

  if (projectName !== null) {
    formatted.project_name = projectName;
  }

  return formatted;
}

export async function sortTasks(
  tasks: TaskLean[],
  sortBy: string,
  sortOrder: 1 | -1
): Promise<TaskLean[]> {
  const direction = sortOrder === 1 ? 1 : -1;

  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return diff * direction;
    }

    const aVal = a[sortBy as keyof TaskLean];
    const bVal = b[sortBy as keyof TaskLean];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (aVal < bVal) return -1 * direction;
    if (aVal > bVal) return 1 * direction;
    return 0;
  });
}

export async function createTask(projectId: string, body: TaskInput) {
  await assertProjectExists(projectId);
  const data = validateTaskCreate(body);

  const task = await Task.create({
    ...data,
    project_id: projectId,
  });

  return formatTask(task.toObject() as TaskLean);
}

export async function listTasksByProject(projectId: string, query: TaskListQuery) {
  await assertProjectExists(projectId);
  validateTaskListQuery(query);

  const pagination = parsePagination(query);
  const sortResult = parseSort(query);
  if (sortResult.error) {
    throw new AppError(sortResult.error, 400);
  }

  const filters = { project_id: projectId, ...buildTaskFilters(query) };

  if (sortResult.isPrioritySort) {
    const [tasks, total] = await Promise.all([
      Task.find(filters).lean(),
      Task.countDocuments(filters),
    ]);
    const sorted = await sortTasks(tasks as TaskLean[], sortResult.sortBy, sortResult.sortOrder);
    const paginated = sorted.slice(pagination.skip, pagination.skip + pagination.limit);
    const data = paginated.map((task) => formatTask(task));
    return buildPaginatedResponse(data, total, pagination);
  }

  const sort = { [sortResult.sortBy]: sortResult.sortOrder };

  const [tasks, total] = await Promise.all([
    Task.find(filters).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    Task.countDocuments(filters),
  ]);

  const data = (tasks as TaskLean[]).map((task) => formatTask(task));
  return buildPaginatedResponse(data, total, pagination);
}

export async function listAllTasks(query: TaskListQuery) {
  validateTaskListQuery(query);

  const pagination = parsePagination(query);
  const sortResult = parseSort(query);
  if (sortResult.error) {
    throw new AppError(sortResult.error, 400);
  }

  const filters = buildTaskFilters(query);

  if (sortResult.isPrioritySort) {
    const [tasks, total] = await Promise.all([
      Task.find(filters).lean(),
      Task.countDocuments(filters),
    ]);

    const projectIds = [...new Set((tasks as TaskLean[]).map((t) => t.project_id.toString()))];
    const projects = await Project.find({ _id: { $in: projectIds } }).select('name').lean();
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));

    const sorted = await sortTasks(tasks as TaskLean[], sortResult.sortBy, sortResult.sortOrder);
    const paginated = sorted.slice(pagination.skip, pagination.skip + pagination.limit);
    const data = paginated.map((task) =>
      formatTask(task, projectMap.get(task.project_id.toString()) || null)
    );
    return buildPaginatedResponse(data, total, pagination);
  }

  const sort = { [sortResult.sortBy]: sortResult.sortOrder };

  const [tasks, total] = await Promise.all([
    Task.find(filters).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    Task.countDocuments(filters),
  ]);

  const projectIds = [...new Set((tasks as TaskLean[]).map((t) => t.project_id.toString()))];
  const projects = await Project.find({ _id: { $in: projectIds } }).select('name').lean();
  const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));

  const data = (tasks as TaskLean[]).map((task) =>
    formatTask(task, projectMap.get(task.project_id.toString()) || null)
  );
  return buildPaginatedResponse(data, total, pagination);
}

export async function getTaskById(id: string): Promise<TaskResponse> {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid task id', 400);
  }

  const task = await Task.findById(id).lean();
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  //console.log("Found task:", task);
  const project = await Project.findById(task.project_id).select('name').lean();

  
  return formatTask(task as TaskLean, project?.name || null);
}

export async function updateTask(id: string, body: TaskInput): Promise<TaskResponse> {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid task id', 400);
  }
const existing = await Task.findById(id);
if (!existing) {
  throw new AppError('Task not found', 404);
}

if (body.project_id !== undefined) {
  throw new AppError('project_id cannot be changed after task creation', 400);
}

const updates = validateTaskUpdate(body, existing.status);

Object.assign(existing, updates);
await existing.save();

  const project = await Project.findById(existing.project_id).select('name').lean();
  return formatTask(existing.toObject() as TaskLean, project?.name || null);
}

export async function deleteTask(id: string) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid task id', 400);
  }

  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return { message: 'Task deleted successfully' };
}
