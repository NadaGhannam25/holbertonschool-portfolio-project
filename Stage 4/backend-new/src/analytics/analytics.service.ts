import { Injectable } from '@nestjs/common';
import {
  
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.st
ivate generatePaymentsForRange(params: {
    subscription: AnalyticsSubscription;
    rangeStart: Date;
    rangeEnd: Date;
  }) {
    const payments: { date: Date; amount: number }[] = [];

    const subscriptionStart = this.parseDate(params.subscription.startDate);
    subscriptionStart.setHours(0, 0, 0, 0);

    const subscriptionEnd = params.subscription.endDate
      ? this.parseDate(params.subscription.endDate)
      : new Date(params.rangeEnd);
    subscriptionEnd.setHours(23, 59, 59, 999);

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
