import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../db';
import { categories, subscriptions, users } from '../db/schema';

const { jsPDF } = require('jspdf') as { jsPDF: any };
const autoTable = require('jspdf-autotable').default;

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

function formatStatus(
  status: string,
  deletedAt: Date | string | null | undefined,
): string {
  if (deletedAt != null) return 'محذوف';
  return status === 'active' ? 'نشط' : 'غير نشط';
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

  // جلب الاشتراكات غير المحذوفة فقط
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
    .where(and(eq(subscriptions.userId, userId), isNull(subscriptions.deletedAt)));

  const activeRows = rows.filter((r) => r.status === 'active');
  const monthlyTotal = activeRows.reduce(
    (sum, r) => sum + getMonthlyEquivalent(r.price, r.billingCycle),
    0,
  );
  const yearlyTotal = monthlyTotal * 12;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();

  // الهيدر بالتدرج الأزرق
  doc.setFillColor(29, 71, 218);
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Dierha - \u062A\u0642\u0631\u064A\u0631 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A', pageW / 2, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`\u0627\u0644\u062D\u0633\u0627\u0628: ${user.name}  |  ${user.email}  |  ${formatDateSafe(new Date())}`, pageW / 2, 26, { align: 'center' });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const cardY = 44;
  const cardW = 80;
  const gap = 10;
  const startX = (pageW - (3 * cardW + 2 * gap)) / 2;

  const cards = [
    { label: '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A', value: String(rows.length) },
    { label: '\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0646\u0634\u0637', value: `${monthlyTotal.toFixed(2)} \u0631\u064A\u0627\u0644` },
    { label: '\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0633\u0646\u0648\u064A \u0627\u0644\u0646\u0634\u0637', value: `${yearlyTotal.toFixed(2)} \u0631\u064A\u0627\u0644` },
  ];

  cards.forEach((card, i) => {
    const x = startX + i * (cardW + gap);
    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(214, 218, 225);
    doc.roundedRect(x, cardY, cardW, 20, 4, 4, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(29, 71, 218);
    doc.text(card.label, x + cardW / 2, cardY + 7, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text(card.value, x + cardW / 2, cardY + 15, { align: 'center' });
  });

  const tableBody = rows.length > 0 ? rows.map((s) => [
    s.name,
    s.categoryName ?? '\u0623\u062E\u0631\u0649',
    `${Number(s.price).toFixed(2)} \u0631\u064A\u0627\u0644`,
    formatBillingCycle(s.billingCycle),
    formatDateSafe(s.startDate),
    formatDateSafe(s.renewalDate),
    formatStatus(s.status ?? 'active', s.deletedAt),
  ]) : [[
    '\u0644\u0627 \u062A\u0648\u062C\u062F \u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u062D\u062A\u0649 \u0627\u0644\u0622\u0646',
    '-', '-', '-', '-', '-', '-',
  ]];

  autoTable(doc, ({
    startY: cardY + 26,
    showHead: 'everyPage',
    head: [['\u0627\u0644\u062E\u062F\u0645\u0629', '\u0627\u0644\u062A\u0635\u0646\u064A\u0641', '\u0627\u0644\u0633\u0639\u0631', '\u062F\u0648\u0631\u0629 \u0627\u0644\u062F\u0641\u0639', '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629', '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u062C\u062F\u064A\u062F', '\u0627\u0644\u062D\u0627\u0644\u0629']],
    body: tableBody,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [29, 71, 218], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 251, 252] },
    margin: { left: 10, right: 10 },
  });

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Dierha | \u0645\u0646\u0635\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A', pageW / 2, pageH - 6, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer') as ArrayBuffer);
}

export async function initBrowser(): Promise<void> { /* no-op */ }
export async function initLogo(): Promise<void> { /* no-op */ }
