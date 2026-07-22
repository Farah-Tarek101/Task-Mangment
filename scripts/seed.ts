import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/config/database';
import Project from '../src/models/Project';
import Task from '../src/models/Task';
import logger from '../src/utils/logger';

function futureDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

async function seed(): Promise<void> {
  await connectDB();
  logger.info('Connected to MongoDB');

  await Task.deleteMany({});
  await Project.deleteMany({});

  const projects = await Project.insertMany([
    {
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
    },
    {
      name: 'Mobile App',
      description: 'Build a cross-platform mobile application',
    },
    {
      name: 'API Migration',
      description: 'Migrate legacy REST API to new architecture',
    },
  ]);

  const [website, mobile, api] = projects;

  await Task.insertMany([
    {
      project_id: website._id,
      title: 'Create wireframes',
      description: 'Design wireframes for all main pages',
      status: 'done',
      priority: 'high',
      due_date: futureDate(-2),
    },
    {
      project_id: website._id,
      title: 'Implement homepage',
      description: 'Build responsive homepage with hero section',
      status: 'in_progress',
      priority: 'high',
      due_date: futureDate(5),
    },
    {
      project_id: website._id,
      title: 'Write unit tests',
      status: 'todo',
      priority: 'medium',
      due_date: futureDate(10),
    },
    {
      project_id: mobile._id,
      title: 'Setup React Native project',
      status: 'done',
      priority: 'high',
    },
    {
      project_id: mobile._id,
      title: 'Implement authentication',
      description: 'JWT-based auth with refresh tokens',
      status: 'in_progress',
      priority: 'high',
      due_date: futureDate(14),
    },
    {
      project_id: mobile._id,
      title: 'Push notifications',
      status: 'todo',
      priority: 'low',
      due_date: futureDate(30),
    },
    {
      project_id: api._id,
      title: 'Audit existing endpoints',
      status: 'done',
      priority: 'medium',
    },
    {
      project_id: api._id,
      title: 'Design new schema',
      description: 'Define MongoDB collections and indexes',
      status: 'in_progress',
      priority: 'high',
      due_date: futureDate(7),
    },
    {
      project_id: api._id,
      title: 'Write migration scripts',
      status: 'todo',
      priority: 'medium',
      due_date: futureDate(21),
    },
  ]);

  logger.info(`Seeded ${projects.length} projects and 9 tasks`);
  await disconnectDB();
}

seed().catch((err: Error) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
