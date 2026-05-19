import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { subscriptionPayments, subscriptions } from '../db/schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  async findBySubscription(userId: number, subscriptionId: number) {
    await this.getOwnedSubscription(userId, subscriptionId);

    return db
      .select()
      .from(subscriptionPayments)
      .where(
        and(
          eq(subscriptionPayments.userId, userId),
          eq(subscriptionPayments.subscriptionId, subscriptionId),
        ),
      )
      .orderBy(asc(subscriptionPayments.paymentDate));
  }

  async create(
    userId: number,
    subscriptionId: number,
    dto: CreatePaymentDto,
  ) {
    await this.getOwnedSubscription(userId, subscriptionId);

    const [payment] = await db
      .insert(subscriptionPayments)
      .values({
        userId,
        subscriptionId,
        amount: dto.amount.toFixed(2),
        paymentDate: dto.paymentDate,
        status: dto.status,
        notes: dto.notes,
      })
      .returning();

    return payment;
  }

  async markAsPaid(userId: number, paymentId: number) {
    const [payment] = await db
      .update(subscriptionPayments)
      .set({ status: 'paid' })
      .where(
        and(
          eq(subscriptionPayments.id, paymentId),
          eq(subscriptionPayments.userId, userId),
        ),
      )
      .returning();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async remove(userId: number, paymentId: number) {
    const [deletedPayment] = await db
      .delete(subscriptionPayments)
      .where(
        and(
          eq(subscriptionPayments.id, paymentId),
          eq(subscriptionPayments.userId, userId),
        ),
      )
      .returning();

    if (!deletedPayment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      message: 'Payment deleted successfully',
      payment: deletedPayment,
    };
  }

  private async getOwnedSubscription(userId: number, subscriptionId: number) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId),
        ),
      );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }
}
