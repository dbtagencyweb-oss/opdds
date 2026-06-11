import { Module } from '@nestjs/common';
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
  imports: [PrismaModule, AuthModule, AdminModule, EntitlementsModule, ReaderModule, WorkbookModule, IGentModule, WebhooksModule],
  controllers: [HealthController],
})
export class AppModule {}
