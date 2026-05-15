import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
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

@Injectable()
export class SubscriptionsService {
  async findAll(userId: number) {
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
      .where(eq(subscriptions.userId, userId));
  }

  async create(userId: number, dto: CreateSubscriptionDto) {
    return db.transaction(async (tx) => {
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
        })
        .returning();

      await tx.insert(priceHistory).values({
        subscriptionId: subscription.id,
        oldPrice: null,
        newPrice: this.formatPrice(dto.price),
        effectiveFrom: dto.renewalDate,
      });

      const renewalDate = new Date(dto.renewalDate);
      const remindAt = new Date(renewalDate);

      remindAt.setDate(remindAt.getDate() - 3);

      if (remindAt > new Date()) {
        await tx.insert(reminders).values({
          subscriptionId: subscription.id,
          remindAt,
          sent: false,
          sentAt: null,
        });
      }

      return subscription;
    });
  }

  async findOne(userId: number, id: number) {
    return this.getOwnedSubscription(userId, id);
  }

  async update(userId: number, id: number, dto: UpdateSubscriptionDto) {
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

    if (Object.keys(updateData).length === 0) {
      return currentSubscription;
    }

    const oldPrice = Number(currentSubscription.price);
    const newPrice = dto.price;

    if (newPrice !== undefined && oldPrice !== newPrice) {
      await db.insert(priceHistory).values({
        subscriptionId: currentSubscription.id,
        oldPrice: this.formatPrice(oldPrice),
        newPrice: this.formatPrice(newPrice),
        effectiveFrom: new Date().toISOString().slice(0, 10),
      });
    }

    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updateData)
      .where(
        and(
          eq(subscriptions.id, currentSubscription.id),
          eq(subscriptions.userId, userId),
        ),
      )
      .returning();

    if (dto.renewalDate !== undefined) {
      await db
        .delete(reminders)
        .where(
          and(
            eq(reminders.subscriptionId, currentSubscription.id),
            eq(reminders.sent, false),
          ),
        );

      await this.createReminderBeforeRenewal(
        currentSubscription.id,
        dto.renewalDate,
      );
    }

    return updatedSubscription;
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
    await this.getOwnedSubscription(userId, id);

    await db.delete(reminders).where(eq(reminders.subscriptionId, id));
    await db.delete(priceHistory).where(eq(priceHistory.subscriptionId, id));

    const [deletedSubscription] = await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
      .returning();

    return {
      message: 'Subscription deleted successfully',
      subscription: deletedSubscription,
    };
  }

  async toggle(userId: number, id: number) {
    const currentSubscription = await this.getOwnedSubscription(userId, id);
    const nextStatus =
      currentSubscription.status === 'active' ? 'inactive' : 'active';

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
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)));

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  private async createReminderBeforeRenewal(
    subscriptionId: number,
    renewalDateValue: string,
  ) {
    const renewalDate = new Date(renewalDateValue);
    const remindAt = new Date(renewalDate);

    remindAt.setDate(remindAt.getDate() - 3);

    if (remindAt <= new Date()) {
      return;
    }

    await db.insert(reminders).values({
      subscriptionId,
      remindAt,
      sent: false,
      sentAt: null,
    });
  }

  private formatPrice(price: number) {
    return price.toFixed(2);
  }
}
