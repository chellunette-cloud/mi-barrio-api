import { Router } from 'express';
import type { ViasControllerDependencies } from '../../controllers/viasController.js';
import { createViasController } from '../../controllers/viasController.js';
import { cachePublic } from '../../middleware/cache.js';

export function createViasRouter(deps: ViasControllerDependencies): Router {
  const router = Router();
  const controller = createViasController(deps);
  router.get('/vias', cachePublic, controller.vias);
  return router;
}