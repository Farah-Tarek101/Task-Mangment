import request from 'supertest';
import createApp from '../../src/app';
import Project from '../../src/models/Project';
import Task from '../../src/models/Task';

const app = createApp();

let token: string;
let userId: string;

function futureDate(daysFromNow = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: "Test User",
      email: "integration@test.com",
      password: "12345678"
    });

  token = res.body.token;
  userId = res.body.user?.id;
});


const auth = () => ({
  Authorization: `Bearer ${token}`
});



describe('Integration: Project lifecycle flow', () => {

  it('Create project → Add task → Mark done → Delete project (cascade)', async () => {

    const projectRes = await request(app)
      .post('/api/projects')
      .set(auth())
      .send({
        name: 'Lifecycle Project',
        description: 'Integration test'
      })
      .expect(201);


    expect(projectRes.body.name)
      .toBe('Lifecycle Project');


    const projectId = projectRes.body.id;



    const taskRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(auth())
      .send({
        title:'Complete integration test',
        priority:'high',
        due_date:futureDate()
      })
      .expect(201);



    expect(taskRes.body.status)
      .toBe('todo');


    const taskId = taskRes.body.id;



    const doneRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(auth())
      .send({
        status:'done'
      })
      .expect(200);



    expect(doneRes.body.status)
      .toBe('done');



    await request(app)
      .delete(`/api/projects/${projectId}`)
      .set(auth())
      .expect(200);



    const deletedProject = await Project.findById(projectId);

    expect(deletedProject).not.toBeNull();
    expect(deletedProject?.deleted_at).not.toBeNull();



    const deletedTask = await Task.findById(taskId);

    expect(deletedTask).not.toBeNull();
    expect(deletedTask?.deleted_at).not.toBeNull();

  });

});





describe('Integration: Filter tasks',()=>{

let projectId:string;


beforeEach(async()=>{

const project = await Project.create({

name:'Filter Test Project',

user_id:userId

});


projectId = project._id.toString();



await Task.create([

{
project_id:projectId,
user_id:userId,
title:'Todo Low',
status:'todo',
priority:'low'
},

{
project_id:projectId,
user_id:userId,
title:'Todo High',
status:'todo',
priority:'high'
},

{
project_id:projectId,
user_id:userId,
title:'Done Medium',
status:'done',
priority:'medium'
},

{
project_id:projectId,
user_id:userId,
title:'Progress High',
status:'in_progress',
priority:'high'
}

]);

});



it('filters status',async()=>{

const res = await request(app)
.get(`/api/projects/${projectId}/tasks?status=todo`)
.set(auth())
.expect(200);


expect(res.body.pagination.total)
.toBe(2);

});



it('filters priority',async()=>{

const res = await request(app)
.get(`/api/projects/${projectId}/tasks?priority=high`)
.set(auth())
.expect(200);


expect(res.body.pagination.total)
.toBe(2);

});



it('filters status and priority together',async()=>{

const res = await request(app)
.get(`/api/projects/${projectId}/tasks?status=todo&priority=high`)
.set(auth())
.expect(200);


expect(res.body.pagination.total)
.toBe(1);

});


});







describe('Search and pagination',()=>{


beforeEach(async()=>{

const project =
await Project.create({

name:'Search Project',
user_id:userId

});



const tasks =
Array.from({length:15},(_,i)=>({

project_id:project._id.toString(),

user_id:userId,


title:
i%2===0
?`Deploy feature ${i}`
:`Review code ${i}`,


description:
i===0
?'Important deployment task'
:null,


status:'todo',

priority:'medium'


}));



await Task.create(tasks);


});





it('search tasks',async()=>{

const res =
await request(app)
.get('/api/tasks?q=deploy')
.set(auth())
.expect(200);



expect(res.body.pagination.total)
.toBeGreaterThan(0);

});





it('returns pagination',async()=>{

const res =
await request(app)
.get('/api/tasks?page=1&limit=5')
.set(auth())
.expect(200);



expect(res.body.data.length)
.toBe(5);



expect(res.body.pagination.total)
.toBe(15);


});


});







describe('Error handling',()=>{


it('returns 404 for missing project',async()=>{


const res =
await request(app)
.post('/api/projects/507f1f77bcf86cd799439011/tasks')
.set(auth())
.send({

title:'orphan'

})
.expect(404);



expect(res.body.error.message)
.toBe('Project not found');


});





it('duplicate project name',async()=>{


await request(app)
.post('/api/projects')
.set(auth())
.send({
name:'Unique Name'
})
.expect(201);



await request(app)
.post('/api/projects')
.set(auth())
.send({
name:'Unique Name'
})
.expect(409);


});





it('invalid project id',async()=>{


const res =
await request(app)
.get('/api/projects/not-an-id')
.set(auth())
.expect(400);



expect(res.body.error.message)
.toBe('Invalid project id');


});







it('past due date rejected',async()=>{


const project =
await Project.create({

name:'Due Date Test',

user_id:userId

});

const yesterday =
new Date();

yesterday.setDate(
yesterday.getDate()-1
);

await request(app)
.post(`/api/projects/${project._id}/tasks`)
.set(auth())
.send({

title:'Late task',

due_date:yesterday.toISOString()

})
.expect(400);


});


});