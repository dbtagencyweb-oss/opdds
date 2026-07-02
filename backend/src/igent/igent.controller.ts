import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MindChatDto } from './igent.dto';
import { IGentService } from './igent.service';

@Controller('igent')
@UseGuards(JwtAuthGuard)
export class IGentController {
  constructor(private readonly igentService: IGentService) {}

  @Post('chat')
  chat(@CurrentUser() user: AuthenticatedUser, @Body() body: MindChatDto) {
    return this.igentService.chat(user.id, body);
  }
}
