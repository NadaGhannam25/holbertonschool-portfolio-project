import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, lte } from 'drizzle-orm';
import { db } from '../db';
import { subscriptions, categories, priceHistory, reminders } from '../db/schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {

  async findAll(userId: number) {
    return await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        price: subscriptions.price,
        billingCycle: subscriptions.billingCycle,
        renewalDate: subscriptions.renewalDate,
        status: subscriptions.status,
        notes: subscriptions.notes,
        cancelUrl: subscriptions.cancelUrl,
        createdAt: subscriptions.createdAt,
        categoryId: subscriptions.categoryId,
        categoryName: categories.name,
      })
      .from(subscriptions)
      .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
      .where(eq(subscriptions.userId, userId));
  }

  async getSummary(userId: number) {
    const all = await this.findAll(userId);
    const active = all.filter((s) => s.status === 'active');

    const monthlyTotal = active.reduce((sum, s) => {
      const price = parseFloat(s.price);
      return sum + (s.billingCycle === 'yearly' ? price / 12 : price);
    }, 0);

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const upcoming = active.filter((s) => {
      const renewal = new Date(s.renewalDate);
      return renewal >= today && renewal <= in7Days;
    });

    return {
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      activeCount: active.length,
      upcomingCount: upcoming.length,
      upcomingRenewals: upcoming.map((s) => ({
        id: s.id,
        name: s.name,
        renewalDate: s.renewalDate,
        price: s.price,
        billingCycle: s.billingCycle,
        daysLeft: Math.ceil(
          (new Date(s.renewalDate).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
    };
  }

  async findOne(id: number, userId: number) {
    const result = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)));

    if (!result[0]) throw new NotFoundException('Subscription not found');
    return result[0];
  }

  async create(userId: number, dto: CreateSubscriptionDto) {
    const newSub = await db
      .insert(subscriptions)
      .values({
        userId,
        name: dto.name,
        price: dto.price,
        categoryId: dto.categoryId ?? null,
        renewalDate: dto.renewalDate,
        billingCycle: dto.billingCycle,
        notes: dto.notes ?? null,
        cancelUrl: dto.cancelUrl ?? null,
        status: dto.status ?? 'active',
      })
      .returning();

    const sub = newSub[0];

    await db.insert(priceHistory).values({
      subscriptionId: sub.id,
      oldPrice: null,
      newPrice: dto.price,
      effectiveFrom: dto.renewalDate,
    });

    const renewalDate = new Date(dto.renewalDate);
    const remindAt = new Date(renewalDate);
    remindAt.setDate(remindAt.getDate() - 3);

    if (remindAt > new Date()) {
      await db.insert(reminders).values({
        subscriptionId: sub.id,
        remindAt,
        sent: false,
      });
    }

    return sub;
  }

  async update(id: number, userId: number, dto: UpdateSubscriptionDto) {
    const existing = await this.findOne(id, userId);

    if (dto.price && dto.price !== existing.price) {
      await db.insert(priceHistory).values({
        subscriptionId: id,
        oldPrice: existing.price,
        newPrice: dto.price,
        effectiveFrom: dto.renewalDate ?? existing.renewalDate,
      });
    }

    const updated = await db
      .update(subscriptions)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.renewalDate !== undefined && { renewalDate: dto.renewalDate }),
        ...(dto.billingCycle !== undefined && { billingCycle: dto.billingCycle }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.cancelUrl !== undefined && { cancelUrl: dto.cancelUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
      })
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
      .returning();

    return updated[0];
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await db.delete(reminders).where(eq(reminders.subscriptionId, id));
    await db.delete(priceHistory).where(eq(priceHistory.subscriptionId, id));
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
    return { message: 'Subscription deleted successfully' };
  }
}
