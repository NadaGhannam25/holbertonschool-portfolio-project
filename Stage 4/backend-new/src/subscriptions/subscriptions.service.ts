    }

          userId,,
          newPrice: this.formatPrice(dto.price),
          effectiveFrom: dto.renewalDate ?? currentSubscription.renewalD
      return updatedSubscription;
    });
  }

  async remove(userId: number, id: number) {
    return db.transaction(async (tx) => {
      await this.getOwnedSubscription(userId, id);

      const today = this.formatDate(new Date());

      await tx.delete(reminders).where(eq(reminders.subscriptionId, id));

      const [deletedSubscription] = await tx
        .update(subscriptions)
        .set({
          status: 'inactive',
          endDate: today,
          deletedAt: new Date(),
        })
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
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
      .set({
        status: nextStatus,
        endDate: nextStatus === 'inactive' ? this.formatDate(new Date()) : null,
      })
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
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
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
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)));

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  private generatePaymentTimeline(params: {
    service: string;
    amount: number;
    startDate: string;
    renewalDate: string;
    billingCycle: BillingCycle;
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

    const currentDate = this.parseDate(params.startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= today) {
      payments.push({
        service: params.service,
        amount: params.amount,
        date: this.formatDate(currentDate),
        month: this.getArabicMonthName(currentDate),
        status: 'paid',
      });

      this.moveDateForward(currentDate, params.billingCycle);
    }

    let upcomingDate = this.parseDate(params.renewalDate);
    upcomingDate.setHours(0, 0, 0, 0);

    if (upcomingDate <= today) {
      upcomingDate = new Date(currentDate);
    }

    let upcomingCount = 0;

    while (upcomingCount < 2) {
      payments.push({
        service: params.service,
        amount: params.amount,
        date: this.formatDate(upcomingDate),
        month: this.getArabicMonthName(upcomingDate),
        status: 'upcoming',
      });

      upcomingCount += 1;
      this.moveDateForward(upcomingDate, params.billingCycle);
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

  private getDefaultCategoryName(categoryId?: number, categoryName?: string) {
    const normalizedName = categoryName?.trim();

    if (normalizedName) {
      const normalizedMap: Record<string, string> = {
        الترفيه: 'ترفيه',
        العمل: 'عمل',
        التعليم: 'تعليم',
        الصحة: 'صحة',
        أخرى: 'أخرى',
      };

      return normalizedMap[normalizedName] ?? normalizedName.replace(/^ال/, '');
    }

    const fallbackMap: Record<number, string> = {
      1: 'ترفيه',
      2: 'عمل',
      3: 'تعليم',
      4: 'صحة',
      5: 'أخرى',
    };

    return fallbackMap[categoryId ?? 5] ?? 'أخرى';
  }

  private async resolveCategoryId(
    tx: any,
    categoryId: number,
    categoryName?: string,
  ) {
    const existingById = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingById[0]?.id) {
      return existingById[0].id;
    }

    const safeName = this.getDefaultCategoryName(categoryId, categoryName);

    const existingByName = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, safeName))
      .limit(1);

    if (existingByName[0]?.id) {
      return existingByName[0].id;
    }

    const [createdCategory] = await tx
      .insert(categories)
      .values({ name: safeName })
      .onConflictDoNothing()
      .returning({ id: categories.id });

    if (createdCategory?.id) {
      return createdCategory.id;
    }

    const [createdAfterConflict] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, safeName))
      .limit(1);

    return createdAfterConflict?.id ?? null;
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

  private getNextRenewalDate(startDateValue: string, billingCycle: BillingCycle) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const renewalDate = this.parseDate(startDateValue);
    renewalDate.setHours(0, 0, 0, 0);

    // تاريخ التجديد القادم = تاريخ الاشتراك + مدة الاشتراك.
    // مثال: 24 مايو + 3 أشهر = 24 أغسطس.
    this.moveDateForward(renewalDate, billingCycle);

    while (renewalDate < today) {
      this.moveDateForward(renewalDate, billingCycle);
    }

    return this.formatDate(renewalDate);
  }

  private formatPrice(price: number | string) {
    return Number(price).toFixed(2);
  }
}
