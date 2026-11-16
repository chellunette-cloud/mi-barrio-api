import type { NextFunction, Request, Response } from 'express';
import type { GetDemografia } from '../../application/GetDemografia.js';
import type { GetSeguridad } from '../../application/GetSeguridad.js';

export interface StatsControllerDependencies {
  getDemografia: GetDemografia;
  getSeguridad: GetSeguridad;
}

export function createStatsController(deps: StatsControllerDependencies) {
  return {
    demografia: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try { res.json(await deps.getDemografia.execute()); } catch (error) { next(error); }
    },
    seguridad: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try { res.json(await deps.getSeguridad.execute()); } catch (error) { next(error); }
    }
  };
}