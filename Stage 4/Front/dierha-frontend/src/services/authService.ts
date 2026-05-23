const API_BASE_URL = "http://localhost:4000";

type AuthUser = {
    id?: number;
    name?: string;
    email: string;
};

type AuthResponse = {
    message?: string;
    token?: string;
    accessToken?: string;
    access_token?: string;
    user?: AuthUser;
};

function getAuthToken(data: AuthResponse) {
    return data.accessToken || data.token || data.access_token || "";
}

function saveAuthData(data: AuthResponse, fallbackEmail: string) {
    const token = getAuthToken(data);

    if (token) {
        localStorage.setItem("dierha_token", token);
    }

    const user = data.user || {
        name: "Dierha User",
        email: fallbackEmail,
    };

    localStorage.setItem("dierha_user", JSON.stringify(user));
}

async function getErrorMessage(response: Response) {
    try {
        const data = await response.json();

        if (response.status === 409) {
            return "هذا البريد الإلكتروني موجود بالفعل";
        }

        if (response.status === 401) {
            return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        }

        if (Array.isArray(data.message)) {
            return data.message[0] || "حدث خطأ أثناء تنفيذ العملية";
        }

        if (typeof data.message === "string") {
            return data.message;
        }

        return "حدث خطأ أثناء تنفيذ العملية";
    } catch {
        return "حدث خطأ أثناء الاتصال بالخادم";
    }
}

export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    await response.json().catch(() => null);

    // The backend register endpoint creates the account but does not return a JWT.
    // Log the user in immediately after registration so protected pages
    // مثل إضافة الاشتراك وحفظه تشتغل مباشرة للحساب الجديد.
    return loginUser(email, password);
}

export async function loginUser(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    const data = (await response.json()) as AuthResponse;

    saveAuthData(data, email);

    return data;
}

export async function logoutUser() {
    const token = localStorage.getItem("dierha_token");

    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
    } catch {
        // Ignore logout errors and clear local storage anyway.
    }

    localStorage.removeItem("dierha_token");
    localStorage.removeItem("dierha_user");
}

export function getStoredUser() {
    const user = localStorage.getItem("dierha_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user) as AuthUser;
    } catch {
        localStorage.removeItem("dierha_token");
        localStorage.removeItem("dierha_user");

        return null;
    }
}

export function getToken() {
    return localStorage.getItem("dierha_token");
}

export async function requestPasswordReset(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    try {
        return await response.json();
    } catch {
        return {
            message: "تم إرسال رابط استعادة كلمة المرور",
        };
    }
}

export async function resetPassword(
    token: string,
    newPassword: string
) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token,
            newPassword,
        }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}
