/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import puppeteer from 'puppeteer';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { categories, subscriptions, users } from '../db/schema';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBillingCycle(cycle: string): string {
  const map: Record<string, string> = {
    weekly: 'أسبوعي',
    monthly: 'شهري',
    quarterly: 'كل 3 أشهر',
    semi_annual: 'كل 6 أشهر',
    yearly: 'سنوي',
  };

  return map[cycle] ?? cycle;
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'نشط',
    inactive: 'متوقف',
    cancelled: 'ملغي',
  };

  return map[status] ?? status;
}

function getMonthlyEquivalent(price: string, billingCycle: string): number {
  const amount = Number(price);

  if (billingCycle === 'weekly') return amount * 4;
  if (billingCycle === 'quarterly') return amount / 3;
  if (billingCycle === 'semi_annual') return amount / 6;
  if (billingCycle === 'yearly') return amount / 12;

  return amount;
}

export async function generateSubscriptionsPdf(userId: number): Promise<Buffer> {
  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error('User not found');
  }

  const rows = await db
    .select({
      name: subscriptions.name,
      price: subscriptions.price,
      billingCycle: subscriptions.billingCycle,
      renewalDate: subscriptions.renewalDate,
      status: subscriptions.status,
      categoryName: categories.name,
    })
    .from(subscriptions)
    .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
    .where(eq(subscriptions.userId, userId));

  const activeSubscriptions = rows.filter((row) => row.status === 'active');

  const monthlyTotal = activeSubscriptions.reduce((sum, row) => {
    return sum + getMonthlyEquivalent(row.price, row.billingCycle);
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const tableRows = rows
    .map(
      (subscription) => `
        <tr>
          <td>${subscription.name}</td>
          <td>${subscription.categoryName ?? 'أخرى'}</td>
          <td>${subscription.price} ريال</td>
          <td>${formatBillingCycle(subscription.billingCycle)}</td>
          <td>${formatDate(subscription.renewalDate)}</td>
          <td>${formatStatus(subscription.status ?? 'active')}</td>
        </tr>
      `,
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            margin: 0;
            padding: 0;
            color: #0f172a;
            background: #ffffff;
          }

          .header {
            background: #1e3a5f;
            color: white;
            padding: 32px 48px;
            text-align: right;
          }

          .header h1 {
            margin: 0;
            font-size: 28px;
          }

          .header p {
            margin: 8px 0 0;
            font-size: 14px;
          }

          .content {
            padding: 32px 48px;
          }

          .info {
            margin-bottom: 24px;
            line-height: 1.8;
            font-size: 14px;
          }

          .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 24px 0 32px;
          }

          .card {
            border: 1px solid #d8e0f3;
            border-radius: 10px;
            background: #f7f9ff;
            padding: 16px;
          }

          .card .label {
            color: #64748b;
            font-size: 13px;
            margin-bottom: 8px;
          }

          .card .value {
            color: #1e3a5f;
            font-size: 20px;
            font-weight: bold;
          }

          h2 {
            color: #1e3a5f;
            font-size: 20px;
            margin: 0 0 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            direction: rtl;
            font-size: 12px;
          }

          th {
            background: #1e3a5f;
            color: white;
            padding: 10px;
            text-align: right;
          }

          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            text-align: right;
          }

          tr:nth-child(even) td {
            background: #f8faff;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>ديرها</h1>
          <p>تقرير إدارة الاشتراكات</p>
        </div>

        <div class="content">
          <div class="info">
            <div>الحساب: ${user.name}</div>
            <div>البريد الإلكتروني: ${user.email}</div>
            <div>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}</div>
          </div>

          <div class="cards">
            <div class="card">
              <div class="label">عدد الاشتراكات</div>
              <div class="value">${rows.length}</div>
            </div>

            <div class="card">
              <div class="label">الإجمالي الشهري</div>
              <div class="value">${monthlyTotal.toFixed(2)} ريال</div>
            </div>

            <div class="card">
              <div class="label">الإجمالي السنوي</div>
              <div class="value">${yearlyTotal.toFixed(2)} ريال</div>
            </div>
          </div>

          <h2>جدول الاشتراكات</h2>

          <table>
            <thead>
              <tr>
                <th>الخدمة</th>
                <th>التصنيف</th>
                <th>السعر</th>
                <th>دورة الدفع</th>
                <th>تاريخ التجديد</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'load',
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm',
    },
  });

  await browser.close();

  return Buffer.from(pdf);
}
