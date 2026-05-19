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
      .leftJoin(
        subscriptionProviders,
        eq(subscriptions.providerId, subscriptionProviders.id),
      )
      .where(and(...conditions));
  }

  async exportPdf(userId: number) {
    return generateSubscriptionsPdf(userId);
  }

  private formatPrice(price: number) {
    return price.toFixed(2);
  }
}
