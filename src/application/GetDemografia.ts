import type { Demografia } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class GetDemografia {
  constructor(private readonly backend: BarrioBackendPort) {}
  execute(): Promise<Demografia> {
    return this.backend.getDemografia();
  }
}