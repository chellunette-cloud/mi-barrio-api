import { Router } from 'express';
import type { AdminClientPort } from '../../adminClientPort.js';
import { createAdminController } from '../../controllers/adminController.js';
import { createAdminCategoriasController } from '../../controllers/adminCategoriasController.js';

export interface AdminRouterDependencies {
  adminClient: AdminClientPort;
}

export function createAdminRouter(deps: AdminRouterDependencies): Router {
  const router = Router();
  const lugares = createAdminController(deps);
  const categorias = createAdminCategoriasController(deps);
  router.get('/admin/lugares', lugares.list);
  router.post('/admin/lugares', lugares.create);
  router.put('/admin/lugares/:id', lugares.update);
  router.delete('/admin/lugares/:id', lugares.remove);
  router.get('/admin/categorias', categorias.list);
  router.post('/admin/categorias', categorias.create);
  router.put('/admin/categorias/:id', categorias.update);
  router.delete('/admin/categorias/:id', categorias.remove);
  router.get('/admin/auditoria', lugares.audit);
  return router;
}