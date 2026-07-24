import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateInviteDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedUser } from './auth.types';
import { AdminGuard } from './admin.guard';

// Limite restrito para reduzir força bruta em credenciais/tokens.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('resolve-invite')
  resolveInvite(@Query('token') token: string) {
    return this.authService.resolveInvite(token);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createInvite(@Body() body: CreateInviteDto) {
    return this.authService.createInvite(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
