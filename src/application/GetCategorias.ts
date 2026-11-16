import type { Categoria } from '../contracts/types.js';
import type { BarrioBackendPort } from './ports.js';

export class GetCategorias {
  constructor(private readonly backend: BarrioBackendPort) {}
  execute(): Promise<Categoria[]> {
    return this.backend.listCategorias();
  }
}