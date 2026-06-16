import logo from "../assets/dierha-logo.png";

type FooterProps = {
  goToHome?: () => void;
  goToSubscriptions?: () => void;
  goToAddSubscription?: () => void;
};

function Footer({ goToHome, goToSubscriptions, goToAddSubscription }: FooterProps) {
  return (
    <footer className="main-footer">
      <div className="footer-container">

        {/* عمود البراند */}
        <div className="footer-col footer-brand-col">
          <div className="footer-logo">
            <img src={logo} alt="ديرها" />
          </div>
          <p>
            ديرها يساعدك على تنظيم اشتراكاتك ومتابعة مصروفاتك
            ومواعيد التجديد بسهولة.
          </p>
        </div>

        {/* روابط سريعة */}
        <div className="footer-col">
          <h4>اختصارات سريعة</h4>
          <ul>
            <li onClick={goToHome}>الرئيسية</li>
            <li onClick={goToSubscriptions}>الاشتراكات</li>
            <li onClick={goToAddSubscription}>إضافة اشتراك</li>
          </ul>
        </div>

        {/* تواصل معنا */}
        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <ul>
            <li>support@dierha.com</li>
            <li>www.dierha.com</li>
          </ul>
        </div>

        {/* تابعنا */}
        <div className="footer-col">
          <h4>تابعنا</h4>
          <div className="social-icons" aria-label="حسابات ديرها الاجتماعية">
            <a className="social-link" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 4L20 20M20 4L4 20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            </a>

            <a className="social-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.7 9.3V19" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                <path d="M6.7 5.4V5.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M11.2 19V9.3" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                <path d="M11.2 13.5C11.2 11.4 12.7 9.8 14.8 9.8C16.9 9.8 18.1 11.2 18.1 13.8V19" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <a className="social-link" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.2" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 ديرها — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}

export default Footer;
