import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.ts';

describe('api', () => {
  const app = createApp();

  it('reports health and integration presence without leaking values', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Object.values(res.body.integrations).every((v) => typeof v === 'boolean')).toBe(true);
  });

  it('rejects protected account routes without a token', async () => {
    const res = await request(app).get('/api/account/export');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('rejects protected jobs routes without a token', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');

    const analyzeRes = await request(app).post('/api/jobs/analyze').send({ text: 'Vaga de React' });
    expect(analyzeRes.status).toBe(401);
  });

  it('rejects protected resumes routes without a token', async () => {
    const res = await request(app).get('/api/resumes');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');

    const uploadRes = await request(app).post('/api/resumes/upload');
    expect(uploadRes.status).toBe(401);
  });

  it('returns JSON 404 for unknown api routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });

  it('sets security headers and hides express', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
