import { useEffect, useMemo, useState } from "react";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import Footer from "../components/Footer";
import {
    type BackendSubscription,
    getSubscriptions,
} from "../services/subscriptionService";
 
type SubscriptionsProps = {
    onLogout: () => void;
    goToHome: () => void;
    goToSubscriptions: () => void;
    goToAddSubscription: () => void;
    goToSubscriptionDetails: (id: number) => void;
};

type ViewMode = "cards" | "list";

const categories = ["الكل", "العمل", "الترفيه", "الصحة", "التعليم", "أخرى"];

const arabicMonthOptions = [
    { value: "01", label: "يناير" },
    { value: "02", label: "فبراير" },
    { value: "03", label: "مارس" },
    { value: "04", label: "أبريل" },
    { value: "05", label: "مايو" },
    { value: "06", label: "يونيو" },
    { value: "07", label: "يوليو" },
    { value: "08", label: "أغسطس" },
    { value: "09", label: "سبتمبر" },
    { value: "10", label: "أكتوبر" },
    { value: "11", label: "نوفمبر" },
    { value: "12", label: "ديسمبر" },
];

const yearOptions = ["2024", "2025", "2026", "2027", "2028"];

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

const normalizeText = (value?: string | null) => {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ");
};

const normalizeCategory = (value?: string | null) => {
    const normalized = normalizeText(value);

    if (normalized === "ترفيه" || normalized === "الترفيه") return "الترفيه";
    if (normalized === "عمل" || normalized === "العمل") return "العمل";
    if (normalized === "صحه" || normalized === "الصحه") return "الصحة";
    if (normalized === "تعليم" || normalized === "التعليم") return "التعليم";
    if (normalized === "اخرى" || normalized === "الأخرى") return "أخرى";

    return value || "أخرى";
};

const formatBillingCycle = (cycle: BackendSubscription["billingCycle"]) => {
    if (cycle === "weekly") return "أسبوعي";
    if (cycle === "monthly") return "شهري";
    if (cycle === "quarterly") return "كل 3 شهور";
    if (cycle === "semi_annual") return "كل 6 شهور";
    return "سنوي";
};

const formatStatus = (status: BackendSubscription["status"]) => {
    return status === "active" ? "نشط" : "غير نشط";
};

const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    const month = arabicMonthOptions[parsedDate.getMonth()]?.label ?? "";
    return `${parsedDate.getDate()} ${month} ${parsedDate.getFullYear()}`;
};

const formatMonthYearFilter = (month: string, year: string) => {
    if (!month && !year) return "تاريخ الاشتراك";
    if (!month) return `كل الأشهر ${year}`;
    if (!year) {
        const monthLabel = arabicMonthOptions.find((item) => item.value === month)?.label ?? "";
        return `${monthLabel} كل السنوات`;
    }

    const monthLabel = arabicMonthOptions.find((item) => item.value === month)?.label ?? "";
    return `${monthLabel} ${year}`;
};

function Subscriptions({
    onLogout,
    goToHome,
    goToSubscriptions,
    goToAddSubscription,
    goToSubscriptionDetails,
}: SubscriptionsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("الكل");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("cards");

    const [subscriptionsData, setSubscriptionsData] = useState<BackendSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [hadSubscriptionsBefore, setHadSubscriptionsBefore] = useState<boolean>(() => {
        return sessionStorage.getItem("dierha_had_subs") === "true";
    });

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                setLoading(true);

                const data = await getSubscriptions();
                const result = Array.isArray(data) ? data : [];

                setSubscriptionsData(result);
                
                if (result.length > 0) {
                    sessionStorage.setItem("dierha_had_subs", "true");
                    setHadSubscriptionsBefore(true);
                }
            } catch (err) {
                console.warn("Subscriptions API request failed.", err);
            } finally {
                setLoading(false);
            }
        };

        loadSubscriptions();
    }, []);

    const filteredSubscriptionsData = useMemo(() => {
        const normalizedSearch = normalizeText(debouncedSearchTerm);
        const normalizedActiveCategory = normalizeCategory(activeCategory);

        return subscriptionsData.filter((item) => {
            const itemCategory = normalizeCategory(item.category?.name ?? "أخرى");

            const categoryMatches =
                normalizedActiveCategory === "الكل" ||
                itemCategory === normalizedActiveCategory;

            const searchableText = normalizeText(
                [
                    item.name,
                    item.provider?.name,
                    item.category?.name,
                    item.notes,
                ]
                    .filter(Boolean)
                    .join(" ")
            );

            const searchMatches =
                !normalizedSearch || searchableText.includes(normalizedSearch);

            if (!categoryMatches || !searchMatches) return false;

            if (!selectedMonth && !selectedYear) return true;

            const subscriptionDateValue = item.startDate || item.renewalDate;

            if (!subscriptionDateValue) return false;

            const subscriptionDate = new Date(subscriptionDateValue);

            if (Number.isNaN(subscriptionDate.getTime())) return false;

            const itemMonth = String(subscriptionDate.getMonth() + 1).padStart(2, "0");
            const itemYear = String(subscriptionDate.getFullYear());

            const monthMatches = selectedMonth ? itemMonth === selectedMonth : true;
            const yearMatches = selectedYear ? itemYear === selectedYear : true;

            return monthMatches && yearMatches;
        });
    }, [
        subscriptionsData,
        debouncedSearchTerm,
        activeCategory,
        selectedMonth,
        selectedYear,
    ]);

    const handleDetailsClick = (id: number) => {
        goToSubscriptionDetails(id);
    };

    const handleSelectMonth = (month: string) => {
        setSelectedMonth(month);
        if (!selectedYear) {
            setSelectedYear(String(new Date().getFullYear()));
        }
        setIsMonthPickerOpen(false);
    };

    const handleClearAllFilters = () => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setActiveCategory("الكل");
        setSelectedMonth("");
        setSelectedYear("");
        setIsMonthPickerOpen(false);
        setIsCategoryPickerOpen(false);
    };

    const renderSubscriptionLogo = (item: BackendSubscription) => {
        const localLogoFileName = logoFileNameMap[item.provider?.name || item.name];
        const localLogoPath = getLogoPath(localLogoFileName);
        const providerLogoPath = getLogoPath(item.provider?.logoUrl || undefined);

        if (localLogoPath) {
            return <img src={localLogoPath} alt={`${item.name} logo`} />;
        }

        if (providerLogoPath) {
            return <img src={providerLogoPath} alt={`${item.name} logo`} />;
        }

        if (item.provider?.logoUrl) {
            return <img src={item.provider.logoUrl} alt={`${item.name} logo`} />;
        }

        return (
            <span className="default-app-logo-small">
                {item.name.charAt(0).toUpperCase()}
            </span>
        );
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
                {loading && (
                    <div className="dierha-page-loader">
                        <span className="dierha-page-loader-ring" aria-hidden="true" />
                        <strong className="dierha-page-loader-text">
                            جاري تحميل الاشتراكات...
                        </strong>
                    </div>
                )}

                {!loading && (
                    <>
                        <section className="subscriptions-alt-hero">
                            <div className="subscriptions-alt-hero-content">
                                <h1>كل الاشتراكات في مكان واحد</h1>
                                <p>
                                    يمكن متابعة الاشتراكات، مواعيد التجديد، والمصروفات بطريقة واضحة
                                    ومنظمة حسب التصنيف.
                                </p>
                            </div>

                            <div className="subscriptions-alt-hero-actions">
                                <button type="button" onClick={goToAddSubscription}>
                                    إضافة اشتراك جديد
                                </button>
                            </div>
                        </section>

                        <section className="subscriptions-alt-toolbar subscriptions-alt-toolbar-balanced">
                            <div className="subscriptions-toolbar-layout">

                                <div className="subscriptions-search-area">
                                    <input
                                        type="text"
                                        placeholder="ابحث عن اشتراك..."
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                    />
                                </div>

                                <div className="month-year-filter-wrapper category-filter-wrapper">
                                    <button
                                        type="button"
                                        className={activeCategory !== "الكل" ? "month-year-filter-button has-value" : "month-year-filter-button"}
                                        onClick={() => {
                                            setIsCategoryPickerOpen((previous) => !previous);
                                            setIsMonthPickerOpen(false);
                                        }}
                                    >
                                        <span>{activeCategory === "الكل" ? "اختر التصنيف" : activeCategory}</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>

                                    {isCategoryPickerOpen && (
                                        <div className="month-year-picker-popover compact-filter-popover">
                                            <div className="month-grid category-grid">
                                                {categories.map((category) => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        className={activeCategory === category ? "active" : ""}
                                                        onClick={() => {
                                                            setActiveCategory(category);
                                                            setIsCategoryPickerOpen(false);
                                                        }}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="month-year-filter-wrapper date-filter-wrapper">
                                    <button
                                        type="button"
                                        className={selectedMonth || selectedYear ? "month-year-filter-button has-value" : "month-year-filter-button"}
                                        onClick={() => {
                                            setIsMonthPickerOpen((previous) => !previous);
                                            setIsCategoryPickerOpen(false);
                                        }}
                                    >
                                        <span>{formatMonthYearFilter(selectedMonth, selectedYear)}</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M4 9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V18C20 19.6569 18.6569 21 17 21H7C5.34315 21 4 19.6569 4 18V7.5C4 6.11929 5.11929 5 6.5 5Z" stroke="currentColor" strokeWidth="1.8" />
                                        </svg>
                                    </button>

                                    {isMonthPickerOpen && (
                                        <div className="month-year-picker-popover">
                                            <div className="month-year-picker-header">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedYear((previous) =>
                                                            String(Number(previous || new Date().getFullYear()) - 1)
                                                        )
                                                    }
                                                >
                                                    ‹
                                                </button>

                                                <select
                                                    value={selectedYear || String(new Date().getFullYear())}
                                                    onChange={(event) => setSelectedYear(event.target.value)}
                                                >
                                                    {yearOptions.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedYear((previous) =>
                                                            String(Number(previous || new Date().getFullYear()) + 1)
                                                        )
                                                    }
                                                >
                                                    ›
                                                </button>
                                            </div>

                                            <div className="month-grid">
                                                {arabicMonthOptions.map((month) => (
                                                    <button
                                                        key={month.value}
                                                        type="button"
                                                        className={selectedMonth === month.value ? "active" : ""}
                                                        onClick={() => handleSelectMonth(month.value)}
                                                    >
                                                        {month.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1 }} />

                                <button
                                    type="button"
                                    className="clear-all-filters-btn"
                                    onClick={handleClearAllFilters}
                                >
                                    إعادة تعيين الفلتر
                                </button>

                                <div className="view-mode-toggle" aria-label="طريقة عرض الاشتراكات">
                                    <button
                                        type="button"
                                        title="عرض كمربعات"
                                        onClick={() => setViewMode("cards")}
                                        className={viewMode === "cards" ? "active" : ""}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <rect x="4" y="4" width="6" height="6" rx="1.5" />
                                            <rect x="14" y="4" width="6" height="6" rx="1.5" />
                                            <rect x="4" y="14" width="6" height="6" rx="1.5" />
                                            <rect x="14" y="14" width="6" height="6" rx="1.5" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        title="عرض كشريط"
                                        onClick={() => setViewMode("list")}
                                        className={viewMode === "list" ? "active" : ""}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <rect x="4" y="6" width="3" height="3" rx="1" />
                                            <rect x="9" y="6" width="11" height="3" rx="1.5" />
                                            <rect x="4" y="11" width="3" height="3" rx="1" />
                                            <rect x="9" y="11" width="11" height="3" rx="1.5" />
                                            <rect x="4" y="16" width="3" height="3" rx="1" />
                                            <rect x="9" y="16" width="11" height="3" rx="1.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {viewMode === "cards" && (
                            <section className="subscriptions-cards-grid">
                                {filteredSubscriptionsData.length > 0 ? (
                                    filteredSubscriptionsData.map((item) => (
                                        <article className="subscription-card-v2" key={item.id}>
                                            <div className="subscription-card-v2-top">
                                                <div className="subscription-logo-box">
                                                    {renderSubscriptionLogo(item)}
                                                </div>

                                                <div>
                                                    <h3>{item.name}</h3>
                                                    <span>{item.category?.name ?? "أخرى"}</span>
                                                </div>
                                            </div>

                                            <p className="subscription-card-v2-desc">
                                                {item.notes || "لا توجد ملاحظات لهذا الاشتراك."}
                                            </p>

                                            <div className="subscription-card-v2-info">
                                                <div>
                                                    <span>السعر</span>
                                                    <strong>{Number(item.price).toFixed(2)} ريال</strong>
                                                </div>

                                                <div>
                                                    <span>الدفع</span>
                                                    <strong>{formatBillingCycle(item.billingCycle)}</strong>
                                                </div>
                                            </div>

                                            <div className="subscription-card-v2-renewal">
                                                <span>تاريخ الاشتراك</span>
                                                <strong>{formatDate(item.startDate || item.renewalDate)}</strong>
                                            </div>

                                            <div className="subscription-card-v2-footer">
                                                <span
                                                    className={
                                                        item.status === "active"
                                                            ? "status-badge"
                                                            : "status-badge inactive"
                                                    }
                                                >
                                                    {formatStatus(item.status)}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="arrow-details-btn"
                                                    onClick={() => handleDetailsClick(item.id)}
                                                    aria-label="فتح تفاصيل الاشتراك"
                                                    title="تفاصيل الاشتراك"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                        <path
                                                            d="M15 6L9 12L15 18"
                                                            stroke="currentColor"
                                                            strokeWidth="2.4"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="subscriptions-empty-card">
                                        {hadSubscriptionsBefore
                                            ? "لا توجد اشتراكات مطابقة للبحث أو التصنيف أو تاريخ الاشتراك المحدد."
                                            : "لا توجد اشتراكات مطابقة للبحث أو التصنيف أو تاريخ الاشتراك المحدد."}
                                    </div>
                                )}
                            </section>
                        )}

                        {viewMode === "list" && (
                            <section className="subscriptions-list-view">
                                {filteredSubscriptionsData.length > 0 ? (
                                    filteredSubscriptionsData.map((item) => (
                                        <article className="subscription-list-row" key={item.id}>
                                            <div className="subscription-list-main">
                                                <div className="subscription-logo-box list-logo">
                                                    {renderSubscriptionLogo(item)}
                                                </div>

                                                <div className="subscription-list-title">
                                                    <h3>{item.name}</h3>
                                                    <p>{item.notes || "لا توجد ملاحظات لهذا الاشتراك."}</p>
                                                </div>
                                            </div>

                                            <div className="subscription-list-details">
                                                <div>
                                                    <span>التصنيف</span>
                                                    <strong>{item.category?.name ?? "أخرى"}</strong>
                                                </div>

                                                <div>
                                                    <span>السعر</span>
                                                    <strong>{Number(item.price).toFixed(2)} ريال</strong>
                                                </div>

                                                <div>
                                                    <span>الدفع</span>
                                                    <strong>{formatBillingCycle(item.billingCycle)}</strong>
                                                </div>

                                                <div>
                                                    <span>تاريخ الاشتراك</span>
                                                    <strong>{formatDate(item.startDate || item.renewalDate)}</strong>
                                                </div>
                                            </div>

                                            <div className="subscription-list-actions">
                                                <span
                                                    className={
                                                        item.status === "active"
                                                            ? "status-badge"
                                                            : "status-badge inactive"
                                                    }
                                                >
                                                    {formatStatus(item.status)}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="arrow-details-btn"
                                                    onClick={() => handleDetailsClick(item.id)}
                                                    aria-label="فتح تفاصيل الاشتراك"
                                                    title="تفاصيل الاشتراك"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                        <path
                                                            d="M15 6L9 12L15 18"
                                                            stroke="currentColor"
                                                            strokeWidth="2.4"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="subscriptions-empty-card">
                                        {hadSubscriptionsBefore
                                            ? "لا توجد اشتراكات مطابقة للبحث أو التصنيف أو تاريخ الاشتراك المحدد."
                                            : "لا توجد اشتراكات مطابقة للبحث أو التصنيف أو تاريخ الاشتراك المحدد."}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </main>

            <Footer
                goToHome={goToHome}
                goToSubscriptions={goToSubscriptions}
                goToAddSubscription={goToAddSubscription}
            />
        </div>
    );
}

export default Subscriptions;

