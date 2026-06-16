import type { BackendSubscription } from "./subscriptionService";

function formatBillingCycle(cycle: string): string {
    const map: Record<string, string> = {
        weekly: "أسبوعي", monthly: "شهري", quarterly: "كل 3 أشهر",
        semi_annual: "كل 6 أشهر", yearly: "سنوي",
    };
    return map[cycle] ?? cycle;
}

function formatDate(val: string | null | undefined): string {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("ar-SA", {
        year: "numeric", month: "long", day: "numeric",
    });
}

function getMonthlyEquivalent(price: string, cycle: string): number {
    const n = Number(price);
    if (cycle === "weekly") return n * 4;
    if (cycle === "quarterly") return n / 3;
    if (cycle === "semi_annual") return n / 6;
    if (cycle === "yearly") return n / 12;
    return n;
}

export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName: string,
    userEmail: string
): Promise<void> {
    const activeOnes = subscriptions.filter(s => s.status === "active");
    const monthlyTotal = activeOnes.reduce(
        (sum, s) => sum + getMonthlyEquivalent(s.price, s.billingCycle), 0
    );
    const yearlyTotal = monthlyTotal * 12;

    const rows = subscriptions.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.category?.name ?? "أخرى"}</td>
            <td>${Number(s.price).toFixed(2)} ريال</td>
            <td>${formatBillingCycle(s.billingCycle)}</td>
            <td>${formatDate(s.renewalDate)}</td>
            <td>
                <span class="badge ${s.status === "active" ? "active" : "inactive"}">
                    ${s.status === "active" ? "نشط" : "غير نشط"}
                </span>
            </td>
        </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>تقرير ديرها</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Cairo", Tahoma, Arial, sans-serif; direction: rtl; background: #F6F8FF; color: #1F2940; }
  .header {
    background: linear-gradient(135deg, #666CC0 0%, #6E87C0 50%, #F3B0B9 100%);
    padding: 40px; text-align: center; color: white;
  }
  .header h1 { font-size: 36px; font-weight: 900; margin-bottom: 8px; }
  .header p { font-size: 15px; opacity: 0.9; }
  .header .meta { margin-top: 12px; font-size: 13px; opacity: 0.85; }
  .content { padding: 32px 40px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .card {
    background: white; border: 1px solid #E7ECF6; border-radius: 16px;
    padding: 20px; text-align: center;
    box-shadow: 0 4px 12px rgba(2,11,92,0.06);
  }
  .card .label { color: #1D47DA; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
  .card .value { color: #1F2940; font-size: 22px; font-weight: 900; }
  h2 { color: #1D47DA; font-size: 20px; font-weight: 900; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
  th { background: linear-gradient(135deg, #1D47DA, #315BE6); color: white; padding: 14px 16px; text-align: right; font-size: 13px; }
  td { padding: 13px 16px; border-bottom: 1px solid #E7ECF6; font-size: 13px; color: #1F2940; }
  tr:nth-child(even) td { background: #F2F6FF; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .badge.active { background: #E8F5E9; color: #2E7D32; }
  .badge.inactive { background: #FFF8E1; color: #F57F17; }
  .footer { margin-top: 32px; text-align: center; color: #667085; font-size: 13px; }
  @media print {
    @page { size: A4; margin: 0; }
    body { background: white; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="no-print" style="text-align:center; padding: 20px; background: #F6F8FF; border-bottom: 1px solid #E7ECF6;">
    <button onclick="window.print()" style="background: linear-gradient(135deg, #1D47DA, #315BE6); color: white; border: none; padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: Cairo, Tahoma, Arial, sans-serif;">
      ⬇ تحميل PDF
    </button>
  </div>
  <style>
    @media print { .no-print { display: none !important; } }
  </style>
  <div class="header">
    <h1>ديرها</h1>
    <p>تقرير إدارة الاشتراكات</p>
    <div class="meta">${userName} | ${userEmail} | ${new Date().toLocaleDateString("ar-SA")}</div>
  </div>
  <div class="content">
    <div class="cards">
      <div class="card"><div class="label">إجمالي الاشتراكات</div><div class="value">${subscriptions.length}</div></div>
      <div class="card"><div class="label">الإجمالي الشهري (النشطة)</div><div class="value">${monthlyTotal.toFixed(2)} ريال</div></div>
      <div class="card"><div class="label">الإجمالي السنوي (النشطة)</div><div class="value">${yearlyTotal.toFixed(2)} ريال</div></div>
    </div>
    <h2>جدول الاشتراكات</h2>
    <table>
      <thead>
        <tr><th>الخدمة</th><th>التصنيف</th><th>السعر</th><th>دورة الدفع</th><th>تاريخ التجديد</th><th>الحالة</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">ديرها | منصة إدارة الاشتراكات</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
}
