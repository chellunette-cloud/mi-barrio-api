import type { Barrio } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class GetBarrio {
  constructor(private readonly backend: BarrioBackendPort) {}

  execute(): Promise<Barrio> {
    return this.backend.getBarrio();
  }
}
