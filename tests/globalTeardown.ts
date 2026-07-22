export default async (): Promise<void> => {
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
};
