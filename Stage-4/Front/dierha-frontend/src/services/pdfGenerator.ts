const API_BASE_URL = "https://dierha-backend.onrender.com";

export async function generatePdfClient(): Promise<void> {
    const token = localStorage.getItem("dierha_token");
    if (!token) throw new Error("يرجى تسجيل الدخول أولاً");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 70_000);

    try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/export/pdf`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let msg = "تعذر تصدير ملف PDF";
            try {
                const err = await response.json();
                msg = err.message || err.error || msg;
            } catch { /* ignore */ }
            throw new Error(msg);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dierha-subscriptions-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("انتهت مهلة الطلب، يرجى المحاولة مجدداً");
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}
