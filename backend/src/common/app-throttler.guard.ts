import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { clientIp } from './client-ip';

/**
 * Throttler global contando por IP real do cliente. Sem isso, atrás do
 * Cloudflare/Render todos os acessos chegavam com o IP do proxy e dividiam o
 * mesmo limite.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return clientIp(req);
  }
}
