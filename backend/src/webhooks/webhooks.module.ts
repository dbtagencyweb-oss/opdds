import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { KiwifyWebhookController } from './kiwify-webhook.controller';
import { MetaCapiService } from './meta-capi.service';
import { MindTrialModule } from '../mind-trial/mind-trial.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [AuthModule, MindTrialModule, LeadsModule],
  controllers: [KiwifyWebhookController],
  providers: [MetaCapiService],
})
export class WebhooksModule {}
