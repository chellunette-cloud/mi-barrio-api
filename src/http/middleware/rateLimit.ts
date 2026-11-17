import rateLimit from 'express-rate-limit';

export function createPublicRateLimit(limit = 120) {
  return rateLimit({
    windowMs: 60_000,
    limit,
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
