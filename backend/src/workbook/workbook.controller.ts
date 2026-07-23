import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/auth.types';
import { ReaderJourneyDto } from './workbook.dto';
import { WorkbookService } from './workbook.service';

@UseGuards(JwtAuthGuard)
@Controller('workbook')
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Get('journey')
  getJourney(@CurrentUser() user: AuthenticatedUser) {
    return this.workbookService.getJourney(user.id);
  }

  @Post('journey')
  saveJourney(@CurrentUser() user: AuthenticatedUser, @Body() body: ReaderJourneyDto) {
    return this.workbookService.saveJourney(user.id, body);
  }

  @Delete('journey')
  deleteJourney(@CurrentUser() user: AuthenticatedUser) {
    return this.workbookService.deleteJourney(user.id);
  }
}
