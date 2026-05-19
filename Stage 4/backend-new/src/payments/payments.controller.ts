import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('api/subscriptions/:subscriptionId/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findBySubscription(
    @Req() request: AuthenticatedRequest,
    @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
  ) {
    return this.paymentsService.findBySubscription(
      request.user!.sub,
      subscriptionId,
    );
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(
      request.user!.sub,
      subscriptionId,
      dto,
    );
  }

  @Patch(':paymentId/paid')
  markAsPaid(
    @Req() request: AuthenticatedRequest,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.paymentsService.markAsPaid(request.user!.sub, paymentId);
  }

  @Delete(':paymentId')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.paymentsService.remove(request.user!.sub, paymentId);
  }
}
