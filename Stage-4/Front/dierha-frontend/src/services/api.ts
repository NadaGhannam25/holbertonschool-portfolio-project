const API_BASE_URL = "https://dierha-backend.onrender.com";

type RequestOptions = RequestInit;

const COLD_START_TIMEOUT_MS = 70_000;
const NORMAL_TIMEOUT_MS = 15_000;

let serverIsAwake = false;

function getTimeout(): number {
    return serverIsAwake ? NORMAL_TIMEOUT_MS : COLD_START_TIMEOUT_MS;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const token = localStorage.getItem("dierha_token");
    const controller = new AbortController();
    const timeout = getTimeout();
    const timeoutId = window.setTimeout(() => controller.abort(), timeout);

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
            }
            throw new Error(errorMessage);
        }

        serverIsAwake = true;

        return response.json();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("");
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}
