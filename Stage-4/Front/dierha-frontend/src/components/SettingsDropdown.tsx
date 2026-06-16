import { useEffect, useRef, useState } from "react";
import { getStoredUser } from "../services/authService";

type SettingsDropdownProps = {
    onLogout: () => void;
};

type StoredUser = {
    id?: number | string;
    name?: string;
    email?: string;
    [key: string]: unknown;
};

const STORAGE_USER_KEYS = [
    "user",
    "currentUser",
    "authUser",
    "dierhaUser",
    "userData",
    "auth",
    "session",
    "dierha-auth",
    "auth-storage",
];

const DIRECT_NAME_KEYS = ["dierha_user_name", "userName", "name"];

function normalizeName(value: string) {
    return value.replace(/\s+/g, " ").trim();
}

function isValidName(value: string) {
    const name = normalizeName(value);

    if (name.length < 2) return false;
    if (name.length > 40) return false;

    return /^[\p{L}\p{M}\s.'-]+$/u.test(name);
}

function updateNameInObject(value: unknown, newName: string): unknown {
    if (!value || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => updateNameInObject(item, newName));
    }

    const objectValue = value as Record<string, unknown>;
    const nextValue: Record<string, unknown> = { ...objectValue };

    if ("name" in nextValue) {
        nextValue.name = newName;
    }

    const nestedKeys = ["user", "data", "auth", "currentUser", "profile", "session", "state"];

    for (const key of nestedKeys) {
        if (nextValue[key] && typeof nextValue[key] === "object") {
            nextValue[key] = updateNameInObject(nextValue[key], newName);
        }
    }

    return nextValue;
}

function saveUserNameEverywhere(newName: string, fallbackUser: StoredUser) {
    let updatedAnyStoredUser = false;
    const storages = [localStorage, sessionStorage];

    for (const storage of storages) {
        for (const key of STORAGE_USER_KEYS) {
            const rawValue = storage.getItem(key);

            if (!rawValue) continue;

            try {
                const parsedValue = JSON.parse(rawValue);
                const updatedValue = updateNameInObject(parsedValue, newName);

                storage.setItem(key, JSON.stringify(updatedValue));
                updatedAnyStoredUser = true;
            } catch {
                // Ignore non-JSON values.
            }
        }

        for (const key of DIRECT_NAME_KEYS) {
            if (storage.getItem(key) !== null) {
                storage.setItem(key, newName);
                updatedAnyStoredUser = true;
            }
        }
    }

    if (!updatedAnyStoredUser) {
        localStorage.setItem(
            "user",
            JSON.stringify({
                ...fallbackUser,
                name: newName,
            })
        );
    }
}

function PencilIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M15.5 5.5L18.5 8.5M4 20H7.25L18.1 9.15C18.9284 8.32157 18.9284 6.97843 18.1 6.15L17.85 5.9C17.0216 5.07157 15.6784 5.07157 14.85 5.9L4 16.75V20Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SettingsDropdown({ onLogout }: SettingsDropdownProps) {
    const initialUser = (getStoredUser?.() ?? {}) as StoredUser;
    const initialName = normalizeName(initialUser?.name || "مستخدم");
    const initialEmail = String(initialUser?.email || "");

    const [isOpen, setIsOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [userName, setUserName] = useState(initialName);
    const [editedName, setEditedName] = useState(initialName);
    const [errorMessage, setErrorMessage] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const userInitial = userName.charAt(0).toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsEditingName(false);
                setErrorMessage("");
                setEditedName(userName);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userName]);

    const handleStartEditing = () => {
        setEditedName(userName);
        setErrorMessage("");
        setIsEditingName(true);
    };

    const handleCancelEditing = () => {
        setEditedName(userName);
        setErrorMessage("");
        setIsEditingName(false);
    };

    const handleSaveName = () => {
        const nextName = normalizeName(editedName);

        if (!isValidName(nextName)) {
            setErrorMessage("اكتبي اسم صحيح من حرفين إلى 40 حرف.");
            return;
        }

        const fallbackUser: StoredUser = {
            ...initialUser,
            name: nextName,
            email: initialEmail,
        };

        saveUserNameEverywhere(nextName, fallbackUser);

        setUserName(nextName);
        setEditedName(nextName);
        setErrorMessage("");
        setIsEditingName(false);

        window.dispatchEvent(
            new CustomEvent("dierha:user-updated", {
                detail: { name: nextName },
            })
        );
    };

    const handleLogout = () => {
        setIsOpen(false);
        onLogout();
    };

    return (
        <div className="settings-dropdown-wrapper person-settings-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className="settings-dropdown-trigger profile-settings-trigger"
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span
                    className={`settings-dropdown-arrow ${isOpen ? "open" : ""}`}
                    aria-hidden="true"
                >
                    ^
                </span>

                <strong>{userName}</strong>

                <span className="settings-dropdown-avatar" aria-hidden="true">
                    {userInitial}
                </span>
            </button>

            {isOpen && (
                <div className="settings-dropdown-menu person-settings-menu" role="menu">
                    {!isEditingName ? (
                        <>
                            <div className="settings-dropdown-profile">
                                <span className="settings-dropdown-avatar" aria-hidden="true">
                                    {userInitial}
                                </span>

                                <div>
                                    <strong>{userName}</strong>
                                    {initialEmail && <p>{initialEmail}</p>}
                                </div>
                            </div>

                            <div className="settings-dropdown-divider" />

                            <div className="settings-dropdown-section">
                                <button
                                    type="button"
                                    className="settings-dropdown-support"
                                    onClick={handleStartEditing}
                                >
                                    <span>تعديل الاسم</span>
                                    <span className="support-left-arrow" aria-hidden="true">
                                        <PencilIcon />
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="settings-dropdown-support settings-dropdown-logout"
                                    onClick={handleLogout}
                                >
                                    <span>تسجيل الخروج</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <form
                            className="settings-profile-edit-form"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSaveName();
                            }}
                        >
                            <div className="settings-profile-edit-title">
                                <PencilIcon />
                                <label htmlFor="settings-profile-name">الاسم :</label>
                            </div>

                            <input
                                id="settings-profile-name"
                                type="text"
                                value={editedName}
                                onChange={(event) => {
                                    setEditedName(event.target.value);
                                    setErrorMessage("");
                                }}
                                autoFocus
                                maxLength={40}
                            />

                            {errorMessage && (
                                <p className="settings-profile-edit-error">{errorMessage}</p>
                            )}

                            <div className="settings-profile-edit-actions">
                                <button
                                    type="submit"
                                    className="settings-profile-save-btn"
                                >
                                    حفظ
                                </button>

                                <button
                                    type="button"
                                    className="settings-profile-cancel-btn"
                                    onClick={handleCancelEditing}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default SettingsDropdown;
