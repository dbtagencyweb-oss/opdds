import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MindTrialModule } from '../mind-trial/mind-trial.module';
import { WorkbookModule } from '../workbook/workbook.module';
import { IGentController } from './igent.controller';
import { IGentService } from './igent.service';

@Module({
  imports: [AuthModule, MindTrialModule, WorkbookModule],
  controllers: [IGentController],
  providers: [IGentService],
})
export class IGentModule {}
