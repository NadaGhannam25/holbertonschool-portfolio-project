import { useMemo, useRef, useState } from "react";
import logo from "../assets/dierha-logo.png";
import Footer from "../components/Footer";
import SettingsDropdown from "../components/SettingsDropdown";
import ToastMessage from "../components/ToastMessage";
import { createSubscription } from "../services/subscriptionService";
import {
    appOptions,
    type AppOption,
} from "../data/appOptions";
type AddSubscriptionProps = {
    onLogout: () => void;
    goToHome: () => void;
    goToSubscriptions: () => void;
}; 

type SubscriptionDuration = "أسبوعي" | "شهري" | "3 أشهر" | "6 أشهر" | "سنة";
type SubscriptionStatus = "نشط" | "غير نشط";
type ReminderPreference =
    | "قبل بيوم"
    | "قبل بثلاث أيام"
    | "قبل بأسبوع"
    | "إيقاف التذكير";


type AddSubscriptionForm = {
    selectedAppId: string;
    customAppName: string;
    cancelUrl: string;
    category: string;
    price: string;
    subscriptionDuration: SubscriptionDuration;
    renewalDate: string;
    status: SubscriptionStatus;
    reminderPreference: ReminderPreference;
    notes: string;
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

const categoryOptions = ["العمل", "الترفيه", "الصحة", "التعليم", "أخرى"];

const reminderOptions: ReminderPreference[] = [
    "قبل بيوم",
    "قبل بثلاث أيام",
    "قبل بأسبوع",
    "إيقاف التذكير",
];

const arabicMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
];

const formatArabicDateDisplay = (value: string) => {
    if (!value) return "حدد تاريخ الاشتراك";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "حدد تاريخ الاشتراك";

    return `${date.getDate()} ${arabicMonths[date.getMonth()]} ${date.getFullYear()}`;
};

const normalizeOptionalCancelUrl = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return undefined;

    if (/^https?:\/\//i.test(trimmedValue)) {
        return trimmedValue;
    }

    return `https://${trimmedValue}`;
};

const categoryIdMap: Record<string, number> = {
    الترفيه: 1,
    العمل: 2,
    التعليم: 3,
    الصحة: 4,
    أخرى: 5,
};

const billingCycleMap: Record<
    SubscriptionDuration,
    "weekly" | "monthly" | "quarterly" | "semi_annual" | "yearly"
> = {
    أسبوعي: "weekly",
    شهري: "monthly",
    "3 أشهر": "quarterly",
    "6 أشهر": "semi_annual",
    سنة: "yearly",
};

const reminderSettingsMap: Record<
    ReminderPreference,
    {
        reminderDays: number;
        remindersEnabled: boolean;
    }
> = {
    "قبل بيوم": {
        reminderDays: 1,
        remindersEnabled: true,
    },
    "قبل بثلاث أيام": {
        reminderDays: 3,
        remindersEnabled: true,
    },
    "قبل بأسبوع": {
        reminderDays: 7,
        remindersEnabled: true,
    },
    "إيقاف التذكير": {
        reminderDays: 3,
        remindersEnabled: false,
    },
};

function AddSubscription({
    onLogout,
    goToHome,
    goToSubscriptions,
}: AddSubscriptionProps) {
    const [formData, setFormData] = useState<AddSubscriptionForm>({
        selectedAppId: "",
        customAppName: "",
        cancelUrl: "",
        category: "الترفيه",
        price: "",
        subscriptionDuration: "شهري",
        renewalDate: "",
        status: "نشط",
        reminderPreference: "قبل بيوم",
        notes: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
    const [isReminderConfirmOpen, setIsReminderConfirmOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] =
        useState<"success" | "error" | "info">("success");

    const renewalDateInputRef = useRef<HTMLInputElement | null>(null);

    const selectedApp = useMemo(() => {
        return appOptions.find((app) => app.id === formData.selectedAppId) || null;
    }, [formData.selectedAppId]);

    const appName = useMemo(() => {
         if (!formData.selectedAppId) return "اختر التطبيق";
         if (formData.selectedAppId === "other") {
          return formData.customAppName.trim();
        }

        return selectedApp?.name ?? "";
    }, [
         formData.selectedAppId,
         formData.customAppName,
         selectedApp,
    ]);

    const updateField = (field: keyof AddSubscriptionForm, value: string) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleReminderPreferenceChange = (value: ReminderPreference) => {
        if (value === "إيقاف التذكير") {
            setIsReminderConfirmOpen(true);
            return;
        }

        updateField("reminderPreference", value);
    };

    const handleAppChange = (appId: string) => {
        const app = appOptions.find((item) => item.id === appId);

        setFormData((previous) => ({
            ...previous,
            selectedAppId: appId,
            category: app?.category || "أخرى",
            customAppName: appId === "other" ? previous.customAppName : "",
            cancelUrl: appId === "other" ? previous.cancelUrl : "",
        }));

        setIsAppMenuOpen(false);
    };

    const normalizedPrice = Number(formData.price);

     const isCustomAppNameValid =
       formData.selectedAppId !== "other" ||
       formData.customAppName.trim().length > 0;

    const isFormValid =
       isCustomAppNameValid &&
       appName.trim() &&
       formData.category.trim() &&
       formData.price.trim() &&
       Number.isFinite(normalizedPrice) &&
       normalizedPrice >= 0 &&
       formData.renewalDate &&
       formData.status.trim();

    const renderAppLogo = (app: AppOption, customName?: string) => {
        const appLogo = getLogoPath(app.logoFileName);
        const fallbackLetter = (customName || app.name || "D")
            .charAt(0)
            .toUpperCase();

        if (appLogo) {
            return <img src={appLogo} alt={`${app.name} logo`} />;
        }

        if (app.logoUrl) {
            return <img src={app.logoUrl} alt={`${app.name} logo`} />;
        }

        return <span className="default-app-logo-small">{fallbackLetter}</span>;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isFormValid) {
            setToastType("error");
            setToastMessage("يرجى تعبئة الحقول المطلوبة قبل حفظ الاشتراك.");
            return;
        }

        try {
            setIsLoading(true);

            const reminderSettings =
                reminderSettingsMap[formData.reminderPreference];

            await createSubscription({
                name: appName,

                categoryId: categoryIdMap[formData.category] ?? 5,

                categoryName: formData.category,

                providerId:
                    formData.selectedAppId !== "other"
                        ? selectedApp?.providerId
                        : undefined,

                price: normalizedPrice,

                startDate: formData.renewalDate,

                billingCycle: billingCycleMap[formData.subscriptionDuration],

                status: formData.status === "نشط" ? "active" : "inactive",

                notes: formData.notes.trim(),

                reminderDays: reminderSettings.reminderDays,

                remindersEnabled: reminderSettings.remindersEnabled,

                cancelUrl:
                    formData.selectedAppId === "other"
                        ? normalizeOptionalCancelUrl(formData.cancelUrl)
                        : undefined,
            });

            setToastType("success");
            setToastMessage("تم حفظ الاشتراك بنجاح.");
            setTimeout(goToSubscriptions, 700);
        } catch (error) {
            console.error(error);
            setToastType("error");
            setToastMessage("حدث خطأ أثناء حفظ الاشتراك.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="home-page">
            <header className="top-navigation">
                <div className="nav-brand">
                    <img src={logo} alt="Dierha Logo" />
                </div>

                <nav className="nav-menu" aria-label="Main navigation">
                    <button type="button" className="nav-link" onClick={goToHome}>
                        الرئيسية
                    </button>

                    <button
                        type="button"
                        className="nav-link active"
                        onClick={goToSubscriptions}
                    >
                        الاشتراكات
                    </button>
                </nav>

                <div className="nav-user-area">
                    <SettingsDropdown onLogout={onLogout} />
                </div>
            </header>

            <main className="dashboard-wrapper">
                <ToastMessage message={toastMessage} type={toastType} />

                <section className="add-subscription-header-v2 clean-page-title add-subscription-title-row">
                    <div>
                        <h1>إضافة اشتراك جديد</h1>
                        <p>
                            يمكنك إضافة اشتراكك هنا وتحديد السعر وموعد التجديد بسهولة.
                        </p>
                    </div>
                </section>

                <section className="add-subscription-single-layout">
                    <form className="add-subscription-form-v2" onSubmit={handleSubmit}>
                        <div className="add-section-title-v2">
                            <h2>بيانات الاشتراك</h2>
                        </div>

                        <div className="top-app-select-section">
                            <label>
                                التطبيق <span>*</span>
                            </label>

                            <div className="app-select-wrapper">
                                <button
                                    type="button"
                                    className="app-select-button"
                                    onClick={() =>
                                        setIsAppMenuOpen((previous) => !previous)
                                    }
                                >
                                    <div className="app-select-current">
                                        {selectedApp ? (
                                            <>
                                                <span className="app-select-logo">
                                                    {renderAppLogo(selectedApp, appName)}
                                                </span>
                                                <div>
                                                    <strong>{appName}</strong>
                                                    <p>{selectedApp?.category}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="app-select-placeholder">
                                                <span className="app-select-logo app-select-logo-empty">＋</span>
                                                <div>
                                                    <strong>اختر التطبيق</strong>
                                                    <p>انقر لاختيار الاشتراك</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <span
                                        className={
                                            isAppMenuOpen
                                                ? "app-select-arrow open"
                                                : "app-select-arrow"
                                        }
                                    >
                                        ▾
                                    </span>
                                </button>

                                {isAppMenuOpen && (
                                    <div className="app-select-menu">
                                        {appOptions.map((app) => (
                                            <button
                                                type="button"
                                                key={app.id}
                                                className={
                                                    formData.selectedAppId === app.id
                                                        ? "app-select-option active"
                                                        : "app-select-option"
                                                }
                                                onClick={() => handleAppChange(app.id)}
                                            >
                                                <span className="app-select-option-logo">
                                                    {renderAppLogo(app)}
                                                </span>

                                                <div>
                                                    <strong>{app.name}</strong>
                                                    <p>{app.category}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="add-form-content-v2 add-form-content-after-app">
                            {formData.selectedAppId === "other" && (
                                <>
                                    <div className="add-field-v2 full">
                                        <label>
                                            اسم التطبيق <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="اكتب اسم التطبيق"
                                            value={formData.customAppName}
                                            onChange={(event) =>
                                                updateField(
                                                    "customAppName",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="add-field-v2 full">
                                        <label>
                                            رابط إلغاء الاشتراك{" "}
                                            <span className="optional-label">
                                                (اختياري)
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="example.com/cancel"
                                            value={formData.cancelUrl}
                                            onChange={(event) =>
                                                updateField(
                                                    "cancelUrl",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            <div className="add-field-v2">
                                <label>
                                    التصنيف <span>*</span>
                                </label>

                                <select
                                    value={formData.category}
                                    disabled={formData.selectedAppId !== "other"}
                                    onChange={(event) =>
                                        updateField("category", event.target.value)
                                    }
                                >
                                    {categoryOptions.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="add-field-v2">
                                <label>
                                    السعر <span>*</span>
                                </label>

                                <div className="price-input-wrapper">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(event) =>
                                            updateField("price", event.target.value)
                                        }
                                    />

                                    <span>ريال</span>
                                </div>
                            </div>

                            <div className="add-field-v2">
                                <label>
                                    مدة الاشتراك <span>*</span>
                                </label>

                                <select
                                    value={formData.subscriptionDuration}
                                    onChange={(event) =>
                                        updateField(
                                            "subscriptionDuration",
                                            event.target.value as SubscriptionDuration,
                                        )
                                    }
                                >
                                    <option value="أسبوعي">أسبوعي</option>
                                    <option value="شهري">شهري</option>
                                    <option value="3 أشهر">3 أشهر</option>
                                    <option value="6 أشهر">6 أشهر</option>
                                    <option value="سنة">سنة</option>
                                </select>
                            </div>

                            <div className="add-field-v2">
                                <label>
                                    تاريخ الاشتراك <span>*</span>
                                </label>

                                <div className="arabic-calendar-field">
                                    <button
                                        type="button"
                                        className={`arabic-calendar-display ${
                                            formData.renewalDate ? "has-value" : ""
                                        }`}
                                        onClick={() => {
                                            const input =
                                                renewalDateInputRef.current as
                                                    | (HTMLInputElement & {
                                                          showPicker?: () => void;
                                                      })
                                                    | null;

                                            input?.showPicker?.();
                                            input?.focus();
                                        }}
                                    >
                                        <span>
                                            {formatArabicDateDisplay(
                                                formData.renewalDate,
                                            )}
                                        </span>

                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M7 3V6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M17 3V6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M4 9H20"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V18C20 19.6569 18.6569 21 17 21H7C5.34315 21 4 19.6569 4 18V7.5C4 6.11929 5.11929 5 6.5 5Z"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            />
                                        </svg>
                                    </button>

                                    <input
                                        ref={renewalDateInputRef}
                                        type="date"
                                        className="hidden-native-date-input"
                                        value={formData.renewalDate}
                                        onChange={(event) =>
                                            updateField(
                                                "renewalDate",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="add-field-v2">
                                <label>
                                    الحالة <span>*</span>
                                </label>

                                <select
                                    value={formData.status}
                                    onChange={(event) =>
                                        updateField(
                                            "status",
                                            event.target.value as SubscriptionStatus,
                                        )
                                    }
                                >
                                    <option value="نشط">نشط</option>
                                    <option value="غير نشط">غير نشط</option>
                                </select>
                            </div>

                            <div className="add-field-v2">
                                <label>
                                    التذكير قبل التجديد <span>*</span>
                                </label>

                                <select
                                    value={formData.reminderPreference}
                                    onChange={(event) =>
                                        handleReminderPreferenceChange(
                                            event.target.value as ReminderPreference,
                                        )
                                    }
                                >
                                    {reminderOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="add-field-v2 full">
                                <label>ملاحظات اختيارية</label>

                                <textarea
                                    placeholder="أضف أي ملاحظات حول هذا الاشتراك..."
                                    value={formData.notes}
                                    onChange={(event) =>
                                        updateField("notes", event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="add-form-actions-v2">
                            <button
                                type="submit"
                                className="save-subscription-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? "جاري الحفظ..." : "حفظ الاشتراك"}
                                <span>+</span>
                            </button>

                            <button
                                type="button"
                                className="cancel-subscription-btn"
                                onClick={goToSubscriptions}
                                disabled={isLoading}
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </section>
            </main>

            {isReminderConfirmOpen && (
                <div className="edit-modal-overlay" role="dialog" aria-modal="true">
                    <div className="edit-modal-card compact-confirm-card add-reminder-confirm-modal">
                        <div className="edit-modal-header">
                            <div>
                                <h2>إيقاف التذكير</h2>
                                <p>
                                    هل أنت متأكد من إيقاف التذكير لهذا الاشتراك؟ لن
                                    تصلك تذكيرات قبل موعد التجديد في حال تمت الموافقة.
                                </p>
                            </div>
                        </div>

                        <div className="edit-modal-actions confirm-actions">
                            <button
                                type="button"
                                className="edit-save-btn"
                                onClick={() => {
                                    updateField(
                                        "reminderPreference",
                                        "إيقاف التذكير",
                                    );

                                    setIsReminderConfirmOpen(false);
                                }}
                            >
                                نعم، إيقاف التذكير
                            </button>

                            <button
                                type="button"
                                className="edit-cancel-btn"
                                onClick={() => setIsReminderConfirmOpen(false)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer goToHome={goToHome} goToSubscriptions={goToSubscriptions} />
        </div>
    );
}

export default AddSubscription;
