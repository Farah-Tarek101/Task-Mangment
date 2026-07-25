import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'my_task_management_secret';

jest.setTimeout(60000);


beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(global.__MONGO_URI__);
  }
});


afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {

    // Keep users because the token is created from this user
    if (key === 'users') continue;

    await collections[key].deleteMany({});
  }
});


afterAll(async () => {

  // Remove test users
  const collections = mongoose.connection.collections;

  if (collections.users) {
    await collections.users.deleteMany({});
  }


  // Close mongoose connection completely
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connection.close();

});