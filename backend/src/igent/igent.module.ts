import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { WorkbookModule } from '../workbook/workbook.module';
import { IGentController } from './igent.controller';
import { IGentService } from './igent.service';

@Module({
  imports: [AuthModule, EntitlementsModule, WorkbookModule],
  controllers: [IGentController],
  providers: [IGentService],
})
export class IGentModule {}
