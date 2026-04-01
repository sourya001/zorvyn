import request from 'supertest';
import app from '../src/app.js';
import { setupTestDb, cleanupTestDb } from './testHelpers.js';

describe('Role-Based Access Control', () => {
  let adminToken, analystToken, viewerToken;
  const uniqueSuffix = `rbac.${Date.now()}.${Math.random()}`;

  beforeAll(async () => {
    setupTestDb();

    const adminRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = adminRes.body.token;

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Analyst',
        email: `analyst.${uniqueSuffix}@test.example.com`,
        password: 'Password123',
        role: 'analyst',
      });

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Viewer',
        email: `viewer.${uniqueSuffix}@test.example.com`,
        password: 'Password123',
        role: 'viewer',
      });

    const analystRes = await request(app)
      .post('/auth/login')
      .send({ email: `analyst.${uniqueSuffix}@test.example.com`, password: 'Password123' });
    analystToken = analystRes.body.token;

    const viewerRes = await request(app)
      .post('/auth/login')
      .send({ email: `viewer.${uniqueSuffix}@test.example.com`, password: 'Password123' });
    viewerToken = viewerRes.body.token;
  });

  afterAll(() => cleanupTestDb());

  it('viewer cannot create records', async () => {
    const response = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        userId: 1,
        amount: 100,
        type: 'income',
        category: 'Bonus',
        date: '2026-04-01',
      });

    expect(response.status).toBe(403);
  });

  it('analyst cannot create records', async () => {
    const response = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        userId: 1,
        amount: 100,
        type: 'income',
        category: 'Bonus',
        date: '2026-04-01',
      });

    expect(response.status).toBe(403);
  });

  it('analyst can read records', async () => {
    await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 500,
        type: 'income',
        category: 'Freelance',
        date: '2026-04-01',
      });

    const response = await request(app)
      .get('/records')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.records)).toBe(true);
  });

  it('viewer can read records', async () => {
    const response = await request(app)
      .get('/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.records)).toBe(true);
  });

  it('viewer cannot access dashboard', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(403);
  });

  it('analyst can access dashboard', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(response.status).toBe(200);
  });

  it('viewer cannot manage users', async () => {
    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123',
        role: 'viewer',
      });

    expect(response.status).toBe(403);
  });

  it('analyst cannot manage users', async () => {
    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        name: 'New User',
        email: `newuser.${uniqueSuffix}@test.example.com`,
        password: 'Password123',
        role: 'viewer',
      });

    expect(response.status).toBe(403);
  });

  it('only admin can list users', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
