import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { KiwifyWebhookController } from './kiwify-webhook.controller';
import { MetaCapiService } from './meta-capi.service';

@Module({
  imports: [AuthModule],
  controllers: [KiwifyWebhookController],
  providers: [MetaCapiService],
})
export class WebhooksModule {}
