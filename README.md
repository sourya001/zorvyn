# Finance Backend

Node.js + Express API for financial records and role-based dashboards. Uses SQLite and JWT auth.

## Setup

```bash
npm install
npm run dev
```

Server on `http://localhost:4000`

## Default Admin

- Email: `admin@example.com`
- Password: `Admin@123`

## API

### Login
```
POST /auth/login
{ "email": "admin@example.com", "password": "Admin@123" }
```

### Users (admin only)
```
POST /users - create user
GET /users - list users
GET /users/:id - get user
PATCH /users/:id - update
DELETE /users/:id - deactivate
```

### Records (filtered by role)
```
POST /records - create (admin)
GET /records - list
GET /records/:id - get one
PATCH /records/:id - update (admin)
DELETE /records/:id - delete (admin)
```

### Dashboard (analyst+)
```
GET /dashboard/summary - totals
GET /dashboard/categories - by category
GET /dashboard/recent - last 10
GET /dashboard/trends - monthly
```

## Roles

- **Viewer**: read-only records
- **Analyst**: read records + view dashboard
- **Admin**: full access

## Tests

```bash
npm test
```

27 integration tests covering all endpoints and access control.

---

### User Management

**POST /users** (Admin only)

Create a new user.

Request:
```json
{
  "name": "John Analyst",
  "email": "john@example.com",
  "password": "Password123",
  "role": "analyst",
  "status": "active"
}
```

Response:
```json
{
  "user": {
    "id": 2,
    "name": "John Analyst",
    "email": "john@example.com",
    "role": "analyst",
    "status": "active",
    "createdAt": "2026-04-01T12:00:00.000Z"
  }
}
```

**GET /users** (Admin only)

List all users.

Response:
```json
{
  "users": [
    {
      "id": 1,
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-04-01T10:00:00.000Z"
    }
  ]
}
```

**GET /users/:id** (Admin or self)

Get user details.

**PATCH /users/:id** (Admin only)

Update user role or status.

Request:
```json
{
  "role": "admin",
  "status": "active"
}
```

**DELETE /users/:id** (Admin only)

Deactivate a user. (Returns 204 No Content)

---

### Financial Records

**POST /records** (Admin only)

Create a new financial record.

Request:
```json
{
  "userId": 1,
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
```

Response:
```json
{
  "id": 1,
  "userId": 1,
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary",
  "createdAt": "2026-04-01T12:00:00.000Z",
  "updatedAt": "2026-04-01T12:00:00.000Z"
}
```

**GET /records** (Admin, Analyst, Viewer)

List records with optional filters.

Query parameters:
- `type` (income | expense)
- `category` (string)
- `userId` (number)
- `startDate` (ISO date)
- `endDate` (ISO date)

Example:
```bash
GET /records?type=income&category=Salary&startDate=2026-04-01&endDate=2026-04-30
```

**GET /records/:id** (Admin, Analyst, Viewer)

Get a specific record.

**PATCH /records/:id** (Admin only)

Update record fields.

Request:
```json
{
  "amount": 5500.00,
  "notes": "Bonus included"
}
```

**DELETE /records/:id** (Admin only)

Delete a record. (Returns 204 No Content)

---

### Dashboard Analytics

All dashboard endpoints require Admin or Analyst role.

**GET /dashboard/summary**

Get totals: total income, total expenses, and net balance.

Response:
```json
{
  "totalIncome": 5000.00,
  "totalExpense": 1200.00,
  "netBalance": 3800.00
}
```

**GET /dashboard/categories**

Get totals by category and type.

Response:
```json
{
  "categories": [
    {
      "category": "Salary",
      "type": "income",
      "total": 5000.00
    },
    {
      "category": "Rent",
      "type": "expense",
      "total": 1200.00
    }
  ]
}
```

**GET /dashboard/recent**

Get 10 most recent records.

Response:
```json
{
  "recent": [
    {
      "id": 2,
      "userId": 1,
      "amount": 1200.00,
      "type": "expense",
      "category": "Rent",
      "date": "2026-04-01",
      "notes": "Monthly rent",
      "createdAt": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

**GET /dashboard/trends**

Get monthly trends (last 12 months).

Response:
```json
{
  "trends": [
    {
      "period": "2026-04",
      "income": 5000.00,
      "expense": 1200.00
    }
  ]
}
```

---

## Data Models

### Users Table

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-increment |
| name | TEXT | User's full name |
| email | TEXT | Unique email |
| password_hash | TEXT | Bcrypt hashed password |
| role | TEXT | viewer, analyst, or admin |
| status | TEXT | active or inactive |
| created_at | TEXT | ISO 8601 timestamp |

### Records Table

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-increment |
| user_id | INTEGER | Foreign key to users |
| amount | REAL | Transaction amount |
| type | TEXT | income or expense |
| category | TEXT | Category label (e.g., Salary, Rent) |
| date | TEXT | ISO 8601 date (YYYY-MM-DD) |
| notes | TEXT | Optional description |
| created_at | TEXT | ISO 8601 timestamp |
| updated_at | TEXT | ISO 8601 timestamp |

---

## Error Handling

The backend returns consistent error responses:

```json
{
  "error": "Invalid credentials"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No content (successful delete/update)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (duplicate email)
- `500` - Server error

---

## Architecture

```
src/
├── server.js                 # Express app entry point
├── app.js                    # Route registration & middleware setup
├── services/
│   ├── db.js                # SQLite connection & schema
│   └── password.js          # Password hashing & comparison
├── routes/
│   ├── auth.js              # /auth/* endpoints
│   ├── users.js             # /users/* endpoints
│   ├── records.js           # /records/* endpoints
│   └── dashboard.js         # /dashboard/* endpoints
├── controllers/
│   ├── authController.js    # Login logic
│   ├── userController.js    # User CRUD
│   ├── recordController.js  # Record CRUD
│   └── dashboardController.js # Analytics aggregates
├── middlewares/
│   ├── auth.js              # JWT verification
│   ├── roles.js             # Role-based access control
│   └── errorHandler.js      # Global error handler
└── validators/
    ├── auth.js              # Login payload validation
    ├── user.js              # User creation/update validation
    └── record.js            # Record creation/update validation
```

**Key Design Decisions:**

1. **JWT Authentication:** Stateless, 8-hour expiration
2. **Role-Based Middleware:** Express middleware enforces role restrictions per route
3. **SQLite:** Lightweight, zero-config persistence
4. **Input Validation:** Joi schemas for all payloads
5. **Error Handling:** Centralized error middleware with consistent response format
6. **Service Layer:** DB operations isolated in services for testability

---

## Testing

Run the full test suite:

```bash
npm test
```

Test suites cover:
- ✅ Authentication (login success/failure)
- ✅ User management (create, list, update, delete)
- ✅ Financial records CRUD
- ✅ Dashboard analytics
- ✅ Role-based access control (RBAC)
- ✅ Validation errors
- ✅ Edge cases (duplicate emails, missing fields, inactive users)

Each test suite uses an isolated `sqlite.db.test` database that is cleaned before and after.

---

## Environment

The backend uses minimal configuration. Default setup requires no `.env` file:

```bash
PORT=4000                    # Default: 4000
SQLITE_FILE=sqlite.db        # Default: sqlite.db
JWT_SECRET=super-secret-key  # Default: super-secret-key
```

For production, create `.env`:

```bash
PORT=5000
JWT_SECRET=your-secure-random-key-here
```

---

## Assumptions & Design Notes

1. **No Soft Deletes:** Records and users are hard-deleted. Consider adding soft deletes for audit trails in production.
2. **Single User Per Admin:** Each admin can manage all users and records.
3. **No Pagination:** Record listing returns all records (consider pagination for large datasets).
4. **Date Format:** Records use ISO 8601 dates (YYYY-MM-DD).
5. **No Rate Limiting:** Consider adding in production.
6. **No Logging:** Consider Winston or Pino for production logging.
7. **JWT on Every Request:** No session management; each request validates token fresh.

---

## Future Enhancements

- [ ] Pagination and sorting for list endpoints
- [ ] Search functionality for records
- [ ] Soft delete with restore
- [ ] User roles with custom permissions
- [ ] API rate limiting
- [ ] Structured logging
- [ ] Refresh tokens
- [ ] Multi-tenancy (org-scoped isolation)
- [ ] Audit trail (who changed what, when)
- [ ] Database migrations (Knex or similar)
- [ ] Docker containerization
- [ ] OpenAPI/Swagger documentation
- [ ] GraphQL alternative to REST

---

## Getting Help

Check the test files in `tests/` for integration examples of each API feature.

---

**Created:** April 2026  
**Stack:** Node.js, Express, SQLite, JWT, Joi  
**Status:** Complete MVP with full test coverage
#   z o r v y n  
 