import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtGuard } from '../common/jwt.guard';

@UseGuards(JwtGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('summary')
  getSummary(@Req() req: any) {
    const userId = req.userId as number;
    return this.subscriptionsService.getSummary(userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.userId as number;
    return this.subscriptionsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.userId as number;
    return this.subscriptionsService.findOne(id, userId);
  }

  @Post()
  create(@Body() body: CreateSubscriptionDto, @Req() req: any) {
    const userId = req.userId as number;
    return this.subscriptionsService.create(userId, body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSubscriptionDto,
    @Req() req: any,
  ) {
    const userId = req.userId as number;
    return this.subscriptionsService.update(id, userId, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.userId as number;
    return this.subscriptionsService.remove(id, userId);
  }
}
