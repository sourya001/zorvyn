import request from 'supertest';
import app from '../src/app.js';
import { setupTestDb, cleanupTestDb } from './testHelpers.js';

describe('User Management API', () => {
  let adminToken;
  const uniqueSuffix = `users.${Date.now()}.${Math.random()}`;

  beforeAll(async () => {
    setupTestDb();
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = loginRes.body.token;
  });

  afterAll(() => cleanupTestDb());

  it('should create a new user as admin', async () => {
    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Analyst',
        email: `john.${uniqueSuffix}@test.example.com`,
        password: 'Password123',
        role: 'analyst',
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.role).toBe('analyst');
  });

  it('should list users as admin', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThan(0);
  });

  it('should fail to create user without token', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Unauthorized User',
        email: `unauth.${uniqueSuffix}@test.example.com`,
        password: 'Password123',
        role: 'viewer',
      });

    expect(response.status).toBe(401);
  });

  it('should fail to create duplicate email', async () => {
    const dup = `duplicate.${uniqueSuffix}@test.example.com`;
    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'First User',
        email: dup,
        password: 'Password123',
        role: 'viewer',
      });

    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Second User',
        email: dup,
        password: 'Password123',
        role: 'viewer',
      });

    expect(response.status).toBe(409);
  });
});
