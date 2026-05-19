import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { categories, subscriptions, users } from '../db/schema';
import { cairoRegularBase64 } from '../assets/fonts/cairo';

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

function getMonthlyEquivalent(
  price: string,
  billingCycle: string,
): number {
  const amount = Number(price);

  if (billingCycle === 'quarterly') return amount / 3;
  if (billingCycle === 'semi_annual') return amount / 6;
  if (billingCycle === 'yearly') return amount / 12;

  return amount;
}

export async function generateSubscriptionsPdf(
  userId: number,
): Promise<Buffer> {
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
    .leftJoin(
      categories,
      eq(subscriptions.categoryId, categories.id),
    )
    .where(eq(subscriptions.userId, userId));

  const activeSubscriptions = rows.filter(
    (row) => row.status === 'active',
  );

  const monthlyTotal = activeSubscriptions.reduce((sum, row) => {
    return sum + getMonthlyEquivalent(row.price, row.billingCycle);
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.addFileToVFS('Cairo-Regular.ttf', cairoRegularBase64);
  doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
  doc.setFont('Cairo');
  doc.setR2L(true);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;

  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('ديرها', pageWidth - margin, 16, {
    align: 'right',
  });

  doc.setFontSize(10);
  doc.text('تقرير إدارة الاشتراكات', pageWidth - margin, 25, {
    align: 'right',
  });

  let y = 48;

  doc.setTextColor(60, 60, 80);
  doc.setFontSize(10);

  doc.text(`الحساب: ${user.name} (${user.email})`, pageWidth - margin, y, {
    align: 'right',
  });

  y += 7;

  doc.text(
    `تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}`,
    pageWidth - margin,
    y,
    {
      align: 'right',
    },
  );

  y += 14;

  const cardWidth = (pageWidth - margin * 2 - 8) / 3;

  const cards = [
    {
      label: 'عدد الاشتراكات',
      value: String(rows.length),
    },
    {
      label: 'الإجمالي الشهري',
      value: `${monthlyTotal.toFixed(2)} ريال`,
    },
    {
      label: 'الإجمالي السنوي',
      value: `${yearlyTotal.toFixed(2)} ريال`,
    },
  ];

  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + 4);

    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(210, 218, 240);
    doc.roundedRect(x, y, cardWidth, 22, 3, 3, 'FD');

    doc.setTextColor(100, 116, 160);
    doc.setFontSize(8);
    doc.text(card.label, x + cardWidth - 6, y + 8, {
      align: 'right',
    });

    doc.setTextColor(30, 58, 95);
    doc.setFontSize(12);
    doc.text(card.value, x + cardWidth - 6, y + 18, {
      align: 'right',
    });
  });

  y += 32;

  doc.setTextColor(30, 58, 95);
  doc.setFontSize(12);
  doc.text('جدول الاشتراكات', pageWidth - margin, y, {
    align: 'right',
  });

  autoTable(doc, {
    startY: y + 4,

    head: [
      [
        'الحالة',
        'تاريخ التجديد',
        'دورة الدفع',
        'السعر',
        'التصنيف',
        'الخدمة',
      ],
    ],

    body: rows.map((subscription) => [
      formatStatus(subscription.status ?? 'active'),
      formatDate(subscription.renewalDate),
      formatBillingCycle(subscription.billingCycle),
      `${subscription.price} ريال`,
      subscription.categoryName ?? 'أخرى',
      subscription.name,
    ]),

    margin: {
      left: margin,
      right: margin,
    },

    styles: {
      font: 'Cairo',
      fontSize: 8,
      cellPadding: 4,
      halign: 'right',
      textColor: [50, 50, 70],
    },

    headStyles: {
      font: 'Cairo',
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      halign: 'right',
    },

    alternateRowStyles: {
      fillColor: [248, 249, 255],
    },
  });

  return Buffer.from(doc.output('arraybuffer') as ArrayBuffer);
}
