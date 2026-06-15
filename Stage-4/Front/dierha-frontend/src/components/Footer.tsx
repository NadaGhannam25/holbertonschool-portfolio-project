import logo from "../assets/dierha-logo.png";

type FooterProps = {
  goToHome?: () => void;
  goToSubscriptions?: () => void;
  goToAddSubscription?: () => void;
};

function Footer({ goToHome, goToSubscriptions, goToAddSubscription }: FooterProps) {
  return (
    <footer className="main-footer app-footer-landing-style">
      <div className="footer-container">
        <div className="footer-col footer-brand-col">
          <div className="footer-logo">
            <img src={logo} alt="Dierha Logo" />
          </div>

          <p>
            ديرها يساعدك على تنظيم اشتراكاتك ومتابعة مصاريفك ومعرفة مواعيد
            التجديد بسهولة من مكان واحد.
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
              >
                support@dierha.com
              </a>
            </li>
            <li>
              <a href="https://www.dierha.com" target="_blank" rel="noreferrer">
                www.dierha.com
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">

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

            <span className="social-link" aria-label="LinkedIn">in</span>
            <span className="social-link" aria-label="X">𝕏</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 ديرها-جميع الحقوق محفوظة
      </div>
    </footer>
  );
}

export default Footer;
