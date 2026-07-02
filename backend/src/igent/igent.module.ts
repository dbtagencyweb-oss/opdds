import { Module } from '@nestjs/common';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { IGentController } from './igent.controller';
import { IGentService } from './igent.service';

@Module({
  imports: [EntitlementsModule],
  controllers: [IGentController],
  providers: [IGentService],
})
export class IGentModule {}
