import { Injectable } from '@nestjs/common';
import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';

import { db } from '../db';
import { categories, subscriptions } from '../db/schema';

type BillingCycle =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'yearly';

@Injectable()
export class AnalyticsService {
  async getMonthly(userId: number) {
    const userSubscriptions = await db
      .select({
        id: subscriptions.id,
        price: subscriptions.price,
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
        ),
      );

    const totalAmount = userSubscriptions.reduce((sum, subscription) => {
      return (
        sum +
        this.getMonthlyEquivalent(
          subscription.price,
          subscription.billingCycle,
        )
      );
    }, 0);

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();

      date.setMonth(date.getMonth() - (5 - index));

      return {
        month: this.formatMonth(date),
        totalAmount: totalAmount.toFixed(2),
        subscriptionsCount: userSubscriptions.length,
      };
    });

    return months;
  }

  async getYearly(userId: number) {
    const [result] = await db
      .select({
        totalYearlyAmount: sql<string>`coalesce(sum(
          case
            when ${subscriptions.billingCycle} = 'weekly'
              then ${subscriptions.price}::numeric * 52

            when ${subscriptions.billingCycle} = 'monthly'
              then ${subscriptions.price}::numeric * 12

            when ${subscriptions.billingCycle} = 'quarterly'
              then ${subscriptions.price}::numeric * 4

            when ${subscriptions.billingCycle} = 'semi_annual'
              then ${subscriptions.price}::numeric * 2

            when ${subscriptions.billingCycle} = 'yearly'
              then ${subscriptions.price}::numeric

            else ${subscriptions.price}::numeric
          end
        ), 0)`,

        subscriptionsCount: sql<number>`count(${subscriptions.id})::int`,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
        ),
      );

    return result ?? {
      totalYearlyAmount: '0',
      subscriptionsCount: 0,
    };
  }

  async getCategories(userId: number) {
    return db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        totalAmount: sql<string>`coalesce(sum(${subscriptions.price}::numeric), 0)`,
        subscriptionsCount: sql<number>`count(${subscriptions.id})::int`,
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
        ),
      )
      .groupBy(categories.id, categories.name)
      .orderBy(categories.name);
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
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
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
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.renewalDate, today),
          lte(subscriptions.renewalDate, this.formatDate(sevenDaysFromNow)),
        ),
      )
      .orderBy(asc(subscriptions.renewalDate));
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

  private getMonthlyEquivalent(price: string, billingCycle: string): number {
    const amount = Number(price);

    if (billingCycle === 'weekly') return amount * 4;
    if (billingCycle === 'quarterly') return amount / 3;
    if (billingCycle === 'semi_annual') return amount / 6;
    if (billingCycle === 'yearly') return amount / 12;

    return amount;
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
    return date.toISOString().slice(0, 10);
  }

  private formatMonth(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }
}
