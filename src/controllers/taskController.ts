import asyncHandler from "../middleware/asyncHandler";
import * as taskService from "../services/taskService";

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(
    req.params.projectId,
    req.body,
    req.user!._id.toString()
  );

  res.status(201).json(task);
});

export const listProjectTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasksByProject(
    req.params.projectId,
    req.query,
    req.user!._id.toString()
  );

  res.json(result);
});

export const listAllTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listAllTasks(
    req.query,
    req.user!._id.toString()
  );

  res.json(result);
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(
    req.params.id,
    req.user!._id.toString()
  );

  res.json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.params.id,
    req.body,
    req.user!._id.toString()
  );

  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(
    req.params.id,
    req.user!._id.toString()
  );

  res.json(result);
});

