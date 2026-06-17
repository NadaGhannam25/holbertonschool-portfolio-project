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

async function logoToBase64(): Promise<string> {
    try {
        const res = await fetch(LOGO_URL);
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch { return ""; }
}

async function loadLibs(): Promise<{ html2canvas: any; jsPDF: any }> {
    if (!(window as any).html2canvas) {
        await new Promise<void>((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            s.onload = () => res(); s.onerror = rej;
            document.head.appendChild(s);
        });
    }
    if (!(window as any).jspdf?.jsPDF) {
        await new Promise<void>((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            s.onload = () => res(); s.onerror = rej;
            document.head.appendChild(s);
        });
    }
    return {
        html2canvas: (window as any).html2canvas,
        jsPDF: (window as any).jspdf.jsPDF,
    };
}

export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName?: string,
    userEmail?: string,
): Promise<void> {
    const safe = Array.isArray(subscriptions) ? subscriptions : [];
    const user  = getUserData();
    const name  = (userName  && userName  !== "undefined") ? userName  : user.name;
    const email = (userEmail && userEmail !== "undefined") ? userEmail : user.email;

    const active = safe.filter((s) => s.status === "active" && !s.deletedAt);
    const monthlyTotal = active.reduce(
        (sum, s) => sum + getMonthlyEquivalent(String(s.price), s.billingCycle), 0
    );
    const yearlyTotal = monthlyTotal * 12;

    const [logoBase64, { html2canvas, jsPDF }] = await Promise.all([
        logoToBase64(),
        loadLibs(),
    ]);

    const tableRows = safe.map((s) => `
        <tr class="${s.deletedAt ? "dierha-deleted" : ""}">
          <td>${s.name}</td>
          <td>${s.category?.name ?? "أخرى"}</td>
          <td>${Number(s.price).toFixed(2)} ريال</td>
          <td>${formatBillingCycle(s.billingCycle)}</td>
          <td>${formatDateSafe(s.startDate)}</td>
          <td>${formatDateSafe(s.renewalDate)}</td>
          <td><span class="dierha-badge dierha-${s.deletedAt ? "deleted" : (s.status ?? "active")}">
            ${formatStatus(s.status ?? "active", s.deletedAt ?? null)}
          </span></td>
        </tr>`).join("");

    // نستخدم shadow DOM لعزل الـ styles كلياً عن الصفحة
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;top:-99999px;left:-99999px;width:0;height:0;overflow:hidden;";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const tmpl = document.createElement("div");
    tmpl.style.cssText = "width:794px;background:#FAFBFC;";
    tmpl.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  .dierha-wrap{width:794px;background:#FAFBFC;font-family:Tahoma,Arial,sans-serif;direction:rtl;}
  .dierha-header{background:linear-gradient(135deg,#666CC0 0%,#6E87C0 45%,#F3B0B9 100%);padding:55px 40px 45px;text-align:center;color:white;}
  .dierha-header img{width:180px;margin-bottom:18px;border-radius:20px;padding:10px;background:rgba(255,255,255,0.15);}
  .dierha-header h1{margin:0;font-size:34px;font-weight:800;font-family:Tahoma,Arial,sans-serif;}
  .dierha-header p{margin-top:10px;font-size:15px;opacity:.95;}
  .dierha-content{padding:36px 44px;}
  .dierha-info{background:white;border:1px solid #D6DAE1;border-radius:20px;padding:20px 24px;margin-bottom:28px;line-height:2;}
  .dierha-info div{font-size:14px;color:#292B2E;margin-bottom:4px;}
  .dierha-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;}
  .dierha-card{background:linear-gradient(180deg,#FFFFFF,#FAFBFC);border:1px solid #D6DAE1;border-radius:20px;padding:22px;text-align:center;}
  .dierha-card .lbl{color:#6E87C0;font-size:12px;margin-bottom:8px;font-weight:700;}
  .dierha-card .val{color:#292B2E;font-size:24px;font-weight:800;}
  .dierha-title{color:#666CC0;font-size:24px;font-weight:800;margin:0 0 16px;}
  .dierha-table{width:100%;border-collapse:collapse;background:white;border-radius:20px;overflow:hidden;}
  .dierha-table thead tr th{background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;}
  .dierha-table tbody tr td{padding:13px 16px;border-bottom:1px solid #E5E9F1;color:#292B2E;font-size:12px;font-family:Tahoma,Arial,sans-serif;}
  .dierha-table tbody tr:nth-child(even) td{background:#FAFBFC;}
  .dierha-deleted td{opacity:0.6;background:#FFF5F5!important;}
  .dierha-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
  .dierha-active{background:#E8F5E9;color:#2E7D32;}
  .dierha-inactive{background:#FFF8E1;color:#F57F17;}
  .dierha-deleted-badge,.dierha-deleted{background:#FFEBEE;color:#C62828;}
  .dierha-footer{margin-top:32px;text-align:center;color:#63676E;font-size:13px;padding-bottom:24px;}
</style>
<div class="dierha-wrap">
  <div class="dierha-header">
    ${logoBase64 ? `<img src="${logoBase64}" alt="ديرها"/>` : ""}
    <h1>ديرها</h1>
    <p>تقرير إدارة الاشتراكات</p>
  </div>
  <div class="dierha-content">
    <div class="dierha-info">
      <div>الحساب: <strong>${name}</strong></div>
      <div>البريد الإلكتروني: <strong>${email}</strong></div>
      <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
    </div>
    <div class="dierha-cards">
      <div class="dierha-card"><div class="lbl">إجمالي الاشتراكات</div><div class="val">${safe.length}</div></div>
      <div class="dierha-card"><div class="lbl">الإجمالي الشهري (النشطة)</div><div class="val">${monthlyTotal.toFixed(2)} ريال</div></div>
      <div class="dierha-card"><div class="lbl">الإجمالي السنوي (النشطة)</div><div class="val">${yearlyTotal.toFixed(2)} ريال</div></div>
    </div>
    <h2 class="dierha-title">جدول الاشتراكات</h2>
    <table class="dierha-table">
      <thead><tr>
        <th>الخدمة</th><th>التصنيف</th><th>السعر</th><th>دورة الدفع</th><th>تاريخ البداية</th><th>تاريخ التجديد</th><th>الحالة</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="dierha-footer">ديرها | منصة إدارة الاشتراكات</div>
  </div>
</div>`;

    shadow.appendChild(tmpl);

    // نخلي الـ host مرئي مؤقتاً بدون أن يظهر للمستخدم
    host.style.cssText = "position:fixed;top:0;left:-9999px;width:794px;height:auto;overflow:visible;z-index:-1;";

    // ننتظر الـ render يكتمل
    await new Promise((r) => setTimeout(r, 300));

    try {
        const canvas = await html2canvas(tmpl, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#FAFBFC",
            logging: false,
            width: 794,
        });

        const imgW  = 210;
        const imgH  = (canvas.height * imgW) / canvas.width;
        const pageH = 297;

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const imgData = canvas.toDataURL("image/jpeg", 0.97);

        let yPos = 0;
        let first = true;
        while (yPos < imgH) {
            if (!first) doc.addPage();
            first = false;
            doc.addImage(imgData, "JPEG", 0, -yPos, imgW, imgH);
            yPos += pageH;
        }

        doc.save(`dierha-subscriptions-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
        document.body.removeChild(host);
    }
}
