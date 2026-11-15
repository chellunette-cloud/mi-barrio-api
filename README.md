# mi-barrio-api

API pública de **Mi Barrio – Ciudad Granada** para HU-01 y HU-02. Es un repositorio independiente:
no importa código de `mi-barrio-backend` ni de `mi-barrio-frontend`; solo consume el contrato HTTP
interno y publica el contrato HTTP público.

## Arquitectura

- `src/application`: casos de uso y puerto `BarrioBackendPort`.
- `src/clients/backend`: cliente HTTP interno con `X-Service-Token`.
- `src/http`: rutas públicas, CORS, rate limit, cache, errores y request id.
- `src/contracts`: tipos generados desde el contrato interno y validador JSON Schema.
- Contrato canónico público: `contracts/public.openapi.yaml`.

## Requisitos y entorno

- Node.js 22 o superior.
- Backend privado accesible por red, con `SERVICE_TOKEN` compartido.
- Variables en `.env.example`.

```bash
npm ci
cp .env.example .env
npm run contracts:verify
npm run dev
```

En contenedores, usar `BACKEND_URL=http://mi-barrio-backend:3001`; no depender de `localhost`.

La configuración de `.env.example` distingue desarrollo local (`127.0.0.1`) de despliegue en red privada de contenedores (`mi-barrio-backend`). El backend no se publica en Internet.

## Endpoints públicos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/health` | Salud de la API |
| `GET` | `/api/v1/barrio` | Ficha territorial y fuentes (HU-01) |
| `GET` | `/api/v1/barrio/geometria` | Polígono oficial WGS84 y centroide (HU-02) |

Respuestas exitosas: `Cache-Control: public, max-age=300, stale-while-revalidate=60`. CORS solo
permite `FRONTEND_ORIGIN`. Rate limit: 120 solicitudes por minuto y por IP. Los errores públicos no
incluyen el token ni detalles internos del backend.

## Contratos y artefactos

`contracts/public.openapi.yaml` es la única fuente de verdad de la API pública. El contrato interno
se sincroniza desde el backend y se verifica con SHA-256:

```bash
npm run contracts:sync
npm run contracts:types
npm run contracts:verify
```

- `contracts/internal.openapi.yaml`: artefacto sincronizado, no editable a mano.
- `contracts/internal.openapi.sha256`: hash fijado.
- `src/contracts/internal-schema.ts`: tipos generados con `openapi-typescript`.
- `src/contracts/validate.ts`: valida en tiempo de ejecución las respuestas internas con Ajv.

## Pruebas

```bash
npm run typecheck
npm run lint
npm run check:lines
npm run test:unit
npm run test:integration
npm run test:contract
npm run ci
```

La suite cubre el puerto de aplicación, el cliente HTTP interno (token, URL y validación), la API
pública, cache/CORS y la validación de las respuestas reales contra el contrato público.

## Límite de 100 líneas

`npm run check:lines` y ESLint fallan si un archivo escrito a mano supera 100 líneas. El tipo
generado `src/contracts/internal-schema.ts` se excluye como artefacto reproducible.

## Evidencia y limitaciones

- Evidencia de Fase 1: `../docs/evidencias/fase-1/`.
- No hay autenticación pública ni endpoints administrativos en esta fase.
- El backend debe permanecer en la red privada; esta API es la única frontera pública.
- El workflow de CI no levanta el backend real; las pruebas de contrato usan el contrato y un puerto
  simulado. La prueba end-to-end se ejecutó localmente y está documentada en la evidencia.
