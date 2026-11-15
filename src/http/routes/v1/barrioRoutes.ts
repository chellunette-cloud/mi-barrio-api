import { Router } from 'express';
import type { BarrioControllerDependencies } from '../../controllers/barrioController.js';
import { createBarrioController } from '../../controllers/barrioController.js';
import { cachePublic } from '../../middleware/cache.js';

export function createPublicRouter(deps: BarrioControllerDependencies): Router {
  const router = Router();
  const controller = createBarrioController(deps);
  router.get('/barrio', cachePublic, controller.barrio);
  router.get('/barrio/geometria', cachePublic, controller.geometria);
  return router;
}
