import { useEffect, useRef, useState } from "react";
import logo from "../assets/dierha-logo.png";
import { getStoredUser } from "../services/authService";
import SettingsDropdown from "./SettingsDropdown";

type AuthenticatedHeaderProps = {
    activePage: "home" | "subscriptions";
    onLogout: () => void;
    goToHome: () => void;
    goToSubscriptions: () => void;
};

function AuthenticatedHeader({
    activePage,
    onLogout,
    goToHome,
    goToSubscriptions,
}: AuthenticatedHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLElement | null>(null);
    const user = getStoredUser();
    const userName = user?.name?.trim() || "مستخدم";
    const userInitial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigation = (navigate: () => void) => {
        setMobileMenuOpen(false);
        navigate();
    };

    const handleLogout = () => {
        setMobileMenuOpen(false);
        onLogout();
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
                <span />
                <span />
                <span />
            </button>

            <div
                id="app-mobile-menu"
                className={`app-mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}
            >
                <div className="app-mobile-user">
                    <span className="app-mobile-user-icon" aria-hidden="true">
                        {userInitial}
                    </span>
                    <div>
                        <small>مرحبًا</small>
                        <strong>{userName}</strong>
                    </div>
                </div>

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
