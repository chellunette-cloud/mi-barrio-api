import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { GetBarrio } from '../../src/application/GetBarrio.js';
import { GetBarrioGeometria } from '../../src/application/GetBarrioGeometria.js';
import { GetCategorias } from '../../src/application/GetCategorias.js';
import { GetLugares } from '../../src/application/GetLugares.js';
import { GetLugar } from '../../src/application/GetLugar.js';
import { ListVias } from '../../src/application/ListVias.js';
import { GetDemografia } from '../../src/application/GetDemografia.js';
import { GetSeguridad } from '../../src/application/GetSeguridad.js';
import type { BarrioBackendPort } from '../../src/application/ports.js';
import { BackendError, BackendTimeoutError } from '../../src/clients/backend/backendErrors.js';
import { barrio, geometria } from '../fixtures.js';

function makeApp(overrides: Partial<BarrioBackendPort> = {}) {
  const backend: BarrioBackendPort = {
    getBarrio: async () => barrio,
    getBarrioGeometria: async () => geometria,
    listCategorias: async () => [],
    listLugares: async () => [],
    getLugar: async () => ({}) as any,
    listVias: async () => [],
    getDemografia: async () => ({}) as any,
    getSeguridad: async () => ({}) as any,
    ...overrides
  };
  return createApp({
    getBarrio: new GetBarrio(backend),
    getBarrioGeometria: new GetBarrioGeometria(backend),
    getCategorias: new GetCategorias(backend),
    getLugares: new GetLugares(backend),
    getLugar: new GetLugar(backend),
    listVias: new ListVias(backend),
    getDemografia: new GetDemografia(backend),
    getSeguridad: new GetSeguridad(backend),
    adminClient: {
      login: async () => ({}),
      refresh: async () => ({}),
      listLugares: async () => [],
      createLugar: async () => ({}),
      updateLugar: async () => ({}),
      deleteLugar: async () => undefined,
      listCategorias: async () => [],
      createCategoria: async () => ({}),
      updateCategoria: async () => ({}),
      deleteCategoria: async () => undefined,
      audit: async () => []
    },
    frontendOrigin: 'http://127.0.0.1:5173'
  });
}

describe('API pública', () => {
  it('publica la ficha con cache y CORS', async () => {
    const response = await request(makeApp())
      .get('/api/v1/barrio')
      .set('Origin', 'http://127.0.0.1:5173');
    expect(response.status).toBe(200);
    expect(response.body.poblacion.valor).toBe(3807);
    expect(response.headers['cache-control']).toContain('max-age=300');
    expect(response.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173');
  });

  it('publica la geometría', async () => {
    const response = await request(makeApp()).get('/api/v1/barrio/geometria');
    expect(response.status).toBe(200);
    expect(response.body.srid).toBe(4326);
  });

  it('traduce errores internos sin filtrar detalles', async () => {
    const notFound = await request(makeApp({ getBarrio: async () => { throw new BackendError(404, 'BARRIO_NO_ENCONTRADO', 'interno'); } }))
      .get('/api/v1/barrio');
    expect(notFound.status).toBe(404);
    expect(notFound.body.error.code).toBe('NO_ENCONTRADO');
    const unavailable = await request(makeApp({ getBarrio: async () => { throw new BackendTimeoutError(); } }))
      .get('/api/v1/barrio');
    expect(unavailable.status).toBe(504);
    expect(unavailable.body.error.code).toBe('TIEMPO_AGOTADO');
  });
});
