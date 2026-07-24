import { MongoMemoryServer } from "mongodb-memory-server";

declare global {
var __MONGO_URI__: string;
var __MONGO_SERVER__: MongoMemoryServer;
}

export { };
