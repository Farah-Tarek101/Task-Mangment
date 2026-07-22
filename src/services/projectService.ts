import Project from '../models/Project';
import Task from '../models/Task';
import { AppError } from '../utils/AppError';
import { parsePagination, buildPaginatedResponse, isValidObjectId } from '../utils/helpers';
import { validateProjectCreate, validateProjectUpdate } from '../validators';
import { MongoError, ProjectInput, ProjectResponse, TaskListQuery } from '../types';

export async function createProject(body: ProjectInput): Promise<ProjectResponse> {
  const data = validateProjectCreate(body);

  try {
    const project = await Project.create(data);
    return project.toJSON() as ProjectResponse;
  } catch (error) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      throw new AppError('A project with this name already exists', 409);
    }
    throw error;
  }
}

export async function listProjects(query: TaskListQuery) {
  const pagination = parsePagination(query);
  const [projects, total] = await Promise.all([
    Project.find().sort({ created_at: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Project.countDocuments(),
  ]);

  const data: ProjectResponse[] = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  return buildPaginatedResponse(data, total, pagination);
}

export async function getProjectById(id: string): Promise<ProjectResponse> {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid project id', 400);
  }

  const project = await Project.findById(id).lean();
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    created_at: project.created_at,
    updated_at: project.updated_at,
  };
}

export async function updateProject(id: string, body: ProjectInput): Promise<ProjectResponse> {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid project id', 400);
  }

  const updates = validateProjectUpdate(body);

  try {
    const project = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
  } catch (error) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      throw new AppError('A project with this name already exists', 409);
    }
    throw error;
  }
}

export async function deleteProject(id: string) {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid project id', 400);
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await Task.deleteMany({ project_id: id });
  await Project.findByIdAndDelete(id);

  return { message: 'Project and associated tasks deleted successfully' };
}

export async function assertProjectExists(projectId: string): Promise<void> {
  if (!isValidObjectId(projectId)) {
    throw new AppError('Invalid project id', 400);
  }

  const exists = await Project.exists({ _id: projectId });
  if (!exists) {
    throw new AppError('Project not found', 404);
  }
}
