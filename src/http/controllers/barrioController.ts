import type { NextFunction, Request, Response } from 'express';
import type { GetBarrio } from '../../application/GetBarrio.js';
import type { GetBarrioGeometria } from '../../application/GetBarrioGeometria.js';
import { HttpError } from '../../lib/httpError.js';

export interface BarrioControllerDependencies {
  getBarrio: GetBarrio;
  getBarrioGeometria: GetBarrioGeometria;
}

export function createBarrioController(deps: BarrioControllerDependencies) {
  return {
    barrio: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        res.json(await deps.getBarrio.execute());
      } catch (error) {
        next(error);
      }
    },
    geometria: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const data = await deps.getBarrioGeometria.execute();
        if (!data) throw new HttpError(404, 'GEOMETRIA_NO_ENCONTRADA', 'La geometría no está disponible');
        res.json(data);
      } catch (error) {
        next(error);
      }
    }
  };
}
