import type { Barrio, BarrioGeometria, Categoria, Lugar, Via, Demografia, Seguridad } from '../contracts/types.js';

export interface BarrioBackendPort {
  getBarrio(): Promise<Barrio>;
  getBarrioGeometria(): Promise<BarrioGeometria>;
  listCategorias(): Promise<Categoria[]>;
  listLugares(params: { categoria?: string; q?: string; limite?: number }): Promise<Lugar[]>;
  getLugar(id: number): Promise<Lugar>;
  listVias(highway?: string): Promise<Via[]>;
  getDemografia(): Promise<Demografia>;
  getSeguridad(): Promise<Seguridad>;
}
