import { Injectable } from '@nestjs/common';
import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { categories, subscriptions } from '../db/schema';

@Injectable()
export class AnalyticsService {
  async getMonthly(userId: number) {
    const monthExpression = sql<string>`to_char(${subscriptions.renewalDate}::date, 'YYYY-MM')`;

    return db
      .select({
        month: monthExpression,
        totalAmount: sql<string>`coalesce(sum(${subscriptions.price}::numeric), 0)`,
        subscriptionsCount: sql<number>`count(${subscriptions.id})::int`,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .groupBy(monthExpression)
      .orderBy(monthExpression);
  }

  async getYearly(userId: number) {
    const [result] = await db
      .select({
        totalYearlyAmount: sql<string>`coalesce(sum(
          case
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
      .where(eq(subscriptions.userId, userId));

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
      .where(eq(subscriptions.userId, userId))
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

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
