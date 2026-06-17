import { eq } from 'drizzle-orm';
import { db } from '../db';
import { categories, subscriptions, users } from '../db/schema';

const { jsPDF } = require('jspdf') as { jsPDF: any };
const autoTable = require('jspdf-autotable').default;

function formatBillingCycle(cycle: string): string {
  const map: Record<string, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    semi_annual: 'Semi-Annual',
    yearly: 'Yearly',
  };
  return map[cycle] ?? cycle;
}

function formatStatus(
  status: string,
  deletedAt: Date | string | null | undefined,
): string {
  if (deletedAt != null) return 'Deleted';
  return status === 'active' ? 'Active' : 'Inactive';
}

function getMonthlyEquivalent(price: string, billingCycle: string): number {
  const amount = Number(price);
  if (billingCycle === 'weekly') return amount * 4;
  if (billingCycle === 'quarterly') return amount / 3;
  if (billingCycle === 'semi_annual') return amount / 6;
  if (billingCycle === 'yearly') return amount / 12;
  return amount;
}

function formatDateSafe(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return '-';
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return '-';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}



export async function generateSubscriptionsPdf(userId: number): Promise<Buffer> {
  const [user] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) throw new Error('User not found');

  const rows = await db
    .select({
      name: subscriptions.name,
      price: subscriptions.price,
      billingCycle: subscriptions.billingCycle,
      startDate: subscriptions.startDate,
      renewalDate: subscriptions.renewalDate,
      status: subscriptions.status,
      deletedAt: subscriptions.deletedAt,
      categoryName: categories.name,
    })
    .from(subscriptions)
    .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
    .where(eq(subscriptions.userId, userId));

  const activeRows = rows.filter((r) => r.status === 'active' && r.deletedAt === null);
  const monthlyTotal = activeRows.reduce(
    (sum, r) => sum + getMonthlyEquivalent(r.price, r.billingCycle),
    0,
  );
  const yearlyTotal = monthlyTotal * 12;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(102, 108, 192); 
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Dierha - Subscription Report', pageW / 2, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`User: ${user.name}  |  ${user.email}  |  ${formatDateSafe(new Date())}`, pageW / 2, 26, { align: 'center' });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const cardY = 44;
  const cardW = 80;
  const gap = 10;
  const startX = (pageW - (3 * cardW + 2 * gap)) / 2;

  const cards = [
    { label: 'Total Subscriptions', value: String(rows.length) },
    { label: 'Monthly Total (Active)', value: `${monthlyTotal.toFixed(2)} SAR` },
    { label: 'Yearly Total (Active)', value: `${yearlyTotal.toFixed(2)} SAR` },
  ];

  cards.forEach((card, i) => {
    const x = startX + i * (cardW + gap);
    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(214, 218, 225);
    doc.roundedRect(x, cardY, cardW, 20, 4, 4, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(110, 135, 192);
    doc.text(card.label, x + cardW / 2, cardY + 7, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text(card.value, x + cardW / 2, cardY + 15, { align: 'center' });
  });

  const tableBody = rows.map((s) => [
    s.name,
    s.categoryName ?? 'Other',
    `${Number(s.price).toFixed(2)} SAR`,
    formatBillingCycle(s.billingCycle),
    formatDateSafe(s.startDate),
    formatDateSafe(s.renewalDate),
    formatStatus(s.status ?? 'active', s.deletedAt),
  ]);

  autoTable(doc, ({
    startY: cardY + 26,
    head: [['Service', 'Category', 'Price', 'Billing', 'Start Date', 'Renewal Date', 'Status']],
    body: tableBody,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [102, 108, 192], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 251, 252] },
    didParseCell: (data: { row: { raw: string[] }; cell: { styles: { textColor: number[] } } }) => {
      const status = data.row.raw[6];
      if (data.cell === data.row.raw[6]) return;
      if (status === 'Deleted') {
        data.cell.styles.textColor = [180, 180, 180];
      }
    },
    margin: { left: 10, right: 10 },
  });

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Dierha | Subscription Management Platform', pageW / 2, pageH - 6, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer') as ArrayBuffer);
}

export async function initBrowser(): Promise<void> { /* no-op */ }
export async function initLogo(): Promise<void> { /* no-op */ }
