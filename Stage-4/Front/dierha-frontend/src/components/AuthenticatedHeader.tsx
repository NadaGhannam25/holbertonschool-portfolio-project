import { useEffect, useRef, useState } from "react";
import logo from "../assets/dierha-logo.png";
import { getStoredUser } from "../services/authService";
import { apiRequest } from "../services/api";
import SettingsDropdown from "./SettingsDropdown";

type AuthenticatedHeaderProps = {
    activePage: "home" | "subscriptions";
    onLogout: () => void;
    goToHome: () => void;
    goToSubscriptions: () => void;
};

type StoredUser = { id?: number; name?: string; email?: string };
type UpdateProfileResponse = { message: string; user: StoredUser };

function AuthenticatedHeader({
    activePage,
    onLogout,
    goToHome,
    goToSubscriptions,
}: AuthenticatedHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || "");
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [nameError, setNameError] = useState("");

    const menuRef = useRef<HTMLElement | null>(null);
    const userName = user?.name?.trim() || "مستخدم";
    const userInitial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMobileMenuOpen(false);
                setIsEditingName(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigation = (navigate: () => void) => {
        setMobileMenuOpen(false);
        setIsEditingName(false);
        navigate();
    };

    const handleLogout = () => {
        setMobileMenuOpen(false);
        onLogout();
    };

    const handleStartEditName = () => {
        setNewName(user?.name || "");
        setNameError("");
        setIsEditingName(true);
    };

    const handleUpdateName = async () => {
        const trimmedName = newName.trim();
        if (!trimmedName) { setNameError("يرجى إدخال الاسم."); return; }
        try {
            setIsUpdatingName(true);
            setNameError("");
            const response = await apiRequest<UpdateProfileResponse>("/auth/profile", {
                method: "PATCH",
                body: JSON.stringify({ name: trimmedName }),
            });
            localStorage.setItem("dierha_user", JSON.stringify(response.user));
            setUser(response.user);
            setIsEditingName(false);
        } catch {
            setNameError("تعذر تحديث الاسم، حاول مرة أخرى.");
        } finally {
            setIsUpdatingName(false);
        }
    };

    return (
        <header className="top-navigation" ref={menuRef}>
            <div className="nav-brand">
                <img src={logo} alt="Dierha Logo" />
            </div>

            <nav className="nav-menu" aria-label="Main navigation">
                <button
                    type="button"
                    className={`nav-link ${activePage === "home" ? "active" : ""}`}
                    onClick={goToHome}
                >
                    الرئيسية
                </button>

                <button
                    type="button"
                    className={`nav-link ${activePage === "subscriptions" ? "active" : ""}`}
                    onClick={goToSubscriptions}
                >
                    الاشتراكات
                </button>
            </nav>

            <div className="nav-user-area">
                <SettingsDropdown onLogout={onLogout} />
            </div>

            <button
                type="button"
                className={`app-mobile-menu-button ${mobileMenuOpen ? "is-open" : ""}`}
                aria-label="فتح وإغلاق القائمة"
                aria-expanded={mobileMenuOpen}
                aria-controls="app-mobile-menu"
                onClick={() => setMobileMenuOpen((current) => !current)}
            >
                <span /><span /><span />
            </button>

            <div
                id="app-mobile-menu"
                className={`app-mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}
            >
                {/* معلومات الحساب */}
                <div className="app-mobile-user">
                    <span className="app-mobile-user-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
                        </svg>
                    </span>
                    <div>
                        <small>مرحبًا</small>
                        <strong>{userName}</strong>
                    </div>
                </div>

                {/* قسم تعديل الاسم */}
                <div className="app-mobile-account-section">
                    <div className="app-mobile-account-row">
                        <span>الاسم</span>
                        <button
                            type="button"
                            onClick={handleStartEditName}
                            aria-label="تعديل الاسم"
                            className="app-mobile-edit-btn"
                        >
                            ✎
                        </button>
                    </div>

                    {!isEditingName ? (
                        <strong className="app-mobile-account-value">{userName}</strong>
                    ) : (
                        <div className="app-mobile-name-edit">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="اكتب الاسم"
                                className="app-mobile-name-input"
                            />
                            {nameError && (
                                <p className="app-mobile-name-error">{nameError}</p>
                            )}
                            <div className="app-mobile-name-actions">
                                <button
                                    type="button"
                                    onClick={handleUpdateName}
                                    disabled={isUpdatingName}
                                    className="app-mobile-save-btn"
                                >
                                    {isUpdatingName ? <><span className="btn-spinner" />جاري الحفظ</> : "حفظ"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsEditingName(false); setNameError(""); }}
                                    disabled={isUpdatingName}
                                    className="app-mobile-cancel-btn"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="app-mobile-account-row" style={{ marginTop: "12px" }}>
                        <span>البريد الإلكتروني</span>
                    </div>
                    <strong className="app-mobile-account-value app-mobile-account-email">
                        {user?.email || "غير متوفر"}
                    </strong>
                </div>

                <div className="app-mobile-divider" />

                {/* التنقل */}
                <button
                    type="button"
                    className={activePage === "home" ? "active" : ""}
                    onClick={() => handleNavigation(goToHome)}
                >
                    الرئيسية
                </button>

                <button
                    type="button"
                    className={activePage === "subscriptions" ? "active" : ""}
                    onClick={() => handleNavigation(goToSubscriptions)}
                >
                    الاشتراكات
                </button>

                <button
                    type="button"
                    className="app-mobile-logout"
                    onClick={handleLogout}
                >
                    تسجيل الخروج
                </button>
            </div>
        </header>
    );
}

export default AuthenticatedHeader;
