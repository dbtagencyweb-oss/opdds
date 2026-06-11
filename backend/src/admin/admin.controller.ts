import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminCreateInviteDto, AdminGrantPlanDto, AdminGrantProductDto } from './admin.dto';
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
