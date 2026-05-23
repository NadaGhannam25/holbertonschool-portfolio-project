/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import puppeteer from 'puppeteer';
import { eq } from 'drizzle-orm';

import { db } from '../db';

import {
  categories,

function formatBillingCycle(
  cycle: string,
): string {

  const map:
  Record<string, string> = {

    weekly: 'أسبوعي',

    monthly: 'شهري',

    quarterly: 'كل 3 أشهر',

    semi_annual: 'كل 6 أشهر',

    yearly: 'سنوي',
  };

  return map[cycle] ?? cycle;
}

function formatStatus(
  status: string,
  deletedAt?: Date | string | null,
): string {

  if (deletedAt) {
    return 'محذوف';
  }

  const map:
  Record<string, string> = {

    active: 'نشط',

    inactive: 'غير نشط',
  };

  return map[status] ?? status;
}

function getMonthlyEquivalent(
  price: string,
  billingCycle: string,
): number {

  const amount =
    Number(price);

  if (
    billingCycle === 'weekly'
  ) {

    return amount * 4;
  }

  if (
    billingCycle === 'quarterly'
  ) {

    return amount / 3;
  }

  if (
    billingCycle === 'semi_annual'
  ) {

    return amount / 6;
  }

  if (
    billingCycle === 'yearly'
  ) {

    return amount / 12;
  }

  return amount;
}

export async function
generateSubscriptionsPdf(
  userId: number,
): Promise<Buffer> {

  const [user] = await db

    .select({

      name: users.name,

      email: users.email,
    })

    .from(users)

    .where(
      eq(users.id, userId),
    );

  if (!user) {

    throw new Error(
      'User not found',
    );
  }

  const rows = await db

    .select({

      name:
        subscriptions.name,

      price:
        subscriptions.price,

      billingCycle:
        subscriptions.billingCycle,

      renewalDate:
        subscriptions.renewalDate,

      status:
        subscriptions.status,

      deletedAt:
        subscriptions.deletedAt,

      categoryName:
        categories.name,
    })

    .from(subscriptions)

    .leftJoin(

      categories,

      eq(
        subscriptions.categoryId,
        categories.id,
      ),
    )

    .where(
      eq(
        subscriptions.userId,
        userId,
      ),
    );

  const activeSubscriptions =

    rows.filter(
      (row) =>
        row.status ===
        'active' &&
        !row.deletedAt,
    );

  const monthlyTotal =

    activeSubscriptions.reduce(

      (sum, row) => {

        return (
          sum +

          getMonthlyEquivalent(
            row.price,
            row.billingCycle,
          )
        );
      },

      0,
    );

  const yearlyTotal =
    monthlyTotal * 12;

  const tableRows = rows

    .map(
      (subscription) => `

        <tr>

          <td>
            ${subscription.name}
          </td>

          <td>

            ${
              subscription.categoryName ??
              'أخرى'
            }

          </td>

          <td>
            ${subscription.price}
            ريال
          </td>

          <td>

            ${formatBillingCycle(
              subscription.billingCycle,
            )}

          </td>

          <td>

            ${formatDate(
              subscription.renewalDate,
            )}

          </td>

          <td>

            ${formatStatus(
              subscription.status ??
              'active',
              subscription.deletedAt,
            )}

          </td>

        </tr>
      `,
    )

    .join('');

  const html = `

<!DOCTYPE html>

<html
  lang="ar"
  dir="rtl"
>

<head>

<meta charset="UTF-8" />

<style>

body {

  font-family:
    Tahoma,
    Arial,
    sans-serif;

  direction: rtl;

  margin: 0;

  padding: 0;

  background: #FAFBFC;

  color: #292B2E;
}

.wrapper {

  width: 100%;

  min-height: 100vh;

  background: #FAFBFC;
}

.header {

  background:
    linear-gradient(
      135deg,
      #666CC0 0%,
      #6E87C0 45%,
      #F3B0B9 100%
    );

  padding:
    55px
    40px
    45px;

  text-align: center;

  color: white;
}

.header img {

  width: 220px;

  margin-bottom: 22px;

  background: transparent;

  border-radius: 24px;

  padding: 12px;

}

.header h1 {

  margin: 0;

  font-size: 38px;

  font-weight: 800;
}

.header p {

  margin-top: 12px;

  font-size: 16px;

  opacity: .95;
}

.content {

  padding:
    45px
    55px;
}

.info {

  background: white;

  border:
    1px solid #D6DAE1;

  border-radius: 24px;

  padding: 24px;

  margin-bottom: 34px;

  line-height: 2.1;

  box-shadow:
    0 6px 18px
    rgba(102,108,192,0.05);
}

.info div {

  margin-bottom: 8px;

  font-size: 15px;
}

.cards {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 18px;

  margin-bottom: 40px;
}

.card {

  background:
    linear-gradient(
      180deg,
      #FFFFFF,
      #FAFBFC
    );

  border:
    1px solid #D6DAE1;

  border-radius: 24px;

  padding: 26px;

  text-align: center;

  box-shadow:
    0 6px 16px
    rgba(102,108,192,0.06);
}

.card .label {

  color: #6E87C0;

  font-size: 14px;

  margin-bottom: 10px;

  font-weight: 700;
}

.card .value {

  color: #292B2E;

  font-size: 28px;

  font-weight: 800;
}

.section-title {

  color: #666CC0;

  font-size: 28px;

  font-weight: 800;

  margin:
    0 0 20px;
}

table {

  width: 100%;

  border-collapse: collapse;

  background: white;

  border-radius: 24px;

  overflow: hidden;

  box-shadow:
    0 8px 24px
    rgba(0,0,0,0.04);
}

th {

  background:
    linear-gradient(
      135deg,
      #666CC0,
      #6E87C0
    );

  color: white;

  padding: 18px;

  text-align: right;

  font-size: 14px;
}

td {

  padding: 18px;

  border-bottom:
    1px solid #E5E9F1;

  color: #292B2E;

  font-size: 14px;
}

tr:nth-child(even) td {

  background: #FAFBFC;
}

.footer {

  margin-top: 40px;

  text-align: center;

  color: #63676E;

  font-size: 14px;

  padding-bottom: 30px;
}

</style>

</head>

<body>

<div class="wrapper">

  <div class="header">

    <img
      src="https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png"
    />

    <h1>
      ديرها
    </h1>

    <p>
      تقرير إدارة الاشتراكات
    </p>

  </div>

  <div class="content">

    <div class="info">

      <div>

        الحساب:
        ${user.name}

      </div>

      <div>

        البريد الإلكتروني:
        ${user.email}

      </div>

      <div>

        تاريخ الإصدار:
        ${new Date()
          .toLocaleDateString(
            'ar-SA',
          )}

      </div>

    </div>

    <div class="cards">

      <div class="card">

        <div class="label">
          عدد الاشتراكات
        </div>

        <div class="value">
          ${rows.length}
        </div>

      </div>

      <div class="card">

        <div class="label">
          الإجمالي الشهري
        </div>

        <div class="value">

          ${monthlyTotal.toFixed(
            2,
          )}

          ريال

        </div>

      </div>

      <div class="card">

        <div class="label">
          الإجمالي السنوي
        </div>

        <div class="value">

          ${yearlyTotal.toFixed(
            2,
          )}

          ريال

        </div>

      </div>

    </div>

    <h2 class="section-title">

      جدول الاشتراكات

    </h2>

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

    <div class="footer">

      ديرها | منصة إدارة الاشتراكات

    </div>

  </div>

</div>

</body>

</html>
`;

  const browser =
    await puppeteer.launch({

      headless: true,
    });

  const page =
    await browser.newPage();

  await page.setContent(
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
