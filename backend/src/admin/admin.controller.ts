import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminBookAudioDto, AdminBookAudioMetaDto, AdminBookAudioOrderDto, AdminCreateInviteDto, AdminGrantPlanDto, AdminGrantProductDto } from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('products')
  listProducts() {
    return this.adminService.listProducts();
  }

  @Get('events')
  listEvents() {
    return this.adminService.listEvents();
  }

  @Get('book/audio')
  listBookAudio() {
    return this.adminService.listBookAudioRevisions();
  }

  @Post('book/audio/publish')
  publishBookAudio(@Body() body: AdminBookAudioDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.publishBookAudio(body, user.id);
  }

  @Post('book/audio/meta')
  saveBookAudioMeta(@Body() body: AdminBookAudioMetaDto) {
    return this.adminService.saveBookAudioMeta(body);
  }

  @Post('book/audio/order')
  saveBookAudioOrder(@Body() body: AdminBookAudioOrderDto) {
    return this.adminService.saveBookAudioOrder(body);
  }

  @Post('invites')
  createInvite(@Body() body: AdminCreateInviteDto) {
    return this.authService.createInvite({ ...body, source: 'ADMIN' });
  }

  @Patch('users/:userId/plan')
  grantPlan(@Param('userId') userId: string, @Body() body: AdminGrantPlanDto) {
    return this.adminService.grantPlan(userId, body);
  }

  @Post('users/:userId/products')
  grantProduct(@Param('userId') userId: string, @Body() body: AdminGrantProductDto) {
    return this.adminService.grantProduct(userId, body);
  }

  @Delete('users/:userId/products/:productKey')
  revokeProduct(@Param('userId') userId: string, @Param('productKey') productKey: string) {
    return this.adminService.revokeProduct(userId, productKey);
  }
}
