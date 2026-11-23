import { isIP } from 'node:net';
import type { Request } from 'express';

/**
 * Render/Cloudflare anade al X-Forwarded-For sin borrar el valor que envia el
 * cliente, por lo que la entrada mas a la izquierda es falsificable. La
 * cabecera CF-Connecting-IP la genera Cloudflare y Render la reenvia; una
 * cabecera aportada por el cliente es rechazada por el borde (403). Solo se
 * acepta si contiene una IP valida; en su defecto se usa req.ip (local/desarrollo).
 */
export function clientIp(req: Request): string {
  const cfIp = req.header('cf-connecting-ip');
  if (cfIp && isIP(cfIp)) return cfIp;
  return req.ip ?? '';
}

export function clientIpSource(req: Request): 'cf-connecting-ip' | 'socket' {
  const cfIp = req.header('cf-connecting-ip');
  return cfIp && isIP(cfIp) ? 'cf-connecting-ip' : 'socket';
}
