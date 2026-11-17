import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../lib/httpError.js';

export interface AdminCategoriasControllerDependencies {
  adminClient: {
    listCategorias(token: string): Promise<unknown>;
    createCategoria(token: string, body: unknown): Promise<unknown>;
    updateCategoria(token: string, id: number, body: unknown): Promise<unknown>;
    deleteCategoria(token: string, id: number, reasignarA?: number): Promise<void>;
  };
}

function token(req: Request): string {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function identifier(value: unknown, code: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, code, 'Identificador inválido');
  return id;
}

export function createAdminCategoriasController(deps: AdminCategoriasControllerDependencies) {
  return {
    list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        res.json(await deps.adminClient.listCategorias(t));
      } catch (error) { next(error); }
    },
    create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        res.status(201).json(await deps.adminClient.createCategoria(t, req.body));
      } catch (error) { next(error); }
    },
    update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        const id = identifier(req.params.id, 'ID_INVALIDO');
        res.json(await deps.adminClient.updateCategoria(t, id, req.body));
      } catch (error) { next(error); }
    },
    remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        const id = identifier(req.params.id, 'ID_INVALIDO');
        const rawTarget = req.query.reasignarA;
        const target = rawTarget === undefined ? undefined : identifier(rawTarget, 'DESTINO_INVALIDO');
        await deps.adminClient.deleteCategoria(t, id, target);
        res.status(204).send();
      } catch (error) { next(error); }
    }
  };
}
