import type { BackendSubscription } from "./subscriptionService";

function formatBillingCycle(cycle: string): string {
    const map: Record<string, string> = {
        weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly",
        semi_annual: "Semi-Annual", yearly: "Yearly",
    };
    return map[cycle] ?? cycle;
}

function formatDateShort(val: string | null | undefined): string {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthlyEquivalent(price: string, cycle: string): number {
    const n = Number(price);
    if (cycle === "weekly") return n * 4;
    if (cycle === "quarterly") return n / 3;
    if (cycle === "semi_annual") return n / 6;
    if (cycle === "yearly") return n / 12;
    return n;
}

async function loadJsPDF(): Promise<{ jsPDF: any; autoTable: any }> {
    return new Promise((resolve, reject) => {
        if ((window as any).jspdf?.jsPDF) {
            resolve({ jsPDF: (window as any).jspdf.jsPDF, autoTable: null });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => {
            const script2 = document.createElement("script");
            script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
            script2.onload = () => {
                resolve({ jsPDF: (window as any).jspdf.jsPDF, autoTable: null });
            };
            script2.onerror = reject;
            document.head.appendChild(script2);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function generatePdfClient(
    subscriptions: BackendSubscription[],
    userName: string,
    userEmail: string,
): Promise<void> {
    const safe = Array.isArray(subscriptions) ? subscriptions : [];
    const active = safe.filter((s) => s.status === "active");
    const monthlyTotal = active.reduce(
        (sum, s) => sum + getMonthlyEquivalent(String(s.price), s.billingCycle), 0
    );
    const yearlyTotal = monthlyTotal * 12;

    const { jsPDF } = await loadJsPDF();

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(102, 108, 192);
    doc.rect(0, 0, pageW, 36, "F");
    doc.setFillColor(243, 176, 185);
    doc.rect(pageW * 0.65, 0, pageW * 0.35, 36, "F");
    doc.setFillColor(110, 135, 192);
    doc.rect(pageW * 0.35, 0, pageW * 0.30, 36, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Dierha - Subscription Report", pageW / 2, 14, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${userName}  |  ${userEmail}  |  ${formatDateShort(new Date().toISOString())}`, pageW / 2, 24, { align: "center" });

    const cardY = 42;
    const cardW = 82;
    const gap = 8;
    const startX = (pageW - (3 * cardW + 2 * gap)) / 2;

    const cards = [
        { label: "Total Subscriptions", value: String(safe.length) },
        { label: "Monthly Total (Active)", value: `${monthlyTotal.toFixed(2)} SAR` },
        { label: "Yearly Total (Active)", value: `${yearlyTotal.toFixed(2)} SAR` },
    ];

    cards.forEach((card, i) => {
        const x = startX + i * (cardW + gap);
        doc.setFillColor(245, 247, 255);
        doc.setDrawColor(214, 218, 225);
        doc.roundedRect(x, cardY, cardW, 18, 3, 3, "FD");
        doc.setFontSize(8);
        doc.setTextColor(102, 108, 192);
        doc.text(card.label, x + cardW / 2, cardY + 6, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(31, 41, 64);
        doc.text(card.value, x + cardW / 2, cardY + 13, { align: "center" });
        doc.setFont("helvetica", "normal");
    });

    const tableBody = safe.map((s) => [
        s.name,
        s.category?.name ?? "Other",
        `${Number(s.price).toFixed(2)} SAR`,
        formatBillingCycle(s.billingCycle),
        formatDateShort(s.startDate),
        formatDateShort(s.renewalDate),
        s.status === "active" ? "Active" : "Inactive",
    ]);

    (doc as any).autoTable({
        startY: cardY + 24,
        head: [["Service", "Category", "Price", "Billing", "Start Date", "Renewal Date", "Status"]],
        body: tableBody,
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3.5 },
        headStyles: {
            fillColor: [102, 108, 192],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [242, 246, 255] },
        columnStyles: {
            6: {
                cellWidth: 22,
                halign: "center",
            },
        },
        didDrawCell: (data: any) => {
            if (data.section === "body" && data.column.index === 6) {
                const status = data.row.raw[6];
                const x = data.cell.x + 2;
                const y = data.cell.y + 2;
                const w = data.cell.width - 4;
                const h = data.cell.height - 4;
                if (status === "Active") {
                    doc.setFillColor(232, 245, 233);
                    doc.setTextColor(46, 125, 50);
                } else {
                    doc.setFillColor(255, 248, 225);
                    doc.setTextColor(245, 127, 23);
                }
                doc.roundedRect(x, y, w, h, 2, 2, "F");
                doc.setFontSize(8);
                doc.text(status, x + w / 2, y + h / 2 + 1, { align: "center" });
                doc.setTextColor(31, 41, 64);
            }
        },
        margin: { left: 8, right: 8 },
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Dierha | Subscription Management Platform", pageW / 2, pageH - 5, { align: "center" });

    // ── Download ──
    doc.save(`dierha-subscriptions-${formatDateShort(new Date().toISOString())}.pdf`);
}
