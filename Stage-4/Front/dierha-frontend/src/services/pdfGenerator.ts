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
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
    });
    await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
        s.onload = () => res();
        s.onerror = rej;
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
    } catch {
        return null;
    }
}

export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName: string,
    userEmail: string,
): Promise<void> {
    const safe = Array.isArray(subscriptions) ? subscriptions : [];
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
    doc.rect(0, 0, W * 0.45, 60, "F");
    doc.setFillColor(110, 135, 192); 
    doc.rect(W * 0.45, 0, W * 0.30, 60, "F");
    doc.setFillColor(243, 176, 185); 
    doc.rect(W * 0.75, 0, W * 0.25, 60, "F");

    if (logoBase64) {
        doc.addImage(logoBase64, "PNG", W / 2 - 18, 6, 36, 26);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Dierha", W / 2, logoBase64 ? 40 : 22, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Subscription Management Report", W / 2, logoBase64 ? 48 : 30, { align: "center" });

    let y = 68;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(214, 218, 225);
    doc.roundedRect(14, y, W - 28, 24, 4, 4, "FD");
    doc.setTextColor(41, 43, 46);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Account: ${userName}`, 20, y + 8);
    doc.text(`Email: ${userEmail}`, 20, y + 15);
    doc.text(`Date: ${new Date().toLocaleDateString("en-CA")}`, W - 20, y + 8, { align: "right" });

    y += 30;
    const cW = (W - 28 - 8) / 3;
    const cards = [
        { label: "Total Subscriptions", value: String(safe.length) },
        { label: "Monthly Total (Active)", value: `${monthlyTotal.toFixed(2)} SAR` },
        { label: "Yearly Total (Active)", value: `${yearlyTotal.toFixed(2)} SAR` },
    ];
    cards.forEach((card, i) => {
        const cx = 14 + i * (cW + 4);
        doc.setFillColor(250, 251, 252);
        doc.setDrawColor(214, 218, 225);
        doc.roundedRect(cx, y, cW, 22, 4, 4, "FD");
        doc.setFontSize(8);
        doc.setTextColor(110, 135, 192);
        doc.text(card.label, cx + cW / 2, y + 8, { align: "center" });
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 43, 46);
        doc.text(card.value, cx + cW / 2, y + 17, { align: "center" });
        doc.setFont("helvetica", "normal");
    });

    y += 28;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 108, 192);
    doc.text("Subscriptions Table", 14, y);

    y += 4;
    const tableBody = safe.map((s) => [
        s.name,
        s.category?.name ?? "Other",
        `${Number(s.price).toFixed(2)} SAR`,
        formatBillingCycle(s.billingCycle),
        formatDateSafe(s.startDate),
        formatDateSafe(s.renewalDate),
        formatStatus(s.status ?? "active", s.deletedAt ?? null),
    ]);

    (doc as any).autoTable({
        startY: y,
        head: [["Service", "Category", "Price", "Billing", "Start Date", "Renewal", "Status"]],
        body: tableBody,
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
            textColor: [41, 43, 46],
        },
        headStyles: {
            fillColor: [102, 108, 192],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [250, 251, 252],
        },
        didParseCell: (data: any) => {
            if (data.section === "body") {
                const row = data.row.raw as string[];
                if (row[6] === "محذوف" || row[6] === "Deleted") {
                    data.cell.styles.textColor = [180, 180, 180];
                    data.cell.styles.fillColor = [255, 245, 245];
                }
            }
        },
        didDrawCell: (data: any) => {
            if (data.section === "body" && data.column.index === 6) {
                const status = (data.row.raw as string[])[6];
                const x = data.cell.x + 1.5;
                const y2 = data.cell.y + 1.5;
                const w = data.cell.width - 3;
                const h = data.cell.height - 3;
                if (status === "نشط") {
                    doc.setFillColor(232, 245, 233);
                    doc.setTextColor(46, 125, 50);
                } else if (status === "غير نشط") {
                    doc.setFillColor(255, 248, 225);
                    doc.setTextColor(245, 127, 23);
                } else {
                    doc.setFillColor(255, 235, 238);
                    doc.setTextColor(198, 40, 40);
                }
                doc.roundedRect(x, y2, w, h, 2, 2, "F");
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text(status, x + w / 2, y2 + h / 2 + 1, { align: "center" });
                doc.setFont("helvetica", "normal");
                doc.setTextColor(41, 43, 46);
            }
        },
        margin: { left: 14, right: 14 },
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Dierha | Subscription Management Platform", W / 2, H - 8, { align: "center" });

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`dierha-subscriptions-${date}.pdf`);
}
