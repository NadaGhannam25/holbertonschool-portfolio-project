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
        <div className="footer-col">
          <div className="footer-logo">
            <img src={logo} alt="Dierha Logo" />
          </div>
          <p>
            ديرها يساعدك على تنظيم اشتراكاتك ، متابعة مصروفاتك، ومعرفة
            مواعيد التجديد بسهولة.
          </p>
        </div>

        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li onClick={goToHome}>الرئيسية</li>
            <li onClick={goToSubscriptions}>الاشتراكات</li>
            <li onClick={goToAddSubscription}>إضافة اشتراك</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <ul>
            <li>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@dierha.com&su=طلب%20دعم%20-%20ديرها"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#667085", textDecoration: "none", fontWeight: 600, fontSize: "13px" }}
              >
                support@dierha.com
              </a>
            </li>
            <li>+966 00 000 0000</li>
            <li>www.dierha.com</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>تابعنا</h4>
          <div className="social-icons">
            <span className="social-link" aria-label="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.2" fill="currentColor" />
              </svg>
            </span>
            <span className="social-link" aria-label="LinkedIn">in</span>
            <span className="social-link" aria-label="X">𝕏</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">©2026 ديرها - جميع الحقوق محفوظة</div>
    </footer>
  );
}

export default Footer;

