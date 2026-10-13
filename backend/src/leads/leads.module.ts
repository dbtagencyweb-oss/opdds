import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MetaCapiService } from '../webhooks/meta-capi.service';
import { LeadsAdminController } from './leads-admin.controller';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuthModule],
  controllers: [LeadsController, LeadsAdminController],
  providers: [LeadsService, MetaCapiService],
  exports: [LeadsService],
})
export class LeadsModule {}
