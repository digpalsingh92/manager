# 🏗 Project Management API

A production-grade RESTful API for managing projects, tasks, and teams with dynamic RBAC (Role-Based Access Control), built with **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**.

## 🚀 Tech Stack

| Technology             | Purpose               |
| ---------------------- | --------------------- |
| **Node.js**            | Runtime               |
| **Express**            | HTTP framework        |
| **TypeScript**         | Type safety           |
| **Prisma**             | ORM & migrations      |
| **PostgreSQL**         | Database              |
| **JWT**                | Authentication        |
| **bcryptjs**           | Password hashing      |
| **Zod**                | Request validation    |
| **Winston**            | Logging               |
| **Helmet**             | Security headers      |
| **CORS**               | Cross-origin requests |
| **express-rate-limit** | Rate limiting         |
| **Docker**             | Containerization      |

## 📁 Architecture

```
server/src/
├── config/                    # Configuration
│   ├── env.config.ts          # Environment variables
│   └── database.config.ts     # Prisma client
├── middlewares/                # Express middleware
│   ├── auth.middleware.ts     # JWT authentication
│   ├── permission.middleware.ts # Dynamic RBAC
│   ├── error.middleware.ts    # Centralized error handler
│   └── validate.middleware.ts # Zod validation
├── modules/                   # Feature modules
│   ├── auth/                  # Authentication
│   ├── users/                 # User management
│   ├── roles/                 # Role management
│   ├── permissions/           # Permission management
│   ├── projects/              # Project CRUD
│   ├── tasks/                 # Task management
│   └── comments/              # Task comments
├── prisma/
│   └── seed.ts                # Database seeding
├── utils/                     # Utilities
│   ├── appError.ts            # Custom error class
│   ├── asyncHandler.ts        # Async wrapper
│   ├── logger.ts              # Winston logger
│   └── response.ts            # Response helpers
├── routes.ts                  # Route aggregator
└── server.ts                  # App entry point
```

Each module follows the **Controller → Service → Repository** pattern.

## 🏁 Quick Start

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** 14+ (or Docker)
- **npm** or **yarn**

### Option 1: Local Development

```bash
# 1. Clone & install
cd server
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database
npm run prisma:seed

# 6. Start development server
npm run dev
```

### Option 2: Docker

```bash
# Start PostgreSQL + API
docker-compose up -d

# The API will be available at http://localhost:5000
```

## 🔑 Default Users (after seeding)

| Role                | Email                     | Password  |
| ------------------- | ------------------------- | --------- |
| **Admin**           | admin@projectmanager.com  | Admin@123 |
| **Project Manager** | pm@projectmanager.com     | User@123  |
| **Developer**       | dev@projectmanager.com    | User@123  |
| **Viewer**          | viewer@projectmanager.com | User@123  |

## 🔐 RBAC System

### Roles & Permissions Matrix

| Permission     | Admin | PM  | Developer | Viewer |
| -------------- | :---: | :-: | :-------: | :----: |
| create_project |  ✅   | ✅  |    ❌     |   ❌   |
| update_project |  ✅   | ✅  |    ❌     |   ❌   |
| delete_project |  ✅   | ❌  |    ❌     |   ❌   |
| manage_members |  ✅   | ✅  |    ❌     |   ❌   |
| create_task    |  ✅   | ✅  |    ✅     |   ❌   |
| update_task    |  ✅   | ✅  |    ✅     |   ❌   |
| move_task      |  ✅   | ✅  |    ✅     |   ❌   |
| delete_task    |  ✅   | ✅  |    ❌     |   ❌   |
| assign_task    |  ✅   | ✅  |    ✅     |   ❌   |
| comment_task   |  ✅   | ✅  |    ✅     |   ✅   |
| manage_users   |  ✅   | ❌  |    ❌     |   ❌   |

Permissions are **dynamic** — stored in the database, not hardcoded. You can create new roles and assign any combination of permissions at runtime.

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

All protected routes require the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint         | Description              | Auth |
| ------ | ---------------- | ------------------------ | ---- |
| POST   | `/auth/register` | Register a new user      | ❌   |
| POST   | `/auth/login`    | Login and get JWT        | ❌   |
| GET    | `/auth/me`       | Get current user profile | ✅   |

### Users

| Method | Endpoint          | Description                | Permission     |
| ------ | ----------------- | -------------------------- | -------------- |
| GET    | `/users`          | List all users (paginated) | `manage_users` |
| PATCH  | `/users/:id/role` | Update user roles          | `manage_users` |

### Projects

| Method | Endpoint                | Description               | Permission       |
| ------ | ----------------------- | ------------------------- | ---------------- |
| GET    | `/projects`             | List projects (paginated) | Authenticated    |
| GET    | `/projects/:id`         | Get project details       | Authenticated    |
| POST   | `/projects`             | Create project            | `create_project` |
| PATCH  | `/projects/:id`         | Update project            | `update_project` |
| DELETE | `/projects/:id`         | Soft delete project       | `delete_project` |
| POST   | `/projects/:id/members` | Add project member        | `manage_members` |

### Tasks

| Method | Endpoint                    | Description           | Permission    |
| ------ | --------------------------- | --------------------- | ------------- |
| GET    | `/tasks/project/:projectId` | List tasks by project | Authenticated |
| POST   | `/tasks`                    | Create task           | `create_task` |
| PATCH  | `/tasks/:id`                | Update task           | `update_task` |
| DELETE | `/tasks/:id`                | Soft delete task      | `delete_task` |
| PATCH  | `/tasks/:id/move`           | Change task status    | `move_task`   |
| PATCH  | `/tasks/:id/assign`         | Assign/unassign task  | `assign_task` |

### Comments

| Method | Endpoint                 | Description           | Permission     |
| ------ | ------------------------ | --------------------- | -------------- |
| GET    | `/comments/task/:taskId` | List comments by task | Authenticated  |
| POST   | `/comments`              | Create comment        | `comment_task` |
| DELETE | `/comments/:id`          | Delete own comment    | Authenticated  |

### Roles & Permissions

| Method | Endpoint       | Description          | Permission     |
| ------ | -------------- | -------------------- | -------------- |
| GET    | `/roles`       | List all roles       | Authenticated  |
| GET    | `/roles/:id`   | Get role details     | Authenticated  |
| POST   | `/roles`       | Create role          | `manage_users` |
| PATCH  | `/roles/:id`   | Update role          | `manage_users` |
| DELETE | `/roles/:id`   | Delete role          | `manage_users` |
| GET    | `/permissions` | List all permissions | Authenticated  |

### Health Check

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| GET    | `/health` | Server health status |

## 📋 API Examples

### Register

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password@123",
    "firstName": "New",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@projectmanager.com",
    "password": "Admin@123"
  }'
```

### Create Project (with token)

```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My New Project",
    "description": "A sample project"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Implement login page",
    "description": "Create the login page with email/password",
    "priority": "HIGH",
    "projectId": "PROJECT_UUID"
  }'
```

### Move Task

```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/TASK_UUID/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "status": "IN_PROGRESS" }'
```

## 🧪 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

## 🛠 Available Scripts

| Script                    | Description                      |
| ------------------------- | -------------------------------- |
| `npm run dev`             | Start dev server with hot reload |
| `npm run build`           | Compile TypeScript               |
| `npm start`               | Run production server            |
| `npm run prisma:generate` | Generate Prisma client           |
| `npm run prisma:migrate`  | Run database migrations          |
| `npm run prisma:seed`     | Seed database                    |
| `npm run prisma:studio`   | Open Prisma Studio GUI           |
| `npm run docker:up`       | Start Docker containers          |
| `npm run docker:down`     | Stop Docker containers           |

## 📝 Environment Variables

| Variable                  | Description                  | Default                 |
| ------------------------- | ---------------------------- | ----------------------- |
| `NODE_ENV`                | Environment mode             | `development`           |
| `PORT`                    | Server port                  | `5000`                  |
| `DATABASE_URL`            | PostgreSQL connection string | —                       |
| `JWT_SECRET`              | JWT signing secret           | —                       |
| `JWT_EXPIRES_IN`          | Token expiration             | `7d`                    |
| `CORS_ORIGIN`             | Allowed CORS origin          | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window (ms)       | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window      | `100`                   |
| `LOG_LEVEL`               | Winston log level            | `info`                  |

## 📄 License

ISC
