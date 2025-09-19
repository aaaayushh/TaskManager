# Task Management System – Documentation
Note: 
Frontend: /task-dashboard
Backend: /api

1. Setup Instructions
   --Prerequisites

Node.js ≥ 18

Nx CLI: npm install -g nx

Angular CLI: npm install -g @angular/cli

Sqlite DB (https://sqlitebrowser.org/dl/)
Environment Variables (.env)

Create a .env file in the root of your backend project:

# JWT

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

# Database

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=task_management

Install node_modules

Running the Apps
Run the app from the root folder; don't go into the api folder or task-dashboard folder

# Backend (NestJS)

nx serve api

# Frontend (Angular)

nx serve task-dashboard

The frontend will run at http://localhost:4200, and the backend at http://localhost:3000.

2. Architecture Overview
   NX Monorepo Layout
   apps/
   api/ # NestJS backend
   task-dashboard/ # Angular frontend
   libs/
   shared/  
    auth/

Rationale:

Single repository for both frontend and backend.

Modular structure improves scalability and testability.

3. Data Model

# Schema Overview

1. Organization

Represents a company, department, or unit.

Supports hierarchical structure (parent-child relationship), allowing sub-organizations.

Connected to:

Users → An organization can have many users.

Tasks → Tasks can be owned by an organization (through its users).

2. User

Represents a person in the system.

Each user:

Belongs to exactly one organization (organizationId is NOT nullable).

Has a role (Owner, Admin, Viewer) to control permissions.

Can create or own multiple tasks.

3. Task

Represents work items that belong to a user.

Tracks:

Title, description, and current status (Pending, In Progress, Completed).

The owner (user responsible for it).

This entity is crucial for your task manager as it holds the actual work data.

4. Role

Stores predefined roles (Owner, Admin, Viewer) and their permissions (like task.create, task.edit, task.delete).

Could be used for dynamic permission checks instead of relying solely on hardcoded enum in User.

# ERD Diagram

┌───────────────────────────┐
│ ORGANIZATION │
├───────────────────────────┤
│ id (PK) │
│ name │
│ parentId (FK → Org.id) │
├───────────────────────────┤
│ 1 ──< children │
│ 1 ──< users │
│ 1 ──< tasks │
└───────────────────────────┘
▲
│ (self-relation)
▼

┌───────────────────────────┐
│ USER │
├───────────────────────────┤
│ id (PK) │
│ username (unique) │
│ password │
│ role (enum: Owner/Admin/Viewer) │
│ organizationId (FK) │
├───────────────────────────┤
│ 1 ──< tasks │
└───────────────────────────┘
│
▼

┌───────────────────────────┐
│ TASK │
├───────────────────────────┤
│ id (PK) │
│ title │
│ description (nullable) │
│ status (enum: Pending/InProgress/Completed) │
│ ownerId (FK → User.id) │
└───────────────────────────┘

┌───────────────────────────┐
│ ROLE │
├───────────────────────────┤
│ id (PK) │
│ name (Owner/Admin/Viewer)│
│ permissions (string[]) │
└───────────────────────────┘

Organization → User: One-to-Many

User → Task: One-to-Many

Roles assigned at the User level dictate access to Tasks within their Organization.

4. Access Control Implementation
   Roles & Permissions

Admin: Full access to all tasks in the org and sub-orgs.

Manager: Access to tasks of users in their team/org.

User: Access only to own tasks.

Organization Hierarchy

Users inherit permissions based on their org and its sub-orgs.

Managers cannot access tasks outside their org scope.

JWT Authentication

JWT includes userId, role, and organizationId.

On each request, middleware validates the token and injects user info into request context.

Permissions are checked against roles and organization hierarchy.

5. API Documentation
   Authentication

POST /auth/login

{
"username": "john",
"password": "password123"
}

Response

{
"token": "jwt_token_here"
}

Task Endpoints

GET /tasks/my-tasks

Returns tasks visible to the logged-in user

POST /tasks

{
"title": "New Task",
"description": "Task description",
"status": "Pending"
}

PUT /tasks/:id

Update task (title, description, status)

DELETE /tasks/:id

Delete task

Response

{
"success": true,
"task": { ... }
}

6. Future Considerations

Customizable Dashboards: Users can filter or arrange task columns.

JWT refresh tokens, CSRF protection, RBAC caching implementation

Use WebSockets or Server-Sent Events to push task updates instantly.
