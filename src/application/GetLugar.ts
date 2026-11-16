import type { Lugar } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class GetLugar {
  constructor(private readonly backend: BarrioBackendPort) {}
  execute(id: number): Promise<Lugar> {
    return this.backend.getLugar(id);
  }
}