import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/config/env.js';

const base = { SERVICE_TOKEN: 'test-service-token-1234567890' };

describe('Configuración de entorno', () => {
  it('usa 120 solicitudes por minuto por defecto en producción', () => {
    const env = loadEnv({ ...base, NODE_ENV: 'production' });
    expect(env.RATE_LIMIT_MAX).toBe(120);
  });

  it('permite 600 solo fuera de producción', () => {
    const env = loadEnv({ ...base, NODE_ENV: 'test', RATE_LIMIT_MAX: '600' });
    expect(env.RATE_LIMIT_MAX).toBe(600);
  });

  it('rechaza un límite elevado en producción', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: 'production', RATE_LIMIT_MAX: '600' }))
      .toThrow(/no puede superar 120/);
  });
});
