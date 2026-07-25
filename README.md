# Task Management REST API

A Task Management REST API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

The API allows users to manage projects and tasks with JWT authentication, validation, filtering, sorting, pagination, searching, and automated testing.

---

# Features

## Authentication

- JWT-based authentication
- User registration and login
- Protected API routes
- User-based data isolation

## Projects

- Full CRUD operations
- Unique project names per user
- Project ownership
- Cascade delete associated tasks

## Tasks

- Full CRUD operations
- Tasks belong to exactly one project
- Status management:
  - `todo`
  - `in_progress`
  - `done`

- Priority management:
  - `low`
  - `medium`
  - `high`

- Due date validation (cannot be in the past)

## Task Management Features

- Filtering by:
  - status
  - priority
  - due date range

- Sorting by:
  - due_date
  - priority
  - created_date

- Pagination with total count

- Search using `q` parameter across:
  - title
  - description

## Additional Features

- MongoDB migrations using migrate-mongo to manage database changes.
- Seed script to create sample users, projects, and tasks.
- Docker Compose setup for running API and MongoDB together.
- Soft delete support using deleted_at timestamps.
- Automated unit and integration tests using Jest and Supertest.

---

# Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Jest
- Supertest
- Docker

---
## Design Decisions

- MongoDB was selected because tasks and projects have flexible structures while Mongoose provides schema validation.
- Projects reference users through user_id to support authentication and data isolation.
- Tasks reference projects through project_id to maintain ownership and relationships.
- Indexes are added for faster searching and filtering.

---
# Requirements

Before running the project, make sure you have:

- Node.js 18+ (20 recommended)
- MongoDB 6+
- npm

---
## Quick Start

```bash
git clone https://github.com/Farah-Tarek101/Task-Mangment.git
cd Task-Mangment
npm install
cp .env.example .env
npm run migrate:up
npm run seed
npm run dev
```

API:

```
http://localhost:3000/api
```
# Installation

## 1. Clone Repository

```bash
git clone https://github.com/Farah-Tarek101/Task-Mangment.git

cd Task-Mangment
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=my_task_management_secret
NODE_ENV=development
```

For testing:

Create `.env.test`

```env
NODE_ENV=test
JWT_SECRET=my_task_management_secret
```

Example `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your_secret_here
NODE_ENV=development
```

---

# Database Setup

## Option 1: Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/task_management
```

---

## Option 2: Docker MongoDB

```bash
docker run -d \
-p 27017:27017 \
--name task-management-mongo \
mongo:7
```

---

# Database Migrations

Apply migrations:

```bash
npm run migrate:up
```

Check migration status:

```bash
npm run migrate:status
```

Rollback latest migration:

```bash
npm run migrate:down
```

---

# Seed Database (Optional)

Create sample user, projects, and tasks:

```bash
npm run seed
```

---

# Running the Application

## Development Mode

```bash
npm run dev
```

## Build TypeScript

```bash
npm run build
```

## Production Mode

```bash
npm start
```

The API will run on:

```
http://localhost:3000
```

---

# Docker Support

Run API and MongoDB using Docker Compose:

```bash
docker-compose up --build
```

This starts:

- MongoDB container
- Node.js API container

API URL:

```
http://localhost:3000
```

Stop containers:

```bash
docker-compose down
```

Remove containers and volumes:

```bash
docker-compose down -v
```

---
# Architecture

The application follows a layered architecture:

- **Routes** define API endpoints.
- **Controllers** handle HTTP requests and responses.
- **Services** contain the business logic.
- **Models** define MongoDB schemas using Mongoose.
- **Middleware** handles authentication and error handling.
- **Validators** validate incoming requests.
  ---
  
# API Documentation

Base URL:

```
http://localhost:3000/api
```

---

# Authentication API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

---

## Register User

### Request

```
POST /api/auth/register
```

### Body

```json
{
  "name": "Farah5",
  "email": "farah6@gmail.com",
  "password": "12345678"
}
```

### Response

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "6a64dcaf72b73700c7ae412a",
    "name": "Farah5",
    "email": "farah6@gmail.com"
  }
}
```

---

## Login User

### Request

```
POST /api/auth/login
```

### Body

```json
{
  "email": "farah5@gmail.com",
  "password": "12345678"
}
```

### Response

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "6a64cd51219462dd10de01a2",
    "name": "Farah5",
    "email": "farah5@gmail.com"
  }
}
```

The returned JWT token must be added to protected requests:

```
Authorization: Bearer JWT_TOKEN
```
---

# Projects API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | Get all projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project by ID |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project and tasks |

---

## Create Project

### Request

```
POST /api/projects
```

### Headers

```
Authorization: Bearer JWT_TOKEN
```

### Body

```json
{
  "name": "Task Management App21",
  "description": "Backend internship project"
}
```

### Response

```json
{
  "user_id": "6a63729c37787de8ccaed713",
  "name": "Task Management App21",
  "description": "Backend internship project",
  "deleted_at": null,
  "created_at": "2026-07-25T15:57:12.784Z",
  "updated_at": "2026-07-25T15:57:12.784Z",
  "id": "6a64dcd872b73700c7ae412c"
}
```

---

## Get All Projects

### Request

```
GET /api/projects
```

### Headers

```
Authorization: Bearer JWT_TOKEN
```

### Response

```json
[
  {
    "id": "6a64dcd872b73700c7ae412c",
    "name": "Task Management App21",
    "description": "Backend internship project",
    "created_at": "2026-07-25T15:57:12.784Z",
    "updated_at": "2026-07-25T15:57:12.784Z"
  }
]
```

---

## Update Project

### Request

```
PUT /api/projects/:id
```

### Body

```json
{
  "name": "Updated Task Management App",
  "description": "Updated backend project"
}
```

### Response

```json
{
  "message": "Project updated successfully",
  "project": {
    "id": "6a64dcd872b73700c7ae412c",
    "name": "Updated Task Management App",
    "description": "Updated backend project"
  }
}
```

---

## Delete Project

### Request

```
DELETE /api/projects/:id
```

### Response

```json
{
  "message": "Project deleted successfully"
}
```

Deleting a project also deletes all related tasks.

---

# Tasks API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks |
| GET | `/projects/:projectId/tasks` | Get tasks of a project |
| POST | `/projects/:projectId/tasks` | Create task |
| GET | `/tasks/:id` | Get task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

---

# Create Task

### Request

```
POST /api/projects/:projectId/tasks
```
### Headers
Authorization: Bearer JWT_TOKEN
### Body

```json
{
  "title": "Implement homepage",
  "description": "Build responsive homepage",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-08-01"
}
```

### Response

```json
{
  "id": "77a123456789",
  "project_id": "6a64dcd872b73700c7ae412c",
  "title": "Implement homepage",
  "description": "Build responsive homepage",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-08-01",
  "created_at": "2026-07-25T15:00:00Z"
}
```

---
# Filtering, Sorting and Pagination

Tasks support filtering, sorting, searching, and pagination.

## Supported Query Parameters

| Parameter | Description |
|---|---|
| status | Filter by task status (`todo`, `in_progress`, `done`) |
| priority | Filter by priority (`low`, `medium`, `high`) |
| due_date_from | Filter tasks starting from a specific date |
| due_date_to | Filter tasks until a specific date |
| sort | Sort field (`due_date`, `priority`, `created_at`) |
| order | Sort order (`asc`, `desc`) |
| page | Page number |
| limit | Number of results per page |
| q | Search in task title and description |

---

## Filter Tasks

### Request

```http
GET /api/tasks?status=todo&priority=high
```

### Response

```json
{
  "data": [
    {
      "id": "77a123456789",
      "title": "Fix API bugs",
      "description": "Resolve authentication issues",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-08-01"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

## Search Tasks

### Request

```http
GET /api/tasks?q=homepage
```

### Response

```json
{
  "data": [
    {
      "id": "77a123456789",
      "title": "Implement homepage",
      "description": "Build responsive homepage"
    }
  ]
}
```

---

## Sort Tasks

### Request

```http
GET /api/tasks?sort=due_date&order=asc
```

### Response

```json
{
  "data": [
    {
      "title": "Database migration",
      "due_date": "2026-07-30"
    },
    {
      "title": "Frontend design",
      "due_date": "2026-08-01"
    }
  ]
}
```

---

## Pagination Example

### Request

```http
GET /api/tasks?page=1&limit=10
```

### Response

```json
{
  "data": [
    {
      "id": "77a123456789",
      "title": "Implement homepage",
      "status": "todo",
      "priority": "high"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

# Postman Collection

A Postman collection is included for testing all API endpoints.

File:

```
Task Mangment.postman_collection.json
```

The collection includes:

## Authentication

- Register
- Login
- JWT authentication

## Projects

- Create project
- View projects
- View project by ID
- Update project
- Delete project

## Tasks

- Create task
- View project tasks
- Update task
- Delete task

## Advanced Testing

- Filtering
- Sorting
- Pagination
- Search
- Validation scenarios
- Business rules testing


## Using Postman

1. Start the API:

```bash
npm run dev
```

2. Import:

```
Task Mangment.postman_collection.json
```

3. Register:

```
POST /api/auth/register
```

4. Login:

```
POST /api/auth/login
```

5. Copy JWT token.

6. Add token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# Postman Screenshots

Screenshots showing part of the API testing workflow are included in the `images` folder.

## Authentication

### Register User

![Register](images/register.png)

### Login User

![Login](images/login.png)

---

## Projects

### Create Project

![Create Project](images/addnewproject.png)

### View All Projects

![View Projects](images/viewallprojects.png)

### Update Project

![Edit Project](images/editprojecctbyid.png)

### Delete Project

![Delete Project](images/deleteprojectbyid%20.png)

---

## Tasks

### Create Task

![Create Task](images/creattask.png)

### View Tasks Of A Project

![View Tasks](images/viewtasksofaproject.png)

---

## Sorting

### Sort By Due Date Ascending

![Sorting](images/Sortbyduedateascending.png)

---

# Running Tests

Run all tests:

```bash
npm test
```

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

Tests use an in-memory MongoDB database.

Coverage includes:

- Project lifecycle
- Task lifecycle
- Filtering
- Sorting
- Search
- Pagination
- Validation
- Authentication
- Error handling

---

# Project Structure

```
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── validators/
├── utils/
└── server.ts

tests/
├── unit/
└── integration/

migrations/

scripts/
└── seed.ts

images/
├── addnewproject.png
├── creattask.png
├── deleteprojectbyid.png
├── editprojecctbyid.png
├── login.png
├── Sortbyduedateascending.png
├── register.png
├── viewallprojects.png
└── viewtasksofaproject.png

Task Mangment.postman_collection.json

.env.example
.gitignore
Dockerfile
docker-compose.yml
package.json
README.md
```

---

# License

MIT
