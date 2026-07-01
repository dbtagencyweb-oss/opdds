import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminBookPageContentDto, AdminCreateInviteDto, AdminGrantPlanDto, AdminGrantProductDto } from './admin.dto';
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

  @Get('book/pages')
  listBookPages() {
    return this.adminService.listBookPageRevisions();
  }

  @Get('book/pages/:pageNumber')
  getBookPage(@Param('pageNumber', ParseIntPipe) pageNumber: number) {
    return this.adminService.getBookPageRevisions(pageNumber);
  }

  @Post('book/pages/:pageNumber/drafts')
  saveBookPageDraft(
    @Param('pageNumber', ParseIntPipe) pageNumber: number,
    @Body() body: AdminBookPageContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.saveBookPageDraft(pageNumber, body, user.id);
  }

  @Post('book/pages/:pageNumber/publish')
  publishBookPage(
    @Param('pageNumber', ParseIntPipe) pageNumber: number,
    @Body() body: AdminBookPageContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.publishBookPage(pageNumber, body, user.id);
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
