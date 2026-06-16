import { useEffect, useState } from "react";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import Footer from "../components/Footer";
import CancelSubscriptionModal from "../components/CancelSubscriptionModal";
import ToastMessage from "../components/ToastMessage";
import EditSubscriptionModal from "../components/EditSubscriptionModal";
import { 
    type BackendSubscription,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription, 
    getSubscriptionSpending,
    type SubscriptionSpending,
} from "../services/subscriptionService";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type SubscriptionDetailsProps = {
    onLogout: () => void;
    goToHome: () => void;
    goToSubscriptions: () => void;
    subscriptionId?: number | string;
};

type ChartItem = {
    month: string;
    amount: number;
};

type PaymentItem = SubscriptionSpending["payments"][number];

const logoModules = import.meta.glob("../assets/*-logo.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const logoFileNameMap: Record<string, string> = {
    // ترفيه
    "netflix": "netflix-logo.png",
    "spotify": "spotify-logo.png",
    "youtube premium": "youtube-premium-logo.png",
    "shahid": "shahid-logo.png",
    "osn+": "osn-plus-logo.png",
    "starzplay": "starzplay-logo.png",
    "amazon prime": "amazon-prime-logo.png",
    "apple music": "apple-music-logo.png",
    "disney+": "disney-plus-logo.png",
    "deezer": "deezer-logo.png",
    "crunchyroll": "crunchyroll-logo.png",
    "twitch turbo": "twitch-turbo-logo.png",
    "stc tv": "stc-tv-logo.png",
    "thmanyah": "thmanyah-logo.png",

    // عمل 
    "canva": "canva-pro-logo.png",
    "canva pro": "canva-pro-logo.png",
    "adobe creative cloud": "adobe-creative-cloud-logo.png",
    "adobe acrobat": "adobe-acrobat-logo.png",
    "microsoft 365": "microsoft-365-logo.png",
    "google one": "google-one-logo.png",
    "dropbox": "dropbox-logo.png",
    "notion": "notion-plus-logo.png",
    "notion plus": "notion-plus-logo.png",
    "chatgpt": "chatgpt-logo.png",
    "gemini": "gemini-logo.png",
    "claude": "claude-logo.png",
    "slack": "slack-logo.png",
    "zoom": "zoom-logo.png",
    "figma": "figma-logo.png",
    "github pro": "github-pro-logo.png",
    "grammarly": "grammarly-logo.png",
    "trello": "trello-logo.png",
    "monday.com": "monday-logo.png",
    "asana": "asana-logo.png",
    "jira": "jira-logo.png",
    "salla": "salla-logo.png",
    "zid": "zid-logo.png",
    "icloud+": "icloud-plus-logo.png",

    // تعليم
    "udemy": "udemy-logo.png",
    "linkedin learning": "linkedin-learning-logo.png",
    "quizlet": "quizlet-logo.png",

    // صحة
    "calm": "calm-logo.png",
    "headspace": "headspace-logo.png",
    "myfitnesspal": "myfitnesspal-logo.png",
    "fitbit premium": "fitbit-premium-logo.png",

    // أخرى
    "jahez": "jahez-logo.png",
    "hungerstation": "hungerstation-logo.png",
    "ninja": "ninja-logo.png",
};

const getLogoPath = (name?: string) => {
    if (!name) return undefined;
    const fileName = logoFileNameMap[name.toLowerCase().trim()];
    if (!fileName) return undefined;
    return logoModules[`../assets/${fileName}`];
};

const categoryIdMap: Record<string, number> = {
    الترفيه: 1,
    العمل: 2,
    التعليم: 3,
    الصحة: 4,
    أخرى: 5,
};

const billingCycleMap: Record<
    string,
    "weekly" | "monthly" | "quarterly" | "semi_annual" | "yearly"
> = {
    "أسبوعي": "weekly",
    "شهري": "monthly",
    "3 أشهر": "quarterly",
    "6 أشهر": "semi_annual",
    "سنة": "yearly",
    "كل 3 شهور": "quarterly",
    "كل 6 شهور": "semi_annual",
    "سنوي": "yearly",
};

const formatBillingCycle = (cycle: BackendSubscription["billingCycle"]) => {
    if (cycle === "weekly") return "أسبوعي";
    if (cycle === "monthly") return "شهري";
    if (cycle === "quarterly") return "3 أشهر";
    if (cycle === "semi_annual") return "6 أشهر";
    return "سنة";
};

const formatStatus = (status: BackendSubscription["status"]) => {
    return status === "active" ? "نشط" : "غير نشط";
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA-u-nu-latn", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const addBillingCycleToDate = (
    dateValue: string,
    billingCycle: BackendSubscription["billingCycle"]
) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return dateValue;

    if (billingCycle === "weekly") {
        date.setDate(date.getDate() + 7);
    } else if (billingCycle === "monthly") {
        date.setMonth(date.getMonth() + 1);
    } else if (billingCycle === "quarterly") {
        date.setMonth(date.getMonth() + 3);
    } else if (billingCycle === "semi_annual") {
        date.setMonth(date.getMonth() + 6);
    } else {
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().slice(0, 10);
};

const resolveRenewalDate = (subscription: BackendSubscription) => {
    const startDate = subscription.startDate || subscription.renewalDate;

    if (!startDate) return subscription.renewalDate;

    if (
        subscription.startDate &&
        subscription.renewalDate &&
        subscription.renewalDate !== subscription.startDate
    ) {
        return subscription.renewalDate;
    }

    return addBillingCycleToDate(startDate, subscription.billingCycle);
};

const normalizeOptionalCancelUrl = (value?: string) => {
    const trimmedValue = value?.trim();

    if (!trimmedValue) return undefined;

    if (/^https?:\/\//i.test(trimmedValue)) {
        return trimmedValue;
    }

    return `https://${trimmedValue}`;
};

const formatReminderPreference = (
    reminderDays?: number | null,
    remindersEnabled?: boolean | null
) => {
    if (remindersEnabled === false) return "إيقاف التذكير";
    if (reminderDays === 1) return "قبل بيوم";
    if (reminderDays === 7) return "قبل بأسبوع";
    return "قبل بثلاث أيام";
};

const getPaidPaymentsStorageKey = (subscriptionId: number | string) => {
    return `dierha_paid_payments_${subscriptionId}`;
};

const getPaymentSnapshotKey = (payment: PaymentItem) => {
    return `${payment.date || "no-date"}|${payment.month || "no-month"}|${
        payment.service || "no-service"
    }`;
};

const readPaidPaymentsSnapshot = (subscriptionId: number | string) => {
    try {
        const storedValue = localStorage.getItem(getPaidPaymentsStorageKey(subscriptionId));
        if (!storedValue) return {};

        const parsed = JSON.parse(storedValue);
        return typeof parsed === "object" && parsed !== null
            ? (parsed as Record<string, number>)
            : {};
    } catch {
        return {};
    }
};

const savePaidPaymentsSnapshot = (
    subscriptionId: number | string,
    payments: PaymentItem[]
) => {
    try {
        const currentSnapshot = readPaidPaymentsSnapshot(subscriptionId);

        payments
            .filter((payment) => payment.status === "paid")
            .forEach((payment) => {
                const amount = Number(payment.amount);

                if (Number.isFinite(amount)) {
                    currentSnapshot[getPaymentSnapshotKey(payment)] = amount;
                }
            });

        localStorage.setItem(
            getPaidPaymentsStorageKey(subscriptionId),
            JSON.stringify(currentSnapshot)
        );
    } catch {
        // Local storage is only used to protect the UI from changing old paid amounts.
    }
};

const applyPaidPaymentsSnapshot = (
    subscriptionId: number | string,
    payments: PaymentItem[]
) => {
    const snapshot = readPaidPaymentsSnapshot(subscriptionId);

    return payments.map((payment) => {
        if (payment.status !== "paid") return payment;

        const savedAmount = snapshot[getPaymentSnapshotKey(payment)];

        if (typeof savedAmount === "number" && Number.isFinite(savedAmount)) {
            return {
                ...payment,
                amount: savedAmount,
            };
        }

        return payment;
    });
};

const paymentsToChartData = (payments: PaymentItem[]): ChartItem[] => {
    return payments
        .filter((payment) => payment.status === "paid")
        .map((payment) => ({
            month: payment.month,
            amount: Number(payment.amount),
        }))
        .filter((item) => Number.isFinite(item.amount));
};

function SubscriptionDetails({
    onLogout,
    goToHome,
    goToSubscriptions,
    subscriptionId = 1,
}: SubscriptionDetailsProps) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subscription, setSubscription] = useState<BackendSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [spendingData, setSpendingData] = useState<ChartItem[]>([]);
    const [paymentsData, setPaymentsData] = useState<SubscriptionSpending["payments"]>([]);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSubscriptionById(subscriptionId);
            const spending = await getSubscriptionSpending(subscriptionId);
            const stablePayments = applyPaidPaymentsSnapshot(
                subscriptionId,
                spending.payments
            );

            setSubscription(data);
            setPaymentsData(stablePayments);
            setSpendingData(paymentsToChartData(stablePayments));
        } catch (err) {
            console.error(err);
            setError("فشل تحميل تفاصيل الاشتراك.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        loadSubscription();
    }, [subscriptionId]);

  if (loading) {
  return (
    <div className="home-page">
      <AuthenticatedHeader
        activePage="subscriptions"
        onLogout={onLogout}
        goToHome={goToHome}
        goToSubscriptions={goToSubscriptions}
      />
      <main className="dashboard-wrapper loading-page-center">
        <div className="dierha-page-loader">
          <span
            className="dierha-page-loader-ring"
            aria-hidden="true"
          />
          <strong className="dierha-page-loader-text">
            جاري تحميل بيانات الاشتراك...
          </strong>
        </div>
      </main>
      <Footer goToHome={goToHome} goToSubscriptions={goToSubscriptions} />
    </div>
  );
}

    if (error || !subscription) {
        return (
            <div className="home-page">
                <AuthenticatedHeader
                    activePage="subscriptions"
                    onLogout={onLogout}
                    goToHome={goToHome}
                    goToSubscriptions={goToSubscriptions}
                />
                <main className="dashboard-wrapper loading-page-center">
                    <div className="subscriptions-empty-card">
                        {error || "لم يتم العثور على الاشتراك."}
                    </div>
                </main>
                <Footer goToHome={goToHome} goToSubscriptions={goToSubscriptions} />
            </div>
        );
    }

    const sortedPayments = [...paymentsData]
        .filter((payment) => {
            if (subscription.status === "inactive" && payment.status === "upcoming") return false;
            return true;
        })
        .sort((a, b) => {
            if (a.status === "upcoming" && b.status !== "upcoming") return -1;
            if (a.status !== "upcoming" && b.status === "upcoming") return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    const logoPath = getLogoPath(subscription.provider?.name || subscription.name);
    const categoryName = subscription.category?.name ?? "أخرى";
    const price = Number(subscription.price).toFixed(2);
    const statusLabel = formatStatus(subscription.status);
    const billingCycleLabel = formatBillingCycle(subscription.billingCycle);
    const subscriptionStartDate = subscription.startDate || subscription.renewalDate;
    const resolvedRenewalDate = resolveRenewalDate(subscription);
    const startDateLabel = formatDate(subscriptionStartDate);
    const renewalDateLabel = formatDate(resolvedRenewalDate);
    const reminderPreferenceLabel = formatReminderPreference(
        subscription.reminderDays,
        subscription.remindersEnabled
    );

    const details = [
        { label: "تاريخ الاشتراك", value: startDateLabel },
        { label: "تاريخ التجديد", value: renewalDateLabel },
        { label: "التصنيف", value: categoryName },
        { label: "مدة الاشتراك", value: billingCycleLabel },
        { label: "التذكير قبل التجديد", value: reminderPreferenceLabel },
        { label: "ملاحظات", value: subscription.notes || "لا توجد ملاحظات" },
    ];

    const confirmDeleteSubscription = async () => {
        try {
            await deleteSubscription(subscription.id);
            setIsDeleteConfirmOpen(false);
            goToSubscriptions();
        } catch (error) {
            console.error(error);
            setToastType("error");
            setToastMessage("حدث خطأ أثناء حذف الاشتراك.");
        }
    };

    const hasLogo = logoPath || (
        subscription.provider?.logoUrl &&
        /^https?:\/\//i.test(subscription.provider.logoUrl)
    );
    const logoContainerStyle = hasLogo
        ? { background: "#f1f3f9" }
        : {
              background: "#f1f3f9",
              color: "#1D47DA",
              border: "1px solid #E7ECF6",
          };

    return (
        <div className="home-page">
            <AuthenticatedHeader
                activePage="subscriptions"
                onLogout={onLogout}
                goToHome={goToHome}
                goToSubscriptions={goToSubscriptions}
            />

            <main className="dashboard-wrapper">
                <ToastMessage message={toastMessage} type={toastType} />

                <section className="subscription-details-header">
                    <div className="details-title-area no-details-icon">
                        <div>
                            <h1>تفاصيل الاشتراك</h1>
                            <p>عرض كامل لبيانات الاشتراك، مواعيد التجديد، والمدفوعات.</p>
                        </div>
                    </div>
                    <button type="button" className="details-back-btn" onClick={goToSubscriptions}>
                         العودة إلى الاشتراكات
                    </button>
                </section>

                <section className="subscription-details-summary">
                    <div className="details-service-main">
                        <div className="details-service-logo" style={logoContainerStyle}>
                            {logoPath ? (
                                <img
                                    src={logoPath}
                                    alt={`${subscription.name} logo`}
                                    className="details-service-logo-image"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                />
                            ) : subscription.provider?.logoUrl && /^https?:\/\//i.test(subscription.provider.logoUrl) ? (
                                <img
                                    src={subscription.provider.logoUrl}
                                    alt={`${subscription.name} logo`}
                                    className="details-service-logo-image"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                />
                            ) : (
                                <span>{subscription.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h2>{subscription.name}</h2>
                            <p>{subscription.notes || "لا توجد ملاحظات لهذا الاشتراك."}</p>
                            <span>{categoryName}</span>
                        </div>
                    </div>

                    <div className="details-summary-item">
                        <span>الحالة</span>
                        <strong className="status-text">{statusLabel}</strong>
                    </div>
                    <div className="details-summary-item">
                        <span>السعر</span>
                        <strong className="status-text">{price} ريال</strong>
                    </div>
                    <div className="details-summary-item">
                        <span>مدة الاشتراك</span>
                        <strong>{billingCycleLabel}</strong>
                    </div>
                    <div className="details-summary-item">
                        <span>تاريخ التجديد</span>
                        <strong>{renewalDateLabel}</strong>
                    </div>
                </section>

                <section className="subscription-details-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        className="details-edit-btn"
                        style={{ flex: 1 }}
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        تعديل الاشتراك
                    </button>

                    <button
                        type="button"
                        className="details-delete-btn"
                        style={{ flex: 1 }}
                        onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                        حذف الاشتراك
                    </button>

                    <button
                        type="button"
                        className="details-cancel-sub-btn highlight-hover-btn"
                        style={{ 
                            flex: 1, 
                            backgroundColor: '#ffffff', 
                            color: '#4b5563', 
                            border: '1px solid #ffffff',
                            padding: '12px', 
                            borderRadius: '16px', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => setIsCancelModalOpen(true)}
                    >
                        إلغاء الاشتراك
                    </button>
                </section>

                <section className="subscription-details-grid details-grid-without-side">
                    <div className="details-main-column details-main-column-full">
                        <div className="details-info-card">
                            <h2 className="section-blue-title">معلومات الاشتراك</h2>
                            <div className="details-info-list">
                                {details.map((item) => (
                                    <div className="details-info-row" key={item.label}>
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="details-chart-card">
                            <div className="panel-title no-action">
                                <h2 className="section-blue-title">سجل الانفاق الشهري</h2>
                            </div>
                            <div className="details-chart-wrapper">
                                {spendingData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={spendingData} margin={{ top: 18, right: 8, left: 8, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="detailsSpendGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#1D47DA" stopOpacity={0.25} />
                                                    <stop offset="100%" stopColor="#1D47DA" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#E7ECF6" strokeDasharray="5 6" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} interval={0} tick={{ fill: "#667085", fontSize: 11, fontWeight: 700 }} />
                                            <YAxis hide domain={[0, "dataMax + 40"]} />
                                            <Tooltip
                                                contentStyle={{ border: "1px solid #E7ECF6", borderRadius: "14px", boxShadow: "0 8px 22px rgba(2, 11, 92, 0.08)", direction: "rtl" }}
                                                formatter={(value) => [`${Number(value).toFixed(2)} ريال`, "المبلغ"]}
                                                labelFormatter={(label) => `الفترة: ${label}`}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#1D47DA" strokeWidth={4} fill="url(#detailsSpendGradient)" dot={{ r: 4, fill: "#FFFFFF", stroke: "#1D47DA", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#F56F96", stroke: "#FFFFFF", strokeWidth: 3 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="subscriptions-empty-card">لا توجد بيانات إنفاق لهذا الاشتراك.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="details-payments-card">
                    <h2 className="section-blue-title">سجل المدفوعات</h2>
                    <div className="details-payments-table-wrapper">
                        <table className="details-payments-table">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>الخدمة</th>
                                    <th>المبلغ</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPayments.length > 0 ? (
                                    sortedPayments.map((payment) => (
                                        <tr key={`${payment.date}-${payment.status}`}>
                                            <td>{payment.date}</td>
                                            <td>{payment.service || subscription.name}</td>
                                            <td>{Number(payment.amount).toFixed(2)} ريال</td>
                                            <td>
                                                <span className={payment.status === "paid" ? "payment-status" : "payment-status upcoming-payment"}>
                                                    {payment.status === "paid" ? "مدفوع" : "قادم"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4}>لا توجد مدفوعات لهذا الاشتراك.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <Footer goToHome={goToHome} goToSubscriptions={goToSubscriptions} />

            {isDeleteConfirmOpen && (
                <div className="delete-confirm-overlay" role="dialog" aria-modal="true">
                    <div className="delete-confirm-card">
                        <div className="delete-confirm-icon">!</div>
                        <h2>هل أنت متأكد من حذف الاشتراك؟</h2>
                        <p>ذلك سيؤدي إلى حذف جميع تفاصيل الاشتراك للأبد ولا يمكن التراجع عن هذه العملية.</p>
                        <div className="delete-confirm-actions">
                            <button type="button" className="delete-confirm-primary" onClick={confirmDeleteSubscription}>نعم، حذف الاشتراك</button>
                            <button type="button" className="delete-confirm-secondary" onClick={() => setIsDeleteConfirmOpen(false)}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            <EditSubscriptionModal
                isOpen={isEditModalOpen}
                subscriptionName={subscription.name}
                initialValues={{
                    category: categoryName,
                    price: Number(subscription.price),
                    duration: billingCycleLabel,
                    renewalDate: subscriptionStartDate,
                    status: statusLabel,
                    notes: subscription.notes || "",
                    reminderPreference: reminderPreferenceLabel,
                    name: subscription.name,
                    cancelUrl: subscription.cancelUrl || "",
                }}
                isCustomSubscription={false}
                onClose={() => setIsEditModalOpen(false)}
                onSave={async (updatedValues) => {
                    try {
                        const toEnglishDigits = (value: unknown) => {
                            return String(value ?? "")
                                .replace(/[٠-٩]/g, (digit) =>
                                    String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
                                )
                                .replace(/[۰-۹]/g, (digit) =>
                                    String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
                                )
                                .replace(",", ".")
                                .trim();
                        };

                        const normalizeDateForApi = (value?: string) => {
                            const fallbackDate = subscription.startDate || subscription.renewalDate;

                            if (!value) return fallbackDate;

                            const normalizedValue = toEnglishDigits(value);

                            if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
                                return normalizedValue;
                            }

                            const arabicMonths: Record<string, number> = {
                                يناير: 0,
                                فبراير: 1,
                                مارس: 2,
                                أبريل: 3,
                                ابريل: 3,
                                مايو: 4,
                                يونيو: 5,
                                يوليو: 6,
                                أغسطس: 7,
                                اغسطس: 7,
                                سبتمبر: 8,
                                أكتوبر: 9,
                                اكتوبر: 9,
                                نوفمبر: 10,
                                ديسمبر: 11,
                            };

                            const arabicDateMatch = normalizedValue.match(
                                /^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/
                            );

                            if (arabicDateMatch) {
                                const [, day, monthName, year] = arabicDateMatch;
                                const monthIndex = arabicMonths[monthName];

                                if (monthIndex !== undefined) {
                                    const parsedArabicDate = new Date(
                                        Number(year),
                                        monthIndex,
                                        Number(day)
                                    );

                                    if (!Number.isNaN(parsedArabicDate.getTime())) {
                                        return parsedArabicDate.toISOString().slice(0, 10);
                                    }
                                }
                            }

                            const parsedDate = new Date(normalizedValue);

                            if (Number.isNaN(parsedDate.getTime())) {
                                return fallbackDate;
                            }

                            return parsedDate.toISOString().slice(0, 10);
                        };

                        const parsedPrice = Number(toEnglishDigits(updatedValues.price));

                        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
                            setToastType("error");
                            setToastMessage("تأكدي من كتابة السعر بشكل صحيح.");
                            return;
                        }

                        const reminderMap: Record<
                            string,
                            { reminderDays: number; remindersEnabled: boolean }
                        > = {
                            "قبل بيوم": { reminderDays: 1, remindersEnabled: true },
                            "قبل بثلاث أيام": { reminderDays: 3, remindersEnabled: true },
                            "قبل بأسبوع": { reminderDays: 7, remindersEnabled: true },
                            "إيقاف التذكير": {
                                reminderDays: subscription.reminderDays ?? 3,
                                remindersEnabled: false,
                            },
                        };

                        const selectedReminder =
                            updatedValues.reminderPreference || reminderPreferenceLabel;

                        const reminderSettings = reminderMap[selectedReminder] ?? {
                            reminderDays: subscription.reminderDays ?? 3,
                            remindersEnabled: subscription.remindersEnabled ?? true,
                        };

                        const selectedCategoryName = updatedValues.category || categoryName;
                        const selectedDuration = updatedValues.duration || billingCycleLabel;
                        const selectedStatus = updatedValues.status || statusLabel;

                        savePaidPaymentsSnapshot(subscription.id, paymentsData);

                        await updateSubscription(subscription.id, {
                            price: parsedPrice,
                            categoryId:
                                categoryIdMap[selectedCategoryName] ??
                                subscription.categoryId ??
                                undefined,
                            billingCycle:
                                billingCycleMap[selectedDuration] ?? subscription.billingCycle,
                            renewalDate: normalizeDateForApi(updatedValues.renewalDate),
                            status:
                                selectedStatus === "نشط" || selectedStatus === "active"
                                    ? "active"
                                    : "inactive",
                            notes: updatedValues.notes ?? "",
                            reminderDays: reminderSettings.reminderDays,
                            remindersEnabled: reminderSettings.remindersEnabled,
                            ...(!subscription.provider?.id
                                ? {
                                      name:
                                          updatedValues.name?.trim() || subscription.name,
                                      cancelUrl:
                                          normalizeOptionalCancelUrl(updatedValues.cancelUrl) ||
                                          subscription.cancelUrl ||
                                          undefined,
                                  }
                                : {}),
                        });

                        setToastType("success");
                        setToastMessage("تم تحديث الاشتراك بنجاح.");
                        setIsEditModalOpen(false);
                        await loadSubscription();
                    } catch (error) {
                        console.error("Update subscription failed:", error);
                        setToastType("error");
                        setToastMessage(
                            error instanceof Error
                                ? error.message
                                : "حدث خطأ أثناء تحديث الاشتراك."
                        );
                    }
                }}
            />

            <CancelSubscriptionModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                subscriptionName={subscription.name}
                cancelUrl={subscription.provider?.cancelUrl ?? subscription.cancelUrl ?? undefined}
            />
        </div>
    );
}

export default SubscriptionDetails;
