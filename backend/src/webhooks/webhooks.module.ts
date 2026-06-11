import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { KiwifyWebhookController } from './kiwify-webhook.controller';

@Module({
  imports: [AuthModule],
  controllers: [KiwifyWebhookController],
})
export class WebhooksModule {}
