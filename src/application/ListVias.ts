import type { Via } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class ListVias {
  constructor(private readonly backend: BarrioBackendPort) {}
  execute(highway?: string): Promise<Via[]> {
    return this.backend.listVias(highway);
  }
}