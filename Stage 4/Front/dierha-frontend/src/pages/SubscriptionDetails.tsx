import { useEffect, useState } from "react";
import logo from "../assets/dierha-logo.png";
import Footer from "../components/Footer";
import CancelSubscriptionModal from "../components/CancelSubscriptionModal";
import SettingsDropdown from "../components/SettingsDropdown";
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

const logoModules = import.meta.glob("../assets/*-logo.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const getLogoPath = (fileName?: string) => {
    if (!fileName) return undefined;
    return logoModules[`../assets/${fileName}`];
};

const logoFileNameMap: Record<string, string> = {
    Netflix: "netflix-logo.png",
    Spotify: "spotify-logo.png",
    "YouTube Premium": "youtube-premium-logo.png",
    Canva: "canva-pro-logo.png",
    "Canva Pro": "canva-pro-logo.png",
    "Adobe Creative Cloud": "adobe-creative-cloud-logo.png",
    "Microsoft 365": "microsoft-365-logo.png",
    "Google One": "google-one-logo.png",
    Dropbox: "dropbox-logo.png",
    Notion: "notion-plus-logo.png",
    "Notion Plus": "notion-plus-logo.png",
    ChatGPT: "chatgpt-logo.png",
    Shahid: "shahid-logo.png",
    "OSN+": "osn-plus-logo.png",
    STARZPLAY: "starzplay-logo.png",
    "Amazon Prime": "amazon-prime-logo.png",
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
    "كل 3 شهور": "quarterly",
    "كل 6 شهور": "semi_annual",
    "سنوي": "yearly",
};

const formatBillingCycle = (cycle: BackendSubscription["billingCycle"]) => {
    if (cycle === "weekly") return "أسبوعي";
    if (cycle === "monthly") return "شهري";
    if (cycle === "quarterly") return "كل 3 شهور";
    if (cycle === "semi_annual") return "كل 6 شهور";
    return "سنوي";
};

const formatStatus = (status: BackendSubscription["status"]) => {
    return status === "active" ? "نشط" : "متوقف";
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

const formatReminderPreference = (
    reminderDays?: number | null,
    remindersEnabled?: boolean | null
) => {
    if (remindersEnabled === false) return "إيقاف التذكير";
    if (reminderDays === 1) return "قبل بيوم";
    if (reminderDays === 7) return "قبل بأسبوع";
    return "قبل بثلاث أيام";
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

            setSubscription(data);
            setPaymentsData(spending.payments);
            setSpendingData(
                spending.payments
                    .filter((payment) => payment.status === "paid")
                    .map((payment) => ({
                        month: payment.month,
                        amount: Number(payment.amount),
                    }))
            );
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
                <main className="dashboard-wrapper loading-page-center">
                    <div className="loading-state-card">
                        <span className="loading-spinner" />
                        <strong>جاري تحميل بيانات الاشتراك...</strong>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="home-page">
                <main className="dashboard-wrapper loading-page-center">
                    <div className="subscriptions-empty-card">
                        {error || "لم يتم العثور على الاشتراك."}
                    </div>
                </main>
            </div>
        );
    }

    const sortedPayments = [...paymentsData].sort((a, b) => {
        if (a.status === "upcoming" && b.status !== "upcoming") return -1;
        if (a.status !== "upcoming" && b.status === "upcoming") return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const localLogoFileName = logoFileNameMap[subscription.provider?.name || subscription.name];
    const logoPath = getLogoPath(localLogoFileName);
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

    return (
        <div className="home-page">
            <header className="top-navigation">
                <div className="nav-brand">
                    <img src={logo} alt="Dierha Logo" />
                </div>
                <nav className="nav-menu" aria-label="Main navigation">
                    <button type="button" className="nav-link" onClick={goToHome}>الرئيسية</button>
                    <button type="button" className="nav-link active" onClick={goToSubscriptions}>الاشتراكات</button>
                </nav>
                <div className="nav-user-area">
                    <SettingsDropdown onLogout={onLogout} />
                </div>
            </header>

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
                        ← العودة إلى الاشتراكات
                    </button>
                </section>

                <section className="subscription-details-summary">
                    <div className="details-service-main">
                        <div className="details-service-logo">
                            {logoPath ? (
                                <img src={logoPath} alt={`${subscription.name} logo`} className="details-service-logo-image" />
                            ) : subscription.provider?.logoUrl ? (
                                <img src={subscription.provider.logoUrl} alt={`${subscription.name} logo`} className="details-service-logo-image" />
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

                {/* قسم الأزرار الثلاثة على سطر واحد */}
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
            border: '1px solid #ffffff', // إطار أبيض لإخفاء الأسود
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
                                <h2 className="section-blue-title">الإنفاق على هذا الاشتراك</h2>
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

            {/* مودال تأكيد الحذف النهائي */}
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
                }}
                onClose={() => setIsEditModalOpen(false)}
                onSave={async (updatedValues) => {
                    try {
                        const reminderMap: Record<string, { reminderDays: number; remindersEnabled: boolean }> = {
                            "قبل بيوم": { reminderDays: 1, remindersEnabled: true },
                            "قبل بثلاث أيام": { reminderDays: 3, remindersEnabled: true },
                            "قبل بأسبوع": { reminderDays: 7, remindersEnabled: true },
                            "إيقاف التذكير": { reminderDays: subscription.reminderDays ?? 3, remindersEnabled: false },
                        };

                        const reminderSettings = reminderMap[updatedValues.reminderPreference || "قبل بيوم"] ?? {
                            reminderDays: subscription.reminderDays ?? 3,
                            remindersEnabled: subscription.remindersEnabled ?? true,
                        };

                        await updateSubscription(subscription.id, {
                            categoryId: subscription.provider?.id
                                ? subscription.categoryId
                                : categoryIdMap[updatedValues.category] ?? subscription.categoryId,
                            price: Number(updatedValues.price),
                            billingCycle: billingCycleMap[updatedValues.duration] ?? subscription.billingCycle,
                            renewalDate: updatedValues.renewalDate,
                            status: updatedValues.status === "نشط" ? "active" : "inactive",
                            notes: updatedValues.notes,
                            reminderDays: reminderSettings.reminderDays,
                            remindersEnabled: reminderSettings.remindersEnabled,
                        });

                        setToastType("success");
                        setToastMessage("تم تحديث الاشتراك بنجاح.");
                        setIsEditModalOpen(false);
                        await loadSubscription();
                    } catch (error) {
                        console.error(error);
                        setToastType("error");
                        setToastMessage("حدث خطأ أثناء تحديث الاشتراك.");
                    }
                }}
            />
            <CancelSubscriptionModal
    isOpen={isCancelModalOpen}
    onClose={() => setIsCancelModalOpen(false)}
    subscriptionName={subscription.name}
    // هذا السطر سيفحص وجود الرابط في المزود أولاً، ثم في الاشتراك، وإذا لم يجدهما يرسل undefined
    cancelUrl={subscription.provider?.cancelUrl ?? subscription.cancelUrl ?? undefined} 
/>
        </div>
    );
}

export default SubscriptionDetails;