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
};

const features: Feature[] = [
  {
    title: "لوحة تحكم موحدة",
    description: "جميع اشتراكاتك في مكان واحد لمتابعة أسهل وأسرع.",
    icon: "▦",
    tone: "blue",
  },
  {
    title: "تنبيهات قبل التجديد",
    description: "لن تفاجئك أي عملية تجديد بعد الآن.",
    icon: "◴",
    tone: "pink",
  },
  {
    title: "تحليل المصروفات",
    description: "تقارير شهرية ورسوم واضحة لفهم إنفاقك.",
    icon: "↗",
    tone: "purple",
  },
  {
    title: "خصوصية أعلى",
    description: "بياناتك آمنة ولا تحتاجين لربط حسابك البنكي.",
    icon: "◇",
    tone: "navy",
  },
];

const steps = [
  {
    number: "01",
    title: "أضيفي اشتراكاتك",
    description: "أضيفي الخدمة والمبلغ وتاريخ التجديد.",
  },
  {
    number: "02",
    title: "نراقب وننبهك",
    description: "تنبيهات قبل التجديد لتبقين بالصورة.",
  },
  {
    number: "03",
    title: "حللي ووفري",
    description: "اكتشفي فرص التوفير وافهمي صرفك.",
  },
  {
    number: "04",
    title: "تحكمي بذكاء",
    description: "اتخذي قرارات مالية أفضل بهدوء.",
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
  },
 {
  name: "شادن العلواني",
  major: "علوم اقتصاد مالي",
  description:
    "تحليل الجانب المالي وتحويل بيانات الاشتراكات إلى قرارات واضحة.",
  tags: ["Finance", "Backend", "Analysis"],
  image: shadenPhoto,
  imageClass: "dl-team-photo-cover dl-team-photo-zoom",
},
  {
  name: "سندس الربيش",
  major: "هندسة كهرباء واتصالات",
  description:
    "دعم بناء الأنظمة واختبار التجربة وتدفق البيانات بشكل موثوق.",
  tags: ["Systems", "Backend", "Testing"],
  image: sondosPhoto,
  imageClass: "dl-team-photo-cover dl-team-photo-zoom",
},
  {
    name: "رهف الحارثي",
    major: "كيمياء",
    description:
      "البحث والتوثيق وتنظيم تفاصيل المشروع وصياغة المحتوى بدقة.",
    tags: ["Research", "Frontend", "Docs"],
    image: rahafPhoto,
  },
  {
    name: "ريناد الزعيبر",
    major: "علوم حاسب",
    description:
      "بناء قاعدة البيانات وربط الخدمات التقنية وتحسين منطق النظام.",
    tags: ["Backend", "DB", "API"],
    image: renadPhoto,
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
        <aside className="dl-dashboard-sidebar">
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 21h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
</span>

          <span className="active">الرئيسية</span>

          <span>اشتراكاتي</span>

          <span>التنبيهات</span>

          <span>التقارير</span>
        </aside>

        <div className="dl-dashboard-content">
          <div className="dl-dashboard-heading">
            <div>
              <strong>مرحباً لين</strong>

              <small>إجمالي مصاريف الشهر الحالي</small>
            </div>

            <span className="dl-dashboard-bell">◌</span>
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
  return (
    <div className="dierha-landing-page" dir="rtl">
      <header className="dl-header">
        <div className="dl-container dl-nav-wrap">
          <a
            className="dl-brand"
            href="#home"
            aria-label="ديرها - الرئيسية"
          >
            <img src={dierhaLogo} alt="ديرها" />
          </a>

          <nav
            className="dl-nav"
            aria-label="روابط الصفحة الرئيسية"
          >
            <a className="active" href="#home">
              الرئيسية
            </a>

            <a href="#features">المزايا</a>

            <a href="#how">كيف تعمل</a>

            <a href="#story">القصة</a>

            <a href="#team">الفريق</a>
          </nav>

          <a className="dl-header-cta" href="/login">
            ابدأ الآن ←
          </a>
        </div>
      </header>

      <main>
        <section className="dl-hero" id="home">
          <div className="dl-container dl-hero-grid">
            <DashboardPreview />

            <div className="dl-hero-copy">

              <h1>
                اشتراكاتك أوضح
                <br />
                ومصاريفك <span>أذكى</span>
              </h1>

              <p>
                اجمع اشتراكاتك في مكان واحد، تابع مواعيد
                التجديد، وافهم مصروفاتك الشهرية بوضوح وهدوء.
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

              <div className="dl-hero-note">
                <span>✓ بدون ربط بنكي</span>
                <span>✓ تنبيهات مسبقة</span>
                <span>✓ تجربة عربية واضحة</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="dl-feature-strip"
          id="features"
        >
          <div className="dl-container">
            <div className="dl-section-heading compact">
              <span>كل شيء أمامك بوضوح</span>

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
                    {feature.icon}
                  </span>

                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="dl-section dl-story-section"
          id="story"
        >
          <div className="dl-container dl-story-grid">
            <div className="dl-story-copy">
             
              <h2>قصة المشروع</h2>
              <h2>ليش بدأنا ديرها؟</h2>

              <p>
                مع كثرة الاشتراكات الشهرية صار من السهل ننسى
                خدمة ما نستخدمها أو نتفاجأ بتجديد جديد. ديرها
                جاءت عشان تجمع الاشتراكات في مكان واحد وتخلي
                القرار المالي أوضح.
              </p>

              <p>
                الفكرة بسيطة: تضيفين الاشتراك يدويًا، تحددين
                تاريخ التجديد، وتتابعين المصروفات والتنبيهات
                بدون مشاركة بياناتك البنكية.
              </p>

              <a
                href="/login"
                className="dl-text-link"
              >
                جرّب ديرها الآن ←
              </a>
            </div>

            <div className="dl-story-visual">
              <span className="dl-story-blob" />

              <img
                src={heroWoman}
                alt="مستخدمة مبتسمة تتصفح هاتفها"
              />

              <div className="dl-floating-saving">
                <small>وفّرت هذا الشهر</small>

                <strong>127 ريال</strong>

                <span>
                  بإلغاء اشتراكين غير مستخدمين
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="dl-section dl-how-section"
          id="how"
        >
          <div className="dl-container">
            <div className="dl-section-heading">

              <h2>كيف تعمل ديرها؟</h2>

              <p>
                أربع خطوات واضحة تساعدك تفهمين اشتراكاتك
                وتتحكمين فيها.
              </p>
            </div>

            <div className="dl-steps-grid">
              {steps.map((step) => (
                <article
                  className="dl-step-card"
                  key={step.number}
                >
                  <span className="dl-step-number">
                    {step.number}
                  </span>

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
                نمنحك أرقامًا سهلة القراءة تساعدك على إدارة
                اشتراكاتك بثقة، ومعرفة أين تذهب مصروفاتك كل
                شهر.
              </p>

              <div className="dl-insight-checks">
                <span>✓ مقارنة شهرية للمصروفات</span>

                <span>
                  ✓ معرفة أكثر الخدمات تكلفة
                </span>

                <span>
                  ✓ تنبيه قبل أي تجديد قادم
                </span>
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

        <section className="dl-section dl-why-section">
          <div className="dl-container dl-why-box">
            <div
              className="dl-why-icon"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <span />
            </div>

            <div>
  

              <h2>لماذا ديرها؟</h2>

              <p>
                كثير من الاشتراكات تتجدد تلقائيًا دون أن نلاحظ،
                وتسبب مصاريف غير ضرورية. ديرها تمنحك الوضوح
                والتنبيهات والتحكم الكامل حتى تكون قراراتك
                المالية أوضح.
              </p>
            </div>
          </div>
        </section>

        <section
          className="dl-section dl-team-section"
          id="team"
        >
          <div className="dl-container">
            <div className="dl-section-heading">

    <h2>فريق العمل والتطوير</h2>
              <p>
                فريق جمع بين التصميم والتطوير والتحليل لتحويل
                ديرها إلى تجربة رقمية واضحة.
              </p>
            </div>

            <div className="dl-team-grid">
              {team.map((member) => (
                <article
                  className="dl-team-card"
                  key={member.name}
                >
                  <div className="dl-team-avatar">
                    <img
                      className={member.imageClass}
                      src={member.image}
                      alt={member.name}
                    />
                  </div>

                  <h3>{member.name}</h3>

                  <span className="dl-team-major">
                    {member.major}
                  </span>

                  <p>{member.description}</p>

                  <div className="dl-team-tags">
                    {member.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dl-section dl-cta-section">
          <div className="dl-container dl-cta-box">
            <div>
              <span>جاهز تعيش تجربة أوضح؟</span>

              <h2>ابدأ تنظيم اشتراكاتك اليوم</h2>

              <p>
                تابع التجديدات والمصروفات والتنبيهات من مكان
                واحد.
              </p>
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
              ديرها يساعدك على تنظيم اشتراكاتك ومتابعة
              مصروفاتك ومواعيد التجديد بسهولة.
            </p>
          </div>

          <div>
            <h4>روابط سريعة</h4>

            <a href="#home">الرئيسية</a>

            <a href="#features">المزايا</a>

            <a href="#story">قصتنا</a>

            <a href="#how">كيف تعمل</a>
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

  <span
    className="dl-instagram-icon"
    aria-label="Instagram"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
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

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  </span>
</div>

        <div className="dl-container dl-copyright">
          © 2026 ديرها — جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}
