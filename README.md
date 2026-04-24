# SmartSeason — Field Monitoring System

A web platform for managing and monitoring agricultural fields. Administrators oversee all fields and agents; field agents track crop progress and submit stage updates for their assigned fields.

---

## Table of Contents

- [Demo Credentials](#demo-credentials)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [API Overview](#api-overview)

---

## Demo Credentials

Create these accounts after running the application (use the **Create account** form on the login page).

| Role  | Email                        | Password   | Notes                                      |
|-------|------------------------------|------------|--------------------------------------------|
| Admin | admin@smartseason.com        | Admin@123  | Promote to Admin via DB after registering  |
| Agent | agent@smartseason.com        | Agent@123  | Registers as Agent by default              |

**Promoting a user to Admin** (run once after they register):

```sql
UPDATE users SET role = 'Admin' WHERE email = 'admin@smartseason.com';
```

Or, select **Admin** on the registration form — the role selector is available at sign-up.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19, Vite 8, TailwindCSS v4               |
| Backend   | Node.js, Express 4                             |
| Database  | MySQL 8 (mysql2/promise, no ORM)               |
| Auth      | JWT (jsonwebtoken + bcryptjs)                  |
| Validation| express-validator                              |
| HTTP sec. | helmet, cors                                   |

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MySQL 8+

---

### 1. Clone the repository

```bash
git clone https://github.com/kipngenokev/SmartSeason-Field-Monitoring-system
cd smartseason
```

---

### 2. Create the database

```sql
CREATE DATABASE smartseason CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then create the tables:

```sql
USE smartseason;

CREATE TABLE users (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('Admin','Agent') NOT NULL DEFAULT 'Agent',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fields (
  id            INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150)   NOT NULL,
  crop_type     VARCHAR(100)   DEFAULT NULL,
  planting_date DATE           DEFAULT NULL,
  location      VARCHAR(255)   NOT NULL,
  size_ha       DECIMAL(10,2)  NOT NULL,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  agent_id      INT UNSIGNED   DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_fields_agent (agent_id),
  CONSTRAINT fk_fields_agent FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE field_updates (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  field_id   INT UNSIGNED NOT NULL,
  agent_id   INT UNSIGNED NOT NULL,
  stage      VARCHAR(100) NOT NULL,
  notes      TEXT         DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_fu_field (field_id),
  KEY fk_fu_agent (agent_id),
  CONSTRAINT fk_fu_field FOREIGN KEY (field_id) REFERENCES fields (id) ON DELETE CASCADE,
  CONSTRAINT fk_fu_agent FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. Configure the backend

```bash
cd backend
cp .env.example .env   # or create .env manually
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartseason

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

Install dependencies and start:

```bash
npm install
npm run dev        # development (nodemon)
# npm start        # production
```

Backend runs at `http://localhost:5000`. Verify with:

```
GET http://localhost:5000/api/health
```

---

### 4. Configure the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically — no extra configuration needed.

---

### 5. Production build (serves frontend from Express)

From the project root:

```bash
npm run build   # builds the React app into frontend/dist
npm start       # starts Express, which serves frontend/dist + the API
```

Single URL, no CORS configuration required.

---

## Database Schema

```
users
  id, name, email, password (bcrypt), role (Admin|Agent), created_at

fields
  id, name, crop_type, planting_date, location, size_ha,
  status (Active|Inactive), agent_id → users.id, created_at

field_updates
  id, field_id → fields.id, agent_id → users.id,
  stage, notes, created_at
```

`field_updates` is an append-only log. There is no separate "current stage" column — it is always derived from the most recent update's `stage` value.

---

## Design Decisions

### 1. No ORM — raw SQL via mysql2/promise

Queries are written directly using parameterised `pool.execute()` calls. This keeps the query logic explicit and avoids the overhead and abstraction leakage that ORMs introduce for a straightforward relational schema.

### 2. Layered backend architecture

Every resource follows the same chain:

```
Route → Controller → Service → Model → DB pool
```

Controllers handle only HTTP concerns (request parsing, response shaping). Business logic lives in services. Models contain only SQL queries. This makes each layer independently testable and easy to extend.

### 3. Computed field health — not stored

`computed_status` (Active / At Risk / Completed) is not a database column. It is calculated at query time in the service layer based on:

- **Completed** — latest stage contains the word "Completed"
- **Active** — latest update within the past 7 days
- **At Risk** — no updates yet, or last update older than 7 days

Storing it would require keeping it in sync with every update write. Deriving it at read time is simpler and always accurate.

### 4. Field updates as a timeline log

Agents do not "edit" a field's stage. Every stage change is a new `field_updates` row. This gives a full audit trail of field activity and makes the timeline view trivial to render. The latest entry's stage is the field's current stage.

### 5. Role-based route ordering

The Express field router applies `router.use(protect, authorize('Admin'))` for admin-only routes. The `/fields/:fieldId/updates` router is mounted **before** `/fields` in the main router so that agent update submissions are not intercepted by the admin-only middleware.

### 6. JWT tokens carry the role at issue time

When a user logs in, the JWT is signed with their current role. The `protect` middleware re-fetches the user from the database on every request, so any role change (e.g., promoting an agent to admin) takes effect immediately on the next request without requiring a re-login.

### 7. Frontend served from Express in production

In production (`NODE_ENV=production`), Express serves the Vite build from `frontend/dist` as static files, and falls back to `index.html` for client-side routing. This means a single deployment URL handles both the API and the React app with no CORS configuration needed.

---

## Assumptions

1. **Two roles are sufficient.** The system models only Admin and Agent. There is no super-admin, manager, or read-only viewer role.

2. **One agent per field.** A field has at most one assigned agent at a time. Reassigning replaces the previous assignment.

3. **Agents self-register.** Any visitor can create an Agent account. Admins are promoted manually via the database or by selecting the Admin role at registration. There is no invite system.

4. **Field health is update-driven.** A field with no updates in 7 days is "At Risk" regardless of how healthy the crop actually is. This is a reporting/engagement metric, not a real agricultural health indicator.

5. **Planting date is informational.** The system records it but does not use it to auto-advance stages or compute growth duration. Stage progression is entirely driven by agent updates.

6. **Notes are optional.** An agent can submit a stage update with no notes. The stage field is the only required part of an update.

7. **Soft delete is out of scope.** Deleting a user cascades to their updates. Deleting a field cascades to its updates. There is no recycle bin or recovery mechanism.

8. **Single timezone.** Timestamps are stored in UTC by MySQL and displayed in the browser's local timezone. No per-user timezone preference is supported.

---

## API Overview

All endpoints are prefixed with `/api`.

### Auth

| Method | Path             | Access | Description          |
|--------|------------------|--------|----------------------|
| POST   | /auth/register   | Public | Create an account    |
| POST   | /auth/login      | Public | Login, receive JWT   |

### Fields

| Method | Path                       | Access       | Description                    |
|--------|----------------------------|--------------|--------------------------------|
| GET    | /fields                    | Admin        | List all fields                |
| POST   | /fields                    | Admin        | Create a field                 |
| GET    | /fields/mine               | Agent        | List assigned fields           |
| GET    | /fields/:id                | Admin, Agent | Get a single field             |
| PATCH  | /fields/:id/assign-agent   | Admin        | Assign an agent to a field     |

### Field Updates

| Method | Path                        | Access       | Description                     |
|--------|-----------------------------|--------------|----------------------------------|
| POST   | /fields/:fieldId/updates    | Agent        | Submit a stage update            |
| GET    | /fields/:fieldId/updates    | Admin, Agent | Get updates for a field          |
| GET    | /updates                    | Admin, Agent | Get all updates (role-scoped)    |

### Users

| Method | Path                | Access | Description                      |
|--------|---------------------|--------|----------------------------------|
| GET    | /users/agents       | Admin  | List all agents                  |
| GET    | /users/agents/stats | Admin  | Agents with field/update counts  |

### Health

| Method | Path    | Access | Description        |
|--------|---------|--------|--------------------|
| GET    | /health | Public | API + DB status    |
