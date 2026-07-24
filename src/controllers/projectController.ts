import asyncHandler from '../middleware/asyncHandler';
import * as projectService from '../services/projectService';

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(
    req.body,
    req.user!._id.toString()
  );

  res.status(201).json(project);
});

export const listProjects = asyncHandler(async (req, res) => {
  const result = await projectService.listProjects(
    req.query,
    req.user!._id.toString()
  );

  res.json(result);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(
    req.params.id,
    req.user!._id.toString()
  );

  res.json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.params.id,
    req.body,
    req.user!._id.toString()
  );

  res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(
    req.params.id,
    req.user!._id.toString()
  );

  res.json(result);
});

