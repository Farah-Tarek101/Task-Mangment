import express, { Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import authRoutes from "./routes/authRoutes";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
app.use("/api/auth", authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
