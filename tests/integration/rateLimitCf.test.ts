import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { barrio } from '../fixtures.js';

const ORIGIN = 'http://127.0.0.1:5173';

function makeApp(limit: number) {
  return createApp({
    getBarrio: { execute: async () => barrio },
    adminClient: {
      login: async () => ({ accessToken: 'test-token' }),
      refresh: async () => ({ accessToken: 'test-token' })
    },
    frontendOrigin: ORIGIN,
    rateLimitMax: limit,
    diagnosticToken: 'service-token-test'
  } as any);
}

function health(app: ReturnType<typeof createApp>, cfIp: string, forwardedFor?: string) {
  const req = request(app).get('/api/v1/health').set('CF-Connecting-IP', cfIp);
  if (forwardedFor) req.set('X-Forwarded-For', forwardedFor);
  return req;
}

describe('Rate limit con CF-Connecting-IP (topologia Render)', () => {
  it('clientes con IP distinta no comparten contador', async () => {
    const app = makeApp(1);
    expect((await health(app, '198.51.100.10')).status).toBe(200);
    expect((await health(app, '198.51.100.11')).status).toBe(200);
  });

  it('el mismo cliente agota su propio contador', async () => {
    const app = makeApp(1);
    expect((await health(app, '198.51.100.20')).status).toBe(200);
    const second = await health(app, '198.51.100.20');
    expect(second.status).toBe(429);
    expect(second.body.error.code).toBe('DEMASIADAS_SOLICITUDES');
    expect(second.headers['cache-control']).toBe('no-store');
  });

  it('la cabecera X-Forwarded-For manipulada no evita el limite', async () => {
    const app = makeApp(1);
    expect((await health(app, '198.51.100.30', '203.0.113.10, 192.0.2.10')).status).toBe(200);
    expect((await health(app, '198.51.100.30', '203.0.113.99')).status).toBe(429);
  });

  it('un X-Forwarded-For invalido no altera la clave cuando hay CF-Connecting-IP', async () => {
    const app = makeApp(1);
    expect((await health(app, '198.51.100.40', 'no-es-una-ip')).status).toBe(200);
    expect((await health(app, '198.51.100.40')).status).toBe(429);
  });

  it('el diagnostico expone la IP efectiva y su origen', async () => {
    const r = await request(makeApp(120))
      .get('/internal/v1/diagnostico-ip')
      .set('x-service-token', 'service-token-test')
      .set('CF-Connecting-IP', '192.0.2.70')
      .set('X-Forwarded-For', '203.0.113.99, 198.51.100.10');
    expect(r.status).toBe(200);
    expect(r.body.clientIp).toBe('192.0.2.70');
    expect(r.body.clientIpSource).toBe('cf-connecting-ip');
    expect(r.body.cfConnectingIp).toBe('192.0.2.70');
  });
});
