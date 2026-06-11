import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  eq,
  gte,
  isNull,
  isNotNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';

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
  // deletedAt يُستخدم كـ endDate بديل عند الحذف
  deletedAt: Date  | null;
  categoryId: number | null;
  categoryName: string | null;
};

type MonthRange = {
  month: string;
  startDate: Date;
  endDate: Date;
};

@Injectable()
export class AnalyticsService {

  private getRiyadhToday(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
    }).format(new Date());
  }

  private getRiyadhNow(): Date {
    return this.parseDate(this.getRiyadhToday());
  }

  // ─────────────────────────────────────────────
  // Public endpoints
  // ─────────────────────────────────────────────

  async getMonthly(userId: number) {
    const now = this.getRiyadhNow();
    // الرسم التاريخي: نشطة + محذوفة لإظهار الإنفاق الفعلي السابق
    const userSubscriptions = await this.getAllHistoricalSubscriptions(userId);

    // إذا ما في أي اشتراك → نرجع آخر 6 أشهر بقيم 0 لإبقاء الرسم ظاهراً
    if (userSubscriptions.length === 0) {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          month: this.formatMonth(d),
          totalAmount: '0.00',
          subscriptionsCount: 0,
        };
      });
    }

    const earliestDate = userSubscriptions.reduce((earliest, sub) => {
      const subDate = this.parseDate(sub.startDate);
      return subDate < earliest ? subDate : earliest;
    }, this.parseDate(userSubscriptions[0].startDate));

    const monthRanges = this.getAllMonthRanges(earliestDate, now);

    return monthRanges.map((monthRange) => {
      let totalAmount = 0;
      const countedSubscriptions = new Set<number>();

      for (const subscription of userSubscriptions) {
        // نحدد نهاية الاشتراك الفعلية (endDate > deletedAt > نهاية النطاق)
        const effectiveEndDate = this.resolveEffectiveEndDate(subscription, this.formatDate(monthRange.endDate));

        const payments = this.generatePaymentsForRange({
          subscription: { ...subscription, endDate: effectiveEndDate },
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
    const now = this.getRiyadhNow();

    // نطاق السنة الحالية فقط: من 1 يناير حتى اليوم
    const yearStart = new Date(now.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    const userSubscriptions = await this.getAllSpendingSubscriptions(userId);

    if (userSubscriptions.length === 0) {
      return { totalYearlyAmount: '0.00', subscriptionsCount: 0 };
    }

    let totalYearlyAmount = 0;
    const countedSubscriptions = new Set<number>();

    for (const subscription of userSubscriptions) {
      const effectiveEndDate = this.resolveEffectiveEndDate(subscription, now.toISOString().split('T')[0]);

      const payments = this.generatePaymentsForRange({
        subscription: { ...subscription, endDate: effectiveEndDate },
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
    const now = this.getRiyadhNow();

    // التصنيفات تشمل الاشتراكات المحذوفة أيضاً لتعكس الإنفاق الحقيقي
    const userSubscriptions = await this.getAllSpendingSubscriptions(userId);

    if (userSubscriptions.length === 0) return [];

    const earliestDate = userSubscriptions.reduce((earliest, sub) => {
      const subDate = this.parseDate(sub.startDate);
      return subDate < earliest ? subDate : earliest;
    }, this.parseDate(userSubscriptions[0].startDate));

    earliestDate.setHours(0, 0, 0, 0);

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
      const effectiveEndDate = this.resolveEffectiveEndDate(subscription, this.formatDate(now));

      const payments = this.generatePaymentsForRange({
        subscription: { ...subscription, endDate: effectiveEndDate },
        rangeStart: earliestDate,
        rangeEnd: now,
      });

      if (payments.length === 0) continue;

      const categoryId = subscription.categoryId ?? 5;
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
      .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount));
  }

  // التقويم والقادمة: تعمل فقط على الاشتراكات الفعّالة غير المحذوفة (سلوكها الصحيح)
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
    const today = this.getRiyadhToday();

    const sevenDaysFromNow = this.getRiyadhNow();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = this.formatDate(sevenDaysFromNow);

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
          lte(subscriptions.renewalDate, sevenDaysStr),
        ),
      )
      .orderBy(asc(subscriptions.renewalDate));
  }

  // ─────────────────────────────────────────────
  // Private DB queries
  // ─────────────────────────────────────────────

  /**
   * يجلب الاشتراكات النشطة فقط (deletedAt IS NULL و status = active).
   * تُستخدم للمصروف الشهري الحالي والتصنيفات.
   */
  private async getAllSpendingSubscriptions(userId: number) {
    return db
      .select({
        id: subscriptions.id,
        price: subscriptions.price,
        billingCycle: subscriptions.billingCycle,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        deletedAt: subscriptions.deletedAt,
        categoryId: subscriptions.categoryId,
        categoryName: categories.name,
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          isNull(subscriptions.deletedAt),
          sql`${subscriptions.startDate} is not null`,
        ),
      );
  }

  /**
   * يجلب الاشتراكات النشطة والمحذوفة معاً.
   * تُستخدم حصراً للرسم التاريخي لإظهار الإنفاق الفعلي السابق.
   */
  private async getAllHistoricalSubscriptions(userId: number) {
    return db
      .select({
        id: subscriptions.id,
        price: subscriptions.price,
        billingCycle: subscriptions.billingCycle,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        deletedAt: subscriptions.deletedAt,
        categoryId: subscriptions.categoryId,
        categoryName: categories.name,
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          or(
            and(
              eq(subscriptions.status, 'active'),
              isNull(subscriptions.deletedAt),
            ),
            isNotNull(subscriptions.deletedAt),
          ),
          sql`${subscriptions.startDate} is not null`,
        ),
      );
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  /**
   * يحدد تاريخ النهاية الفعلي للاشتراك بالأولوية:
   * 1. endDate (إذا وُجد — المستخدم حدد تاريخ انتهاء صريح)
   * 2. deletedAt (إذا وُجد — وقت الحذف يُعامَل كنهاية)
   * 3. fallbackDate (نهاية نطاق الحساب — الاشتراك لا يزال فعّالاً)
   */
  private resolveEffectiveEndDate(
    subscription: Pick<AnalyticsSubscription, 'endDate' | 'deletedAt'>,
    fallbackDate: string,
  ): string | null {
    if (subscription.endDate) {
      return subscription.endDate;
    }
    if (subscription.deletedAt) {
      // deletedAt قد يكون ISO timestamp — نأخذ الجزء التاريخي فقط
      return this.formatDate(subscription.deletedAt)
    }
    return null; // generatePaymentsForRange ستستخدم rangeEnd كحد
  }

  private getAllMonthRanges(earliestDate: Date, now: Date): MonthRange[] {
    const ranges: MonthRange[] = [];

    const current = new Date(
      earliestDate.getFullYear(),
      earliestDate.getMonth(),
      1,
    );

    const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    while (current <= endMonth) {
      const startDate = new Date(current.getFullYear(), current.getMonth(), 1);
      const endDate = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0,
      );

      ranges.push({
        month: this.formatMonth(startDate),
        startDate,
        endDate,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return ranges;
  }

  private generatePaymentsForRange(params: {
    subscription: AnalyticsSubscription;
    rangeStart: Date;
    rangeEnd: Date;
  }) {
    const payments: { date: Date; amount: number }[] = [];

    const subscriptionStart = this.parseDate(params.subscription.startDate);
    subscriptionStart.setHours(0, 0, 0, 0);

    // إذا كان endDate مصدره deletedAt → لا نحسب دفعة في يوم الحذف نفسه (نهاية قبله)
    // إذا كان endDate عادي → نشمل اليوم كاملاً
    const hasDeletedAt = !!params.subscription.deletedAt;
    const subscriptionEnd = params.subscription.endDate
      ? this.parseDate(params.subscription.endDate)
      : new Date(params.rangeEnd);
    // لو المصدر deletedAt → ننهي عند بداية اليوم (exclusive) بدل نهايته
    subscriptionEnd.setHours(hasDeletedAt ? 0 : 23, hasDeletedAt ? 0 : 59, hasDeletedAt ? 0 : 59, hasDeletedAt ? 0 : 999);

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

    // تخطّي الدفعات قبل نطاق الحساب بكفاءة
    while (paymentDate < rangeStart) {
      this.moveDateForward(
        paymentDate,
        params.subscription.billingCycle as BillingCycle,
      );
    }

    // كل دفعة في النطاق تُضاف مباشرة
    while (paymentDate <= effectiveEnd) {
      payments.push({
        date: new Date(paymentDate),
        amount: Number(params.subscription.price),
      });

      this.moveDateForward(
        paymentDate,
        params.subscription.billingCycle as BillingCycle,
      );
    }

    return payments;
  }

  private getCurrentMonthRange() {
    const now = this.getRiyadhNow();
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
