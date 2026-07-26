import express, { Express } from 'express';
import path from 'path';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/auth', authRoutes);

  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
