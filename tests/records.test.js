import request from 'supertest';
import app from '../src/app.js';
import { setupTestDb, cleanupTestDb } from './testHelpers.js';
import { getDb } from '../src/services/db.js';

describe('Financial Records API', () => {
  let adminToken;

  beforeAll(async () => {
    setupTestDb();
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = loginRes.body.token;
  });

  afterAll(() => cleanupTestDb());

  it('should create a financial record as admin', async () => {
    const response = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 5000,
        type: 'income',
        category: 'Salary',
        date: '2026-04-01',
        notes: 'Monthly salary',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(5000);
  });

  it('should list records with filtering', async () => {
    const response = await request(app)
      .get('/records?type=income')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.records)).toBe(true);
  });

  it('should get a specific record', async () => {
    const createRes = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 1000,
        type: 'expense',
        category: 'Food',
        date: '2026-04-01',
      });

    const recordId = createRes.body.id;
    const response = await request(app)
      .get(`/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.record.id).toBe(recordId);
  });

  it('should update a record', async () => {
    const createRes = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 500,
        type: 'expense',
        category: 'Transport',
        date: '2026-04-01',
      });

    const recordId = createRes.body.id;
    const response = await request(app)
      .patch(`/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 600 });

    expect(response.status).toBe(200);
    expect(response.body.record.amount).toBe(600);
  });

  it('should delete a record', async () => {
    const createRes = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: 1,
        amount: 200,
        type: 'expense',
        category: 'Entertainment',
        date: '2026-04-01',
      });

    const recordId = createRes.body.id;
    const response = await request(app)
      .delete(`/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });
});
