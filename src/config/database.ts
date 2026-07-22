import mongoose from 'mongoose';

export async function connectDB(uri?: string): Promise<typeof mongoose.connection> {
  const connectionUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management';
  await mongoose.connect(connectionUri);
  return mongoose.connection;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
