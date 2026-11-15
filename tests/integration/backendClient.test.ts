import { describe, expect, it, vi, afterEach } from 'vitest';
import { BackendClient } from '../../src/clients/backend/BackendClient.js';
import { BackendError } from '../../src/clients/backend/backendErrors.js';
import { barrio } from '../fixtures.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BackendClient', () => {
  it('envía el token interno y valida el contrato', async () => {
    const fetchMock = vi.fn(async (_url: URL, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>)['X-Service-Token']).toBe('internal-token-1234567890');
      return new Response(JSON.stringify(barrio), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    const client = new BackendClient('http://backend.internal:3001', 'internal-token-1234567890');
    const result = await client.getBarrio();
    expect(result.codigoId).toBe('LEG00645');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('convierte una respuesta interna no exitosa en BackendError', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: { code: 'NO_AUTORIZADO', message: 'x', requestId: null } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )));
    const client = new BackendClient('http://backend.internal:3001', 'internal-token-1234567890');
    await expect(client.getBarrio()).rejects.toBeInstanceOf(BackendError);
  });
});
