module.exports = {
  async up(db) {
    await db.createCollection('projects');
    await db.createCollection('tasks');

    await db.collection('projects').createIndex({ name: 1 }, { unique: true });
    await db.collection('projects').createIndex({ created_at: -1 });

    await db.collection('tasks').createIndex({ project_id: 1 });
    await db.collection('tasks').createIndex({ project_id: 1, status: 1 });
    await db.collection('tasks').createIndex({ project_id: 1, priority: 1 });
    await db.collection('tasks').createIndex({ project_id: 1, due_date: 1 });
    await db.collection('tasks').createIndex({ status: 1, priority: 1 });
    await db.collection('tasks').createIndex({ due_date: 1 });
    await db.collection('tasks').createIndex({ created_at: -1 });
    await db.collection('tasks').createIndex({ title: 'text', description: 'text' });
  },

  async down(db) {
    await db.collection('tasks').drop().catch(() => {});
    await db.collection('projects').drop().catch(() => {});
  },
};
