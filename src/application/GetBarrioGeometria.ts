import type { BarrioGeometria } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class GetBarrioGeometria {
  constructor(private readonly backend: BarrioBackendPort) {}

  execute(): Promise<BarrioGeometria> {
    return this.backend.getBarrioGeometria();
  }
}
