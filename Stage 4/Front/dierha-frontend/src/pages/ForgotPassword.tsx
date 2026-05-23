import { useState } from "react";
import ToastMessage from "../components/ToastMessage";
import { requestPasswordReset } from "../services/authService";

type ForgotPasswordProps = {
  goToLogin: () => void;
};

function ForgotPassword({ goToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessageType("error");
      setMessage("يرجى إدخال البريد الإلكتروني أولاً.");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      await requestPasswordReset(email.trim());
      setSentEmail(email.trim());
      setMessageType("success");
      setMessage(`أرسلنا تعليمات استعادة كلمة المرور إلى ${email.trim()}.`);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "تعذر إرسال طلب استعادة كلمة المرور.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card forgot-password-card">
        <ToastMessage message={message} type={messageType} />
        <h1>استعادة كلمة المرور</h1>
        <p>أدخل بريدك الإلكتروني، وسنرسل لك رابط استعادة كلمة المرور إذا كان الحساب موجودًا.</p>

        {!sentEmail ? (
          <form onSubmit={handleSubmit}>
            <label className="required-label">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <button type="submit" className="primary-btn" disabled={isLoading}>
              {isLoading ? "جاري الإرسال..." : "إرسال"}
            </button>
          </form>
        ) : (
          <div className="forgot-success-box">
            <strong>تم إرسال رسالة الاستعادة</strong>
            <p>تحققي من بريدك الإلكتروني: <span>{sentEmail}</span></p>
          </div>
        )}

        <button type="button" className="back-to-login-btn" onClick={goToLogin}>
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
