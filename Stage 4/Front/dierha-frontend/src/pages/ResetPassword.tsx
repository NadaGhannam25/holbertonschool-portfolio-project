/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";   
 
import ToastMessage from "../components/ToastMessage";  
import { resetPassword } from "../services/authService"; 
   
type ResetPasswordProps = {  
    token: string;
};  
 
function PasswordEyeIcon({ hidden }: { hidden: boolean }) {
    if (hidden) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                <path d="M8.35 5.6C9.48 5.22 10.7 5 12 5C16.55 5 20.1 7.64 22 12C21.43 13.31 20.67 14.45 19.76 15.38" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.65 18.4C14.52 18.78 13.3 19 12 19C7.45 19 3.9 16.36 2 12C2.82 10.12 4.02 8.58 5.5 7.43" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M2 12C3.9 7.64 7.45 5 12 5C16.55 5 20.1 7.64 22 12C20.1 16.36 16.55 19 12 19C7.45 19 3.9 16.36 2 12Z" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

type PageState = "form" | "expired" | "success";

function ResetPassword({ token }: ResetPasswordProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

    const [pageState, setPageState] = useState<PageState>("form");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setPageState("expired");
            return;
        }

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setMessageType("error");
            setMessage("يرجى تعبئة جميع الحقول المطلوبة.");
            return;
        }

        if (newPassword.length < 8) {
            setMessageType("error");
            setMessage("كلمة المرور يجب أن تتكون من 8 أحرف أو أكثر.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessageType("error");
            setMessage("كلمتا المرور غير متطابقتين.");
            return;
        }

        try {
            setIsLoading(true);
            setMessage("");

            await resetPassword(token, newPassword);

            setPageState("success");

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "";

            if (
                errMsg.includes("منتهي") ||
                errMsg.includes("expired") ||
                errMsg.includes("Invalid or expired")
            ) {
                setPageState("expired");
            } else {
                setMessageType("error");
                setMessage(errMsg || "تعذر تغيير كلمة المرور.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (pageState === "expired") {
        return (
            <div className="auth-page">
                <div className="auth-card forgot-password-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "16px" }}></div>
                    <h1 style={{ color: "#e53e3e" }}>انتهت صلاحية الرابط</h1>
                    <p style={{ color: "#666", marginBottom: "24px" }}>
                        رابط إعادة التعيين صالح لمدة 15 دقيقة فقط وقد انتهت صلاحيته.
                        يرجى طلب رابط جديد.
                    </p>
                    <button
                        type="button"
                        className="primary-btn"
                        onClick={() => { window.location.href = "/forgot-password"; }}
                    >
                        طلب رابط جديد
                    </button>
                    <button
                        type="button"
                        className="back-to-login-btn"
                        style={{ marginTop: "12px" }}
                        onClick={() => { window.location.href = "/"; }}
                    >
                        العودة لتسجيل الدخول
                    </button>
                </div>
            </div>
        );
    }

    if (pageState === "success") {
        return (
            <div className="auth-page">
                <div className="auth-card forgot-password-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "52px", marginBottom: "16px" }}></div>
                    <h1 style={{ color: "#38a169" }}>تم تغيير كلمة المرور</h1>
                    <p style={{ color: "#666", marginBottom: "24px" }}>
                      تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول   .
                    </p>
                    <button
                        type="button"
                        className="primary-btn"
                        onClick={() => { window.location.href = "/"; }}
                    >
                        تسجيل الدخول
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card forgot-password-card">
                <ToastMessage message={message} type={messageType} />

                <h1>إعادة تعيين كلمة المرور</h1>
                <p>أدخل كلمة مرور جديدة لحسابك.</p>

                <form onSubmit={handleSubmit}>
                    <label className="required-label">كلمة المرور الجديدة</label>

                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="أدخل كلمة المرور الجديدة"
                            value={newPassword}
                            disabled={isLoading}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                        <button
                            type="button"
                            className="password-eye-btn"
                            onClick={() => setShowPassword((p) => !p)}
                            aria-label="إظهار أو إخفاء كلمة المرور"
                            disabled={isLoading}
                        >
                            <PasswordEyeIcon hidden={showPassword} />
                        </button>
                    </div>

                    <label className="required-label">تأكيد كلمة المرور</label>

                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder= "تأكيد كلمة المرور"
                            value={confirmPassword}
                            disabled={isLoading}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                        <button
                            type="button"
                            className="password-eye-btn"
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            aria-label="إظهار أو إخفاء كلمة المرور"
                            disabled={isLoading}
                        >
                            <PasswordEyeIcon hidden={showConfirmPassword} />
                        </button>
                    </div>

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
                    </button>
                </form>

                <button
                    type="button"
                    className="back-to-login-btn"
                    onClick={() => { window.location.href = "/"; }}
                    disabled={isLoading}
                >
                    العودة لتسجيل الدخول
                </button>
            </div>
        </div>
    );
}

export default ResetPassword;
