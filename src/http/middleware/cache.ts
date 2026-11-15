import type { RequestHandler } from 'express';

export const cachePublic: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  next();
};
