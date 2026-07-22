import request from 'supertest';
import createApp from '../../src/app';
import Project from '../../src/models/Project';
import Task from '../../src/models/Task';
import { TaskResponse } from '../../src/types';

const app = createApp();

function futureDate(daysFromNow = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

describe('Integration: Project lifecycle flow', () => {
  it('Create project → Add task → Mark done → Delete project (cascade)', async () => {
    const projectRes = await request(app)
      .post('/api/projects')
      .send({ name: 'Lifecycle Project', description: 'Integration test' })
      .expect(201);

    expect(projectRes.body.name).toBe('Lifecycle Project');
    expect(projectRes.body.id).toBeDefined();

    const projectId = projectRes.body.id;

    const taskRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({
        title: 'Complete integration test',
        priority: 'high',
        due_date: futureDate(),
      })
      .expect(201);

    expect(taskRes.body.title).toBe('Complete integration test');
    expect(taskRes.body.status).toBe('todo');
    expect(taskRes.body.project_id).toBe(projectId);

    const taskId = taskRes.body.id;

    const doneRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'done' })
      .expect(200);

    expect(doneRes.body.status).toBe('done');

    await request(app).delete(`/api/projects/${projectId}`).expect(200);

    const deletedProject = await Project.findById(projectId);
    const deletedTask = await Task.findById(taskId);
    expect(deletedProject).toBeNull();
    expect(deletedTask).toBeNull();
  });
});

describe('Integration: Filter tasks by status and priority', () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await Project.create({ name: 'Filter Test Project' });
    projectId = project._id.toString();

    await Task.create([
      { project_id: projectId, title: 'Todo Low', status: 'todo', priority: 'low' },
      { project_id: projectId, title: 'Todo High', status: 'todo', priority: 'high' },
      { project_id: projectId, title: 'Done Medium', status: 'done', priority: 'medium' },
      { project_id: projectId, title: 'In Progress High', status: 'in_progress', priority: 'high' },
    ]);
  });

  it('filters by status', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=todo`)
      .expect(200);

    expect(res.body.pagination.total).toBe(2);
    expect(res.body.data.every((t: TaskResponse) => t.status === 'todo')).toBe(true);
  });

  it('filters by priority', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?priority=high`)
      .expect(200);

    expect(res.body.pagination.total).toBe(2);
    expect(res.body.data.every((t: TaskResponse) => t.priority === 'high')).toBe(true);
  });

  it('filters by status and priority combined', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=todo&priority=high`)
      .expect(200);

    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].title).toBe('Todo High');
  });
});

describe('Integration: Search and pagination', () => {
  beforeEach(async () => {
    const project = await Project.create({ name: 'Search Project' });
    const projectId = project._id.toString();

    const tasks = Array.from({ length: 15 }, (_, i) => ({
      project_id: projectId,
      title: i % 2 === 0 ? `Deploy feature ${i}` : `Review code ${i}`,
      description: i === 0 ? 'Important deployment task' : null,
      status: 'todo' as const,
      priority: 'medium' as const,
    }));

    await Task.create(tasks);
  });

  it('searches tasks by title and description', async () => {
    const res = await request(app).get('/api/tasks?q=deploy').expect(200);

    expect(res.body.pagination.total).toBeGreaterThan(0);
    expect(res.body.data.every((t: TaskResponse) => t.project_name === 'Search Project')).toBe(true);
    expect(
      res.body.data.every(
        (t: TaskResponse) =>
          t.title.toLowerCase().includes('deploy') ||
          (t.description && t.description.toLowerCase().includes('deploy'))
      )
    ).toBe(true);
  });

  it('returns paginated results with total count', async () => {
    const page1 = await request(app).get('/api/tasks?page=1&limit=5').expect(200);

    expect(page1.body.data).toHaveLength(5);
    expect(page1.body.pagination.total).toBe(15);
    expect(page1.body.pagination.total_pages).toBe(3);
    expect(page1.body.pagination.has_next).toBe(true);
    expect(page1.body.pagination.has_prev).toBe(false);

    const page2 = await request(app).get('/api/tasks?page=2&limit=5').expect(200);

    expect(page2.body.data).toHaveLength(5);
    expect(page2.body.pagination.has_prev).toBe(true);
    expect(page2.body.pagination.has_next).toBe(true);
  });
});

describe('Integration: Error handling', () => {
  it('returns 404 for non-existent project', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await request(app)
      .post(`/api/projects/${fakeId}/tasks`)
      .send({ title: 'Orphan task' })
      .expect(404);

    expect(res.body.error.message).toBe('Project not found');
  });

  it('returns 409 for duplicate project name', async () => {
    await request(app).post('/api/projects').send({ name: 'Unique Name' }).expect(201);

    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Unique Name' })
      .expect(409);

    expect(res.body.error.message).toContain('already exists');
  });

  it('returns 400 for invalid project id', async () => {
    const res = await request(app).get('/api/projects/not-an-id').expect(400);
    expect(res.body.error.message).toBe('Invalid project id');
  });

  it('returns 400 for past due date on task create', async () => {
    const project = await Project.create({ name: 'Due Date Test' });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const res = await request(app)
      .post(`/api/projects/${project._id}/tasks`)
      .send({ title: 'Late task', due_date: yesterday.toISOString() })
      .expect(400);

    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'due_date' })])
    );
  });
});
