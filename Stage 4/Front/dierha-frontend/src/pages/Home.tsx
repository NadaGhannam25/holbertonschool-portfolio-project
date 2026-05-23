import { useEffect, useMemo, useState } from "react";  
import logo from "../assets/dierha-logo.png";       
import Footer from "../components/Footer";  
import SettingsDropdown from "../components/SettingsDropdown";   
import {     
    type BackendSubscription,   
    getCategoryAnalytics,    
    getMonthlyAnalytics, 
    getSubscriptions, 
    getUpcomingRenewals,
    exportSubscriptionsPdf,
} from "../services/subscriptionService";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis, 
    YAxis,
    PieChart,
    Pie,
    Cell,
} from "recharts";

type HomeProps = {
    onLogout: () => void;
    goToHome: () => void;
    goToSubscriptions: () => void;
    goToAddSubscription: () => void;
};

type MonthlyChartItem = {
    month: string;
    amount: number;
};

type ChartFilter = "monthly" | "yearly" | "categories";

type CategoryInsightItem = {
    title: string;
    amount: string;
    width: string;
    tone: "primary" | "pink" | "light";
};

type CategoryChartItem = {
    name: string;
    amount: number;
    color: string;
};

type UpcomingRenewalItem = {
    id: number;
    name: string;
    renewalDate: string;
    price: string;
};

const categoryChartColors = ["#1D47DA", "#F56F96", "#020B5C", "#8EC2F5", "#7A8194"];

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

const arabicWeekdays = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
];

const formatArabicDateParts = (dateValue: string | Date, includeWeekday = false) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "-";

    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    const weekday = arabicWeekdays[date.getDay()];

    return includeWeekday
        ? `${weekday}، ${day} ${month} ${year}`
        : `${day} ${month} ${year}`;
};

const formatDate = (date: string) => {
    return formatArabicDateParts(date);
};

const formatShortDate = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return `${parsedDate.getDate()} ${arabicMonths[parsedDate.getMonth()]}`;
};

const getDaysRemaining = (date: string) => {
    const today = new Date();
    const renewalDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    renewalDate.setHours(0, 0, 0, 0);

    const diffMs = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "اليوم";
    if (diffDays === 1) return "باقي يوم واحد";
    return `باقي ${diffDays} أيام`;
};

const getCurrentDateText = () => {
    return formatArabicDateParts(new Date(), true);
};

const getCurrentTimeText = () => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "مساءً" : "صباحًا";
    const hour12 = hours % 12 || 12;

    return `${String(hour12).padStart(2, "0")}:${minutes} ${period}`;
};

function Home({
    onLogout,
    goToHome,
    goToSubscriptions,
    goToAddSubscription,
}: HomeProps) {
    const [subscriptions, setSubscriptions] = useState<BackendSubscription[]>([]);
    const [monthlyTrend, setMonthlyTrend] = useState<MonthlyChartItem[]>([]);
    const [categoryInsights, setCategoryInsights] = useState<CategoryInsightItem[]>([]);
    const [categoryChartData, setCategoryChartData] = useState<CategoryChartItem[]>([]);
    const [renewals, setRenewals] = useState<UpcomingRenewalItem[]>([]);
    const [chartFilter, setChartFilter] = useState<ChartFilter>("monthly");
    const [loading, setLoading] = useState(true);
    const [pdfMessage, setPdfMessage] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const [
                    subscriptionsData,
                    monthlyData,
                    categoriesData,
                    upcomingData,
                ] = await Promise.all([
                    getSubscriptions(),
                    getMonthlyAnalytics(),
                    getCategoryAnalytics(),
                    getUpcomingRenewals(),
                ]);

                setSubscriptions(subscriptionsData);

                setMonthlyTrend(
                    monthlyData.map((item: any) => ({
                        month: item.month,
                        amount: Number(item.amount ?? item.totalAmount ?? 0),
                    }))
                );

                const maxCategoryAmount = Math.max(
                    ...categoriesData.map((item: any) =>
                        Number(item.amount ?? item.totalAmount ?? 0)
                    ),
                    1
                );

                const categoryItems = categoriesData.map((item: any, index: number) => {
                    const amount = Number(item.amount ?? item.totalAmount ?? 0);
                    const title =
                        item.category ??
                        item.categoryName ??
                        "أخرى";

                    const tones: CategoryInsightItem["tone"][] = [
                        "primary",
                        "pink",
                        "light",
                    ];

                    return {
                        title,
                        amount,
                        formattedAmount: `${amount.toFixed(2)} ريال`,
                        width: `${Math.max(
                            Math.round((amount / maxCategoryAmount) * 100),
                            8
                        )}%`,
                        tone: tones[index % tones.length],
                        color: categoryChartColors[index % categoryChartColors.length],
                    };
                });

                setCategoryInsights(
                    categoryItems.map((item) => ({
                        title: item.title,
                        amount: item.formattedAmount,
                        width: item.width,
                        tone: item.tone,
                    }))
                );

                setCategoryChartData(
                    categoryItems.map((item) => ({
                        name: item.title,
                        amount: item.amount,
                        color: item.color,
                    }))
                );

                setRenewals(
                    upcomingData
                        .filter((item: any) => item.status === "active")
                        .map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            renewalDate: item.renewalDate,
                            price: item.price,
                        }))
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const activeSubscriptions = useMemo(() => {
        return subscriptions.filter((item) => item.status === "active");
    }, [subscriptions]);

    const currentMonthlyAmount = useMemo(() => {
        if (monthlyTrend.length === 0) return 0;
        return monthlyTrend[monthlyTrend.length - 1]?.amount ?? 0;
    }, [monthlyTrend]);

    const monthlyChartData = useMemo(() => {
        return monthlyTrend.length > 0 ? monthlyTrend.slice(-6) : [];
    }, [monthlyTrend]);

    const yearlyChartData = useMemo(() => {
        if (monthlyTrend.length === 0) return [];

        const grouped = monthlyTrend.reduce<Record<string, number>>((acc, item) => {
            const parsed = new Date(item.month);
            const year = Number.isNaN(parsed.getTime())
                ? String(new Date().getFullYear())
                : String(parsed.getFullYear());

            acc[year] = (acc[year] || 0) + Number(item.amount || 0);
            return acc;
        }, {});

        return Object.entries(grouped).map(([year, amount]) => ({
            month: year,
            amount: amount,
        }));
    }, [monthlyTrend]);

    const activeLineChartData = chartFilter === "yearly" ? yearlyChartData : monthlyChartData;

    const fallbackCategoryChartData = useMemo(() => {
        const grouped = subscriptions.reduce<Record<string, number>>((acc, item) => {
            const categoryName = item.category?.name ?? "أخرى";
            acc[categoryName] = (acc[categoryName] || 0) + Number(item.price || 0);
            return acc;
        }, {});

        return Object.entries(grouped).map(([name, amount], index) => ({
            name,
            amount,
            color: categoryChartColors[index % categoryChartColors.length],
        }));
    }, [subscriptions]);

    const visibleCategoryChartData = categoryChartData.length > 0
        ? categoryChartData
        : fallbackCategoryChartData;

    const totalCategoryAmount = useMemo(() => {
        return visibleCategoryChartData.reduce((sum, item) => sum + item.amount, 0);
    }, [visibleCategoryChartData]);

    const nearestRenewal = useMemo(() => {
        if (renewals.length > 0) {
            return renewals[0];
        }

        return activeSubscriptions
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.renewalDate).getTime() -
                    new Date(b.renewalDate).getTime()
            )[0];
    }, [renewals, activeSubscriptions]);

    const tableSubscriptions = useMemo(() => {
        return subscriptions;
    }, [subscriptions]);

    if (loading) {
        return (
            <div className="home-page">
                <main className="dashboard-wrapper">
                    <div className="loading-state-card">
                        <span className="loading-spinner" />
                        <strong>جاري تحميل بيانات الصفحة الرئيسية...</strong>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="home-page">
            <header className="top-navigation">
                <div className="nav-brand">
                    <img src={logo} alt="Dierha Logo" />
                </div>

                <nav className="nav-menu" aria-label="Main navigation">
                    <button type="button" className="nav-link active" onClick={goToHome}>
                        الرئيسية
                    </button>

                    <button type="button" className="nav-link" onClick={goToSubscriptions}>
                        الاشتراكات
                    </button>
                </nav>

                <div className="nav-user-area">
                    <SettingsDropdown onLogout={onLogout} />
                </div>
            </header>

            <main className="dashboard-wrapper">
                <section className="overview-strip">
                    <div className="overview-date-card">
                        <span className="card-label light-label">اليوم</span>
                        <h2>{getCurrentDateText()}</h2>
                        <p>آخر تحديث للبيانات</p>
                        <strong>{getCurrentTimeText()}</strong>
                    </div>

                    <div className="overview-chart-card">
                        <div className="card-top">
                            <div>
                                <h2 className="section-blue-title">تحليل المصروفات</h2>
                            </div>

                            <div className="chart-filter-actions">
                                <select
                                    value={chartFilter}
                                    onChange={(event) => setChartFilter(event.target.value as ChartFilter)}
                                    aria-label="تصفية الرسم البياني"
                                >
                                    <option value="monthly">شهري</option>
                                    <option value="yearly">سنوي</option>
                                    <option value="categories">تصنيفات</option>
                                </select>
                            </div>
                        </div>

                        <div className={chartFilter === "categories" ? "recharts-wrapper-card category-pie-wrapper" : "recharts-wrapper-card"}>
                            {chartFilter === "categories" ? (
                                visibleCategoryChartData.length > 0 ? (
                                    <div className="category-pie-layout">
                                        <div className="category-pie-chart">
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={visibleCategoryChartData}
                                                        dataKey="amount"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={38}
                                                        outerRadius={96}
                                                        paddingAngle={2}
                                                        label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
                                                        labelLine={false}
                                                    >
                                                        {visibleCategoryChartData.map((item) => (
                                                            <Cell key={item.name} fill={item.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => [`${Number(value).toFixed(2)} ريال`, "المصروف"]}
                                                        contentStyle={{
                                                            border: "1px solid #E7ECF6",
                                                            borderRadius: "14px",
                                                            boxShadow: "0 8px 22px rgba(2, 11, 92, 0.08)",
                                                            fontFamily: "inherit",
                                                            direction: "rtl",
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="category-pie-legend">
                                            {visibleCategoryChartData.map((item) => {
                                                const percent = totalCategoryAmount
                                                    ? Math.round((item.amount / totalCategoryAmount) * 100)
                                                    : 0;

                                                return (
                                                    <div className="category-pie-legend-item" key={item.name}>
                                                        <span
                                                            className="category-pie-legend-color"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                        <span>{item.name}</span>
                                                        <strong>{percent}%</strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="subscriptions-empty-card">لا توجد بيانات تصنيفات حتى الآن.</div>
                                )
                            ) : (
                                <ResponsiveContainer width="100%" height={230}>
                                    <AreaChart
                                        data={activeLineChartData}
                                        margin={{ top: 18, right: 8, left: 8, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="monthlySpendGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop offset="0%" stopColor="#1D47DA" stopOpacity={0.25} />
                                                <stop offset="100%" stopColor="#1D47DA" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            stroke="#E7ECF6"
                                            strokeDasharray="5 6"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#667085",
                                                fontSize: 12,
                                                fontWeight: 700,
                                            }}
                                        />

                                        <YAxis hide domain={[0, "dataMax + 40"]} />

                                        <Tooltip
                                            contentStyle={{
                                                border: "1px solid #E7ECF6",
                                                borderRadius: "14px",
                                                boxShadow: "0 8px 22px rgba(2, 11, 92, 0.08)",
                                                fontFamily: "inherit",
                                                direction: "rtl",
                                            }}
                                            formatter={(value) => [`${value} ريال`, "المصروف"]}
                                            labelFormatter={(label) => `الفترة: ${label}`}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#1D47DA"
                                            strokeWidth={4}
                                            fill="url(#monthlySpendGradient)"
                                            dot={{
                                                r: 5,
                                                fill: "#FFFFFF",
                                                stroke: "#1D47DA",
                                                strokeWidth: 2,
                                            }}
                                            activeDot={{
                                                r: 7,
                                                fill: "#F56F96",
                                                stroke: "#FFFFFF",
                                                strokeWidth: 3,
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="overview-analysis-card">
                        <div className="card-top">
                            <h2 className="section-blue-title">أعلى التصنيفات</h2>
                        </div>

                        <div className="analysis-list">
                            {categoryInsights.length > 0 ? (
                                categoryInsights.map((item) => (
                                    <div className="analysis-item" key={item.title}>
                                        <div className="analysis-head">
                                            <span>{item.title}</span>
                                            <strong>{item.amount}</strong>
                                        </div>

                                        <div className="analysis-bar-track">
                                            <div
                                                className={`analysis-bar-fill ${item.tone}`}
                                                style={{ width: item.width }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="subscriptions-empty-card">
                                    لا توجد بيانات تصنيفات حتى الآن.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="metrics-section">
                    <div className="metric-card">
                        <span>إجمالي الاشتراكات</span>
                        <strong>{subscriptions.length}</strong>
                        <p>كل الاشتراكات المسجلة</p>
                    </div>

                    <div className="metric-card">
                        <span>المصروف الشهري</span>
                        <strong>{currentMonthlyAmount.toFixed(2)} ريال</strong>
                        <p>إجمالي الصرف حسب آخر شهر</p>
                    </div>

                    <div className="metric-card">
                        <span>أقرب تجديد</span>
                        <strong>
                            {nearestRenewal
                                ? formatShortDate(nearestRenewal.renewalDate)
                                : "-"}
                        </strong>
                        <p>
                            {nearestRenewal
                                ? `${nearestRenewal.name} - ${getDaysRemaining(nearestRenewal.renewalDate)}`
                                : "لا توجد تجديدات قادمة"}
                        </p>
                    </div>

                    <div className="metric-card">
                        <span>الاشتراكات النشطة</span>
                        <strong>{activeSubscriptions.length}</strong>
                        <p>اشتراكات حالتها نشطة</p>
                    </div>
                </section>

                <section className="dashboard-grid home-main-clean">
                    <div className="main-column">
                        <div className="main-panel">
                            <div className="panel-title home-subscriptions-table-title">
                                <div>
                                    <h2 className="section-blue-title">
                                     جدول الاشتراكات
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="export-pdf-btn home-table-export-btn"
                                    aria-label="تصدير جدول الاشتراكات بصيغة PDF"
                                    onClick={async () => {
                                        if (tableSubscriptions.length === 0) {
                                            setPdfMessage("لا توجد اشتراكات لتصديرها حاليًا.");
                                            return;
                                        }

                                        try {
                                            await exportSubscriptionsPdf();
                                        } catch (error) {
                                            console.error(error);
                                            setPdfMessage("تعذر تصدير ملف PDF حاليًا.");
                                        }
                                    }}
                                >
                                     تصدير PDF
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table className="subscriptions-table">
                                    <thead>
                                        <tr>
                                            <th>الخدمة</th>
                                            <th>التصنيف</th>
                                            <th>السعر</th>
                                            <th>دورة الدفع</th>
                                            <th>تاريخ التجديد</th>
                                            <th>الحالة</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tableSubscriptions.length > 0 ? (
                                            tableSubscriptions.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="service-cell">
                                                            <div className="service-icon">
                                                                {item.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <strong>{item.name}</strong>
                                                        </div>
                                                    </td>

                                                    <td>{item.category?.name ?? "أخرى"}</td>
                                                    <td className="price-cell">
                                                        {Number(item.price).toFixed(2)} ريال
                                                    </td>
                                                    <td>{formatBillingCycle(item.billingCycle)}</td>
                                                    <td>{formatDate(item.renewalDate)}</td>

                                                    <td>
                                                        <span
                                                            className={
                                                                item.status === "active"
                                                                    ? "status-badge"
                                                                    : "status-badge inactive"
                                                            }
                                                        >
                                                            {formatStatus(item.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6}>لا توجد اشتراكات حتى الآن.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <aside className="side-column">
                        <div className="side-panel">
                            <div className="panel-title no-action">
                                <h2 className="section-blue-title">التجديدات القادمة</h2>
                            </div>

                            <div className="renewal-list">
                                {renewals.length > 0 ? (
                                    renewals.map((item) => (
                                        <div className="renewal-item" key={item.id}>
                                            <div className="renewal-info">
                                                <h3>{item.name}</h3>
                                                <p>{formatDate(item.renewalDate)}</p>
                                            </div>

                                            <div className="renewal-meta">
                                                <strong>{Number(item.price).toFixed(2)} ريال</strong>
                                                <span>{getDaysRemaining(item.renewalDate)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="subscriptions-empty-card">
                                        لا توجد تجديدات قادمة خلال 7 أيام.
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </section>
            </main>

            {pdfMessage && (
                <div className="edit-modal-overlay" role="dialog" aria-modal="true">
                    <div className="edit-modal-card compact-confirm-card pdf-info-modal">
                        <div className="edit-modal-header">
                            <div>
                                <h2>تصدير PDF</h2>
                                <p>{pdfMessage}</p>
                            </div>
                        </div>

                        <div className="edit-modal-actions confirm-actions single-action">
                            <button
                                type="button"
                                className="edit-save-btn"
                                onClick={() => setPdfMessage("")}
                            >
                                حسناً
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer goToHome={goToHome} goToSubscriptions={goToSubscriptions} goToAddSubscription={goToAddSubscription} />
        </div>
    );
}

export default Home;
