// rebuild by the cloudflare
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://dierha-backend.onrender.com/api";

export type BillingCycle =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "yearly";

export type SubscriptionStatus = "active" | "inactive";

export type Subscription = {
  id: number;
  userId?: number;
  providerId?: number | null;
  name: string;
  price: string | number;
  categoryId?: number | null;
  renewalDate: string;
  startDate: string;
  endDate?: string | null;
  billingCycle: BillingCycle;
  notes?: string | null;
  status?: SubscriptionStatus;
  cancelUrl?: string | null;
  reminderDays?: number | null;
  remindersEnabled?: boolean | null;
  deletedAt?: string | null;
  createdAt?: string;

  category?: {
    id: number;
    name: string;
  } | null;

  provider?: {
    id: number;
    name: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    cancelUrl?: string | null;
  } | null;
};

export type CreateSubscriptionDto = {
  providerId?: number | null;
  name: string;
  price: number | string;
  categoryId?: number;
  categoryName?: string;
  startDate: string;
  billingCycle: BillingCycle;
  notes?: string;
  status?: SubscriptionStatus;
  cancelUrl?: string;
  reminderDays?: number;
  remindersEnabled?: boolean;
};

export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto> & {
  renewalDate?: string;
  endDate?: string | null;
};

export type FilterSubscriptionsDto = {
  categoryId?: number | string;
  search?: string;
  paymentMonth?: number | string;
  paymentYear?: number | string;
};

type RequestOptions = RequestInit & {
  skipJson?: boolean;
};

function getToken() {
  const directKeys = [
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "jwtToken",
    "access_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value.replace(/^Bearer\s+/i, "");
    }
  }

  const objectKeys = ["user", "currentUser", "auth", "authUser", "dierhaUser"];

  for (const key of objectKeys) {
    const value = localStorage.getItem(key);

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
      // Ignore invalid JSON values in localStorage.
    }
  }

  return null;
}

function buildQuery(filters?: FilterSubscriptionsDto) {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.categoryId !== undefined && filters.categoryId !== "") {
    params.append("categoryId", String(filters.categoryId));
  }

  if (filters.search) {
    params.append("search", filters.search);
  }

  if (filters.paymentMonth !== undefined && filters.paymentMonth !== "") {
    params.append("paymentMonth", String(filters.paymentMonth));
  }

  if (filters.paymentYear !== undefined && filters.paymentYear !== "") {
    params.append("paymentYear", String(filters.paymentYear));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const errorData = await response.json();
      errorMessage =
        errorData?.message ||
        errorData?.error ||
        JSON.stringify(errorData) ||
        errorMessage;
    } catch {
      const text = await response.text();
      errorMessage = text || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (options.skipJson || response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export class SubscriptionsService {
  findAll(filters?: FilterSubscriptionsDto) {
    return request<Subscription[]>(`/subscriptions${buildQuery(filters)}`);
  }

  create(dto: CreateSubscriptionDto) {
    return request<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  findOne(id: number | string) {
    return request<Subscription>(`/subscriptions/${id}`);
  }

  update(id: number | string, dto: UpdateSubscriptionDto) {
    return request<Subscription>(`/subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  }

  remove(id: number | string) {
    return request<{ message: string; subscription: Subscription }>(
      `/subscriptions/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  toggle(id: number | string) {
    return request<Subscription>(`/subscriptions/${id}/toggle`, {
      method: "PATCH",
    });
  }

  getSubscriptionSpending(id: number | string) {
    return request(`/subscriptions/${id}/spending`);
  }

  findPriceHistory(id: number | string) {
    return request(`/subscriptions/${id}/price-history`);
  }

  async exportPdf() {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/subscriptions/export/pdf`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export PDF");
    }

    return response.blob();
  }
}

export const subscriptionsService = new SubscriptionsService();
export const subscriptionService = subscriptionsService;

export const getSubscriptions = (filters?: FilterSubscriptionsDto) => {
  return subscriptionsService.findAll(filters);
};

export const getSubscriptionById = (id: number | string) => {
  return subscriptionsService.findOne(id);
};

export const getSubscription = (id: number | string) => {
  return subscriptionsService.findOne(id);
};

export const createSubscription = (data: CreateSubscriptionDto) => {
  return subscriptionsService.create(data);
};

export const addSubscription = (data: CreateSubscriptionDto) => {
  return subscriptionsService.create(data);
};

export const updateSubscription = (
  id: number | string,
  data: UpdateSubscriptionDto
) => {
  return subscriptionsService.update(id, data);
};

export const deleteSubscription = (id: number | string) => {
  return subscriptionsService.remove(id);
};

export const removeSubscription = (id: number | string) => {
  return subscriptionsService.remove(id);
};

export const toggleSubscription = (id: number | string) => {
  return subscriptionsService.toggle(id);
};

export const getSubscriptionSpending = (id: number | string) => {
  return subscriptionsService.getSubscriptionSpending(id);
};

export const getPriceHistory = (id: number | string) => {
  return subscriptionsService.findPriceHistory(id);
};

export const exportSubscriptionsPdf = () => {
  return subscriptionsService.exportPdf();
};

export const exportSubscriptionsPDF = () => {
  return subscriptionsService.exportPdf();
};

export const getCategoryAnalytics = () => {
  return request("/analytics/categories");
};

export const getMonthlyAnalytics = () => {
  return request("/analytics/monthly");
};

export const getUpcomingRenewals = () => {
  return request("/subscriptions/upcoming-renewals");
};

export default subscriptionsService;
