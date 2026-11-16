import { describe, expect, it } from 'vitest';
import { GetBarrio } from '../../src/application/GetBarrio.js';
import type { BarrioBackendPort } from '../../src/application/ports.js';
import { barrio, geometria } from '../fixtures.js';

const backend: BarrioBackendPort = {
  getBarrio: async () => barrio,
  getBarrioGeometria: async () => geometria,
  listCategorias: async () => [],
  listLugares: async () => [],
  getLugar: async () => ({}) as any
};

describe('GetBarrio', () => {
  it('delega en el puerto del backend', async () => {
    const result = await new GetBarrio(backend).execute();
    expect(result.poblacion.valor).toBe(3807);
    expect(result.fuentes).toHaveLength(2);
  });
});
