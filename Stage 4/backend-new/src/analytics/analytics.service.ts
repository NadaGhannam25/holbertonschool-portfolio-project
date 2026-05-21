import { Injectable } from '@nestjs/common';
import { and, asc, eq, gte, isNull, lte, sql } from 'drizzle-orm';

import { db } from '../db';
import { categories, subscriptions } from '../db/schema';

type BillingCycle =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'yearly';

type AnalyticsSubscription = {
  id: number;
  price: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  categoryId: number;
  categoryName: string | null;
};

@Injectable()
export class AnalyticsService {
  async getMonthly(userId: number) {
    const monthRanges = this.getLastSixMonthRanges();

    const userSubscriptions = await this.getAnalyticsSubscriptions(userId);

    return monthRanges.map((monthRange) => {
      let totalAmount = 0;
      const countedSubscriptions = new Set<number>();

      for (const subscription of userSubscriptions) {
        const payments = this.generatePaymentsForRange({
          subscription,
          rangeStart: monthRange.startDate,
          rangeEnd: monthRange.endDate,
        });

        if (payments.length > 0) {
          countedSubscriptions.add(subscription.id);
        }

        totalAmount += payments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
      }

      return {
        month: monthRange.month,
        totalAmount: totalAmount.toFixed(2),
        subscriptionsCount: countedSubscriptions.size,
      };
    });
  }

  async getYearly(userId: number) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const userSubscriptions = await this.getAnalyticsSubscriptions(userId);

    let totalYearlyAmount = 0;
    const countedSubscriptions = new Set<number>();

    for (const subscription of userSubscriptions) {
      const payments = this.generatePaymentsForRange({
        subscription,
        rangeStart: yearStart,
        rangeEnd: now,
      });

      if (payments.length > 0) {
        countedSubscriptions.add(subscription.id);
      }

      totalYearlyAmount += payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
    }

    return {
      totalYearlyAmount: totalYearlyAmount.toFixed(2),
      subscriptionsCount: countedSubscriptions.size,
    };
  }

  async getCategories(userId: number) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const userSubscriptions = await this.getAnalyticsSubscriptions(userId);

    const categoryMap = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        totalAmount: number;
        subscriptions: Set<number>;
      }
    >();

    for (const subscription of userSubscriptions) {
      const payments = this.generatePaymentsForRange({
        subscription,
        rangeStart: yearStart,
        rangeEnd: now,
      });

      if (payments.length === 0) continue;

      const categoryId = subscription.categoryId;
      const categoryName = subscription.categoryName ?? 'أخرى';

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          totalAmount: 0,
          subscriptions: new Set<number>(),
        });
      }

      const category = categoryMap.get(categoryId)!;

      category.totalAmount += payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      category.subscriptions.add(subscription.id);
    }

    return Array.from(categoryMap.values())
      .map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        totalAmount: category.totalAmount.toFixed(2),
        subscriptionsCount: category.subscriptions.size,
      }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }

  async getCalendar(userId: number) {
    const { startDate, endDate } = this.getCurrentMonthRange();

    return db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        price: subscriptions.price,
        categoryId: subscriptions.categoryId,
        renewalDate: subscriptions.renewalDate,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          isNull(subscriptions.deletedAt),
          gte(subscriptions.renewalDate, startDate),
          lte(subscriptions.renewalDate, endDate),
        ),
      )
      .orderBy(asc(subscriptions.renewalDate));
  }

  async getUpcoming(userId: number) {
    const today = this.formatDate(new Date());

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        price: subscriptions.price,
        categoryId: subscriptions.categoryId,
        renewalDate: subscriptions.renewalDate,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          isNull(subscriptions.deletedAt),
          gte(subscriptions.renewalDate, today),
          lte(subscriptions.renewalDate, this.formatDate(sevenDaysFromNow)),
        ),
      )
      .orderBy(asc(subscriptions.renewalDate));
  }

  private async getAnalyticsSubscriptions(userId: number) {
    return db
      .select({
        id: subscriptions.id,
        price: subscriptions.price,
        billingCycle: subscriptions.billingCycle,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        categoryId: subscriptions.categoryId,
        categoryName: categories.name,
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .where(eq(subscriptions.userId, userId));
  }

  private generatePaymentsForRange(params: {
    subscription: AnalyticsSubscription;
    rangeStart: Date;
    rangeEnd: Date;
  }) {
    const payments: { date: Date; amount: number }[] = [];

    const subscriptionStart = this.parseDate(params.subscription.startDate);
    subscriptionStart.setHours(0, 0, 0, 0);

    const subscriptionEnd = params.subscription.endDate
      ? this.parseDate(params.subscription.endDate)
      : params.rangeEnd;

    subscriptionEnd.setHours(23, 59, 59, 999);

    const rangeStart = new Date(params.rangeStart);
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(params.rangeEnd);
    rangeEnd.setHours(23, 59, 59, 999);

    const effectiveEnd =
      subscriptionEnd < rangeEnd ? subscriptionEnd : rangeEnd;

    if (subscriptionStart > effectiveEnd) {
      return payments;
    }

    const paymentDate = new Date(subscriptionStart);

    while (paymentDate <= effectiveEnd) {
      if (paymentDate >= rangeStart) {
        payments.push({
          date: new Date(paymentDate),
          amount: Number(params.subscription.price),
        });
      }

      this.moveDateForward(
        paymentDate,
        params.subscription.billingCycle as BillingCycle,
      );
    }

    return payments;
  }

  private getLastSixMonthRanges() {
    return Array.from({ length: 6 }, (_, index) => {
      const now = new Date();

      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1,
      );

      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      return {
        month: this.formatMonth(startDate),
        startDate,
        endDate,
      };
    });
  }

  private getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: this.formatDate(start),
      endDate: this.formatDate(end),
    };
  }

  private moveDateForward(date: Date, billingCycle: BillingCycle) {
    switch (billingCycle) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;

      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;

      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;

      case 'semi_annual':
        date.setMonth(date.getMonth() + 6);
        break;

      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;

      default:
        date.setMonth(date.getMonth() + 1);
    }
  }

  private parseDate(dateValue: string | Date) {
    if (dateValue instanceof Date) {
      return new Date(dateValue);
    }

    const [year, month, day] = dateValue.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatMonth(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }
}
