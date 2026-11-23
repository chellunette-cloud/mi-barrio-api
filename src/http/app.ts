import cors from 'cors';
import { timingSafeEqual } from 'node:crypto';
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
import type { AdminClientPort } from './adminClientPort.js';
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
  adminClient: AdminClientPort;
  frontendOrigin: string;
  rateLimitMax?: number;
  diagnosticToken?: string;
}

export function createApp(deps: AppDependencies): Express {
  const app = express();
  // Render terminates TLS and forwards through its edge proxy. Trust one hop,
  // never the permissive `true` value: the proxy must append the real client IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin: deps.frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  }));
  app.use(requestId);
  app.get('/internal/v1/diagnostico-ip', (req, res) => {
    if (!deps.diagnosticToken || !tokenValido(req.header('x-service-token'), deps.diagnosticToken)) {
      res.status(401).json({ error: { code: 'NO_AUTORIZADO', message: 'Token de servicio inválido' } });
      return;
    }
    res.set('Cache-Control', 'no-store').json({
      ip: req.ip ?? null,
      ips: req.ips,
      forwardedFor: req.header('x-forwarded-for') ?? null,
      trustProxy: app.get('trust proxy')
    });
  });
  app.use(createPublicRateLimit(deps.rateLimitMax));
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

function tokenValido(valor: string | undefined, esperado: string): boolean {
  if (!valor) return false;
  const recibido = Buffer.from(valor);
  const referencia = Buffer.from(esperado);
  return recibido.length === referencia.length && timingSafeEqual(recibido, referencia);
}