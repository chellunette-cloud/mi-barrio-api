import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { barrio } from '../fixtures.js';

const ORIGIN = 'http://127.0.0.1:5173';

function makeApp(rateLimitMax: number) {
  return createApp({
    getBarrio: { execute: async () => barrio },
    adminClient: {
      login: async () => ({ accessToken: 'test-token' }),
      refresh: async () => ({ accessToken: 'test-token' })
    },
    frontendOrigin: ORIGIN,
    rateLimitMax
  } as any);
}

function getFrom(app: ReturnType<typeof createApp>, realIp: string, spoofedIp?: string) {
  const forwardedFor = spoofedIp ? `${spoofedIp}, ${realIp}` : realIp;
  return request(app).get('/api/v1/health').set('X-Forwarded-For', forwardedFor);
}

describe('Rate limit por IP real', () => {
  it('comparte el contador para solicitudes de la misma IP', async () => {
    const app = makeApp(2);
    expect((await getFrom(app, '203.0.113.10')).status).toBe(200);
    expect((await getFrom(app, '203.0.113.10')).status).toBe(200);
    expect((await getFrom(app, '203.0.113.10')).status).toBe(429);
  });

  it('mantiene contadores independientes para IPs distintas', async () => {
    const app = makeApp(1);
    expect((await getFrom(app, '203.0.113.10')).status).toBe(200);
    expect((await getFrom(app, '203.0.113.10')).status).toBe(429);
    expect((await getFrom(app, '203.0.113.11')).status).toBe(200);
  });

  it('ignora una IP falsa añadida a la izquierda por el cliente', async () => {
    const app = makeApp(1);
    expect((await getFrom(app, '203.0.113.10', '198.51.100.21')).status).toBe(200);
    expect((await getFrom(app, '203.0.113.10', '198.51.100.22')).status).toBe(429);
  });

  it('devuelve 429 con el contrato de error y cabecera estándar', async () => {
    const app = makeApp(1);
    await getFrom(app, '203.0.113.10');
    const response = await getFrom(app, '203.0.113.10');
    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('DEMASIADAS_SOLICITUDES');
    expect(response.headers.ratelimit).toBeDefined();
  });

  it('configura trust proxy en uno antes de inicializar el limiter', () => {
    const app = makeApp(2);
    expect(app.get('trust proxy')).toBe(1);
  });
});

describe('Compatibilidad de middleware', () => {
  it('mantiene health, CORS, requestId, autenticación y 404', async () => {
    const app = makeApp(120);
    const health = await request(app).get('/api/v1/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: 'ok', service: 'mi-barrio-api' });

    const barrioResponse = await request(app)
      .get('/api/v1/barrio')
      .set('Origin', ORIGIN)
      .set('x-request-id', 'test-request-id');
    expect(barrioResponse.status).toBe(200);
    expect(barrioResponse.body.poblacion.valor).toBe(3807);
    expect(barrioResponse.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(barrioResponse.headers['x-request-id']).toBe('test-request-id');

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'test-password' });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBe('test-token');

    const missing = await request(app).get('/api/v1/inexistente');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('RUTA_NO_ENCONTRADA');
  });
});
