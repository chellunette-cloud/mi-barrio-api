import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { GetLugares } from '../../src/application/GetLugares.js';

let capturado: unknown;
const backend = {
  listLugares: async (params: unknown) => {
    capturado = params;
    return [];
  }
} as any;
const app = createApp({
  getLugares: new GetLugares(backend),
  frontendOrigin: 'http://127.0.0.1:5173'
} as any);

describe('Límites de q en el contrato público', () => {
  it('acepta q ausente y q vacío', async () => {
    expect((await request(app).get('/api/v1/lugares')).status).toBe(200);
    expect((await request(app).get('/api/v1/lugares?q=')).status).toBe(200);
  });

  it('acepta exactamente 60 caracteres', async () => {
    const q = 'x'.repeat(60);
    const response = await request(app).get(`/api/v1/lugares?q=${q}`);
    expect(response.status).toBe(200);
    expect(capturado).toMatchObject({ q });
  });

  it('rechaza 61 caracteres con FILTRO_INVALIDO', async () => {
    const response = await request(app).get(`/api/v1/lugares?q=${'x'.repeat(61)}`);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('FILTRO_INVALIDO');
  });
});
