import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { Ajv } from 'ajv';
import { parse } from 'yaml';
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
import { barrio, geometria } from '../fixtures.js';

const backend: BarrioBackendPort = {
  getBarrio: async () => barrio,
  getBarrioGeometria: async () => geometria,
  listCategorias: async () => [],
  listLugares: async () => [],
  getLugar: async () => ({}) as any,
  listVias: async () => [],
  getDemografia: async () => ({}) as any,
  getSeguridad: async () => ({}) as any
};
const app = createApp({
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
    audit: async () => []
  },
  frontendOrigin: 'http://127.0.0.1:5173'
});

describe('Contrato público', () => {
  it('declara las rutas y valida la ficha real contra Barrio', async () => {
    const raw = readFileSync(join(process.cwd(), 'contracts/public.openapi.yaml'), 'utf8');
    expect(raw).toContain('/api/v1/barrio:');
    expect(raw).toContain('/api/v1/barrio/geometria:');
    const contract = parse(raw) as Record<string, unknown>;
    const ajv = new Ajv({ strict: false, validateFormats: false, allErrors: true });
    ajv.addSchema(contract, 'public');
    const validate = ajv.getSchema('public#/components/schemas/Barrio');
    expect(validate).toBeTypeOf('function');
    const response = await request(app).get('/api/v1/barrio');
    expect(response.status).toBe(200);
    expect(validate?.(response.body)).toBe(true);
  });

  it('valida la respuesta real de geometría contra BarrioGeometria', async () => {
    const contract = parse(
      readFileSync(join(process.cwd(), 'contracts/public.openapi.yaml'), 'utf8')
    ) as Record<string, unknown>;
    const ajv = new Ajv({ strict: false, validateFormats: false, allErrors: true });
    ajv.addSchema(contract, 'public-geo');
    const validate = ajv.getSchema('public-geo#/components/schemas/BarrioGeometria');
    expect(validate).toBeTypeOf('function');
    const response = await request(app).get('/api/v1/barrio/geometria');
    expect(response.status).toBe(200);
    expect(validate?.(response.body)).toBe(true);
    expect(response.body.srid).toBe(4326);
    expect(response.body.vertices).toBe(58);
  });
});
