import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MetaAdsService } from './meta-ads.service';

@Controller('admin/meta-ads')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MetaAdsController {
  constructor(private readonly metaAds: MetaAdsService) {}

  @Get('config')
  getConfig() {
    return this.metaAds.getConfig();
  }

  @Get('test')
  testConnection(@Query('accountId') accountId?: string) {
    return this.metaAds.testConnection(accountId);
  }

  @Get('campaigns')
  getCampaigns(@Query() query: any) {
    return this.metaAds.getCampaigns(query);
  }

  @Get('campaigns/:campaignId/adsets')
  getAdSets(@Param('campaignId') campaignId: string, @Query() query: any) {
    return this.metaAds.getAdSets(campaignId, query);
  }

  @Get('audiences')
  getAudiences(@Query() query: any) {
    return this.metaAds.getAudiences(query);
  }

  @Get('advisor')
  getAdvisor(@Query() query: any) {
    return this.metaAds.getAdvisor(query);
  }
}
