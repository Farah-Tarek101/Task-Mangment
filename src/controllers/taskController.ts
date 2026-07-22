import * as taskService from '../services/taskService';
import asyncHandler from '../middleware/asyncHandler';

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.params.id, req.body);
  res.status(201).json(task);
});

export const listProjectTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasksByProject(req.params.id, req.query);
  res.json(result);
});

export const listAllTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listAllTasks(req.query);
  res.json(result);
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id);
  res.json(result);
});
