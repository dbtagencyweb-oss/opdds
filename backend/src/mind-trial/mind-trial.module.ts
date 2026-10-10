import { Module } from '@nestjs/common';
import { MailService } from '../auth/mail.service';
import { MindTrialService } from './mind-trial.service';

@Module({
  providers: [MindTrialService, MailService],
  exports: [MindTrialService],
})
export class MindTrialModule {}
