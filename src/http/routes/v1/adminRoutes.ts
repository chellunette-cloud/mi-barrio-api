import { Router } from 'express';
import type { AdminControllerDependencies } from '../../controllers/adminController.js';
import { createAdminController } from '../../controllers/adminController.js';

export function createAdminRouter(deps: AdminControllerDependencies): Router {
  const router = Router();
  const controller = createAdminController(deps);
  router.get('/admin/lugares', controller.list);
  router.post('/admin/lugares', controller.create);
  router.put('/admin/lugares/:id', controller.update);
  router.delete('/admin/lugares/:id', controller.remove);
  router.get('/admin/auditoria', controller.audit);
  return router;
}