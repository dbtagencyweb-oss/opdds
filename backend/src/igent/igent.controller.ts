import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MindChatDto } from './igent.dto';
import { IGentService } from './igent.service';

@Controller('igent')
@UseGuards(JwtAuthGuard)
export class IGentController {
  constructor(private readonly igentService: IGentService) {}

  @Get('status')
  status() {
    return this.igentService.status();
  }

  @Get('sessions')
  sessions(@CurrentUser() user: AuthenticatedUser) {
    return this.igentService.listSessions(user.id);
  }

  @Delete('sessions')
  deleteSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.igentService.deleteSessions(user.id);
  }

  // Limite restrito: cada chamada consome créditos pagos de OpenAI/Gemini.
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('chat')
  chat(@CurrentUser() user: AuthenticatedUser, @Body() body: MindChatDto) {
    return this.igentService.chat(user.id, body);
  }
}
