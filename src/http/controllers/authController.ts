import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../lib/httpError.js';

export interface AuthControllerDependencies {
  adminClient: { login(username: string, password: string): Promise<unknown>; refresh(refreshToken: string): Promise<unknown> };
}

const loginSchema = z.object({ username: z.string().trim().min(1), password: z.string().min(1) });

export function createAuthController(deps: AuthControllerDependencies) {
  return {
    login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = loginSchema.parse(req.body);
        res.json(await deps.adminClient.login(body.username, body.password));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'DATOS_INVALIDOS', 'Datos inválidos') : error);
      }
    },
    refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const body = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
        res.json(await deps.adminClient.refresh(body.refreshToken));
      } catch (error) {
        next(error instanceof z.ZodError ? new HttpError(400, 'DATOS_INVALIDOS', 'Datos inválidos') : error);
      }
    }
  };
}