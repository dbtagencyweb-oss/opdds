import { Logger, ValidationPipe } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { assertProductionEnv, getLeadsCorsOrigins, IS_PRODUCTION } from './config/env';

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

async function bootstrap() {
  // Falha cedo em produção se segredos/variáveis obrigatórias estiverem ausentes.
  assertProductionEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  // Atrás do Cloudflare + proxy do Render: req.ip/req.ips vêm do X-Forwarded-For.
  app.set('trust proxy', true);
  app.use(helmet());
  const origins = parseOrigins(process.env.CORS_ORIGINS);

  // Em produção, nunca refletir qualquer origem com credenciais habilitadas.
  // (assertProductionEnv já garante que CORS_ORIGINS existe em produção.)
  const appCors: CorsOptions = {
    origin: origins.length > 0 ? origins : IS_PRODUCTION ? false : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  // Rotas públicas da LP (/api/leads*, /api/cartas*): só a LP, sem credenciais.
  const leadsCors: CorsOptions = {
    origin: getLeadsCorsOrigins(),
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  };
  app.enableCors((req: any, callback: (error: Error | null, options: CorsOptions) => void) => {
    const path = String(req.originalUrl || req.url || '').split('?')[0];
    const isLeadsRoute = path === '/api/leads' || path.startsWith('/api/leads/') || path.startsWith('/api/cartas/');
    callback(null, isLeadsRoute ? leadsCors : appCors);
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  Logger.log(`opdds-api ouvindo na porta ${port} (${IS_PRODUCTION ? 'produção' : 'desenvolvimento'})`, 'Bootstrap');
}

bootstrap();
