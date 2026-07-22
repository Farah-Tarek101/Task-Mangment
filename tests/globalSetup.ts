import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_URI__: string;
  // eslint-disable-next-line no-var
  var __MONGO_SERVER__: MongoMemoryServer;
}

export default async (): Promise<void> => {
  const mongoServer = await MongoMemoryServer.create({
    binary: { version: '7.0.14' },
  });
  global.__MONGO_URI__ = mongoServer.getUri();
  global.__MONGO_SERVER__ = mongoServer;
};
