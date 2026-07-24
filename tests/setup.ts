import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Use a test secret if one isn't already defined
process.env.JWT_SECRET ??= 'test-secret';

jest.setTimeout(60000);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(global.__MONGO_URI__);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {

    if (key !== "users") {
      await collections[key].deleteMany({});
    }

  }
});

afterAll(async () => {
  await mongoose.disconnect();
});