import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // Para monitores de uptime (UptimeRobot): mantém o Render acordado sem tocar
  // no banco, para não consumir as horas de compute do plano grátis do Neon.
  @Get('ping')
  ping() {
    return { status: 'online' };
  }

  @Get()
  async health() {
    let database = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'connected';
    } catch {
      database = 'unavailable';
    }

    return {
      status: 'online',
      app: 'opdds-api',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
