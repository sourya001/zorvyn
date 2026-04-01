import request from 'supertest';
import app from '../src/app.js';
import { setupTestDb, cleanupTestDb } from './testHelpers.js';

describe('Dashboard API', () => {
  let adminToken, analystToken;
  const uniqueSuffix = `dashboard.${Date.now()}.${Math.random()}`;

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

    const analystRes = await request(app)
      .post('/auth/login')
      .send({ email: `analyst.${uniqueSuffix}@test.example.com`, password: 'Password123' });
    analystToken = analystRes.body.token;

    await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 5000,
        type: 'income',
        category: 'Salary',
        date: '2026-04-01',
      });

    await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 1200,
        type: 'expense',
        category: 'Rent',
        date: '2026-04-01',
      });
  });

  afterAll(() => cleanupTestDb());

  it('should get dashboard summary', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalIncome');
    expect(response.body).toHaveProperty('totalExpense');
    expect(response.body).toHaveProperty('netBalance');
    expect(response.body.totalIncome).toBe(5000);
    expect(response.body.totalExpense).toBe(1200);
    expect(response.body.netBalance).toBe(3800);
  });

  it('should get category totals', async () => {
    const response = await request(app)
      .get('/dashboard/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.categories)).toBe(true);
  });

  it('should get recent activity', async () => {
    const response = await request(app)
      .get('/dashboard/recent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.recent)).toBe(true);
  });

  it('should get monthly trends', async () => {
    const response = await request(app)
      .get('/dashboard/trends')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.trends)).toBe(true);
  });

  it('should deny dashboard access to viewer role', async () => {
    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Viewer',
        email: `viewer.${uniqueSuffix}@test.example.com`,
        password: 'Password123',
        role: 'viewer',
      });

    const viewerRes = await request(app)
      .post('/auth/login')
      .send({ email: `viewer.${uniqueSuffix}@test.example.com`, password: 'Password123' });
    const viewerToken = viewerRes.body.token;

    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(403);
  });

  it('should allow dashboard access to analyst role', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(response.status).toBe(200);
  });
});
