import { Router } from 'express';
import type { StatsControllerDependencies } from '../../controllers/statsController.js';
import { createStatsController } from '../../controllers/statsController.js';
import { cachePublic } from '../../middleware/cache.js';

export function createStatsRouter(deps: StatsControllerDependencies): Router {
  const router = Router();
  const controller = createStatsController(deps);
  router.get('/estadisticas/demografia', cachePublic, controller.demografia);
  router.get('/estadisticas/seguridad', cachePublic, controller.seguridad);
  return router;
}