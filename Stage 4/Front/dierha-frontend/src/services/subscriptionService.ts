import { apiRequest } from "./api";

export type BackendSubscription = {
    id: number;
    name: string;
    price: string;
    categoryId: number;
    startDate?: string;
    renewalDate: string;
    billingCycle: "weekly" | "monthly" | "quarterly" | "semi_annual" | "yearly";
    status: "active" | "inactive";
    notes?: string | null;
    cancelUrl?: string | null;
    reminderDays?: number | null;
    remindersEnabled?: boolean | null;
    createdAt?: string;
    category?: {
        id: number;
        name: string;
    };
    provider?: {
        id: number | null;
        name: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        cancelUrl: string | null;
    };
};

export type Provider = {
    id: number;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    cancelUrl: string | null;
    isPopular: boolean;
    category?: {
        id: number;
        name: string;
    };
};

export async function getSubscriptions(search?: string, categoryId?: number) {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", String(categoryId));

    const query = params.toString();

    return apiRequest<BackendSubscription[]>(
        `/api/subscriptions${query ? `?${query}` : ""}`
    );
}

export async function getProviders() {
    return apiRequest<Provider[]>("/api/providers");
}

export async function createSubscription(data: {
    providerId?: number;
    name: string;
    price: number;
    categoryId: number;
    categoryName?: string;
    startDate: string;
    billingCycle: "weekly" | "monthly" | "quarterly" | "semi_annual" | "yearly";
    status?: "active" | "inactive";
    notes?: string;
    cancelUrl?: string;
    reminderDays?: number;
    remindersEnabled?: boolean;
}) {
    return apiRequest<BackendSubscription>("/api/subscriptions", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getSubscriptionById(id: number | string) {
    return apiRequest<BackendSubscription>(`/api/subscriptions/${id}`);
}

export async function updateSubscription(
    id: number | string,
    data: {
        providerId?: number;
        name?: string;
        price?: number;
        categoryId?: number;
        renewalDate?: string;
        billingCycle?: "weekly" | "monthly" | "quarterly" | "semi_annual" | "yearly";
        status?: "active" | "inactive";
        notes?: string;
        cancelUrl?: string;
        reminderDays?: number;
        remindersEnabled?: boolean;
    }
) {
    return apiRequest<BackendSubscription>(`/api/subscriptions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSubscription(id: number | string) {
    return apiRequest<{ message: string }>(`/api/subscriptions/${id}`, {
        method: "DELETE",
    });
}

export type MonthlyAnalytics = {
    month: string;
    amount: number;
};

export type CategoryAnalytics = {
    category: string;
    amount: number;
};

export type UpcomingRenewal = {
    id: number;
    name: string;
    renewalDate: string;
    price: string;
};

export type SubscriptionPayment = {
    service: string;
    amount: number;
    date: string;
    month: string;
    status: "paid" | "upcoming";
};

export type SubscriptionSpending = {
    subscription: {
        id: number;
        name: string;
    };
    payments: SubscriptionPayment[];
};

export async function getMonthlyAnalytics() {
    return apiRequest<MonthlyAnalytics[]>("/api/analytics/monthly");
}

export async function getCategoryAnalytics() {
    return apiRequest<CategoryAnalytics[]>("/api/analytics/categories");
}

export async function getUpcomingRenewals() {
    return apiRequest<UpcomingRenewal[]>("/api/analytics/upcoming");
}

export async function getSubscriptionSpending(id: number | string) {
    return apiRequest<SubscriptionSpending>(
        `/api/subscriptions/${id}/spending`
    );
}

export async function exportSubscriptionsPdf() {
    const token = localStorage.getItem("dierha_token");

    const response = await fetch(
        "http://localhost:4000/api/subscriptions/pdf/export",
        {
            method: "GET",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        }
    );

    if (!response.ok) {
        throw new Error("فشل تصدير ملف PDF");
    }

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = downloadUrl;

    link.download = "subscriptions-report.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
}
