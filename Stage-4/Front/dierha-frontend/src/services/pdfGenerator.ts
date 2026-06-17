import { getSubscriptions, type BackendSubscription } from "./subscriptionService";

const LOGO_URL =
    "https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png";

type Libs = { html2canvas: any; jsPDF: any };

let libsPromise: Promise<Libs> | null = null;
let logoBase64Promise: Promise<string> | null = null;

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

function formatStatus(status: string | undefined): string {
    return status === "active" ? "نشط" : "غير نشط";
}

function getMonthlyEquivalent(price: string | number, cycle: string): number {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return 0;
    if (cycle === "weekly") return amount * 4;
    if (cycle === "quarterly") return amount / 3;
    if (cycle === "semi_annual") return amount / 6;
    if (cycle === "yearly") return amount / 12;

    return amount;
}

function formatDateSafe(value: string | null | undefined): string {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("ar-SA-u-nu-latn", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getUserData(): { name: string; email: string } {
    const userKeys = [
        "dierha_user",
        "user",
        "currentUser",
        "authUser",
        "dierhaUser",
        "userData",
    ];

    for (const storage of [localStorage, sessionStorage]) {
        for (const key of userKeys) {
            try {
                const raw = storage.getItem(key);
                if (!raw) continue;

                const parsed = JSON.parse(raw);
                const user = parsed?.user ?? parsed?.data?.user ?? parsed?.data ?? parsed;

                if (user && typeof user === "object") {
                    return {
                        name: user?.name ?? "مستخدم",
                        email: user?.email ?? "",
                    };
                }
            } catch {
                // Ignore unreadable storage values.
            }
        }
    }

    return { name: "مستخدم", email: "" };
}

function normalizeSubscriptions(value: unknown): BackendSubscription[] {
    if (Array.isArray(value)) return value as BackendSubscription[];

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;

        if (Array.isArray(record.data)) return record.data as BackendSubscription[];
        if (Array.isArray(record.subscriptions)) return record.subscriptions as BackendSubscription[];
        if (Array.isArray(record.items)) return record.items as BackendSubscription[];
    }

    return [];
}

async function resolveSubscriptions(
    subscriptions?: BackendSubscription[] | unknown,
): Promise<BackendSubscription[]> {
    const provided = normalizeSubscriptions(subscriptions);

    if (provided.length > 0 || Array.isArray(subscriptions)) {
        return provided;
    }

    const fetched = await getSubscriptions();
    return normalizeSubscriptions(fetched);
}

async function logoToBase64(): Promise<string> {
    if (!logoBase64Promise) {
        logoBase64Promise = (async () => {
            try {
                const response = await fetch(LOGO_URL, { cache: "force-cache" });
                const blob = await response.blob();

                return await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = () => resolve("");
                    reader.readAsDataURL(blob);
                });
            } catch {
                return "";
            }
        })();
    }

    return logoBase64Promise;
}

function loadScriptOnce(id: string, src: string): Promise<void> {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing?.dataset.loaded === "true") {
        return Promise.resolve();
    }

    if (existing) {
        return new Promise<void>((resolve, reject) => {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
                once: true,
            });
        });
    }

    return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = "true";
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

async function loadLibs(): Promise<Libs> {
    if (!libsPromise) {
        libsPromise = (async () => {
            if (!(window as any).html2canvas) {
                await loadScriptOnce(
                    "dierha-html2canvas",
                    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
                );
            }

            if (!(window as any).jspdf?.jsPDF) {
                await loadScriptOnce(
                    "dierha-jspdf",
                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
                );
            }

            return {
                html2canvas: (window as any).html2canvas,
                jsPDF: (window as any).jspdf.jsPDF,
            };
        })();
    }

    return libsPromise;
}

function buildTableRows(subscriptions: BackendSubscription[]): string {
    if (subscriptions.length === 0) {
        return `
            <tr>
                <td colspan="7" style="padding:22px 16px;border-bottom:1px solid #E5E9F1;font-size:12px;text-align:center;color:#667085;font-weight:700;">
                    لا توجد اشتراكات حتى الآن.
                </td>
            </tr>
        `;
    }

    return subscriptions
        .map((subscription, index) => {
            const rowBackground =
                index % 2 === 1 ? "background:#FAFBFC;" : "background:#FFFFFF;";

            const cellStyle =
                "padding:10px 6px;border-bottom:1px solid #E5E9F1;font-size:10px;line-height:1.6;color:#292B2E;vertical-align:middle;text-align:center;";

            const statusStyle =
                subscription.status === "active"
                    ? "background:#E8F5E9;color:#2E7D32;"
                    : "background:#FFF8E1;color:#F57F17;";

            return `
                <tr style="${rowBackground}">
                    <td style="${cellStyle};font-weight:800;word-break:break-word;text-align:right;">${escapeHtml(subscription.name)}</td>
                    <td style="${cellStyle}">${escapeHtml(subscription.category?.name ?? "أخرى")}</td>
                    <td style="${cellStyle};white-space:nowrap;font-weight:800;">${Number(subscription.price || 0).toFixed(2)} ريال</td>
                    <td style="${cellStyle};white-space:nowrap;">${formatBillingCycle(String(subscription.billingCycle))}</td>
                    <td style="${cellStyle};white-space:nowrap;">${formatDateSafe(subscription.startDate)}</td>
                    <td style="${cellStyle};white-space:nowrap;">${formatDateSafe(subscription.renewalDate)}</td>
                    <td style="${cellStyle};white-space:nowrap;text-align:center;">
                        <span style="display:inline-block;min-width:48px;padding:4px 7px;border-radius:999px;font-size:9px;font-weight:800;${statusStyle}">
                            ${formatStatus(subscription.status)}
                        </span>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function buildHTML(
    subscriptions: BackendSubscription[],
    name: string,
    email: string,
    logoBase64: string,
    monthlyTotal: number,
    yearlyTotal: number,
    totalSubscriptionsCount: number,
): string {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #FAFBFC; }
    body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
    table { border-collapse: collapse; table-layout: fixed; }
  </style>
</head>
<body>
  <div style="width:794px;min-height:1123px;background:#FAFBFC;font-family:Tahoma,Arial,sans-serif;direction:rtl;color:#292B2E;padding:34px 0;">
    <div style="width:700px;margin:0 auto;background:#FFFFFF;border:1px solid #D6DAE1;border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
      <div style="background:linear-gradient(135deg,#666CC0 0%,#6E87C0 45%,#F3B0B9 100%);padding:48px 40px 40px;text-align:center;color:white;">
        ${logoBase64 ? `<img src="${logoBase64}" style="width:220px;margin:0 auto 18px;border-radius:24px;padding:12px;display:block;background:transparent;box-shadow:0 12px 28px rgba(0,0,0,0.12);" />` : ""}
        <div style="font-size:34px;font-weight:900;color:white;text-align:center;">تقرير إدارة الاشتراكات</div>
      </div>

      <div style="padding:38px 44px;">
      <div style="background:linear-gradient(180deg,#FFFFFF 0%,#FAFBFC 100%);border:1px solid #D6DAE1;border-radius:24px;padding:22px 26px;margin-bottom:24px;line-height:2.1;box-shadow:0 6px 16px rgba(102,108,192,0.06);">
        <div style="font-size:13px;color:#292B2E;">الحساب: <strong>${escapeHtml(name)}</strong></div>
        <div style="font-size:13px;color:#292B2E;">البريد الإلكتروني: <strong>${escapeHtml(email || "غير متوفر")}</strong></div>
        <div style="font-size:13px;color:#292B2E;">تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA-u-nu-latn")}</strong></div>
      </div>

      <div style="display:flex;gap:12px;margin-bottom:24px;">
        <div style="flex:1;background:linear-gradient(180deg,#FFFFFF 0%,#FAFBFC 100%);border:1px solid #D6DAE1;border-radius:24px;padding:18px 10px;text-align:center;box-shadow:0 6px 16px rgba(102,108,192,0.06);">
          <div style="color:#6E87C0;font-size:11px;margin-bottom:7px;font-weight:800;">إجمالي الاشتراكات</div>
          <div style="color:#292B2E;font-size:22px;font-weight:900;">${totalSubscriptionsCount}</div>
        </div>
        <div style="flex:1;background:linear-gradient(180deg,#FFFFFF 0%,#FAFBFC 100%);border:1px solid #D6DAE1;border-radius:24px;padding:18px 10px;text-align:center;box-shadow:0 6px 16px rgba(102,108,192,0.06);">
          <div style="color:#6E87C0;font-size:11px;margin-bottom:7px;font-weight:800;">الإجمالي الشهري النشط</div>
          <div style="color:#292B2E;font-size:20px;font-weight:900;">${monthlyTotal.toFixed(2)} ريال</div>
        </div>
        <div style="flex:1;background:linear-gradient(180deg,#FFFFFF 0%,#FAFBFC 100%);border:1px solid #D6DAE1;border-radius:24px;padding:18px 10px;text-align:center;box-shadow:0 6px 16px rgba(102,108,192,0.06);">
          <div style="color:#6E87C0;font-size:11px;margin-bottom:7px;font-weight:800;">الإجمالي السنوي النشط</div>
          <div style="color:#292B2E;font-size:20px;font-weight:900;">${yearlyTotal.toFixed(2)} ريال</div>
        </div>
      </div>

      <div style="color:#020B5C;font-size:22px;font-weight:900;margin:0 0 14px;">جدول الاشتراكات</div>

      <table style="width:100%;background:white;border:1px solid #E5E9F1;border-radius:24px;overflow:hidden;">
        <thead>
          <tr>
            <th style="width:17%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">الخدمة</th>
            <th style="width:12%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">التصنيف</th>
            <th style="width:14%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">السعر</th>
            <th style="width:13%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">دورة الدفع</th>
            <th style="width:15%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">تاريخ البداية</th>
            <th style="width:15%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">تاريخ التجديد</th>
            <th style="width:14%;background:#6E87C0;color:white;padding:11px 6px;text-align:center;font-size:10px;font-weight:900;">الحالة</th>
          </tr>
        </thead>
        <tbody>${buildTableRows(subscriptions)}</tbody>
      </table>

      <div style="margin:30px -44px -38px;text-align:center;color:#63676E;font-size:14px;padding:24px;background:#E5E9F1;border-top:1px solid #D6DAE1;">ديرها | منصة إدارة الاشتراكات</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function waitForImages(documentRef: Document): Promise<void> {
    const images = Array.from(documentRef.querySelectorAll("img"));

    if (images.length === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 50));
        return;
    }

    await Promise.all(
        images.map(
            (image) =>
                new Promise<void>((resolve) => {
                    if (image.complete) {
                        resolve();
                        return;
                    }

                    image.onload = () => resolve();
                    image.onerror = () => resolve();
                }),
        ),
    );

    await new Promise((resolve) => window.setTimeout(resolve, 50));
}

export async function generatePdfClient(
    subscriptions?: BackendSubscription[] | unknown,
    userName?: string,
    userEmail?: string,
): Promise<void> {
    const safe = await resolveSubscriptions(subscriptions);
    const user = getUserData();
    const name = userName && userName !== "undefined" ? userName : user.name;
    const email = userEmail && userEmail !== "undefined" ? userEmail : user.email;

    const visibleSubscriptions = safe.filter(
        (subscription) => !subscription.deletedAt,
    );

    const activeSubscriptions = visibleSubscriptions.filter(
        (subscription) => subscription.status === "active",
    );

    const totalSubscriptionsCount = safe.length;

    const monthlyTotal = activeSubscriptions.reduce(
        (sum, subscription) =>
            sum + getMonthlyEquivalent(subscription.price, String(subscription.billingCycle)),
        0,
    );

    const yearlyTotal = monthlyTotal * 12;

    const [{ html2canvas, jsPDF }, logoBase64] = await Promise.all([
        loadLibs(),
        logoToBase64(),
    ]);

    const html = buildHTML(
        visibleSubscriptions,
        name,
        email,
        logoBase64,
        monthlyTotal,
        yearlyTotal,
        totalSubscriptionsCount,
    );

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
        "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:none;opacity:0;pointer-events:none;z-index:-1;";
    document.body.appendChild(iframe);

    try {
        const iframeDocument = iframe.contentDocument;

        if (!iframeDocument) {
            throw new Error("تعذر تجهيز ملف PDF.");
        }

        iframeDocument.open();
        iframeDocument.write(html);
        iframeDocument.close();

        await waitForImages(iframeDocument);

        const target = iframeDocument.body.firstElementChild as HTMLElement | null;

        if (!target) {
            throw new Error("تعذر إنشاء محتوى PDF.");
        }

        const totalHeight = Math.max(target.scrollHeight, 1123);
        iframe.style.height = `${totalHeight}px`;

        const canvas = await html2canvas(target, {
            scale: 1.45,
            useCORS: true,
            backgroundColor: "#FAFBFC",
            logging: false,
            width: 794,
            height: totalHeight,
            windowWidth: 794,
            windowHeight: totalHeight,
        });

        const pdfWidth = 210;
        const pageHeight = 297;
        const pdfImageHeight = (canvas.height * pdfWidth) / canvas.width;
        const imageData = canvas.toDataURL("image/jpeg", 0.92);

        const documentPdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
        });

        let yPosition = 0;
        let isFirstPage = true;

        while (yPosition < pdfImageHeight) {
            if (!isFirstPage) {
                documentPdf.addPage();
            }

            isFirstPage = false;
            documentPdf.addImage(imageData, "JPEG", 0, -yPosition, pdfWidth, pdfImageHeight);
            yPosition += pageHeight;
        }

        documentPdf.save(`dierha-subscriptions-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
        document.body.removeChild(iframe);
    }
}
