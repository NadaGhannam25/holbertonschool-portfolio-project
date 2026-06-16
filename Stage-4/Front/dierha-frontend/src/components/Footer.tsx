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
          <div className="social-icons">
            <span className="social-link" aria-label="X">𝕏</span>
            <span className="social-link" aria-label="LinkedIn">in</span>
            <span className="social-link" aria-label="Instagram">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.2" fill="currentColor" />
              </svg>
            </span>
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
