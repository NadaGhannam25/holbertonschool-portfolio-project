import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../db';
import { categories, priceHistory, reminders, subscriptionProviders, subscriptions } from '../db/schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { FilterSubscriptionsDto } from './dto/filter-subscriptions.dto';
import { generateSubscriptionsPdf } from '../services/pdf';

type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'yearly';

@Injectable()
export class SubscriptionsService {
  async findAll(userId: number, filters?: FilterSubscriptionsDto) {
    const conditions = [eq(subscriptions.userId, userId)];

    if (filters?.categoryId !== undefined) {
      conditions.push(eq(subscriptions.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(ilike(subscriptions.name, `%${filters.search}%`));
    }

    if (filters?.paymentMonth !== undefined) {
      conditions.push( sql`extract(month from ${subscriptions.renewalDate}::date) = ${filters.paymentMonth}`);
    }

    if (filters?.paymentYear !== undefined) {
      conditions.push( sql`extract(year from ${subscriptions.renewalDate}::date) = ${filters.paymentYear}`);
    }

    return db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        providerId: subscriptions.providerId,
        name: subscriptions.name,
        price: subscriptions.price,
        categoryId: subscriptions.categoryId,
        renewalDate: subscriptions.renewalDate,
        billingCycle: subscriptions.billingCycle,
        notes: subscriptions.notes,
        status: subscriptions.status,
        cancelUrl: subscriptions.cancelUrl,
        reminderDays: subscriptions.reminderDays,
        remindersEnabled: subscriptions.remindersEnabled,
        createdAt: subscriptions.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
        provider: {
          id: subscriptionProviders.id,
          name: subscriptionProviders.name,
          logoUrl: subscriptionProviders.logoUrl,
          websiteUrl: subscriptionProviders.websiteUrl,
          cancelUrl: subscriptionProviders.cancelUrl,
        },
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .leftJoin(
        subscriptionProviders,
        eq(subscriptions.providerId, subscriptionProviders.id),
      )
      .where(and(...conditions));
  }

  async exportPdf(userId: number) {
    return generateSubscriptionsPdf(userId);
  }

  async create(userId: number, dto: CreateSubscriptionDto) {
    return db.transaction(async (tx) => {
      const reminderDays = dto.reminderDays ?? 3;
      const remindersEnabled = dto.remindersEnabled ?? true;

      const [subscription] = await tx
        .insert(subscriptions)
        .values({
          userId,
          providerId: dto.providerId,
          name: dto.name,
          price: this.formatPrice(dto.price),
          categoryId: dto.categoryId,
          renewalDate: dto.renewalDate,
          billingCycle: dto.billingCycle,
          notes: dto.notes,
          status: dto.status ?? 'active',
          cancelUrl: dto.cancelUrl,
          reminderDays,
          remindersEnabled,
        })
        .returning();

      await tx.insert(priceHistory).values({
        subscriptionId: subscription.id,
        oldPrice: null,
        newPrice: this.formatPrice(dto.price),
        effectiveFrom: dto.renewalDate,
      });

      if (remindersEnabled) {
        const renewalDate = this.parseDate(subscription.renewalDate);
        const remindAt = new Date(renewalDate);

        remindAt.setDate(remindAt.getDate() - reminderDays);

        if (remindAt > new Date()) {
          await tx.insert(reminders).values({
            subscriptionId: subscription.id,
            remindAt,
            sent: false,
            sentAt: null,
          });
        }
      }

      return subscription;
    });
  }

  async findOne(userId: number, id: number) {
    return this.getOwnedSubscription(userId, id);
  }

  async getSubscriptionSpending(userId: number, id: number) {
    const subscription = await this.getOwnedSubscription(userId, id);

    const today = new Date();

    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setHours(23, 59, 59, 999);

    const payments = this.generatePaymentTimeline({
      service: subscription.name,
      amount: Number(subscription.price),
      renewalDate: subscription.renewalDate,
      billingCycle: subscription.billingCycle as BillingCycle,
      startDate,
      endDate,
    });

    return {
      subscription: {
        id: subscription.id,
        name: subscription.name,
      },
      payments,
    };
  }

  async findPriceHistory(userId: number, id: number) {
    const currentSubscription = await this.getOwnedSubscription(userId, id);

    return db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.subscriptionId, currentSubscription.id))
      .orderBy(desc(priceHistory.changedAt));
  }

  async update(userId: number, id: number, dto: UpdateSubscriptionDto) {
    const currentSubscription = await this.getOwnedSubscription(userId, id);

    return db.transaction(async (tx) => {
      const updateData: Partial<typeof subscriptions.$inferInsert> = {};

      if (dto.providerId !== undefined) {
        updateData.providerId = dto.providerId;
      }

      if (dto.name !== undefined) {
        updateData.name = dto.name;
      }

      if (dto.price !== undefined) {
        updateData.price = this.formatPrice(dto.price);
      }

      if (dto.categoryId !== undefined) {
        updateData.categoryId = dto.categoryId;
      }

      if (dto.renewalDate !== undefined) {
        updateData.renewalDate = dto.renewalDate;
      }

      if (dto.billingCycle !== undefined) {
        updateData.billingCycle = dto.billingCycle;
      }

      if (dto.notes !== undefined) {
        updateData.notes = dto.notes;
      }

      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      if (dto.cancelUrl !== undefined) {
        updateData.cancelUrl = dto.cancelUrl;
      }

      if (dto.reminderDays !== undefined) {
        updateData.reminderDays = dto.reminderDays;
      }

      if (dto.remindersEnabled !== undefined) {
        updateData.remindersEnabled = dto.remindersEnabled;
      }

      const [updatedSubscription] = await tx
        .update(subscriptions)
        .set(updateData)
        .where(
          and(
            eq(subscriptions.id, id),
            eq(subscriptions.userId, userId),
          ),
        )
        .returning();

      if (
        dto.price !== undefined &&
        Number(currentSubscription.price) !== Number(dto.price)
      ) {
        await tx.insert(priceHistory).values({
          subscriptionId: id,
          oldPrice: currentSubscription.price,
          newPrice: this.formatPrice(dto.price),
          effectiveFrom: dto.renewalDate ?? currentSubscription.renewalDate,
        });
      }

      const reminderSettingsChanged =
        dto.reminderDays !== undefined ||
        dto.remindersEnabled !== undefined ||
        dto.renewalDate !== undefined;

      if (reminderSettingsChanged) {
        await tx.delete(reminders).where(eq(reminders.subscriptionId, id));

        const finalRemindersEnabled =
          dto.remindersEnabled ??
          currentSubscription.remindersEnabled ??
          true;

        const finalReminderDays =
          dto.reminderDays ??
          currentSubscription.reminderDays ??
          3;

        const finalRenewalDate =
          dto.renewalDate ??
          currentSubscription.renewalDate;

        if (finalRemindersEnabled) {
          const renewalDate = this.parseDate(finalRenewalDate);
          const remindAt = new Date(renewalDate);

          remindAt.setDate(remindAt.getDate() - finalReminderDays);

          if (remindAt > new Date()) {
            await tx.insert(reminders).values({
              subscriptionId: id,
              remindAt,
              sent: false,
              sentAt: null,
            });
          }
        }
      }

      return updatedSubscription;
    });
  }

  async remove(userId: number, id: number) {
    return db.transaction(async (tx) => {
      await this.getOwnedSubscription(userId, id);

      await tx.delete(reminders).where(eq(reminders.subscriptionId, id));

      await tx.delete(priceHistory).where(eq(priceHistory.subscriptionId, id));

      const [deletedSubscription] = await tx
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.id, id),
            eq(subscriptions.userId, userId),
          ),
        )
        .returning();

      return {
        message: 'Subscription deleted successfully',
        subscription: deletedSubscription,
      };
    });
  }

  async toggle(userId: number, id: number) {
    const currentSubscription = await this.getOwnedSubscription(userId, id);

    const nextStatus =
      currentSubscription.status === 'active' ? 'inactive' : 'active';

    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ status: nextStatus })
      .where(
        and(
          eq(subscriptions.id, id),
          eq(subscriptions.userId, userId),
        ),
      )
      .returning();

    return updatedSubscription;
  }

  private async getOwnedSubscription(userId: number, id: number) {
    const [subscription] = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        providerId: subscriptions.providerId,
        name: subscriptions.name,
        price: subscriptions.price,
        categoryId: subscriptions.categoryId,
        renewalDate: subscriptions.renewalDate,
        billingCycle: subscriptions.billingCycle,
        notes: subscriptions.notes,
        status: subscriptions.status,
        cancelUrl: subscriptions.cancelUrl,
        reminderDays: subscriptions.reminderDays,
        remindersEnabled: subscriptions.remindersEnabled,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, id),
          eq(subscriptions.userId, userId),
        ),
      );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  private generatePaymentTimeline(params: {
    service: string;
    amount: number;
    renewalDate: string;
    billingCycle: BillingCycle;
    startDate: Date;
    endDate: Date;
  }) {
    const payments: {
      service: string;
      amount: number;
      date: string;
      month: string;
      status: 'paid' | 'upcoming';
    }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = this.parseDate(params.renewalDate);

    while (currentDate > params.startDate) {
      this.moveDateBackward(currentDate, params.billingCycle);
    }

    while (currentDate <= params.endDate) {
      if (currentDate >= params.startDate) {
        const paymentDate = new Date(currentDate);

        payments.push({
          service: params.service,
          amount: params.amount,
          date: this.formatDate(paymentDate),
          month: this.getArabicMonthName(paymentDate),
          status: paymentDate < today ? 'paid' : 'upcoming',
        });
      }

      this.moveDateForward(currentDate, params.billingCycle);
    }

    return payments;
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

  private moveDateBackward(date: Date, billingCycle: BillingCycle) {
    switch (billingCycle) {
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'semi_annual':
        date.setMonth(date.getMonth() - 6);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
  }

  private getArabicMonthName(date: Date) {
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];

    return months[date.getMonth()];
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

  private formatPrice(price: number) {
    return price.toFixed(2);
  }
}
