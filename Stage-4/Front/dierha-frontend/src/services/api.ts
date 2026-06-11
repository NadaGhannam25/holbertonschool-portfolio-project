const API_BASE_URL = "https://dierha-backend.onrender.com";

type RequestOptions = RequestInit;

const API_TIMEOUT_MS = 5000;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem("dierha_token");
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMessage = "حدث خطأ غير متوقع";

      try {
        const errorData = await response.json();

        errorMessage =
          errorData.message ||
          errorData.error ||
          errorMessage;
      } catch {
        // Keep default error message
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("تعذر الاتصال حاليًا. حاولي مرة أخرى.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
