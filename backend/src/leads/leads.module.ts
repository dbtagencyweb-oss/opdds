import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MetaCapiService } from '../webhooks/meta-capi.service';
import { MailService } from '../auth/mail.service';
import { CartasController } from './cartas.controller';
import { LeadsAdminController } from './leads-admin.controller';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuthModule],
  controllers: [LeadsController, LeadsAdminController, CartasController],
  providers: [LeadsService, MetaCapiService, MailService],
  exports: [LeadsService],
})
export class LeadsModule {}
