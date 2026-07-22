import * as projectService from '../services/projectService';
import asyncHandler from '../middleware/asyncHandler';

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body);
  res.status(201).json(project);
});

export const listProjects = asyncHandler(async (req, res) => {
  const result = await projectService.listProjects(req.query);
  res.json(result);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(req.params.id);
  res.json(result);
});
