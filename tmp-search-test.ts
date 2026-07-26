import dotenv from 'dotenv';
import request from 'supertest';
import createApp from './src/app';

dotenv.config();

const app = createApp();

async function main() {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Search Test', email: 'search-test@example.com', password: 'password123' });
  console.log('register status', registerRes.status, registerRes.body);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'search-test@example.com', password: 'password123' });
  console.log('login status', loginRes.status, loginRes.body);
  const token = loginRes.body.token;
  if (!token) {
    console.error('No token returned from login');
    return;
  }

  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Search Project', description: 'Search project description' });
  console.log('project status', projectRes.status, projectRes.body);
  const projectId = projectRes.body.id;

  await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Deploy feature X', description: 'Deploy to production', priority: 'high', due_date: '2099-12-31' });

  await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Review code Y', description: 'Code review required', priority: 'low', due_date: '2099-12-31' });

  const searchRes = await request(app)
    .get('/api/tasks?q=deploy')
    .set('Authorization', `Bearer ${token}`);
  console.log('search status', searchRes.status, searchRes.body);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});