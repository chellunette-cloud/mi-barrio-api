import type { ErrorRequestHandler, RequestHandler } from 'express';
import { BackendError, BackendTimeoutError } from '../../clients/backend/backendErrors.js';
import { HttpError } from '../../lib/httpError.js';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'RUTA_NO_ENCONTRADA',
      message: `No existe la ruta ${req.method} ${req.path}`,
      requestId: res.locals.requestId ?? null
    }
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const requestId = res.locals.requestId ?? null;
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, requestId } });
    return;
  }
  if (error instanceof BackendTimeoutError) {
    res.status(504).json({
      error: { code: 'TIEMPO_AGOTADO', message: error.message, requestId }
    });
    return;
  }
  if (error instanceof BackendError) {
    if (error.status >= 400 && error.status < 500 && error.status !== 404) {
      res.status(error.status).json({ error: { code: error.code, message: error.message, requestId } });
      return;
    }
    const status = error.status === 404 ? 404 : 502;
    const code = error.status === 404 ? 'NO_ENCONTRADO' : 'DEPENDENCIA_NO_DISPONIBLE';
    console.error(JSON.stringify({ level: 'error', requestId, backendStatus: error.status, code: error.code }));
    res.status(status).json({ error: { code, message: 'No fue posible obtener el dato', requestId } });
    return;
  }
  console.error(JSON.stringify({ level: 'error', requestId, message: String(error) }));
  res.status(500).json({
    error: { code: 'ERROR_INTERNO', message: 'No fue posible completar la solicitud', requestId }
  });
};
