import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('monthly')
  getMonthly(@Req() request: AuthenticatedRequest) {
    return this.analyticsService.getMonthly(request.user!.sub);
  }

  @Get('yearly')
  getYearly(@Req() request: AuthenticatedRequest) {
    return this.analyticsService.getYearly(request.user!.sub);
  }

  @Get('categories')
  getCategories(@Req() request: AuthenticatedRequest) {
    return this.analyticsService.getCategories(request.user!.sub);
  }

  @Get('calendar')
  getCalendar(@Req() request: AuthenticatedRequest) {
    return this.analyticsService.getCalendar(request.user!.sub);
  }

  @Get('upcoming')
  getUpcoming(@Req() request: AuthenticatedRequest) {
    return this.analyticsService.getUpcoming(request.user!.sub);
  }
}
