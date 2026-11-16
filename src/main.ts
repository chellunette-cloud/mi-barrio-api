import 'dotenv/config';
import { loadEnv } from './config/env.js';
import { BackendClient } from './clients/backend/BackendClient.js';
import { GetBarrio } from './application/GetBarrio.js';
import { GetBarrioGeometria } from './application/GetBarrioGeometria.js';
import { GetCategorias } from './application/GetCategorias.js';
import { GetLugares } from './application/GetLugares.js';
import { GetLugar } from './application/GetLugar.js';
import { createApp } from './http/app.js';

function main(): void {
  const env = loadEnv();
  const backend = new BackendClient(env.BACKEND_URL, env.SERVICE_TOKEN);
  const app = createApp({
    getBarrio: new GetBarrio(backend),
    getBarrioGeometria: new GetBarrioGeometria(backend),
    getCategorias: new GetCategorias(backend),
    getLugares: new GetLugares(backend),
    getLugar: new GetLugar(backend),
    frontendOrigin: env.FRONTEND_ORIGIN
  });
  app.listen(env.PORT, env.HOST, () => {
    console.log(`mi-barrio-api escuchando en ${env.HOST}:${env.PORT} -> ${env.BACKEND_URL}`);
  });
}

try {
  main();
} catch (error) {
  console.error('No se pudo iniciar mi-barrio-api:', error);
  process.exit(1);
}
