import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';

import { db } from '../db';

import {
  categories,
  priceHistory,
  reminders,
  subscriptionProviders,
  subscriptions,
} from '../db/schema';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { FilterSubscriptionsDto } from './dto/filter-subscriptions.dto';

import { generateSubscriptionsPdf } from '../services/pdf';

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
      conditions.push(
        sql`extract(month from ${subscriptions.renewalDate}::date) = ${filters.paymentMonth}`,
      );
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
        const renewalDate = new Date(dto.renewalDate);
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

  async findPriceHistory(userId: number, id: number) {
    const currentSubscription = await this.getOwnedSubscription(userId, id);

    return db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.subscriptionId, currentSubscription.id))
      .orderBy(desc(priceHistory.changedAt));
  }

  async remove(userId: number, id: number) {
    return db.transaction(async (tx) => {
      await this.getOwnedSubscription(userId, id);

      await tx
        .delete(reminders)
        .where(eq(reminders.subscriptionId, id));

      await tx
        .delete(priceHistory)
        .where(eq(priceHistory.subscriptionId, id));

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
    const currentSubscription = await this.getOwnedSubscription(
      userId,
      id,
    );

    const nextStatus =
      currentSubscription.status === 'active'
        ? 'inactive'
        : 'active';

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

  private async getOwnedSubscription(
    userId: number,
    id: number,
  ) {
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

  private formatPrice(price: number) {
    return price.toFixed(2);
  }
}    return generateSubscriptionsPdf(userId);
  }

  private formatPrice(price: number) {
    return price.toFixed(2);
  }
}
