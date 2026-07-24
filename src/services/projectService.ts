import Project from '../models/Project';
import Task from '../models/Task';
import { MongoError, ProjectInput, ProjectResponse, TaskListQuery } from '../types';
import { AppError } from '../utils/AppError';
import { buildPaginatedResponse, isValidObjectId, parsePagination } from '../utils/helpers';
import { validateProjectCreate, validateProjectUpdate } from '../validators';

export async function createProject(
  body: ProjectInput,
  userId: string
): Promise<ProjectResponse> {

  const data = validateProjectCreate(body);

  try {

    const project = await Project.create({
      ...data,
      user_id: userId,
    });

    return project.toJSON() as ProjectResponse;

  } catch (error) {

    const mongoError = error as MongoError;

    if (mongoError.code === 11000) {
      throw new AppError(
        'A project with this name already exists',
        409
      );
    }

    throw error;
  }
}

export async function listProjects(
  query: TaskListQuery,
  userId: string
) {
  const pagination = parsePagination(query);

  const [projects, total] = await Promise.all([
    Project.find({
  user_id: userId,
  deleted_at: null,
  })
      .sort({ created_at: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),

    Project.countDocuments({
  user_id:userId,
  deleted_at:null
  })
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

export async function getProjectById(
 id:string,
 userId:string
): Promise<ProjectResponse> {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid project id', 400);
  }

  const project = await Project.findOne({
  _id: id,
  user_id: userId,
  deleted_at: null,
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
}

export async function updateProject(
id:string,body:ProjectInput,
userId:string
): Promise<ProjectResponse> {
  if (!isValidObjectId(id)) {
    throw new AppError('Invalid project id', 400);
  }

  const updates = validateProjectUpdate(body);

  try {
    const project = await Project.findOneAndUpdate(
  {
_id:id,
user_id:userId,
deleted_at:null
},
  updates,
  {
    new: true,
    runValidators: true,
  }
).lean();

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

export async function deleteProject(
  id: string,
  userId: string
) {

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid project id', 400);
  }

  const project = await Project.findOne({
    _id: id,
    user_id: userId,
    deleted_at: null,
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }


  const deleteDate = new Date();


  // soft delete project
  await Project.updateOne(
    {
      _id: id,
      user_id: userId,
    },
    {
      deleted_at: deleteDate,
    }
  );


  // soft delete all tasks inside project
  await Task.updateMany(
    {
      project_id: id,
      user_id: userId,
      deleted_at: null,
    },
    {
      deleted_at: deleteDate,
    }
  );


  return {
    message: 'Project and associated tasks deleted successfully'
  };
}

export async function assertProjectExists(
  projectId: string,userId: string): Promise<void>  {
  if (!isValidObjectId(projectId)) {
    throw new AppError('Invalid project id', 400);
  }

  const exists = await Project.exists({
    _id: projectId,
    user_id:userId,
    deleted_at: null,
  });
  if (!exists) {
    throw new AppError('Project not found', 404);
  }
}
