import type { Barrio, BarrioGeometria } from '../contracts/types.js';

export interface BarrioBackendPort {
  getBarrio(): Promise<Barrio>;
  getBarrioGeometria(): Promise<BarrioGeometria>;
}
