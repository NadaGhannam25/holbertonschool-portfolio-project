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

const storageUserKeys = [
  "dierha_user",
  "user",
  "currentUser",
  "auth",
  "authUser",
  "dierhaUser",
  "userData",
  "session",
];

function SettingsDropdown({ onLogout }: SettingsDropdownProps) {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const [isOpen, setIsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const saveUserLocally = (updatedUser: StoredUser) => {
    const finalUser: StoredUser = {
      ...(getStoredUser() || {}),
      ...(user || {}),
      ...updatedUser,
    };

    localStorage.setItem("dierha_user", JSON.stringify(finalUser));

    for (const storage of [localStorage, sessionStorage]) {
      for (const key of storageUserKeys) {
        const rawValue = storage.getItem(key);

        if (!rawValue) continue;

        try {
          const parsedValue = JSON.parse(rawValue);

          if (
            parsedValue &&
            typeof parsedValue === "object" &&
            !Array.isArray(parsedValue)
          ) {
            const record = parsedValue as Record<string, unknown>;

            if ("name" in record || "email" in record || "id" in record) {
              record.name = finalUser.name;
            }

            if (
              record.user &&
              typeof record.user === "object" &&
              !Array.isArray(record.user)
            ) {
              record.user = {
                ...(record.user as Record<string, unknown>),
                name: finalUser.name,
              };
            }

            if (
              record.data &&
              typeof record.data === "object" &&
              !Array.isArray(record.data)
            ) {
              const dataRecord = record.data as Record<string, unknown>;

              if ("name" in dataRecord || "email" in dataRecord || "id" in dataRecord) {
                dataRecord.name = finalUser.name;
              }

              if (
                dataRecord.user &&
                typeof dataRecord.user === "object" &&
                !Array.isArray(dataRecord.user)
              ) {
                dataRecord.user = {
                  ...(dataRecord.user as Record<string, unknown>),
                  name: finalUser.name,
                };
              }

              record.data = dataRecord;
            }

            storage.setItem(key, JSON.stringify(record));
          }
        } catch {
          // نخلي أي قيمة غير JSON مثل ما هي.
        }
      }
    }

    window.dispatchEvent(
      new CustomEvent("dierha:user-updated", {
        detail: finalUser,
      })
    );

    return finalUser;
  };

  const updateNameOnServer = async (trimmedName: string) => {
    try {
      return await apiRequest<UpdateProfileResponse>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: trimmedName,
        }),
      });
    } catch (patchError) {
      console.warn("PATCH profile update failed, trying PUT.", patchError);

      return await apiRequest<UpdateProfileResponse>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
        }),
      });
    }
  };

  const handleStartEditName = () => {
    setNewName(user?.name || "");
    setNameError("");
    setIsEditingName(true);
    setIsSupportOpen(false);
  };

  const handleUpdateName = async () => {
    const trimmedName = newName.trim().replace(/\s+/g, " ");

    if (!trimmedName) {
      setNameError("يرجى إدخال الاسم.");
      return;
    }

    try {
      setIsUpdatingName(true);
      setNameError("");

      let updatedUser: StoredUser = {
        ...(user || {}),
        name: trimmedName,
      };

      try {
        const response = await updateNameOnServer(trimmedName);

        updatedUser = {
          ...(user || {}),
          ...(response.user || {}),
          name: response.user?.name || trimmedName,
        };
      } catch (serverError) {
        console.warn(
          "Profile name server update failed, saving name locally.",
          serverError
        );
      }

      const savedUser = saveUserLocally(updatedUser);

      setUser(savedUser);
      setNewName(savedUser.name || trimmedName);
      setIsEditingName(false);
      setNameError("");
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
          <svg
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
          >
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
                    width: "24px",
                    height: "24px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    onChange={(event) => {
                      setNewName(event.target.value);
                      setNameError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleUpdateName();
                      }

                      if (event.key === "Escape") {
                        setIsEditingName(false);
                        setNameError("");
                      }
                    }}
                    placeholder="اكتب الاسم"
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "1px solid #D6DAE1",
                      borderRadius: "14px",
                      padding: "0 12px",
                      outline: "none",
                      fontWeight: 700,
                      fontSize: "14px",
                      background: "#FFFFFF",
                    }}
                  />

                  {nameError && (
                    <p
                      style={{
                        color: "#EF476F",
                        fontSize: "12px",
                        marginTop: "6px",
                        lineHeight: 1.6,
                      }}
                    >
                      {nameError}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleUpdateName}
                      disabled={isUpdatingName}
                      style={{
                        width: "86px",
                        height: "38px",
                        border: "none",
                        borderRadius: "12px",
                        background: "#2454E8",
                        color: "#FFFFFF",
                        padding: 0,
                        cursor: isUpdatingName ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        fontSize: "14px",
                        opacity: isUpdatingName ? 0.7 : 1,
                      }}
                    >
                      {isUpdatingName ? "..." : "حفظ"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameError("");
                        setNewName(user?.name || "");
                      }}
                      disabled={isUpdatingName}
                      style={{
                        width: "86px",
                        height: "38px",
                        border: "1px solid #D6DAE1",
                        borderRadius: "12px",
                        background: "#FFFFFF",
                        color: "#667085",
                        padding: 0,
                        cursor: isUpdatingName ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        fontSize: "14px",
                        opacity: isUpdatingName ? 0.7 : 1,
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="settings-account-row"
              style={{ display: "block", marginTop: "14px" }}
            >
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
