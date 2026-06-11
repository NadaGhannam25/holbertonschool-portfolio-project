import { useState } from "react";
import ToastMessage from "../components/ToastMessage";

type LoginProps = {
    onLogin: (email: string, password: string) => void;
    goToRegister: () => void;
    goToForgotPassword: () => void;
    isLoading?: boolean;
    externalMessage?: string;
    externalMessageType?: "success" | "error" | "info";
}; 

function Login({
    onLogin,
    goToRegister,
    goToForgotPassword,
    isLoading = false,
    externalMessage = "",
    externalMessageType = "info",
}: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const showLocalMessage = (text: string) => {
        setMessage(text);

        window.setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            showLocalMessage("يرجى تعبئة الحقول المطلوبة");
            return;
        }
        
        if (password.length < 8) {
            showLocalMessage("كلمة المرور يجب أن تتكون من 8 أحرف أو أكثر");
            return;
        }
        onLogin(email, password);
    };

    const displayedMessage = message || externalMessage;
    const displayedType = message ? "info" : externalMessageType;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <ToastMessage message={displayedMessage} type={displayedType} />

                <h1>تسجيل الدخول</h1>
                <p>مرحبًا بك في ديرها، نظّم اشتراكاتك بسهولة </p>

                <form onSubmit={handleSubmit}>
                    <label className="required-label">البريد الإلكتروني</label>
                    <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <label className="required-label">كلمة المرور</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="أدخل كلمة المرور"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        <button
                            type="button"
                            className="password-eye-btn"
                            onClick={() => setShowPassword((previous) => !previous)}
                            aria-label="إظهار أو إخفاء كلمة المرور"
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                                    <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                                    <path d="M8.35 5.6C9.48 5.22 10.7 5 12 5C16.55 5 20.1 7.64 22 12C21.43 13.31 20.67 14.45 19.76 15.38" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15.65 18.4C14.52 18.78 13.3 19 12 19C7.45 19 3.9 16.36 2 12C2.82 10.12 4.02 8.58 5.5 7.43" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M2 12C3.9 7.64 7.45 5 12 5C16.55 5 20.1 7.64 22 12C20.1 16.36 16.55 19 12 19C7.45 19 3.9 16.36 2 12Z" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="forgot-password-row">
                        <button
                            type="button"
                            className="forgot-password-btn"
                            onClick={goToForgotPassword}
                            disabled={isLoading}
                        >
                            هل نسيت كلمة المرور؟
                        </button>
                    </div>

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
                    </button>
                </form>

                <p className="auth-switch">
                    ليس لديك حساب{" "}
                    <button type="button" onClick={goToRegister} disabled={isLoading}>
                        إنشاء حساب جديد
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
