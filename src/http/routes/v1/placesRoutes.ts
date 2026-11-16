import { Router } from 'express';
import type { PlacesControllerDependencies } from '../../controllers/placesController.js';
import { createPlacesController } from '../../controllers/placesController.js';
import { cachePublic } from '../../middleware/cache.js';

export function createPlacesRouter(deps: PlacesControllerDependencies): Router {
  const router = Router();
  const controller = createPlacesController(deps);
  router.get('/categorias', cachePublic, controller.categorias);
  router.get('/lugares', cachePublic, controller.lugares);
  router.get('/lugares/:id', cachePublic, controller.lugar);
  return router;
}