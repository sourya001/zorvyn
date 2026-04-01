Finance Backend API

A Node.js and Express backend for managing financial records with role-based access control (RBAC) and analytics dashboards. Built using SQLite, JWT authentication, and comprehensive integration testing.

Features
JWT-based authentication (stateless)
Role-based access control (Admin, Analyst, Viewer)
Financial records management (income and expenses)
Dashboard analytics (summary, trends, categories)
Input validation using Joi
Integration test coverage for all endpoints
Lightweight SQLite database with zero setup
Tech Stack
Backend: Node.js, Express
Database: SQLite
Authentication: JWT
Validation: Joi
Testing: Jest, Supertest
Setup and Run
npm install
npm run dev

Server runs at:

http://localhost:4000
Default Admin Credentials

Email: admin@example.com

Password: Admin@123

Authentication
Login
POST /auth/login

Request:

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
User Management (Admin Only)
POST /users — Create user
GET /users — List users
GET /users/:id — Get user details
PATCH /users/:id — Update role or status
DELETE /users/:id — Deactivate user
Financial Records
POST /records — Create record (Admin)
GET /records — List records (All roles)
GET /records/:id — Get record (All roles)
PATCH /records/:id — Update record (Admin)
DELETE /records/:id — Delete record (Admin)
Filters
GET /records?type=income&category=Salary&startDate=2026-04-01&endDate=2026-04-30
Dashboard (Admin and Analyst)
GET /dashboard/summary — Total income, expenses, balance
GET /dashboard/categories — Category-wise totals
GET /dashboard/recent — Last 10 records
GET /dashboard/trends — Monthly trends
Roles and Permissions
Viewer: Read-only access
Analyst: Read access and dashboard access
Admin: Full access
Testing

Run all tests:

npm test

Test coverage includes:

Authentication
User management (CRUD)
Financial records (CRUD)
Dashboard analytics
Role-based access control
Validation and edge cases

Each test suite uses an isolated SQLite test database.

Project Structure
src/
├── server.js
├── app.js
├── services/
├── routes/
├── controllers/
├── middlewares/
└── validators/
Architecture Highlights
Stateless JWT authentication with expiration
Role-based middleware for access control
Service layer for database operations
Centralized error handling
Validation layer using Joi
Data Models
Users
id (primary key)
name
email (unique)
password_hash
role (viewer, analyst, admin)
status (active, inactive)
created_at
Records
id (primary key)
user_id (foreign key)
amount
type (income or expense)
category
date
notes
created_at
updated_at
Error Handling

Standard error response:

{
  "error": "Message"
}
Status Codes
200: Success
201: Created
204: No Content
400: Bad Request
401: Unauthorized
403: Forbidden
409: Conflict
500: Server Error
Environment Variables

Default configuration (no .env required):

PORT=4000
SQLITE_FILE=sqlite.db
JWT_SECRET=super-secret-key

Production example:

PORT=5000
JWT_SECRET=your-secure-key
Design Assumptions
No pagination implemented
Hard deletes are used (no audit trail)
Single-tenant system
No rate limiting or logging included
Future Improvements
Pagination and advanced filtering
Soft deletes and audit logging
Rate limiting
Refresh token support
Multi-tenancy
API documentation (Swagger/OpenAPI)
Docker support
Structured logging
Notes

This project is designed as a minimum viable product with a clean and scalable architecture. It can be extended for production use with additional features.

Author

Sourya
April 2026