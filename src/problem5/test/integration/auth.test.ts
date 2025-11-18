// Integration tests for auth endpoints.
// These tests exercise the HTTP layer using Supertest.

import { describe, it, expect } from 'vitest';
// @ts-ignore
import request from 'supertest';
import { app } from '../../src/app';

describe('Auth - /v1/signin & /v1/signout', () => {
  it('should sign in with valid credentials and return an access token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sign-in')
      .send({ email: 'john.doe@example.com', password: 'P@ssw0rd123' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sign-in')
      .send({ email: 'user-vn@example.com', password: 'Wrong12345@7' })
      .expect(401);

    expect(res.body?.error?.code).toBe('UNAUTHORIZED');
  });

  it('should return 204 on signout with a valid token', async () => {
    const signin = await request(app)
      .post('/api/v1/auth/sign-in')
      .send({ email: 'john.doe@example.com', password: 'P@ssw0rd123' })
      .expect(200);

    const token = signin.body.accessToken as string;

    await request(app)
      .post('/api/v1/auth/sign-out')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});
