import "./Footer.css";

type FooterProps = {
  goToHome?: () => void;
  goToSubscriptions?: () => void;
  goToAddSubscription?: () => void;
};

function Footer({
  goToHome,
  goToSubscriptions,
  goToAddSubscription,
}: FooterProps) {
  return (
    <footer className="main-footer" dir="rtl">
      <div className="footer-container">
        <div className="footer-card">
          <div className="footer-heading">
            <h4>روابط سريعة</h4>
          </div>

          <nav className="footer-links" aria-label="روابط سريعة">
            <button type="button" onClick={goToHome}>
              الرئيسية
            </button>

            <button type="button" onClick={goToSubscriptions}>
              الاشتراكات
            </button>

            <button type="button" onClick={goToAddSubscription}>
              إضافة اشتراك
            </button>
          </nav>
        </div>

        <div className="footer-copyright">
          © 2026 ديرها - جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}

export default Footer;
