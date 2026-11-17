import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default('127.0.0.1'),
  BACKEND_URL: z.string().url().default('http://127.0.0.1:3001'),
  SERVICE_TOKEN: z.string().min(16),
  FRONTEND_ORIGIN: z.string().url().default('http://127.0.0.1:5173'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const env = envSchema.parse(source);
  if (env.NODE_ENV === 'production' && env.RATE_LIMIT_MAX > 120) {
    throw new Error('RATE_LIMIT_MAX no puede superar 120 en producción');
  }
  return env;
}
