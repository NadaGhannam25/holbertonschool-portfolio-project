import logo from "../assets/dierha-logo.png";
import "./Footer.css";

type FooterProps = {
  goToHome?: () => void;
  goToSubscriptions?: () => void;
  goToAddSubscription?: () => void;
};

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

function Footer({
  goToHome,
  goToSubscriptions,
  goToAddSubscription,
}: FooterProps) {
  return (
    <footer className="main-footer" dir="rtl">
      <div className="footer-container footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="ديرها" />
          <p>
            ديرها يساعدك على تنظيم اشتراكاتك ومتابعة مصاريفك ومواعيد التجديد
            بسهولة.
          </p>
        </div>

        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <button type="button" onClick={goToHome}>
            الرئيسية
          </button>
          <button type="button" onClick={goToSubscriptions}>
            الاشتراكات
          </button>
          <button type="button" onClick={goToAddSubscription}>
            إضافة اشتراك
          </button>
        </div>

        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <span>support@dierha.com</span>
          <span>www.dierha.com</span>
        </div>

        <div className="footer-col">
          <h4>تابعنا</h4>
          <div className="footer-socials">
            <span aria-label="X">𝕏</span>
            <span aria-label="LinkedIn">in</span>
            <span className="footer-instagram-icon" aria-label="Instagram">
              <InstagramIcon />
            </span>
          </div>
        </div>
      </div>

      <div className="footer-container footer-copyright">
        © 2026 ديرها - جميع الحقوق محفوظة
      </div>
    </footer>
  );
}

export default Footer;
