    }
 this.getOwnedSubscription(userId, id);


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
