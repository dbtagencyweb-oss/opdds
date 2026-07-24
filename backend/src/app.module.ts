import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { EntitlementsModule } from './entitlements/entitlements.module';
import { ReaderModule } from './reader/reader.module';
import { WorkbookModule } from './workbook/workbook.module';
import { IGentModule } from './igent/igent.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    AdminModule,
    EntitlementsModule,
    ReaderModule,
    WorkbookModule,
    IGentModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
