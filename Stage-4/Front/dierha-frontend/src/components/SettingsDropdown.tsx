import { useEffect, useRef, useState } from "react";
import { getStoredUser } from "../services/authService";
import { apiRequest } from "../services/api";

type SettingsDropdownProps = {
  onLogout?: () => void;
};

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
};

type UpdateProfileResponse = {
  message: string;
  user: StoredUser;
};

function SettingsDropdown({ onLogout }: SettingsDropdownProps) {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const [isOpen, setIsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const menuRef = useRef<HTMLDivElement | null>(null);
  const userInitial = (user?.name?.trim()?.charAt(0) || "ن").toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSupportOpen(false);
        setIsEditingName(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartEditName = () => {
    setNewName(user?.name || "");
    setNameError("");
    setIsEditingName(true);
    setIsSupportOpen(false);
  };

  const handleUpdateName = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setNameError("يرجى إدخال الاسم.");
      return;
    }

    try {
      setIsUpdatingName(true);
      setNameError("");

      const response = await apiRequest<UpdateProfileResponse>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      localStorage.setItem("dierha_user", JSON.stringify(response.user));

      setUser(response.user);
      setIsEditingName(false);
    } catch (error) {
      console.error(error);
      setNameError("تعذر تحديث الاسم، حاول مرة أخرى.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <div className="settings-dropdown-wrapper person-settings-wrapper" ref={menuRef}>
      <button
        type="button"
        className={`profile-pill profile-settings-trigger ${isOpen ? "open" : ""}`}
        onClick={() => {
          setIsOpen((previous) => !previous);
          setIsSupportOpen(false);
          setIsEditingName(false);
        }}
        aria-label="فتح إعدادات الحساب"
      >
        <span className="profile-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
          </svg>
        </span>

        <strong>{user?.name || "مستخدم"}</strong>

        <span className={`settings-dropdown-arrow ${isOpen ? "open" : ""}`}>
          ‹
        </span>
      </button>

      {isOpen && (
        <div className="settings-dropdown-menu person-settings-menu">
          <div className="settings-account-info">
            <div className="settings-account-row" style={{ display: "block" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <span>الاسم</span>

                <button
                  type="button"
                  onClick={handleStartEditName}
                  aria-label="تعديل الاسم"
                  title="تعديل الاسم"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#2454E8",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: 0,
                  }}
                >
                  ✎
                </button>
              </div>

              {!isEditingName ? (
                <strong
                  style={{
                    display: "block",
                    wordBreak: "break-word",
                    fontSize: "15px",
                  }}
                >
                  {user?.name || "مستخدم"}
                </strong>
              ) : (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="اكتب الاسم"
                    style={{
                      width: "100%",
                      border: "1px solid #D6DAE1",
                      borderRadius: "14px",
                      padding: "10px 12px",
                      outline: "none",
                      fontWeight: 700,
                    }}
                  />

                  {nameError && (
                    <p
                      style={{
                        color: "#EF476F",
                        fontSize: "12px",
                        marginTop: "6px",
                      }}
                    >
                      {nameError}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleUpdateName}
                      disabled={isUpdatingName}
                      style={{
                        flex: 1,
                        border: "none",
                        borderRadius: "12px",
                        background: "#2454E8",
                        color: "#FFFFFF",
                        padding: "9px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {isUpdatingName ? "جاري الحفظ..." : "حفظ"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameError("");
                      }}
                      disabled={isUpdatingName}
                      style={{
                        flex: 1,
                        border: "1px solid #D6DAE1",
                        borderRadius: "12px",
                        background: "#FFFFFF",
                        color: "#667085",
                        padding: "9px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="settings-account-row" style={{ display: "block", marginTop: "14px" }}>
              <span style={{ display: "block", marginBottom: "6px" }}>
                البريد الإلكتروني
              </span>

              <strong
                className="settings-account-email"
                style={{
                  display: "block",
                  wordBreak: "break-all",
                  lineHeight: 1.7,
                }}
              >
                {user?.email || "غير متوفر"}
              </strong>
            </div>
          </div>

          <div className="settings-dropdown-divider" />

          <button
            type="button"
            className={`settings-dropdown-support ${isSupportOpen ? "open" : ""}`}
            onClick={() => {
              setIsSupportOpen((previous) => !previous);
              setIsEditingName(false);
            }}
          >
            <span>الدعم والمساعدة</span>
            <span className={`support-left-arrow ${isSupportOpen ? "open" : ""}`}>
              ‹
            </span>
          </button>

          {isSupportOpen && (
            <div className="settings-support-mini-box">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@dierha.com&su=طلب%20دعم%20-%20ديرها"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#667085",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  wordBreak: "break-all",
                }}
              >
                support@dierha.com
              </a>

              <div>
                <span>رقم التواصل</span>
                <strong>+966 00 000 0000</strong>
              </div>
            </div>
          )}

          {onLogout && (
            <>
              <div className="settings-dropdown-divider" />

              <button type="button" className="settings-logout-btn" onClick={onLogout}>
                تسجيل الخروج
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SettingsDropdown;
