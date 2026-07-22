# Task Management REST API

A production-ready Task Management REST API built with **Node.js**, **Express**, and **MongoDB**. Supports full CRUD for projects and tasks, with filtering, sorting, pagination, and search.

## Features

- Full CRUD for **Projects** and **Tasks**
- Task filtering by status, priority, and due date range
- Sorting by due date, priority, or created date
- Pagination with total count
- Case-insensitive search across task titles and descriptions
- Cascade delete: removing a project deletes all its tasks
- Input validation with clear error messages
- Database migrations via `migrate-mongo`
- Unit and integration tests
- Docker support
- Seed script for sample data

## Prerequisites

- **Node.js** 18+ (20 recommended)
- **MongoDB** 6+ (local install or Docker)

## Quick Start

### 1. Clone and install

```bash
git clone <repository-url>
cd backend-intern
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Default values in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_management
NODE_ENV=development
```

### 3. Start MongoDB

If using Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 4. Run migrations

```bash
npm run migrate:up
```

### 5. (Optional) Seed sample data

```bash
npm run seed
```

### 6. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

### Using Docker Compose (all-in-one)

```bash
docker-compose up --build
```

Or with Make:

```bash
make docker-up
```

## API Documentation

Base URL: `http://localhost:3000`

All error responses follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "details": [{ "field": "name", "message": "Project name is required" }]
  }
}
```

Paginated list responses:

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "page": 1,
    "offset": 0,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### Projects

#### Create a project

```http
POST /api/projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign the company website"
}
```

**Response `201`:**

```json
{
  "id": "665a1b2c3d4e5f6789012345",
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "created_at": "2025-07-22T10:00:00.000Z",
  "updated_at": "2025-07-22T10:00:00.000Z"
}
```

#### List projects (paginated)

```http
GET /api/projects?page=1&limit=10
```

#### Get a project

```http
GET /api/projects/:id
```

#### Update a project

```http
PUT /api/projects/:id
Content-Type: application/json

{
  "name": "Website Redesign v2",
  "description": "Updated scope"
}
```

#### Delete a project (cascade deletes tasks)

```http
DELETE /api/projects/:id
```

**Response `200`:**

```json
{
  "message": "Project and associated tasks deleted successfully"
}
```

---

### Tasks

#### Create a task under a project

```http
POST /api/projects/:projectId/tasks
Content-Type: application/json

{
  "title": "Implement homepage",
  "description": "Build responsive homepage",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-08-01"
}
```

**Response `201`:**

```json
{
  "id": "665a1b2c3d4e5f6789012346",
  "project_id": "665a1b2c3d4e5f6789012345",
  "title": "Implement homepage",
  "description": "Build responsive homepage",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-08-01T00:00:00.000Z",
  "created_at": "2025-07-22T10:00:00.000Z",
  "updated_at": "2025-07-22T10:00:00.000Z"
}
```

#### List tasks for a project

```http
GET /api/projects/:projectId/tasks?status=todo&priority=high&sort_by=due_date&sort_order=asc&page=1&limit=10
```

**Query parameters:**

| Parameter       | Description                                      |
|----------------|--------------------------------------------------|
| `status`       | Filter: `todo`, `in_progress`, `done`          |
| `priority`     | Filter: `low`, `medium`, `high`                  |
| `due_date_from`| Filter tasks due on or after this date (ISO)     |
| `due_date_to`  | Filter tasks due on or before this date (ISO)    |
| `sort_by`      | Sort field: `due_date`, `priority`, `created_at` |
| `sort_order`   | `asc` or `desc` (default: `desc`)              |
| `page`         | Page number (default: 1)                         |
| `limit`        | Items per page, max 100 (default: 10)            |
| `offset`       | Alternative to page-based pagination             |
| `q`            | Search task titles and descriptions              |

#### List all tasks (across projects)

```http
GET /api/tasks?q=deploy&status=in_progress&page=1&limit=10
```

Each task includes `project_name`:

```json
{
  "data": [
    {
      "id": "...",
      "project_id": "...",
      "project_name": "Website Redesign",
      "title": "Deploy to staging",
      "status": "in_progress",
      "priority": "high",
      "due_date": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "pagination": { ... }
}
```

#### Get a single task

```http
GET /api/tasks/:id
```

#### Update a task

```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "done"
}
```

#### Delete a task

```http
DELETE /api/tasks/:id
```

---

### Health check

```http
GET /health
```

---

## Validation Rules

| Rule | Behavior |
|------|----------|
| Project name | Required, unique, max 200 chars |
| Task title | Required, max 300 chars |
| Task status | `todo` (default), `in_progress`, `done` |
| Task priority | `low`, `medium` (default), `high` |
| Due date | Optional; if set, must be today or future |
| Status `done → todo` | Allowed; logged as unusual transition |
| Duplicate project name | Returns `409 Conflict` |
| Invalid project/task ID | Returns `400 Bad Request` |
| Non-existent project/task | Returns `404 Not Found` |
| Delete project | Cascade deletes all associated tasks |

## Database Schema

### Design rationale

**Projects** and **Tasks** are stored in separate MongoDB collections with a reference relationship (`tasks.project_id → projects._id`). This normalized design avoids data duplication while keeping queries efficient.

**Indexes:**

- `projects.name` — unique constraint for duplicate rejection
- `tasks.project_id` — fast lookup of tasks by project
- Compound indexes on `(project_id, status)`, `(project_id, priority)`, `(project_id, due_date)` — optimize filtered list queries
- Text index on `(title, description)` — support search queries
- Individual indexes on `status`, `priority`, `due_date`, `created_at` — support global task listing and sorting

**N+1 prevention:** When listing all tasks, project names are fetched in a single batch query using `$in` on unique project IDs, not one query per task.

### Migrations

Schema changes are managed with [migrate-mongo](https://github.com/seppevs/migrate-mongo):

```bash
npm run migrate:up      # Apply pending migrations
npm run migrate:down    # Rollback last migration
npm run migrate:status  # Check migration status
```

## Testing

Tests use an in-memory MongoDB instance — no external database required.

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

Or with Make:

```bash
make test
make test-unit
make test-integration
```

### Test coverage

**Unit tests** (`tests/unit/`):
- Task validation (title, status, priority, due date)
- Status transition logging (`done → todo`)
- Due date boundary checks
- Project validation

**Integration tests** (`tests/integration/`):
- Full lifecycle: create project → add task → mark done → delete project
- Filter tasks by status and priority
- Search tasks with pagination
- Error handling (404, 409, 400)

## Project Structure

```
├── migrations/           # Database migrations (migrate-mongo)
├── scripts/
│   └── seed.js           # Sample data seeder
├── src/
│   ├── config/           # Database connection
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Error handling, async wrapper
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── services/         # Business logic layer
│   ├── utils/            # Helpers, logger, errors
│   ├── validators/       # Input validation
│   ├── app.js            # Express app factory
│   └── server.js         # Entry point
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # API integration tests
│   └── setup.js          # Test database setup
├── docker-compose.yml
├── Dockerfile
├── Makefile
└── README.md
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm test` | Run full test suite |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run migrate:up` | Apply migrations |
| `npm run migrate:down` | Rollback migrations |
| `npm run seed` | Populate database with sample data |

## License

MIT
