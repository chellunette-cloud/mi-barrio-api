import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { GetCategorias } from '../../application/GetCategorias.js';
import type { GetLugares } from '../../application/GetLugares.js';
import type { GetLugar } from '../../application/GetLugar.js';
import { HttpError } from '../../lib/httpError.js';

export interface PlacesControllerDependencies {
  getCategorias: GetCategorias;
  getLugares: GetLugares;
  getLugar: GetLugar;
}

const filtroSchema = z.object({
  categoria: z.string().trim().optional(),
  q: z.string().trim().max(60).optional(),
  tipo: z.string().trim().max(60).optional(),
  limite: z.coerce.number().int().min(1).max(1000).optional()
});

export function createPlacesController(deps: PlacesControllerDependencies) {
  return {
    categorias: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        res.json(await deps.getCategorias.execute());
      } catch (error) {
        next(error);
      }
    },
    lugares: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const filtro = filtroSchema.parse(req.query);
        res.json(await deps.getLugares.execute(filtro));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'FILTRO_INVALIDO', 'Filtro inválido') : error);
      }
    },
    lugar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID_INVALIDO', 'Identificador inválido');
        res.json(await deps.getLugar.execute(id));
      } catch (error) {
        next(error);
      }
    }
  };
}