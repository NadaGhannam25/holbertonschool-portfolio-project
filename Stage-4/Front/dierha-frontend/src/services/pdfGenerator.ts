import type { BackendSubscription } from "./subscriptionService";

const LOGO_URL =
    "https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png";

function formatBillingCycle(cycle: string): string {
    const map: Record<string, string> = {
        weekly: "أسبوعي", monthly: "شهري", quarterly: "كل 3 أشهر",
        semi_annual: "كل 6 أشهر", yearly: "سنوي",
    };
    return map[cycle] ?? cycle;
}

function formatStatus(status: string, deletedAt: string | null | undefined): string {
    if (deletedAt) return "محذوف";
    return status === "active" ? "نشط" : "غير نشط";
}

function getMonthlyEquivalent(price: string, cycle: string): number {
    const n = Number(price);
    if (cycle === "weekly") return n * 4;
    if (cycle === "quarterly") return n / 3;
    if (cycle === "semi_annual") return n / 6;
    if (cycle === "yearly") return n / 12;
    return n;
}

function formatDateSafe(val: string | null | undefined): string {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

function getUserData(): { name: string; email: string } {
    try {
        const raw = localStorage.getItem("dierha_user");
        if (raw) {
            const p = JSON.parse(raw);
            return { name: p?.name ?? "مستخدم", email: p?.email ?? "" };
        }
    } catch { /* ignore */ }
    return { name: "مستخدم", email: "" };
}

export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName?: string,
    userEmail?: string,
): Promise<void> {
    const safe = Array.isArray(subscriptions) ? subscriptions : [];

    const user = getUserData();
    const name  = (userName  && userName  !== "undefined") ? userName  : user.name;
    const email = (userEmail && userEmail !== "undefined") ? userEmail : user.email;

    const active = safe.filter((s) => s.status === "active" && !s.deletedAt);
    const monthlyTotal = active.reduce(
        (sum, s) => sum + getMonthlyEquivalent(String(s.price), s.billingCycle), 0
    );
    const yearlyTotal = monthlyTotal * 12;

    const tableRows = safe.map((s) => `
      <tr class="${s.deletedAt ? "deleted-row" : ""}">
        <td>${s.name}</td>
        <td>${s.category?.name ?? "أخرى"}</td>
        <td>${Number(s.price).toFixed(2)} ريال</td>
        <td>${formatBillingCycle(s.billingCycle)}</td>
        <td>${formatDateSafe(s.startDate)}</td>
        <td>${formatDateSafe(s.renewalDate)}</td>
        <td>
          <span class="status-badge status-${s.deletedAt ? "deleted" : (s.status ?? "active")}">
            ${formatStatus(s.status ?? "active", s.deletedAt ?? null)}
          </span>
        </td>
      </tr>`).join("");

    const css = `
      body { font-family: Tahoma, Arial, sans-serif; direction: rtl; margin: 0; padding: 0; background: #FAFBFC; color: #292B2E; }
      .wrapper { width: 100%; min-height: 100vh; background: #FAFBFC; }
      .header { background: linear-gradient(135deg, #666CC0 0%, #6E87C0 45%, #F3B0B9 100%); padding: 55px 40px 45px; text-align: center; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .header img { width: 220px; margin-bottom: 22px; background: transparent; border-radius: 24px; padding: 12px; box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
      .header h1 { margin: 0; font-size: 38px; font-weight: 800; }
      .header p { margin-top: 12px; font-size: 16px; opacity: .95; }
      .content { padding: 45px 55px; }
      .info { background: white; border: 1px solid #D6DAE1; border-radius: 24px; padding: 24px; margin-bottom: 34px; line-height: 2.1; box-shadow: 0 6px 18px rgba(102,108,192,0.05); }
      .info div { margin-bottom: 8px; font-size: 15px; }
      .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 40px; }
      .card { background: linear-gradient(180deg, #FFFFFF, #FAFBFC); border: 1px solid #D6DAE1; border-radius: 24px; padding: 26px; text-align: center; box-shadow: 0 6px 16px rgba(102,108,192,0.06); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .card .label { color: #6E87C0; font-size: 14px; margin-bottom: 10px; font-weight: 700; }
      .card .value { color: #292B2E; font-size: 28px; font-weight: 800; }
      .section-title { color: #666CC0; font-size: 28px; font-weight: 800; margin: 0 0 20px; }
      table { width: 100%; border-collapse: collapse; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
      th { background: linear-gradient(135deg, #666CC0, #6E87C0); color: white; padding: 18px; text-align: right; font-size: 13px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      td { padding: 16px 18px; border-bottom: 1px solid #E5E9F1; color: #292B2E; font-size: 13px; }
      tr:nth-child(even) td { background: #FAFBFC; }
      .deleted-row td { opacity: 0.6; background: #FFF5F5 !important; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .status-active   { background: #E8F5E9; color: #2E7D32; }
      .status-inactive { background: #FFF8E1; color: #F57F17; }
      .status-deleted  { background: #FFEBEE; color: #C62828; }
      .footer { margin-top: 40px; text-align: center; color: #63676E; font-size: 14px; padding-bottom: 30px; }
      @media print {
        @page { size: A4; margin: 0; }
        body { background: white; }
      }
    `;

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<style>${css}</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="${LOGO_URL}" alt="ديرها" />
    <h1>ديرها</h1>
    <p>تقرير إدارة الاشتراكات</p>
  </div>
  <div class="content">
    <div class="info">
      <div>الحساب: <strong>${name}</strong></div>
      <div>البريد الإلكتروني: <strong>${email}</strong></div>
      <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
    </div>
    <div class="cards">
      <div class="card"><div class="label">إجمالي الاشتراكات</div><div class="value">${safe.length}</div></div>
      <div class="card"><div class="label">الإجمالي الشهري (النشطة)</div><div class="value">${monthlyTotal.toFixed(2)} ريال</div></div>
      <div class="card"><div class="label">الإجمالي السنوي (النشطة)</div><div class="value">${yearlyTotal.toFixed(2)} ريال</div></div>
    </div>
    <h2 class="section-title">جدول الاشتراكات</h2>
    <table>
      <thead>
        <tr><th>الخدمة</th><th>التصنيف</th><th>السعر</th><th>دورة الدفع</th><th>تاريخ البداية</th><th>تاريخ التجديد</th><th>الحالة</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="footer">ديرها | منصة إدارة الاشتراكات</div>
  </div>
</div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) { document.body.removeChild(iframe); return; }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    iframe.onload = () => {
        setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 600);
    };
}
