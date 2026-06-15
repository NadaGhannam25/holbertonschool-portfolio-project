import { useState } from "react";

import "./DierhaLanding.css";

import dierhaLogo from "./assets/dierha-logo.png";
import netflixLogo from "./assets/netflix.png";
import spotifyLogo from "./assets/spotify.png";
import canvaLogo from "./assets/canva.png";
import adobeLogo from "./assets/adobe-creative-cloud.png";
import heroWoman from "./assets/hero-woman.png";
import nadaPhoto from "./assets/nada.png";
import shadenPhoto from "./assets/shaden.png";
import sondosPhoto from "./assets/sondos.png";
import rahafPhoto from "./assets/rahaf.jpg";
import renadPhoto from "./assets/renad.png";

type Feature = {
    title: string;
    description: string;
    icon: string;
    tone: "blue" | "pink" | "purple" | "navy";
};

type TeamMember = {
    name: string;
    major: string;
    description: string;
    tags: string[];
    image: string;
    imageClass?: string;
    linkedin: string;
    github: string;
};

const features: Feature[] = [
    {
        title: "لوحة تحكم موحدة",
        description: "جميع اشتراكاتك في مكان واحد لمتابعة أسهل وأسرع.",
        icon: "dashboard",
        tone: "blue",
    },
    {
        title: "تنبيهات قبل التجديد",
        description: "لن تفاجئك أي عملية تجديد بعد الآن.",
        icon: "bell",
        tone: "pink",
    },
    {
        title: "تحليل المصروفات",
        description: "تقارير شهرية ورسوم واضحة لفهم إنفاقك.",
        icon: "chart",
        tone: "purple",
    },
    {
        title: "خصوصية أعلى",
        description: "بياناتك آمنة ولا تحتاجين لربط حسابك البنكي.",
        icon: "shield",
        tone: "navy",
    },
];

const steps = [
    {
        number: "01",
        title: "أضيفي اشتراكاتك",
        description: "أضيف الخدمة والمبلغ وتاريخ التجديد.",
    },
    {
        number: "02",
        title: "نراقب وننبهك",
        description: "تنبيهات قبل التجديد لتبقى بالصورة.",
    },
    {
        number: "03",
        title: "حلل ووفر",
        description: "اكتشف فرص التوفير وافهم صرفك.",
    },
    {
        number: "04",
        title: "تحكم بذكاء",
        description: "اتخذ قرارات مالية أفضل بهدوء.",
    },
];

const team: TeamMember[] = [
    {
        name: "ندى المطيري",
        major: "نظم معلومات",
        description:
            "تصميم تجربة المستخدم وربط الواجهة بفكرة المنتج واحتياج المستخدم.",
        tags: ["Product", "Frontend", "UX/UI"],
        image: nadaPhoto,
        linkedin: "https://www.linkedin.com/in/nada-al-mutairi-77102325b",
        github: "https://github.com/NadaGhannam25",
    },
    {
        name: "شادن العلواني",
        major: "علوم اقتصاد مالي",
        description:
            "تحليل الجانب المالي وتحويل بيانات الاشتراكات إلى قرارات واضحة.",
        tags: ["Finance", "Backend", "Analysis"],
        image: shadenPhoto,
        imageClass: "dl-team-photo-cover dl-team-photo-zoom-shaden",
        linkedin: "https://www.linkedin.com/in/shadenal-alwani/?locale=en",
        github: "https://github.com/Shadenm-404",
    },
    {
        name: "سندس الربيش",
        major: "هندسة كهربائية واتصالات",
        description:
            "دعم بناء الأنظمة واختبار التجربة وتدفق البيانات بشكل موثوق.",
        tags: ["DB", "Backend", "Testing"],
        image: sondosPhoto,
        imageClass: "dl-team-photo-cover dl-team-photo-zoom-sondos",
        linkedin: "https://www.linkedin.com/in/sondosalrubaish/",
        github: "https://github.com/sondos04",
    },
    {
        name: "رهف الحارثي",
        major: "كيمياء",
        description:
            "البحث والتوثيق وتنظيم تفاصيل المشروع وصياغة المحتوى بدقة.",
        tags: ["Research", "Frontend", "UX/UI"],
        image: rahafPhoto,
        linkedin: "https://www.linkedin.com/in/rahaf-alharthi-573531354/",
        github: "https://github.com/rahafalharthi1111-png",
    },
    {
        name: "ريناد الزعيبر",
        major: "علوم حاسب",
        description:
            "بناء قاعدة البيانات وربط الخدمات التقنية وتحسين منطق النظام.",
        tags: ["Frontend", "UX/UI", "Testing"],
        image: renadPhoto,
        linkedin: "https://www.linkedin.com/in/rinad-fahad-735a3830a",
        github: "https://github.com/Rinadfahadz",
    },
];

const subscriptions = [
    {
        name: "Netflix",
        category: "ترفيه",
        price: "95 ر.س",
        date: "15 مايو",
        logo: netflixLogo,
    },
    {
        name: "Spotify",
        category: "موسيقى",
        price: "27 ر.س",
        date: "20 مايو",
        logo: spotifyLogo,
    },
    {
        name: "Canva Pro",
        category: "تصميم",
        price: "39 ر.س",
        date: "24 مايو",
        logo: canvaLogo,
    },
    {
        name: "Adobe",
        category: "أدوات تصميم",
        price: "198 ر.س",
        date: "28 مايو",
        logo: adobeLogo,
    },
];

function BellIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M18 8A6 6 0 0 0 6 8C6 15 3 15 3 17H21C21 15 18 15 18 8Z"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10 21C10.3 21.6 11 22 12 22C13 22 13.7 21.6 14 21"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <circle
                cx="12"
                cy="12"
                r="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
    );
}

function FeatureIcon({ type }: { type: string }) {
    switch (type) {
        case "dashboard":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                        x="3.5"
                        y="3.5"
                        width="6.5"
                        height="6.5"
                        rx="1.8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    />
                    <rect
                        x="14"
                        y="3.5"
                        width="6.5"
                        height="6.5"
                        rx="1.8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    />
                    <rect
                        x="3.5"
                        y="14"
                        width="6.5"
                        height="6.5"
                        rx="1.8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    />
                    <rect
                        x="14"
                        y="14"
                        width="6.5"
                        height="6.5"
                        rx="1.8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    />
                </svg>
            );

        case "bell":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M18 9A6 6 0 0 0 6 9C6 14.2 4 15.8 3.5 17.5H20.5C20 15.8 18 14.2 18 9Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9.8 20H14.2"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "chart":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M4 19V14"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M10 19V10"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M16 19V6"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                    <path
                        d="M3 19.5H21"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "shield":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M12 3.5L19 6.5V11.2C19 15.5 16.3 18.9 12 21C7.7 18.9 5 15.5 5 11.2V6.5L12 3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9.3 12.2L11.2 14.1L15 10.3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );

        default:
            return null;
    }
}


function LinkedInIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M6.5 8.4H3.2V20.8H6.5V8.4ZM4.9 3.2C3.8 3.2 3 4 3 5C3 6.1 3.8 6.9 4.9 6.9C6 6.9 6.8 6.1 6.8 5C6.8 4 6 3.2 4.9 3.2ZM13 8.4H9.8V20.8H13V14.7C13 13.1 13.3 11.5 15.3 11.5C17.2 11.5 17.2 13.3 17.2 14.8V20.8H20.5V14C20.5 10.7 19.8 8.1 15.9 8.1C14.1 8.1 12.9 9.1 12.4 10H12.3V8.4H13Z"
            />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 2.5C6.5 2.5 2 7 2 12.6C2 17 4.9 20.7 8.9 22C9.4 22.1 9.6 21.8 9.6 21.5V19.6C6.8 20.2 6.2 18.4 6.2 18.4C5.7 17.2 5.1 16.9 5.1 16.9C4.2 16.3 5.2 16.3 5.2 16.3C6.2 16.4 6.7 17.3 6.7 17.3C7.6 18.8 9 18.4 9.6 18.1C9.7 17.5 10 17 10.3 16.8C8.1 16.5 5.8 15.7 5.8 11.8C5.8 10.7 6.2 9.8 6.8 9.1C6.7 8.8 6.4 7.8 6.9 6.4C6.9 6.4 7.7 6.1 9.6 7.4C10.4 7.2 11.2 7.1 12 7.1C12.8 7.1 13.6 7.2 14.4 7.4C16.3 6.1 17.1 6.4 17.1 6.4C17.6 7.8 17.3 8.8 17.2 9.1C17.8 9.8 18.2 10.7 18.2 11.8C18.2 15.7 15.9 16.5 13.7 16.8C14.1 17.1 14.4 17.7 14.4 18.6V21.5C14.4 21.8 14.6 22.1 15.1 22C19.1 20.7 22 17 22 12.6C22 7 17.5 2.5 12 2.5Z"
            />
        </svg>
    );
}

function DashboardPreview() {
    return (
        <div className="dl-preview-wrap" aria-label="معاينة لوحة تحكم ديرها">
            <div className="dl-credit-card" aria-hidden="true">
                <span className="dl-chip" />
                <strong>ديرها</strong>
                <span className="dl-card-dots">••••</span>
                <small>4548</small>
                <span className="dl-valid-date">
                    VALID THRU
                    <br />
                    06/28
                </span>
            </div>

            <div className="dl-dashboard-card">
                <div
                    className="dl-hero-bell"
                    aria-hidden="true"
                >
                    <BellIcon />
                </div>

                <aside className="dl-dashboard-sidebar">
                    <span className="dl-sidebar-spacer" />
                    <span className="active">الرئيسية</span>
                    <span>اشتراكاتي</span>
                </aside>

                <div className="dl-dashboard-content">
                    <div className="dl-dashboard-heading">
                        <div>
                            <strong>أهلاً لين</strong>
                            <small>إجمالي مصاريف الشهر الحالي</small>
                        </div>
                    </div>

                    <div className="dl-dashboard-metrics">
                        <div>
                            <span>إجمالي المصروفات</span>
                            <b>386</b>
                            <small>ريال هذا الشهر</small>
                        </div>
                        <div>
                            <span>اشتراكات نشطة</span>
                            <b>8</b>
                            <small>اشتراكات</small>
                        </div>
                        <div>
                            <span>القادم للتجديد</span>
                            <b>1,248</b>
                            <small>ريال خلال الشهر</small>
                        </div>
                    </div>

                    <div className="dl-subscriptions-heading">
                        <strong>اشتراكاتي</strong>
                        <span>عرض الكل</span>
                    </div>

                    <div className="dl-subscriptions-list">
                        {subscriptions.map((subscription) => (
                            <div
                                className="dl-subscription-row"
                                key={subscription.name}
                            >
                                <img
                                    src={subscription.logo}
                                    alt={subscription.name}
                                />
                                <div>
                                    <strong>{subscription.name}</strong>
                                    <small>{subscription.category}</small>
                                </div>
                                <b>{subscription.price}</b>
                                <small>{subscription.date}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DierhaLanding() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="dierha-landing-page" dir="rtl">
            <header className="dl-header">
                <div className="dl-container dl-nav-wrap">
                    <a
                        className="dl-brand"
                        href="#home"
                        aria-label="ديرها - الرئيسية"
                        onClick={closeMobileMenu}
                    >
                        <img src={dierhaLogo} alt="ديرها" />
                    </a>

                    <button
                        type="button"
                        className={`dl-mobile-menu-button ${
                            mobileMenuOpen ? "is-open" : ""
                        }`}
                        aria-label="فتح وإغلاق القائمة"
                        aria-expanded={mobileMenuOpen}
                        aria-controls="dierha-mobile-menu"
                        onClick={() =>
                            setMobileMenuOpen((current) => !current)
                        }
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <nav
                        id="dierha-mobile-menu"
                        className={`dl-nav ${
                            mobileMenuOpen ? "dl-nav-mobile-open" : ""
                        }`}
                        aria-label="روابط الصفحة الرئيسية"
                    >
                        <a
                            className="active"
                            href="#home"
                            onClick={closeMobileMenu}
                        >
                            الرئيسية
                        </a>
                        <a href="#features" onClick={closeMobileMenu}>
                            المزايا
                        </a>
                         <a href="#story" onClick={closeMobileMenu}>
                            القصة
                        </a>
                        <a href="#how" onClick={closeMobileMenu}>
                            كيف تبدأ
                        </a>
                       
                        <a href="#team" onClick={closeMobileMenu}>
                            الفريق
                        </a>
                        <a
                            className="dl-mobile-menu-cta"
                            href="/login"
                            onClick={closeMobileMenu}
                        >
                            ابدأ الآن
                        </a>
                    </nav>

                    <a className="dl-header-cta" href="/login">
                        ابدأ الآن
                    </a>
                </div>
            </header>

            <main>
               
<section className="dl-hero" id="home">
    <div className="dl-container dl-hero-grid">
        <DashboardPreview />

        <div className="dl-hero-copy">
            <h1>
                جاهز تدير اشتراكاتك
                <br />
                بشكل <span>صحيح؟</span>
            </h1>

            <p>
                اجمع اشتراكاتك في مكان واحد، تابع مواعيد التجديد،
                وافهم مصاريفك الشهرية بوضوح وهدوء.
            </p>

            <div className="dl-hero-actions">
                <a
                    className="dl-btn dl-btn-primary"
                    href="/login"
                >
                    ابدأ الآن
                </a>

                <a
                    className="dl-btn dl-btn-secondary"
                    href="#features"
                >
                    استعرض المزايا
                </a>
            </div>

        </div>
    </div>
</section>

                <section className="dl-feature-strip" id="features">
                    <div className="dl-container">
                        <div className="dl-section-heading compact">
                            <h2>مزايا ديرها</h2>
                        </div>

                        <div className="dl-feature-grid">
                            {features.map((feature) => (
                                <article
                                    className="dl-feature-card"
                                    key={feature.title}
                                >
                                    <span
                                        className={`dl-feature-icon ${feature.tone}`}
                                    >
                                        <FeatureIcon type={feature.icon} />
                                    </span>

                                    <div className="dl-feature-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="dl-section dl-story-section" id="story">
                    <div className="dl-container dl-story-grid">
                        <div className="dl-story-copy">
                            <h2>ليش بدأنا ديرها؟</h2>

                            <p>
                                مع كثرة الاشتراكات الشهرية صار من السهل ننسى خدمة
                                ما نستخدمها أو نتفاجأ بتجديد جديد. ديرها جاءت عشان
                                تجمع الاشتراكات في مكان واحد وتخلي القرار المالي أوضح.
                            </p>

                            <p>
                                الفكرة بسيطة: تضيف الاشتراك يدويًا، تحدد تاريخ
                                التجديد، وتتابع المصروفات والتنبيهات بدون مشاركة
                                بياناتك البنكية.
                            </p>
                        </div>

                        <div className="dl-story-visual">
                            <span className="dl-story-blob" />

                            <div className="dl-woman-frame">
                                <img
                                    src={heroWoman}
                                    alt="مستخدمة مبتسمة تتصفح هاتفها"
                                />
                            </div>

                            <div className="dl-floating-saving">
                                <small>اشتراكاتك لهذا الشهر</small>
                                <strong>127 ريال</strong>
                                <span>أكثر اشتراك تم الانفاق عليه هو Netflix</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dl-section dl-how-section" id="how">
                    <div className="dl-container">
                        <div className="dl-section-heading">
                            <h2>كيف تبدأ مع ديرها؟</h2>
                            <p>
                                أربع خطوات واضحة تساعدك تفهم اشتراكاتك وتتحكم فيها.
                            </p>
                        </div>

                        <div className="dl-steps-grid">
                            {steps.map((step) => (
                                <article className="dl-step-card" key={step.number}>
                                    <span className="dl-step-number">{step.number}</span>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="dl-section dl-insight-section">
                    <div className="dl-container dl-insight-grid">
                        <div className="dl-insight-copy">
                            <h2>رؤية واضحة لقرارات أفضل</h2>

                            <p>
                                نمنحك أرقامًا سهلة القراءة تساعدك على إدارة اشتراكاتك
                                بثقة، ومعرفة مصاريفك الشهرية أفضل.
                            </p>

                            <div className="dl-insight-checks">
                            </div>
                        </div>

                        <div className="dl-insight-panel">
                            <div className="dl-ring-chart">
                                <span>78%</span>
                            </div>

                            <div className="dl-insight-stat">
                                <small>إجمالي المصروفات</small>
                                <strong>386 ريال</strong>
                            </div>

                            <div className="dl-insight-stat">
                                <small>الأقرب للتجديد</small>
                                <strong>بعد 3 أيام</strong>
                            </div>

                            <div className="dl-insight-stat">
                                <small>الأكثر استخدامًا</small>
                                <strong>Netflix</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dl-section dl-team-section" id="team">
                    <div className="dl-container">
                        <div className="dl-section-heading">
                            <h2>فريق العمل</h2>
                            <p>
                                فريق جمع بين التصميم والتطوير والتحليل لتحويل ديرها
                                إلى تجربة رقمية واضحة.
                            </p>
                        </div>

                        <div className="dl-team-grid">
                            {team.map((member) => (
                                <article className="dl-team-card" key={member.name}>
                                    <div className="dl-team-avatar">
                                        <img
                                            className={member.imageClass}
                                            src={member.image}
                                            alt={member.name}
                                        />
                                    </div>

                                    <h3>{member.name}</h3>
                                    <span className="dl-team-major">{member.major}</span>
                                    <p>{member.description}</p>

                                    <div className="dl-team-tags">
                                        {member.tags.map((tag) => (
                                            <span key={tag}>{tag}</span>
                                        ))}
                                    </div>

                                    <div className="dl-team-socials">
                                        <a
                                            href={member.linkedin}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`LinkedIn - ${member.name}`}
                                            title={`LinkedIn - ${member.name}`}
                                        >
                                            <LinkedInIcon />
                                        </a>

                                        <a
                                            href={member.github}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`GitHub - ${member.name}`}
                                            title={`GitHub - ${member.name}`}
                                        >
                                            <GitHubIcon />
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="dl-section dl-cta-section">
                    <div className="dl-container dl-cta-box">
                        <div>
                            <h2>جاهز تدير اشتراكاتك صح؟</h2>
                        </div>

                        <a href="/login">ابدأ الآن</a>
                    </div>
                </section>
            </main>

            <footer className="dl-footer">
                <div className="dl-container dl-footer-grid">
                    <div className="dl-footer-brand">
                        <img src={dierhaLogo} alt="ديرها" />
                        <p>
                            ديرها يساعدك على تنظيم اشتراكاتك ومتابعة مصاريفك
                            ومواعيد التجديد بسهولة.
                        </p>
                    </div>

                    <div>
                        <h4>روابط سريعة</h4>
                        <a href="#home">الرئيسية</a>
                        <a href="#features">المزايا</a>
                        <a href="#story">قصتنا</a>
                        <a href="#team">الفريق</a>
                    </div>

                    <div>
                        <h4>تواصل معنا</h4>
                        <span>support@dierha.com</span>
                        <span>www.dierha.com</span>
                    </div>

                    <div>
                        <h4>تابعنا</h4>
                        <div className="dl-socials">
                            <span aria-label="X">𝕏</span>
                            <span aria-label="LinkedIn">in</span>
                            <span className="dl-instagram-icon" aria-label="Instagram">
                                <InstagramIcon />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="dl-container dl-copyright">
                    © 2026 ديرها-جميع الحقوق محفوظة
                </div>
            </footer>
        </div>
    );
}
