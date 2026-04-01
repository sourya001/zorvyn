import request from 'supertest';
import app from '../src/app.js';
import { setupTestDb, cleanupTestDb } from './testHelpers.js';

describe('Auth API', () => {
  beforeAll(() => setupTestDb());
  afterAll(() => cleanupTestDb());

  it('should login with default admin credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('admin@example.com');
    expect(response.body.user.role).toBe('admin');
  });

  it('should fail with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'wrongpass' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should fail with missing email or password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com' });

    expect(response.status).toBe(400);
  });
});
