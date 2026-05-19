import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../db';
import { categories, priceHistory, reminders, subscriptionProviders, subscriptions } from '../db/schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { FilterSubscriptionsDto } from './dto/filter-subscriptions.dto';

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
        category: { id: categories.id, name: categories.name },
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
      .leftJoin(subscriptionProviders, eq(subscriptions.providerId, subscriptionProviders.id))
      .where(and(...conditions));
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

  async update(userId: number, id: number, dto: UpdateSubscriptionDto) {
    return db.transaction(async (tx) => {
      const currentSubscription = await this.getOwnedSubscription(userId, id);
      const updateData: Partial<typeof subscriptions.$inferInsert> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.price !== undefined) updateData.price = this.formatPrice(dto.price);
      if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
      if (dto.providerId !== undefined) updateData.providerId = dto.providerId;
      if (dto.renewalDate !== undefined) updateData.renewalDate = dto.renewalDate;
      if (dto.billingCycle !== undefined) updateData.billingCycle = dto.billingCycle;
      if (dto.notes !== undefined) updateData.notes = dto.notes;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.cancelUrl !== undefined) updateData.cancelUrl = dto.cancelUrl;
      if (dto.reminderDays !== undefined) updateData.reminderDays = dto.reminderDays;
      if (dto.remindersEnabled !== undefined) updateData.remindersEnabled = dto.remindersEnabled;

      if (Object.keys(updateData).length === 0) return currentSubscription;

      const oldPrice = Number(currentSubscription.price);
      const newPrice = dto.price;
      if (newPrice !== undefined && oldPrice !== newPrice) {
        await tx.insert(priceHistory).values({
          subscriptionId: currentSubscription.id,
          oldPrice: this.formatPrice(oldPrice),
          newPrice: this.formatPrice(newPrice),
          effectiveFrom: new Date().toISOString().slice(0, 10),
        });
      }

      const [updatedSubscription] = await tx
        .update(subscriptions)
        .set(updateData)
        .where(and(eq(subscriptions.id, currentSubscription.id), eq(subscriptions.userId, userId)))
        .returning();

      if (dto.renewalDate !== undefined || dto.reminderDays !== undefined || dto.remindersEnabled !== undefined) {
        await tx.delete(reminders).where(and(eq(reminders.subscriptionId, currentSubscription.id), eq(reminders.sent, false)));

        const remindersEnabled = dto.remindersEnabled ?? currentSubscription.remindersEnabled ?? true;
        const reminderDays = dto.reminderDays ?? currentSubscription.reminderDays ?? 3;
        const renewalDateStr = dto.renewalDate ?? currentSubscription.renewalDate;

        if (remindersEnabled) {
          const renewalDate = new Date(renewalDateStr);
          const remindAt = new Date(renewalDate);
          remindAt.setDate(remindAt.getDate() - reminderDays);
          if (remindAt > new Date()) {
            await tx.insert(reminders).values({
              subscriptionId: currentSubscription.id,
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

  async getSubscriptionSpending(userId: number, id: number) {
    const subscription = await this.getOwnedSubscription(userId, id);

    const today = new Date();

    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);

    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 2);

    const payments = this.generatePaymentTimeline({
      service: subscription.name,
      amount: Number(subscription.price),
      renewalDate: subscription.renewalDate,
      billingCycle: subscription.billingCycle ?? 'monthly',
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

  async remove(userId: number, id: number) {
    return db.transaction(async (tx) => {
      await this.getOwnedSubscription(userId, id);
      await tx.delete(reminders).where(eq(reminders.subscriptionId, id));
      await tx.delete(priceHistory).where(eq(priceHistory.subscriptionId, id));
      const [deletedSubscription] = await tx
        .delete(subscriptions)
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
        .returning();
      return { message: 'Subscription deleted successfully', subscription: deletedSubscription };
    });
  }

  async toggle(userId: number, id: number) {
    const currentSubscription = await this.getOwnedSubscription(userId, id);
    const nextStatus = currentSubscription.status === 'active' ? 'inactive' : 'active';
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ status: nextStatus })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
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
        category: { id: categories.id, name: categories.name },
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
      .leftJoin(subscriptionProviders, eq(subscriptions.providerId, subscriptionProviders.id))
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)));

    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  private formatPrice(price: number) {
    return price.toFixed(2);
  }
}
