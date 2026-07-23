import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { assertProductionEnv, IS_PRODUCTION } from './config/env';

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

async function bootstrap() {
  // Falha cedo em produção se segredos/variáveis obrigatórias estiverem ausentes.
  assertProductionEnv();

  const app = await NestFactory.create(AppModule, { rawBody: true });
  const origins = parseOrigins(process.env.CORS_ORIGINS);

  // Em produção, nunca refletir qualquer origem com credenciais habilitadas.
  // (assertProductionEnv já garante que CORS_ORIGINS existe em produção.)
  app.enableCors({
    origin: origins.length > 0 ? origins : IS_PRODUCTION ? false : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  Logger.log(`opdds-api ouvindo na porta ${port} (${IS_PRODUCTION ? 'produção' : 'desenvolvimento'})`, 'Bootstrap');
}

bootstrap();
