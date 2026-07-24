import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  var __MONGO_URI__: string;
  var __MONGO_SERVER__: MongoMemoryServer;
}

export default async (): Promise<void> => {

  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.14'
    },
    instance: {
      storageEngine: 'wiredTiger'
    }
  });


  global.__MONGO_URI__ = mongoServer.getUri();

  global.__MONGO_SERVER__ = mongoServer;

};