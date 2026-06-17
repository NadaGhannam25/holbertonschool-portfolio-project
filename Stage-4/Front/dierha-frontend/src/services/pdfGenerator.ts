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

async function loadJsPDF(): Promise<any> {
    if ((window as any).jspdf?.jsPDF) return (window as any).jspdf.jsPDF;
    await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload = () => res(); s.onerror = rej;
        document.head.appendChild(s);
    });
    await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
        s.onload = () => res(); s.onerror = rej;
        document.head.appendChild(s);
    });
    return (window as any).jspdf.jsPDF;
}

async function toBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch { return null; }
}

function getUserData(): { name: string; email: string } {
    try {
        const raw = localStorage.getItem("dierha_user");
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                name: parsed?.name ?? parsed?.userName ?? "مستخدم",
                email: parsed?.email ?? parsed?.userEmail ?? "",
            };
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
    const name = (userName && userName !== "undefined") ? userName : user.name;
    const email = (userEmail && userEmail !== "undefined") ? userEmail : user.email;

    const active = safe.filter((s) => s.status === "active" && !s.deletedAt);
    const monthlyTotal = active.reduce(
        (sum, s) => sum + getMonthlyEquivalent(String(s.price), s.billingCycle), 0
    );
    const yearlyTotal = monthlyTotal * 12;

    const [jsPDF, logoBase64] = await Promise.all([
        loadJsPDF(),
        toBase64(LOGO_URL),
    ]);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    doc.setFillColor(102, 108, 192);
    doc.rect(0, 0, W, 70, "F");
    const steps = 30;
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const r = Math.round(102 + (243 - 102) * t);
        const g = Math.round(108 + (176 - 108) * t);
        const b = Math.round(192 + (185 - 192) * t);
        doc.setFillColor(r, g, b);
        doc.rect(W * (i / steps), 0, W / steps + 0.5, 70, "F");
    }

    
    if (logoBase64) {
        const logoW = 42;
        const logoH = 30;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(W / 2 - logoW / 2 - 4, 6, logoW + 8, logoH + 8, 6, 6, "F");
        doc.addImage(logoBase64, "PNG", W / 2 - logoW / 2, 10, logoW, logoH);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("\u062F\u064A\u0631\u0647\u0627", W / 2, logoBase64 ? 54 : 28, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("\u062A\u0642\u0631\u064A\u0631 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A", W / 2, logoBase64 ? 62 : 38, { align: "center" });

    let y = 78;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(214, 218, 225);
    doc.roundedRect(14, y, W - 28, 26, 4, 4, "FD");
    doc.setTextColor(41, 43, 46);
    doc.setFontSize(10);
    doc.text(`\u0627\u0644\u062D\u0633\u0627\u0628: ${name}`, W - 20, y + 9, { align: "right" });
    doc.text(`\u0627\u0644\u0628\u0631\u064A\u062F: ${email}`, W - 20, y + 17, { align: "right" });
    doc.text(`\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u062F\u0627\u0631: ${new Date().toLocaleDateString("ar-SA")}`, 20, y + 9);

    y += 32;
    const cW = (W - 28 - 8) / 3;
    const cardData = [
        { label: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A", value: String(safe.length) },
        { label: "\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0634\u0647\u0631\u064A (\u0627\u0644\u0646\u0634\u0637\u0629)", value: `${monthlyTotal.toFixed(2)} \u0631\u064A\u0627\u0644` },
        { label: "\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0633\u0646\u0648\u064A (\u0627\u0644\u0646\u0634\u0637\u0629)", value: `${yearlyTotal.toFixed(2)} \u0631\u064A\u0627\u0644` },
    ];
    cardData.forEach((card, i) => {
        const cx = 14 + i * (cW + 4);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(214, 218, 225);
        doc.roundedRect(cx, y, cW, 22, 4, 4, "FD");
        doc.setFontSize(8);
        doc.setTextColor(110, 135, 192);
        doc.text(card.label, cx + cW / 2, y + 7, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 43, 46);
        doc.text(card.value, cx + cW / 2, y + 16, { align: "center" });
        doc.setFont("helvetica", "normal");
    });

    y += 28;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 108, 192);
    doc.text("\u062C\u062F\u0648\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A", W - 14, y, { align: "right" });

    y += 5;
    const tableBody = safe.map((s) => [
        s.name,
        s.category?.name ?? "\u0623\u062E\u0631\u0649",
        `${Number(s.price).toFixed(2)} \u0631\u064A\u0627\u0644`,
        formatBillingCycle(s.billingCycle),
        formatDateSafe(s.startDate),
        formatDateSafe(s.renewalDate),
        formatStatus(s.status ?? "active", s.deletedAt ?? null),
    ]);

    (doc as any).autoTable({
        startY: y,
        head: [[
            "\u0627\u0644\u062E\u062F\u0645\u0629",
            "\u0627\u0644\u062A\u0635\u0646\u064A\u0641",
            "\u0627\u0644\u0633\u0639\u0631",
            "\u062F\u0648\u0631\u0629 \u0627\u0644\u062F\u0641\u0639",
            "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629",
            "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u062C\u062F\u064A\u062F",
            "\u0627\u0644\u062D\u0627\u0644\u0629",
        ]],
        body: tableBody,
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: [41, 43, 46] },
        headStyles: { fillColor: [102, 108, 192], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        didParseCell: (data: any) => {
            if (data.section === "body") {
                const row = data.row.raw as string[];
                if (row[6] === "\u0645\u062D\u0630\u0648\u0641") {
                    data.cell.styles.textColor = [180, 180, 180];
                    data.cell.styles.fillColor = [255, 245, 245];
                }
            }
        },
        didDrawCell: (data: any) => {
            if (data.section === "body" && data.column.index === 6) {
                const status = (data.row.raw as string[])[6];
                const x = data.cell.x + 1.5, y2 = data.cell.y + 1.5;
                const w = data.cell.width - 3, h = data.cell.height - 3;
                if (status === "\u0646\u0634\u0637") {
                    doc.setFillColor(232, 245, 233); doc.setTextColor(46, 125, 50);
                } else if (status === "\u063A\u064A\u0631 \u0646\u0634\u0637") {
                    doc.setFillColor(255, 248, 225); doc.setTextColor(245, 127, 23);
                } else {
                    doc.setFillColor(255, 235, 238); doc.setTextColor(198, 40, 40);
                }
                doc.roundedRect(x, y2, w, h, 2, 2, "F");
                doc.setFontSize(8); doc.setFont("helvetica", "bold");
                doc.text(status, x + w / 2, y2 + h / 2 + 1, { align: "center" });
                doc.setFont("helvetica", "normal"); doc.setTextColor(41, 43, 46);
            }
        },
        margin: { left: 14, right: 14 },
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("\u062F\u064A\u0631\u0647\u0627 | \u0645\u0646\u0635\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A", W / 2, H - 8, { align: "center" });

    // ── تنزيل مباشر ──────────────────────────────────────────────────────────
    doc.save(`dierha-subscriptions-${new Date().toISOString().slice(0, 10)}.pdf`);
}
