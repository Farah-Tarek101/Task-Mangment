# Task Management REST API

A Task Management REST API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

This API allows users to manage projects and tasks with authentication, validation, filtering, sorting, pagination, searching, and automated testing.

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

- Filtering:
  - status
  - priority
  - due date range

- Sorting:
  - due_date
  - priority
  - created_at

- Pagination with total count

- Search using `q` parameter across:
  - title
  - description

## Additional Features

- MongoDB migrations using migrate-mongo
- Database seed script
- Docker and Docker Compose support
- Soft delete functionality
- Unit and integration tests

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

# Requirements

Before running the project, make sure you have:

- Node.js 18+ (20 recommended)
- MongoDB 6+
- npm

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/Farah-Tarek101/Task-Mangment.git

cd Task-Mangment
```

---

## 2. Install dependencies

Install all required packages:

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=my_task_management_secret
NODE_ENV=development
```

For testing, the project uses `.env.test` automatically.

Example `.env.test`:

```env
NODE_ENV=test
JWT_SECRET=my_task_management_secret
```

---

## 4. Start MongoDB

Make sure MongoDB is running before starting the application.

### Option 1: Local MongoDB

Use:

```env
MONGODB_URI=mongodb://localhost:27017/task_management
```

### Option 2: Using Docker

Run MongoDB container:

```bash
docker run -d \
  -p 27017:27017 \
  --name task-management-mongo \
  mongo:7
```

---

## 5. Run Database Migrations

Apply migrations:

```bash
npm run migrate:up
```

Check migration status:

```bash
npm run migrate:status
```

Rollback the latest migration:

```bash
npm run migrate:down
```

---

## 6. Seed Database (Optional)

Create sample user, projects, and tasks:

```bash
npm run seed
```

---

## 7. Run the Application

### Development mode

Runs the server with automatic reload:

```bash
npm run dev
```

### Build TypeScript

Compile TypeScript:

```bash
npm run build
```

### Production mode

Start the compiled application:

```bash
npm start
```

The API will be available at:

```
http://localhost:3000
```

---

# API Overview

Base URL:

```
http://localhost:3000/api
```

---

## Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

---

## Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all projects |
| POST | `/projects` | Create a project |
| GET | `/projects/:id` | Get project by ID |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project and related tasks |

Example create project:

```json
{
  "name": "Website Redesign",
  "description": "Redesign company website"
}
```

---

## Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/projects/:projectId/tasks` | Get tasks for a project |
| POST | `/projects/:projectId/tasks` | Create a task |
| GET | `/tasks/:id` | Get task by ID |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

Example create task:

```json
{
  "title": "Implement homepage",
  "description": "Build responsive homepage",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-08-01"
}
```

---

## Task Filtering, Sorting and Pagination

Example:

```
GET /api/tasks?status=todo&priority=high&page=1&limit=10
```

Supported query parameters:

| Parameter | Description |
|-----------|-------------|
| status | Filter by task status |
| priority | Filter by task priority |
| due_date_from | Tasks after this date |
| due_date_to | Tasks before this date |
| sort_by | due_date, priority, created_at |
| sort_order | asc or desc |
| page | Page number |
| limit | Number of results |
| q | Search title and description |

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

Dockerfile
docker-compose.yml
package.json
README.md
```

---

# Running Tests

The project includes unit and integration tests.

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

Tests use an in-memory MongoDB database, so no external test database is required.

Current tests cover:

- Project creation and deletion flow
- Task lifecycle flow
- Filtering
- Search
- Pagination
- Validation rules
- Authentication
- Error handling

---

# Docker Support

The project supports running the API and MongoDB using Docker Compose.

Build and start containers:

```bash
docker-compose up --build
```

This starts:

- MongoDB container
- Node.js API container

The API will be available at:

```
http://localhost:3000
```

---

# Postman Collection

A Postman collection is included for testing all API endpoints.

The collection covers:

## Authentication

- Register user
- Login user
- JWT authentication

## Projects

- Create project
- Get all projects
- Get project by ID
- Update project
- Delete project

## Tasks

- Create task
- Get tasks by project
- Get task by ID
- Update task
- Delete task

## Advanced Testing

- Filtering
- Sorting
- Pagination
- Search
- Validation rules
- Business rules testing

Import the collection file:

```
Task Mangment.postman_collection.json
```

Before testing protected endpoints:

1. Register a user:

```
POST /api/auth/register
```

2. Login:

```
POST /api/auth/login
```

3. Copy the returned JWT token.

4. Add it to protected requests:

```
Authorization: Bearer <your_token>
```

---

# License

MIT
