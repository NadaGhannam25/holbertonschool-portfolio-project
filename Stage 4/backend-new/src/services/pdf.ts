import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { categories, subscriptions, users } from '../db/schema';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB');
}

function formatBillingCycle(cycle: string): string {
  const map: Record<string, string> = {
    monthly: 'Monthly',
    yearly: 'Yearly',
    weekly: 'Weekly',
    daily: 'Daily',
  };

  return map[cycle] ?? cycle;
}

function getMonthlyEquivalent(price: string, billingCycle: string): number {
  const amount = Number(price);

  if (billingCycle === 'yearly') return amount / 12;
  if (billingCycle === 'weekly') return amount * 4;
  if (billingCycle === 'daily') return amount * 30;

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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;

  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Dierha', margin, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subscription Management Report', margin, 25);

  let y = 48;

  doc.setTextColor(60, 60, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Account:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.text(`${user.name} (${user.email})`, margin + 22, y);

  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Generated:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-GB'), margin + 26, y);

  y += 14;

  const cardWidth = (pageWidth - margin * 2 - 8) / 3;

  const cards = [
    { label: 'Total Subscriptions', value: String(rows.length) },
    {
      label: 'Monthly Total',
      value: `${Math.round(monthlyTotal * 100) / 100} SAR`,
    },
    {
      label: 'Yearly Total',
      value: `${Math.round(yearlyTotal * 100) / 100} SAR`,
    },
  ];

  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + 4);

    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(210, 218, 240);
    doc.roundedRect(x, y, cardWidth, 22, 3, 3, 'FD');

    doc.setTextColor(100, 116, 160);
    doc.setFontSize(8);
    doc.text(card.label, x + 6, y + 8);

    doc.setTextColor(30, 58, 95);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + 6, y + 18);
  });

  y += 32;

  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Subscriptions', margin, y);

  autoTable(doc, {
    startY: y + 4,
    head: [['Name', 'Category', 'Amount', 'Billing', 'Next Renewal', 'Status']],
    body: rows.map((subscription) => [
      subscription.name,
      subscription.categoryName ?? 'Other',
      `${subscription.price} SAR`,
      formatBillingCycle(subscription.billingCycle),
      formatDate(subscription.renewalDate),
      subscription.status ?? 'active',
    ]),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [50, 50, 70],
    },
    headStyles: {
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 249, 255],
    },
  });

  return Buffer.from(doc.output('arraybuffer'));
}
