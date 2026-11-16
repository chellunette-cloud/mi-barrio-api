import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { GetBarrio } from '../application/GetBarrio.js';
import type { GetBarrioGeometria } from '../application/GetBarrioGeometria.js';
import type { GetCategorias } from '../application/GetCategorias.js';
import type { GetLugares } from '../application/GetLugares.js';
import type { GetLugar } from '../application/GetLugar.js';
import type { ListVias } from '../application/ListVias.js';
import type { GetDemografia } from '../application/GetDemografia.js';
import type { GetSeguridad } from '../application/GetSeguridad.js';
import { createPublicRouter } from './routes/v1/barrioRoutes.js';
import { createStatsRouter } from './routes/v1/statsRoutes.js';
import { createAuthRouter } from './routes/v1/authRoutes.js';
import { createAdminRouter } from './routes/v1/adminRoutes.js';
import { requestId } from './middleware/requestId.js';
import { createPublicRateLimit } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export interface AppDependencies {
  getBarrio: GetBarrio;
  getBarrioGeometria: GetBarrioGeometria;
  getCategorias: GetCategorias;
  getLugares: GetLugares;
  getLugar: GetLugar;
  listVias: ListVias;
  getDemografia: GetDemografia;
  getSeguridad: GetSeguridad;
  adminClient: { login(username: string, password: string): Promise<unknown>; refresh(refreshToken: string): Promise<unknown>; listLugares(token: string): Promise<unknown>; createLugar(token: string, body: unknown): Promise<unknown>; updateLugar(token: string, id: number, body: unknown): Promise<unknown>; deleteLugar(token: string, id: number): Promise<void>; audit(token: string): Promise<unknown>; };
  frontendOrigin: string;
}

export function createApp(deps: AppDependencies): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: deps.frontendOrigin, methods: ['GET'], maxAge: 86400 }));
  app.use(requestId);
  app.use(createPublicRateLimit());
  app.use(express.json({ limit: '8kb' }));
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mi-barrio-api' });
  });
  app.use('/api/v1', createPublicRouter(deps));
  app.use('/api/v1', createStatsRouter(deps));
  app.use('/api/v1', createAuthRouter({ adminClient: deps.adminClient }));
  app.use('/api/v1', createAdminRouter({ adminClient: deps.adminClient }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}