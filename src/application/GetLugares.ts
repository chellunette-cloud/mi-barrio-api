import type { Lugar } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export interface LugaresParams {
  categoria?: string;
  q?: string;
  tipo?: string;
  limite?: number;
}

export class GetLugares {
  constructor(private readonly backend: BarrioBackendPort) {}
  execute(params: LugaresParams): Promise<Lugar[]> {
    return this.backend.listLugares(params);
  }
}