import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkbookController } from './workbook.controller';
import { WorkbookService } from './workbook.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [WorkbookController],
  providers: [WorkbookService],
  exports: [WorkbookService],
})
export class WorkbookModule {}
