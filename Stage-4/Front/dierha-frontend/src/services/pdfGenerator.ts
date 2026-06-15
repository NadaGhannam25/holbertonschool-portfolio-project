import type { BackendSubscription } from "./subscriptionService";

// ─── Helpers ────────────────────────────────────────────────────────────────
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
    return new Date(val).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
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

// ─── Canvas PDF ─────────────────────────────────────────────────────────────
const PAGE_W = 794;   // A4 @ 96dpi
const PAGE_H = 1123;
const MARGIN = 44;
const COL_W = PAGE_W - MARGIN * 2;

const C = {
    blue:       "#1D47DA",
    navy:       "#020B5C",
    pink:       "#F56F96",
    lightBlue:  "#8EC2F5",
    white:      "#FFFFFF",
    bg:         "#F6F8FF",
    border:     "#E7ECF6",
    grey:       "#667085",
    dark:       "#1F2940",
    green:      "#25A96A",
    softBlue:   "#F2F6FF",
};

function makeCanvas(): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width  = PAGE_W;
    c.height = PAGE_H;
    return c;
}

function initCtx(ctx: CanvasRenderingContext2D) {
    ctx.textBaseline = "top";
    ctx.textAlign    = "right";
    ctx.direction    = "rtl";
}

// رسم gradient header
function drawHeader(ctx: CanvasRenderingContext2D, userName: string, userEmail: string) {
    const grad = ctx.createLinearGradient(0, 0, PAGE_W, 160);
    grad.addColorStop(0,   "#666CC0");
    grad.addColorStop(0.5, "#6E87C0");
    grad.addColorStop(1,   "#F3B0B9");
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, PAGE_W, 160, 0);
    ctx.fill();

    // عنوان
    ctx.fillStyle = C.white;
    ctx.font = "bold 32px Tahoma, Arial";
    ctx.textAlign = "center";
    ctx.fillText("ديرها", PAGE_W / 2, 42);

    ctx.font = "16px Tahoma, Arial";
    ctx.fillText("تقرير إدارة الاشتراكات", PAGE_W / 2, 84);

    // معلومات المستخدم
    ctx.font = "13px Tahoma, Arial";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(`${userName}  |  ${userEmail}  |  ${new Date().toLocaleDateString("ar-SA")}`, PAGE_W / 2, 116);

    ctx.textAlign = "right";
}

// مربع مستدير الحواف
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// رسم بطاقة ملخص (3 بطاقات)
function drawSummaryCards(
    ctx: CanvasRenderingContext2D,
    total: number,
    monthly: number,
    yearly: number,
    y: number
): number {
    const cardW = (COL_W - 24) / 3;
    const cardH = 82;
    const cards = [
        { label: "إجمالي الاشتراكات", value: String(total) },
        { label: "الإجمالي الشهري (النشطة)", value: `${monthly.toFixed(2)} ريال` },
        { label: "الإجمالي السنوي (النشطة)", value: `${yearly.toFixed(2)} ريال` },
    ];

    cards.forEach((card, i) => {
        const x = MARGIN + i * (cardW + 12);
        // shadow
        ctx.shadowColor = "rgba(2,11,92,0.08)";
        ctx.shadowBlur  = 14;
        ctx.fillStyle   = C.white;
        roundRect(ctx, x, y, cardW, cardH, 16);
        ctx.fill();
        ctx.shadowBlur  = 0;

        // border
        ctx.strokeStyle = C.border;
        ctx.lineWidth   = 1;
        roundRect(ctx, x, y, cardW, cardH, 16);
        ctx.stroke();

        // label
        ctx.fillStyle  = C.blue;
        ctx.font       = "bold 11px Tahoma, Arial";
        ctx.textAlign  = "center";
        ctx.fillText(card.label, x + cardW / 2, y + 14);

        // value
        ctx.fillStyle  = C.dark;
        ctx.font       = "bold 20px Tahoma, Arial";
        ctx.fillText(card.value, x + cardW / 2, y + 36);

        ctx.textAlign  = "right";
    });

    return y + cardH + 20;
}

// رسم رأس الجدول
function drawTableHeader(ctx: CanvasRenderingContext2D, y: number): number {
    const cols = getColDefs();
    const headerH = 38;

    const grad = ctx.createLinearGradient(MARGIN, y, MARGIN, y + headerH);
    grad.addColorStop(0, "#1D47DA");
    grad.addColorStop(1, "#315BE6");
    ctx.fillStyle = grad;
    roundRect(ctx, MARGIN, y, COL_W, headerH, 10);
    ctx.fill();

    ctx.fillStyle = C.white;
    ctx.font      = "bold 12px Tahoma, Arial";
    cols.forEach(col => {
        ctx.fillText(col.label, col.x, y + 13);
    });

    return y + headerH;
}

// تعريف الأعمدة
function getColDefs() {
    const x0 = PAGE_W - MARGIN; // RTL: نبدأ من اليمين
    return [
        { label: "الخدمة",        x: x0 - 0,   width: 130 },
        { label: "التصنيف",       x: x0 - 135, width: 90  },
        { label: "السعر",         x: x0 - 230, width: 90  },
        { label: "دورة الدفع",    x: x0 - 325, width: 100 },
        { label: "التجديد",       x: x0 - 430, width: 120 },
        { label: "الحالة",        x: x0 - 555, width: 80  },
    ];
}

// رسم صف
function drawRow(
    ctx: CanvasRenderingContext2D,
    sub: BackendSubscription,
    y: number,
    even: boolean
): number {
    const rowH = 42;
    const cols = getColDefs();

    // خلفية الصف
    ctx.fillStyle = even ? C.softBlue : C.white;
    ctx.fillRect(MARGIN, y, COL_W, rowH);

    // خط فاصل
    ctx.strokeStyle = C.border;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y + rowH);
    ctx.lineTo(MARGIN + COL_W, y + rowH);
    ctx.stroke();

    const isDeleted  = false;
    const isInactive = sub.status === "inactive";
    ctx.globalAlpha  = isDeleted || isInactive ? 0.65 : 1;

    ctx.font      = "13px Tahoma, Arial";
    ctx.fillStyle = C.dark;
    ctx.textAlign = "right";

    const values = [
        sub.name,
        sub.category?.name ?? "أخرى",
        `${Number(sub.price).toFixed(2)} ريال`,
        formatBillingCycle(sub.billingCycle),
        formatDate(sub.renewalDate),
        sub.status === "active" ? "نشط" : "غير نشط",
    ];

    cols.forEach((col, i) => {
        const text = values[i];
        // للحالة نرسم badge
        if (i === 5) {
            const badgeW = 60;
            const badgeH = 22;
            const badgeX = col.x - badgeW;
            const badgeY = y + (rowH - badgeH) / 2;

            if (sub.status === "active") {
                ctx.fillStyle = "rgba(37,169,106,0.12)";
                roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 11);
                ctx.fill();
                ctx.fillStyle = "#25A96A";
            } else {
                ctx.fillStyle = "rgba(102,112,133,0.1)";
                roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 11);
                ctx.fill();
                ctx.fillStyle = C.grey;
            }
            ctx.font = "bold 11px Tahoma, Arial";
            ctx.textAlign = "center";
            ctx.fillText(text, badgeX + badgeW / 2, badgeY + 5);
            ctx.textAlign = "right";
            ctx.font = "13px Tahoma, Arial";
        } else {
            // اقتطاع النص الطويل
            const maxW = col.width - 8;
            let t = text;
            while (ctx.measureText(t).width > maxW && t.length > 1) {
                t = t.slice(0, -1);
            }
            if (t !== text) t += "…";
            ctx.fillStyle = i === 0 ? C.navy : C.grey;
            if (i === 0) ctx.font = "bold 13px Tahoma, Arial";
            ctx.fillText(t, col.x, y + 14);
            ctx.font = "13px Tahoma, Arial";
        }
    });

    ctx.globalAlpha = 1;
    return y + rowH;
}

// رسم footer
function drawFooter(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = C.grey;
    ctx.font      = "12px Tahoma, Arial";
    ctx.textAlign = "center";
    ctx.fillText("ديرها | منصة إدارة الاشتراكات", PAGE_W / 2, PAGE_H - 28);
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName: string,
    userEmail: string
): Promise<void> {
    // حساب الإحصاءات
    const activeOnes = subscriptions.filter(s => s.status === "active");
    const monthlyTotal = activeOnes.reduce(
        (sum, s) => sum + getMonthlyEquivalent(s.price, s.billingCycle),
        0
    );
    const yearlyTotal = monthlyTotal * 12;

    // نحسب عدد الصفحات المطلوبة
    const ROW_H        = 42;
    const HEADER_H     = 160;
    const CARDS_H      = 82 + 20;
    const TITLE_H      = 40;
    const TABLE_HEAD_H = 38;
    const FOOTER_H     = 40;

    const firstPageRows = Math.floor(
        (PAGE_H - HEADER_H - CARDS_H - TITLE_H - TABLE_HEAD_H - FOOTER_H - 20) / ROW_H
    );
    const extraPageRows = Math.floor(
        (PAGE_H - TABLE_HEAD_H - FOOTER_H - 40) / ROW_H
    );

    const totalPages = subscriptions.length <= firstPageRows
        ? 1
        : 1 + Math.ceil((subscriptions.length - firstPageRows) / extraPageRows);

    const canvases: HTMLCanvasElement[] = [];

    for (let p = 0; p < totalPages; p++) {
        const canvas = makeCanvas();
        const ctx = canvas.getContext("2d")!;
        initCtx(ctx);

        // خلفية
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, PAGE_W, PAGE_H);

        let y: number;

        if (p === 0) {
            // الصفحة الأولى: header + cards + جدول
            drawHeader(ctx, userName, userEmail);
            y = HEADER_H + 16;
            y = drawSummaryCards(ctx, subscriptions.length, monthlyTotal, yearlyTotal, y);

            // عنوان الجدول
            ctx.fillStyle = C.blue;
            ctx.font      = "bold 18px Tahoma, Arial";
            ctx.textAlign = "right";
            ctx.fillText("جدول الاشتراكات", PAGE_W - MARGIN, y);
            y += TITLE_H;

            y = drawTableHeader(ctx, y);

            const slice = subscriptions.slice(0, firstPageRows);
            slice.forEach((sub, i) => {
                y = drawRow(ctx, sub, y, i % 2 === 0);
            });
        } else {
            // الصفحات التالية
            const startIdx = firstPageRows + (p - 1) * extraPageRows;
            const slice    = subscriptions.slice(startIdx, startIdx + extraPageRows);

            ctx.fillStyle = C.blue;
            ctx.font      = "bold 14px Tahoma, Arial";
            ctx.textAlign = "right";
            ctx.fillText(`تابع — جدول الاشتراكات (صفحة ${p + 1})`, PAGE_W - MARGIN, 20);

            y = drawTableHeader(ctx, 50);
            slice.forEach((sub, i) => {
                y = drawRow(ctx, sub, y, i % 2 === 0);
            });
        }

        // border للجدول
        ctx.strokeStyle = C.border;
        ctx.lineWidth   = 1;
        const tableTop    = p === 0
            ? HEADER_H + 16 + CARDS_H + TITLE_H
            : 50;
        const tableBottom = y;
        ctx.strokeRect(MARGIN, tableTop, COL_W, tableBottom - tableTop);

        drawFooter(ctx);
        canvases.push(canvas);
    }

    // تحويل كل canvas لـ image وتجميعهم في PDF عبر جمع صور في صفحة واحدة طويلة
    // نستخدم الـ canvas مباشرة → blob → download
    if (canvases.length === 1) {
        // صفحة واحدة: مباشرة
        canvases[0].toBlob(blob => {
            if (!blob) return;
            triggerDownload(blob, "png");
        }, "image/png");
        return;
    }

    // صفحات متعددة: نجمعهم في canvas طولي وننزل كصورة طويلة
    // أو نحوّل كل صفحة لـ data URL ونفتح نافذة طباعة
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        // fallback: نزّل الصفحة الأولى
        canvases[0].toBlob(blob => {
            if (!blob) return;
            triggerDownload(blob, "png");
        }, "image/png");
        return;
    }

    const images = canvases.map(c => c.toDataURL("image/png"));
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
        <meta charset="UTF-8">
        <title>تقرير ديرها</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; }
            img { display: block; width: 100%; page-break-after: always; }
            img:last-child { page-break-after: auto; }
            @media print {
                @page { size: A4; margin: 0; }
                img { width: 100%; height: auto; }
            }
        </style>
        </head>
        <body>
        ${images.map(src => `<img src="${src}" />`).join("")}
        <script>
            window.onload = function() {
                setTimeout(function() { window.print(); }, 400);
            };
        </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function triggerDownload(blob: Blob, ext: string) {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `dierha-${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}
