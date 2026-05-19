import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { FilterSubscriptionsDto } from './dto/filter-subscriptions.dto';

import { SubscriptionsService } from './subscriptions.service';

import {
  sendResetPasswordEmail,
} from '../services/email';

@Controller('api/subscriptions')

// علقيه مؤقتًا للتست
// @UseGuards(JwtAuthGuard)

@UseGuards(JwtAuthGuard)
export class SubscriptionsController {

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() filters: FilterSubscriptionsDto,
  ) {
    return this.subscriptionsService.findAll(
      request.user!.sub,
      filters,
    );
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(
      request.user!.sub,
      createSubscriptionDto,
    );
  }

  @Get('pdf/export')
  async exportPdf(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {

    const pdfBuffer =
      await this.subscriptionsService.exportPdf(
        request.user!.sub,
      );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename=subscriptions.pdf',
    });

    return res.send(pdfBuffer);
  }

  // =========================
  // TEST RESET PASSWORD EMAIL
  // =========================

  @Get('test-reset')
  async testReset(
    @Query('email') email: string,
  ) {

    const result =
      await sendResetPasswordEmail({
        to: email,
        userName: 'User',
        token: 'test-reset-token-123',
      });

    return {
      success: result,
      sentTo: email,
    };
  }

  @Get(':id/spending')
  getSubscriptionSpending(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subscriptionsService.getSubscriptionSpending(
      request.user!.sub,
      id,
    );
  }

  @Get(':id/history')
  findPriceHistory(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subscriptionsService.findPriceHistory(
      request.user!.sub,
      id,
    );
  }

  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subscriptionsService.findOne(
      request.user!.sub,
      id,
    );
  }

  @Put(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(
      request.user!.sub,
      id,
      updateSubscriptionDto,
    );
  }

  @Patch(':id/toggle')
  toggle(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subscriptionsService.toggle(
      request.user!.sub,
      id,
    );
  }

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subscriptionsService.remove(
      request.user!.sub,
      id,
    );
  }
}
