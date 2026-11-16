import type { Seguridad } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class GetSeguridad {
  constructor(private readonly backend: BarrioBackendPort) {}
  execute(): Promise<Seguridad> {
    return this.backend.getSeguridad();
  }
}