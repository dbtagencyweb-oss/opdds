import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './common/app-throttler.guard';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { EntitlementsModule } from './entitlements/entitlements.module';
import { ReaderModule } from './reader/reader.module';
import { WorkbookModule } from './workbook/workbook.module';
import { IGentModule } from './igent/igent.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MetaAdsModule } from './meta-ads/meta-ads.module';
import { LeadsModule } from './leads/leads.module';

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
    MetaAdsModule,
    LeadsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
