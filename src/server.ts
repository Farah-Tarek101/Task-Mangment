import 'dotenv/config';
import createApp from './app';
import { connectDB } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

export async function start(): Promise<void> {
  await connectDB();
  logger.info('Connected to MongoDB');

  const app = createApp();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err: Error) => {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
}
