import { Injectable } from '@nestjs/common';
import { asc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { categories, subscriptionProviders } from '../db/schema';

@Injectable()
export class ProvidersService {
  async findAll(search?: string) {
    const baseQuery = db
      .select({
        id: subscriptionProviders.id,
        name: subscriptionProviders.name,
        logoUrl: subscriptionProviders.logoUrl,
        websiteUrl: subscriptionProviders.websiteUrl,
        cancelUrl: subscriptionProviders.cancelUrl,
        isPopular: subscriptionProviders.isPopular,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(subscriptionProviders)
      .leftJoin(
        categories,
        eq(subscriptionProviders.categoryId, categories.id),
      );

    if (search) {
      return baseQuery
        .where(
          or(
            ilike(subscriptionProviders.name, `%${search}%`),
            ilike(categories.name, `%${search}%`),
          ),
        )
        .orderBy(asc(subscriptionProviders.name));
    }

    return baseQuery.orderBy(asc(subscriptionProviders.name));
  }
}
