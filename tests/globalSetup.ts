import { MongoMemoryServer } from "mongodb-memory-server";

export default async (): Promise<void> => {

  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "7.0.24",
    },
    instance: {
      storageEngine: "wiredTiger",
    },
  });

  global.__MONGO_URI__ = mongoServer.getUri();
  global.__MONGO_SERVER__ = mongoServer;
};