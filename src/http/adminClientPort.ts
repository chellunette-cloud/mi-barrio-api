export interface AdminClientPort {
  login(username: string, password: string): Promise<unknown>;
  refresh(refreshToken: string): Promise<unknown>;
  listLugares(token: string): Promise<unknown>;
  createLugar(token: string, body: unknown): Promise<unknown>;
  updateLugar(token: string, id: number, body: unknown): Promise<unknown>;
  deleteLugar(token: string, id: number): Promise<void>;
  listCategorias(token: string): Promise<unknown>;
  createCategoria(token: string, body: unknown): Promise<unknown>;
  updateCategoria(token: string, id: number, body: unknown): Promise<unknown>;
  deleteCategoria(token: string, id: number, reasignarA?: number): Promise<void>;
  audit(token: string): Promise<unknown>;
}
