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

function buildHTML(
    safe: BackendSubscription[],
    name: string,
    email: string,
    logoBase64: string,
    monthlyTotal: number,
    yearlyTotal: number,
): string {
    const tableRows = safe.map((s) => `
        <tr style="${s.deletedAt ? "opacity:0.6;background:#FFF5F5;" : ""}">
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;color:#292B2E;">${s.name}</td>
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;color:#292B2E;">${s.category?.name ?? "أخرى"}</td>
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;color:#292B2E;">${Number(s.price).toFixed(2)} ريال</td>
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;color:#292B2E;">${formatBillingCycle(s.billingCycle)}</td>
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;color:#292B2E;">${formatDateSafe(s.startDate)}</td>
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;color:#292B2E;">${formatDateSafe(s.renewalDate)}</td>
          <td style="padding:13px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;font-family:Tahoma,Arial,sans-serif;">
            <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;font-family:Tahoma,Arial,sans-serif;
              ${s.deletedAt ? "background:#FFEBEE;color:#C62828;" : s.status === "active" ? "background:#E8F5E9;color:#2E7D32;" : "background:#FFF8E1;color:#F57F17;"}">
              ${formatStatus(s.status ?? "active", s.deletedAt ?? null)}
            </span>
          </td>
        </tr>`).join("");

    const evenRows = safe.map((_, i) =>
        i % 2 === 1 ? `tr:nth-child(${i + 1}) td { background: #FAFBFC; }` : ""
    ).join("");

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#FAFBFC;}
  table{border-collapse:collapse;}
</style>
</head>
<body>
<div style="width:794px;background:#FAFBFC;font-family:Tahoma,Arial,sans-serif;direction:rtl;">

  <div style="background:linear-gradient(135deg,#666CC0 0%,#6E87C0 45%,#F3B0B9 100%);padding:55px 40px 45px;text-align:center;color:white;">
    ${logoBase64 ? `<img src="${logoBase64}" style="width:180px;margin-bottom:18px;border-radius:20px;padding:10px;display:block;margin-left:auto;margin-right:auto;"/>` : ""}
    <div style="font-size:34px;font-weight:800;font-family:Tahoma,Arial,sans-serif;color:white;">ديرها</div>
    <div style="margin-top:10px;font-size:15px;opacity:.95;color:white;">تقرير إدارة الاشتراكات</div>
  </div>

  <div style="padding:36px 44px;">

    <div style="background:white;border:1px solid #D6DAE1;border-radius:20px;padding:20px 24px;margin-bottom:28px;line-height:2;">
      <div style="font-size:14px;color:#292B2E;margin-bottom:4px;">الحساب: <strong>${name}</strong></div>
      <div style="font-size:14px;color:#292B2E;margin-bottom:4px;">البريد الإلكتروني: <strong>${email}</strong></div>
      <div style="font-size:14px;color:#292B2E;">تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
      <div style="background:linear-gradient(180deg,#FFFFFF,#FAFBFC);border:1px solid #D6DAE1;border-radius:20px;padding:22px;text-align:center;">
        <div style="color:#6E87C0;font-size:12px;margin-bottom:8px;font-weight:700;">إجمالي الاشتراكات</div>
        <div style="color:#292B2E;font-size:24px;font-weight:800;">${safe.length}</div>
      </div>
      <div style="background:linear-gradient(180deg,#FFFFFF,#FAFBFC);border:1px solid #D6DAE1;border-radius:20px;padding:22px;text-align:center;">
        <div style="color:#6E87C0;font-size:12px;margin-bottom:8px;font-weight:700;">الإجمالي الشهري (النشطة)</div>
        <div style="color:#292B2E;font-size:24px;font-weight:800;">${monthlyTotal.toFixed(2)} ريال</div>
      </div>
      <div style="background:linear-gradient(180deg,#FFFFFF,#FAFBFC);border:1px solid #D6DAE1;border-radius:20px;padding:22px;text-align:center;">
        <div style="color:#6E87C0;font-size:12px;margin-bottom:8px;font-weight:700;">الإجمالي السنوي (النشطة)</div>
        <div style="color:#292B2E;font-size:24px;font-weight:800;">${yearlyTotal.toFixed(2)} ريال</div>
      </div>
    </div>

    <div style="color:#666CC0;font-size:24px;font-weight:800;margin:0 0 16px;">جدول الاشتراكات</div>

    <table style="width:100%;border-collapse:collapse;background:white;border-radius:20px;overflow:hidden;">
      <thead>
        <tr>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">الخدمة</th>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">التصنيف</th>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">السعر</th>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">دورة الدفع</th>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">تاريخ البداية</th>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">تاريخ التجديد</th>
          <th style="background:linear-gradient(135deg,#666CC0,#6E87C0);color:white;padding:15px 16px;text-align:right;font-size:12px;font-family:Tahoma,Arial,sans-serif;font-weight:700;">الحالة</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div style="margin-top:32px;text-align:center;color:#63676E;font-size:13px;padding-bottom:24px;">ديرها | منصة إدارة الاشتراكات</div>
  </div>
</div>
</body></html>`;
}

export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName?: string,
    userEmail?: string,
): Promise<void> {
    const safe = Array.isArray(subscriptions)
  ? subscriptions
  : Array.isArray((subscriptions as any)?.data)
    ? (subscriptions as any).data
    : Array.isArray((subscriptions as any)?.subscriptions)
      ? (subscriptions as any).subscriptions
      : [];
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

    const html = buildHTML(safe, name, email, logoBase64, monthlyTotal, yearlyTotal);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;left:0;top:0;width:794px;height:1px;border:none;visibility:hidden;";
    document.body.appendChild(iframe);

    try {
        const iDoc = iframe.contentDocument!;
        iDoc.open(); iDoc.write(html); iDoc.close();

        await new Promise<void>((resolve) => {
            const imgs = iDoc.querySelectorAll("img");
            if (imgs.length === 0) { setTimeout(resolve, 200); return; }
            let loaded = 0;
            imgs.forEach((img) => {
                if (img.complete) { loaded++; if (loaded === imgs.length) setTimeout(resolve, 200); }
                else { img.onload = img.onerror = () => { loaded++; if (loaded === imgs.length) setTimeout(resolve, 200); }; }
            });
        });

        const target = iDoc.body.firstElementChild as HTMLElement;
        const totalH = target.scrollHeight;
        iframe.style.height = totalH + "px";

        await new Promise((r) => setTimeout(r, 150));

        const canvas = await html2canvas(target, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#FAFBFC",
            logging: false,
            width: 794,
            height: totalH,
            windowWidth: 794,
            windowHeight: totalH,
        });

        const imgW  = 210;
        const imgH  = (canvas.height * imgW) / canvas.width;
        const pageH = 297;
        const imgData = canvas.toDataURL("image/jpeg", 0.97);

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
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
        document.body.removeChild(iframe);
    }
}
