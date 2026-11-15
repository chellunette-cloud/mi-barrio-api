import rateLimit from 'express-rate-limit';

export function createPublicRateLimit() {
  return rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'DEMASIADAS_SOLICITUDES',
          message: 'Se superó el límite de solicitudes; intente más tarde',
          requestId: res.locals.requestId ?? null
        }
      });
    }
  });
}
