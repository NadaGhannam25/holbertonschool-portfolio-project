import type { BackendSubscription } from "./subscriptionService";


function formatBillingCycle(cycle: string): string {
    const map: Record<string, string> = {
        weekly: "أسبوعي",
        monthly: "شهري",
        quarterly: "كل 3 أشهر",
        semi_annual: "كل 6 أشهر",
        yearly: "سنوي",
    };
    return map[cycle] ?? cycle;
}

function formatDate(val: string | null | undefined): string {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
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
    userEmail: string,
): Promise<void> {
    const safe = Array.isArray(subscriptions) ? subscriptions : [];
    const active = safe.filter((s) => s.status === "active");
    const monthlyTotal = active.reduce(
        (sum, s) => sum + getMonthlyEquivalent(String(s.price), s.billingCycle),
        0,
    );
    const yearlyTotal = monthlyTotal * 12;

    const rows = safe
        .map(
            (s) => `
      <tr class="${s.deletedAt ? "deleted-row" : ""}">
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
      </tr>`,
        )
        .join("");

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>تقرير ديرها</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Tahoma,Arial,sans-serif;direction:rtl;background:#F6F8FF;color:#1F2940}
  .no-print{text-align:center;padding:18px;background:#F6F8FF;border-bottom:1px solid #E7ECF6}
  .no-print button{background:linear-gradient(135deg,#666CC0,#6E87C0);color:#fff;border:none;
    padding:12px 36px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;
    font-family:Tahoma,Arial,sans-serif}
  @media print{.no-print{display:none!important}}
  .header{background:linear-gradient(135deg,#666CC0 0%,#6E87C0 50%,#F3B0B9 100%);
    padding:40px;text-align:center;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .header h1{font-size:34px;font-weight:900;margin-bottom:6px}
  .header p{font-size:14px;opacity:.9}
  .header .meta{margin-top:10px;font-size:12px;opacity:.85}
  .content{padding:28px 36px}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px}
  .card{background:#fff;border:1px solid #E7ECF6;border-radius:16px;padding:18px;text-align:center;
    box-shadow:0 4px 12px rgba(2,11,92,.06);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .card .label{color:#666CC0;font-size:11px;font-weight:700;margin-bottom:6px}
  .card .value{color:#1F2940;font-size:20px;font-weight:900}
  h2{color:#666CC0;font-size:18px;font-weight:900;margin-bottom:14px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;
    overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.04)}
  th{background:linear-gradient(135deg,#666CC0,#6E87C0);color:#fff;padding:13px 14px;
    text-align:right;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  td{padding:12px 14px;border-bottom:1px solid #E7ECF6;font-size:12px;color:#1F2940}
  tr:nth-child(even) td{background:#F2F6FF}
  tr:last-child td{border-bottom:none}
  .deleted-row td{opacity:.55;background:#FFF5F5!important}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  .badge.active{background:#E8F5E9;color:#2E7D32}
  .badge.inactive{background:#FFF8E1;color:#F57F17}
  .footer{margin-top:28px;text-align:center;color:#667085;font-size:12px}
  @media print{@page{size:A4;margin:10mm} body{background:#fff}}
</style>
</head>
<body>
<div class="no-print">
  <button onclick="window.print()">⬇ تحميل PDF</button>
</div>
<div class="header">
  <h1>ديرها</h1>
  <p>تقرير إدارة الاشتراكات</p>
  <div class="meta">${userName} | ${userEmail} | ${new Date().toLocaleDateString("ar-SA")}</div>
</div>
<div class="content">
  <div class="cards">
    <div class="card"><div class="label">إجمالي الاشتراكات</div><div class="value">${safe.length}</div></div>
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
    setTimeout(() => {
        win.document.open();
        win.document.write(html);
        win.document.close();
    }, 0);
}
