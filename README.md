# Task Management REST API

A production-ready Task Management REST API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

The API allows users to manage projects and tasks with authentication, validation, filtering, sorting, pagination, searching, and automated testing.

## Features

### Authentication
- JWT-based authentication
- User registration and login
- Protected API routes
- User-based data isolation

### Projects
- Create, read, update, and delete projects
- Unique project names per user
- Project ownership
- Cascade delete associated tasks

### Tasks
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


### Task Management Features
- Filter tasks by:
  - status
  - priority
  - due date range
- Sort by:
  - due date
  - priority
  - created date
- Pagination with total count
- Search using `q` parameter across:
  - title
  - description
### Additional Features
- MongoDB migrations using migrate-mongo
- Database seed script
- Docker support
- Soft delete support
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
git clone <repository-url>

cd task-management

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

For running tests, the project uses `.env.test` automatically.

Example `.env.test`:

```env
NODE_ENV=test
JWT_SECRET=my_task_management_secret
```

---

## 4. Start MongoDB

Make sure MongoDB is running locally.

### Option 1: Local MongoDB

Start your MongoDB service and use:

```env
MONGODB_URI=mongodb://localhost:27017/task_management
```

### Option 2: Using Docker

Run MongoDB with Docker:

```bash
docker run -d \
  -p 27017:27017 \
  --name task-management-mongo \
  mongo:7
```

---

## 5. Run Database Migrations

Apply database migrations:

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

Compile TypeScript files:

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

## 8. Running Tests

The project includes unit tests and integration tests.

Run all tests:

```bash
npm test
```

Run unit tests only:

```bash
npm run test:unit
```

Run integration tests only:

```bash
npm run test:integration
```

Tests use an in-memory MongoDB database, so no external test database is required.

Current test coverage includes:

- Project and task lifecycle flow
- Task filtering
- Task search
- Pagination
- Validation rules
- Error handling
- Authentication flow

---

## 9. Docker Support

Build and run the application using Docker Compose:

```bash
docker-compose up --build
```

This starts the required services and runs the application in containers.
