import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../lib/httpError.js';

export interface AdminControllerDependencies {
  adminClient: {
    listLugares(token: string): Promise<unknown>;
    createLugar(token: string, body: unknown): Promise<unknown>;
    updateLugar(token: string, id: number, body: unknown): Promise<unknown>;
    deleteLugar(token: string, id: number): Promise<void>;
    audit(token: string): Promise<unknown>;
  };
}

function token(req: Request): string {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

export function createAdminController(deps: AdminControllerDependencies) {
  return {
    list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        res.json(await deps.adminClient.listLugares(t));
      } catch (error) { next(error); }
    },
    create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        res.status(201).json(await deps.adminClient.createLugar(t, req.body));
      } catch (error) { next(error); }
    },
    update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
        res.json(await deps.adminClient.updateLugar(t, id, req.body));
      } catch (error) { next(error); }
    },
    remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
        await deps.adminClient.deleteLugar(t, id);
        res.status(204).send();
      } catch (error) { next(error); }
    },
    audit: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const t = token(req);
        if (!t) throw new HttpError(401, 'NO_AUTORIZADO', 'Token ausente');
        res.json(await deps.adminClient.audit(t));
      } catch (error) { next(error); }
    }
  };
}