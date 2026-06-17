const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://dierha-backend.onrender.com/api";

const NORMALIZED_API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

const API_BASE_URL = NORMALIZED_API_BASE_URL.endsWith("/api")
  ? NORMALIZED_API_BASE_URL
  : `${NORMALIZED_API_BASE_URL}/api`;

function getAuthToken() {
  const directKeys = [
    "dierha_token",
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "jwtToken",
    "access_token",
  ];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of directKeys) {
      const value = storage.getItem(key);

      if (value) {
        return value.replace(/^Bearer\s+/i, "");
      }
    }
  }

  const objectKeys = [
    "user",
    "currentUser",
    "auth",
    "authUser",
    "dierhaUser",
    "userData",
  ];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of objectKeys) {
      const value = storage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        const token =
          parsed?.token ||
          parsed?.accessToken ||
          parsed?.authToken ||
          parsed?.access_token ||
          parsed?.jwt ||
          parsed?.jwtToken ||
          parsed?.data?.token ||
          parsed?.data?.accessToken ||
          parsed?.data?.authToken ||
          parsed?.data?.access_token ||
          parsed?.user?.token ||
          parsed?.user?.accessToken ||
          parsed?.user?.authToken ||
          parsed?.user?.access_token;

        if (token) {
          return String(token).replace(/^Bearer\s+/i, "");
        }
      } catch {
        // Ignore invalid JSON values.
      }
    }
  }

  return null;
}

export async function generatePdfClient(): Promise<void> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("يرجى تسجيل الدخول أولاً");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 70_000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/subscriptions/export/pdf`,
      {
        method: "GET",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let msg = "تعذر تصدير ملف PDF";

      try {
        const err = await response.json();
        msg = err?.message || err?.error || msg;
      } catch {
        try {
          const text = await response.text();
          msg = text || msg;
        } catch {
          // Ignore unreadable response body.
        }
      }

      throw new Error(msg);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `dierha-subscriptions-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

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
