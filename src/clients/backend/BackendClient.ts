import type { Barrio, BarrioGeometria } from '../../contracts/types.js';
import type { BarrioBackendPort } from '../../application/ports.js';
import { validateInternal } from '../../contracts/validate.js';
import { BackendError, BackendTimeoutError } from './backendErrors.js';

export class BackendClient implements BarrioBackendPort {
  constructor(
    private readonly baseUrl: string,
    private readonly serviceToken: string
  ) {}

  getBarrio(): Promise<Barrio> {
    return this.request<Barrio>('/internal/v1/barrio', 'Barrio');
  }

  getBarrioGeometria(): Promise<BarrioGeometria> {
    return this.request<BarrioGeometria>('/internal/v1/barrio/geometria', 'BarrioGeometria');
  }

  private async request<T>(path: string, schema: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        headers: { Accept: 'application/json', 'X-Service-Token': this.serviceToken },
        signal: AbortSignal.timeout(5000)
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') throw new BackendTimeoutError();
      throw new BackendError(502, 'BACKEND_NO_DISPONIBLE', 'No fue posible contactar el backend');
    }
    if (!response.ok) {
      let code = 'BACKEND_ERROR';
      try {
        const body = (await response.json()) as { error?: { code?: string } };
        code = body.error?.code ?? code;
      } catch {
        // La respuesta de error no es JSON; se conserva el código genérico.
      }
      throw new BackendError(response.status, code, `El backend respondió ${response.status}`);
    }
    const data: unknown = await response.json();
    try {
      return validateInternal<T>(schema, data);
    } catch (error) {
      throw new BackendError(
        502,
        'CONTRATO_INTERNO_INVALIDO',
        error instanceof Error ? error.message : 'Respuesta interna inválida'
      );
    }
  }
}
