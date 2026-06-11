import logo from "../../assets/dierha-logo.png";
import "./DierhaLanding.css";
export {};
function DierhaLanding() {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="lp-root" dir="rtl">
            <header className="top-navigation">
                <div className="nav-brand">
                    <img src={logo} alt="Dierha Logo" />
                </div>

                <nav className="nav-menu" aria-label="Landing navigation">
                    <button type="button" className="nav-link active" onClick={() => scrollTo("hero")}>
                        الرئيسية
                    </button>

                    <button type="button" className="nav-link" onClick={() => scrollTo("features")}>
                        المزايا
                    </button>

                    <button type="button" className="nav-link" onClick={() => scrollTo("about")}>
                        قصتنا
                    </button>

                    <button type="button" className="nav-link" onClick={() => scrollTo("why")}>
                        لماذا ديرها
                    </button>

                    <button type="button" className="nav-link" onClick={() => scrollTo("team")}>
                        الفريق
                    </button>
                </nav>

                <div className="nav-user-area" />
            </header>

            <section className="lp-hero" id="hero">
                <div className="lp-container lp-hero-grid">
                    <div className="lp-hero-text">
                        <h1 className="lp-hero-h1">
                           ديــرهـا<br />
                            <span className="lp-hero-h1">كل اشتراكـاتك في مكان واحد</span>
                        </h1>
                        <p className="lp-hero-desc">
                            تنبيهات قبل التجديد، وتحليلات واضحة للمصاريف، لتدير أموالك بوعي أكبر وتوفّر أكثر
                        </p>
                        <div className="lp-hero-actions">
                            <a href="/login" className="lp-btn-primary">ابدأ الآن ←</a>
                        </div>
                        <div className="lp-hero-tags">
                            <span>تذكيرات قبل التجديد</span>
                            <span> تحليل المصروفات</span>
                            <span>مشاركة اشتراكاتك</span>
                            <span>بدون ربط حساب بنكي</span>
                        </div>
                    </div>

                    <div className="lp-hero-visual">
                        <div className="lp-float-card lp-float-top">
                            <div className="lp-float-icon"></div>
                            <div>
                                <strong>تجديد بعد 3 أيام</strong>
                                <span>Netflix على وشك التجديد</span>
                            </div>
                        </div>
                        <div className="lp-dashboard-shell">
                            <div className="lp-dash-titlebar">
                                <div className="lp-dash-dots"><i /><i /><i /></div>
                                <div />
                            </div>
                            <div className="lp-dash-body">
                                <div className="lp-dash-header">
                                    <div>
                                        <h3>هلا  لين  </h3>
                                        <p>إجمالي مصاريفك، يناير</p>
                                    </div>
                                    <div className="lp-dash-add-btn">+ اشتراك</div>
                                </div>
                                <div className="lp-stats-row">
                                    <div className="lp-stat-card lp-stat-dark">
                                        <span>المصروف الشهري</span>
                                        <strong>342 ر.س</strong>
                                        <small>إجمالي الصرف حسب آخر شهر</small>
                                    </div>
                                    <div className="lp-stat-card">
                                        <span>اشتراكاتي</span>
                                        <strong>7</strong>
                                        <small>3 تجديدات قريبة</small>
                                    </div>
                                    <div className="lp-stat-card">
                                        <span>التجديدات القادمة</span>
                                        <strong>2</strong>
                                        <small>بعد 18 يوم</small>
                                    </div>
                                </div>
                                <div className="lp-sub-list">
                                    <div className="lp-sub-row">
                                        <div className="lp-sub-icon" style={{ background: "#f3eeff", color: "#7c3aed" }}>N</div>
                                        <div><strong>Netflix</strong><span>ترفيه · 15 يناير</span></div>
                                        <div className="lp-sub-price">45 ر.س</div>
                                    </div>
                                    <div className="lp-sub-row">
                                        <div className="lp-sub-icon" style={{ background: "#e7f5ff", color: "#1D47DA" }}>S</div>
                                        <div><strong>Spotify</strong><span>ترفيه · 22 يناير</span></div>
                                        <div className="lp-sub-price">26 ر.س</div>
                                    </div>
                                    <div className="lp-sub-row">
                                        <div className="lp-sub-icon" style={{ background: "#fff3e6", color: "#c2410c" }}>A</div>
                                        <div><strong>Adobe CC</strong><span>عمل · 30 يناير</span></div>
                                        <div className="lp-sub-price">189 ر.س</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            <section className="lp-section" id="features">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <h2>كل اللي تحتاجه لتتحكم باشتراكاتك</h2>
                        <p>صمّمنا ديرها عشان يكون بسيط وفعّال  من إضافة الاشتراك إلى استلام التذكير في خطوات قليلة</p>
                    </div>
                    <div className="lp-features-grid">
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon lp-fi-blue">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                            </div>
                            <div className="lp-feature-illus lp-fi-dash-preview">
                                <div className="lp-mini-row">
                                    <div className="lp-mini-card lp-mc-dark"><span>الإجمالي</span><strong>342 ر.س</strong></div>
                                    <div className="lp-mini-card"><span>اشتراكات</span><strong>7</strong></div>
                                </div>
                                <div className="lp-mini-bar-group">
                                    <div className="lp-mini-bar" style={{ width: "80%" }} />
                                    <div className="lp-mini-bar lp-mb-pink" style={{ width: "55%" }} />
                                    <div className="lp-mini-bar lp-mb-light" style={{ width: "35%" }} />
                                </div>
                            </div>
                            <h3>لوحة تحكم موحّدة</h3>
                            <p>كل اشتراكاتك في مكان واحد، مرتّبة حسب الفئة والتاريخ، مع تفاصيل واضحة  بدون ما تدور في أكثر من تطبيق</p>
                        </div>

                        <div className="lp-feature-card lp-feature-featured">
                            <div className="lp-feature-badge">الأكثر استخدامًا</div>
                            <div className="lp-feature-icon lp-fi-pink">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            </div>
                            <div className="lp-feature-illus lp-fi-reminder-preview">
                                <div className="lp-reminder-card lp-reminder-urgent">
                                    <div className="lp-reminder-dot lp-rd-red" />
                                    <div><span>Netflix</span><small>يتجدد بعد 3 أيام  45 ر.س</small></div>
                                    <div className="lp-remind-cancel-pill">إلغاء</div>
                                </div>
                                <div className="lp-reminder-card">
                                    <div className="lp-reminder-dot lp-rd-yellow" />
                                    <div><span>Adobe CC</span><small>يتجدد بعد 12 يوم</small></div>
                                </div>
                                <div className="lp-reminder-card">
                                    <div className="lp-reminder-dot lp-rd-green" />
                                    <div><span>Spotify</span><small>يتجدد بعد 22 يوم</small></div>
                                </div>
                            </div>
                            <h3>تذكيرات تلقائية قبل التجديد</h3>
                            <p>ديرها يرسل لك إشعار على بريدك قبل موعد التجديد بأيام كافية، مع رابط مباشر تراجع فيه الاشتراك أو تلغيه قبل ما يُخصم</p>
                        </div>

                        <div className="lp-feature-card">
                            <div className="lp-feature-icon lp-fi-navy">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            </div>
                            <div className="lp-feature-illus lp-fi-chart-preview">
                                <div className="lp-mini-chart">
                                    {[40, 65, 50, 80, 62, 90, 75].map((h, i) => (
                                        <div key={i} className={`lp-chart-bar${i === 5 ? " lp-cb-peak" : ""}`} style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div className="lp-chart-labels">
                                    <span>يوليو</span><span>أغسطس</span><span>سبتمبر</span>
                                </div>
                            </div>
                            <h3>تحليلات مصروفات بصرية</h3>
                            <p>تابع مصاريفك عبر رسوم بيانية توضّح توزيع الاشتراكات حسب الفئة والشهر، واكتشف الأنماط اللي تساعدك توفّر فعلاً.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section" id="about">
                <div className="lp-container">
                    <div className="lp-about-grid">

                        <div className="lp-about-logo">
                        <img src={logo} alt="ديرها" className="lp-about-logo-image"/> </div>
                        <div className="lp-about-story">
                         <h2 className="lp-about-title">قصـة ديـرهـا</h2>
 
                        <p>
                    مع كثرة الاشتراكات اليوم، صار من السهل ننسى بعض الخدمات أو نستمر بالدفع مقابل اشتراكات ما نستخدمها بالشكل الكافي. ومع مرور الوقت، تتراكم هذه المصاريف بدون ما ننتبه لحجمها الحقيقي.
                        </p>

                       <p>
                    من هنا بدأت فكرة ديرها؛ منصة تساعدك تجمع اشتراكاتك في مكان واحد، تتابع مواعيد التجديد، وتفهم مصروفاتك بشكل أوضح، بدون الحاجة لربط حسابك البنكي أو مشاركة بياناتك المالية.
                       </p>

                     <p>
                    فكانت ديرها؛ منصة صُممت لتمنحك رؤية أوضح وتحكمًا أكبر في اشتراكاتك.
                     </p>
                         </div>

                    </div>
                </div>
             </section>

            <section className="lp-section" id="why">
                <div className="lp-container">                         
                    <div className="lp-why-block">                       
                        <div className="lp-why-text">                    
                            <h2>لماذا ديرها؟</h2>
                        </div>
                        <div className="lp-why-items">
                            {[{num: "1",title: "لا تفوت أي موعد تجديد",desc: "تنبيهات تساعدك تراجع اشتراكك قبل الخصم"},
                              {num: "2",title: "افهم أين تذهب مصروفاتك", desc: "تابع مصروفاتك حسب الفئة والفترة الزمنية"},
                              {num: "3",title: "اتخذ قرارات بوعي أكبر",  desc: "اعرف الاشتراكات المهمة واللي ممكن تستغني عنها"},
                              {num: "4",title: "تجربة بسيطة وآمنة",desc: "إدارة يدوية بدون ربط حسابك البنكي"},
                             ].map((item) => (
                            <div key={item.num} className="lp-why-item">
                                  <div className="lp-why-num">{item.num}</div>
                                 <strong>{item.title}</strong>
                                 <p>{item.desc}</p>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-section-soft" id="team">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <h2>فريق ديرها</h2>
                        <p>خمس مطوّرات عملن معًا لتحويل فكرة بسيطة إلى حل فعلي</p>
                    </div>
                    <div className="lp-team-grid">
                        {[
                            { initial: "ن", name: "ندى المطيري",    role: "نظم معلومات",            uni: "جامعة المعرفة",       skills: ["UX/UI", "Frontend", "Product"],  github: "https://github.com/NadaGhannam25" },
                            { initial: "ش", name: "شادن العلواني",  role: "علوم اقتصاد مالي",       uni: "جامعة الأميرة نورة", skills: ["Finance", "Backend", "Analysis"], github: "https://github.com/Shadenm-404" },
                            { initial: "س", name: "سندس الربيش",   role: "هندسة كهرباء واتصالات", uni: "جامعة الأميرة نورة", skills: ["Backend", "Systems", "Testing"],  github: "https://github.com/sondos04" },
                            { initial: "ر", name: "رهف الحارثي",   role: "كيمياء",                  uni: "جامعة الأميرة نورة", skills: ["Research", "Frontend", "Docs"],   github: "https://github.com/rahafalharthi1111-png" },
                            { initial: "ر", name: "ريناد الزعيبر", role: "علوم حاسب",              uni: "جامعة الأميرة نورة", skills: ["Backend", "DB", "API"],           github: "https://github.com/Rinadfahadz" },
                        ].map((member) => (
                            <div key={member.name} className="lp-member-card">
                                <div className="lp-member-avatar">{member.initial}</div>
                                <h3>{member.name}</h3>
                                <p className="lp-member-role">{member.role}</p>
                                <span className="lp-member-uni">{member.uni}</span>
                                <div className="lp-member-chips">
                                    {member.skills.map((s) => <span key={s}>{s}</span>)}
                                </div>
                                <a
                                    href={member.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="lp-member-github"
                                    aria-label={`GitHub profile of ${member.name}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                                    </svg>
                                    GitHub
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* رابط الـ GitHub repository */}
                    <div className="lp-repo-link">
                        <a
                            href="https://github.com/NadaGhannam25/holbertonschool-portfolio-project"
                            target="_blank"
                            rel="noreferrer"
                            className="lp-repo-btn"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                            GitHub Repository
                        </a>
                    </div>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-container">
                    <div className="lp-cta-block">
                        <div className="lp-cta-text">
                            <h2>جاهز تدير اشتراكاتك؟</h2>
                            <p>ابدأ مجانًا، بدون ربط حساب بنكي، في أقل من دقيقتين.</p>
                        </div>
                        <a href="/login" className="lp-cta-btn">ابدأ الآن  ←</a>
                    </div>
                </div>
            </section>

            <footer className="main-footer">
             <div className="footer-container">
        <div className="footer-col">
            <div className="footer-logo">
                <img src={logo} alt="Dierha Logo" />
            </div>

            <p>
                ديرها يساعدك على تنظيم اشتراكاتك، متابعة مصروفاتك، ومعرفة
                مواعيد التجديد بسهولة.
            </p>
        </div>

        <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
                <li onClick={() => scrollTo("hero")}>الرئيسية</li>
                <li onClick={() => scrollTo("features")}>المزايا</li>
                <li onClick={() => scrollTo("about")}>قصتنا</li>
                <li onClick={() => scrollTo("why")}>لماذا ديرها</li>
                <li onClick={() => scrollTo("team")}>الفريق</li>
            </ul>
        </div>

        <div className="footer-col">
            <h4>تواصل معنا</h4>
            <ul>
                <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=support@dierha.com&su=طلب%20دعم%20-%20ديرها"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        color: "#667085",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "13px",
                    }}
                >
                    support@dierha.com
                </a>
                <li>+966 00 000 0000</li>
                <li>www.dierha.com</li>  
            </ul>
        </div>

        <div className="footer-col">
            <h4>تابعنا</h4>
            <div className="social-icons">
                <span className="social-link" aria-label="Instagram"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.2" fill="currentColor" />
              </svg></span>
                <span className="social-link" aria-label="LinkedIn">in</span>
                <span className="social-link" aria-label="X">𝕏</span>
            </div>
        </div>
    </div>

    <div className="footer-bottom">©2026 ديرها - جميع الحقوق محفوظة</div>
</footer>
 
        </div>
    );
}



export default DierhaLanding;
