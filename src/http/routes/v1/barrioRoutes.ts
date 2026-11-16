import { Router } from 'express';
import type { BarrioControllerDependencies } from '../../controllers/barrioController.js';
import { createBarrioController } from '../../controllers/barrioController.js';
import type { PlacesControllerDependencies } from '../../controllers/placesController.js';
import { createPlacesRouter } from './placesRoutes.js';
import { cachePublic } from '../../middleware/cache.js';

export interface PublicRouterDependencies
  extends BarrioControllerDependencies, PlacesControllerDependencies {}

export function createPublicRouter(deps: PublicRouterDependencies): Router {
  const router = Router();
  const controller = createBarrioController(deps);
  router.get('/barrio', cachePublic, controller.barrio);
  router.get('/barrio/geometria', cachePublic, controller.geometria);
  router.use(createPlacesRouter(deps));
  return router;
}