import { useEffect, useRef, useState } from "react";

type ReminderPreference =
    | "قبل بيوم"
    | "قبل بثلاث أيام"
    | "قبل بأسبوع"
    | "إيقاف التذكير";

type EditSubscriptionValues = {
    category: string;
    price: number;
    duration: string;
    renewalDate: string;
    status: string;
    notes: string;
    reminderPreference?: ReminderPreference;

    name?: string;
    cancelUrl?: string;
};

type EditSubscriptionModalProps = {
    isOpen: boolean;
    subscriptionName: string;
    initialValues: EditSubscriptionValues;

    isCustomSubscription?: boolean;

    onClose: () => void;
    onSave: (values: EditSubscriptionValues) => void;
};

const categoryOptions = [
    "العمل",
    "الترفيه",
    "الصحة",
    "التعليم",
    "أخرى",
];

const durationOptions = [
    "أسبوعي",
    "شهري",
    "3 أشهر",
    "6 أشهر",
    "سنة",
];

const statusOptions = ["نشط", "غير نشط"];

const reminderOptions: ReminderPreference[] = [
    "قبل بيوم",
    "قبل بثلاث أيام",
    "قبل بأسبوع",
    "إيقاف التذكير",
];

const arabicMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
];

const formatArabicDateDisplay = (value: string) => {
    if (!value) return "حدد تاريخ الاشتراك";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "حدد تاريخ الاشتراك";
    }

    return `${date.getDate()} ${
        arabicMonths[date.getMonth()]
    } ${date.getFullYear()}`;
};

function EditSubscriptionModal({
    isOpen,
    subscriptionName,
    initialValues,
    isCustomSubscription = false,
    onClose,
    onSave,
}: EditSubscriptionModalProps) {
    const [formData, setFormData] =
        useState<EditSubscriptionValues>({
            ...initialValues,
            reminderPreference:
                initialValues.reminderPreference ||
                "قبل بيوم",
        });

    const [isReminderConfirmOpen, setIsReminderConfirmOpen] =
        useState(false);
    const [calculatedRenewalDate, setCalculatedRenewalDate] = useState<string>("");
    const renewalDateInputRef =
        useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...initialValues,
                reminderPreference:
                    initialValues.reminderPreference ||
                    "قبل بيوم",
            });

            setIsReminderConfirmOpen(false);
        }
    }, [isOpen, initialValues]);
    useEffect(() => {
        if (!formData.renewalDate) {
            setCalculatedRenewalDate("");
            return;
        }

        const date = new Date(formData.renewalDate);
        if (Number.isNaN(date.getTime())) return;

        switch (formData.duration) {
            case "أسبوعي":
                date.setDate(date.getDate() + 7);
                break;
            case "شهري":
                date.setMonth(date.getMonth() + 1);
                break;
            case "3 أشهر":
                date.setMonth(date.getMonth() + 3);
                break;
            case "6 أشهر":
                date.setMonth(date.getMonth() + 6);
                break;
            case "سنة":
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                break;
        }

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        
        setCalculatedRenewalDate(`${yyyy}-${mm}-${dd}`);
    }, [formData.renewalDate, formData.duration]);
    if (!isOpen) return null;

    const updateField = (
        field: keyof EditSubscriptionValues,
        value: string | number
    ) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleReminderPreferenceChange = (
        value: ReminderPreference
    ) => {
        if (value === "إيقاف التذكير") {
            setIsReminderConfirmOpen(true);
            return;
        }

        updateField("reminderPreference", value);
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const normalizedPrice = Number(formData.price);

        if (
            !formData.category ||
            !Number.isFinite(normalizedPrice) ||
            normalizedPrice < 0 ||
            !formData.duration ||
            !formData.renewalDate ||
            !formData.status
        ) {
            window.dispatchEvent(
                new CustomEvent("dierha-toast", {
                    detail:
                        "يرجى تعبئة الحقول المطلوبة قبل حفظ التعديلات.",
                })
            );

            return;
        }

        if (
            isCustomSubscription &&
            !formData.name?.trim()
        ) {
            window.dispatchEvent(
                new CustomEvent("dierha-toast", {
                    detail: "اسم التطبيق مطلوب.",
                })
            );

            return;
        }

        onSave({...formData,
            renewalDate: calculatedRenewalDate || formData.renewalDate });
        onClose(); };

    return (
        <div
            className="edit-modal-overlay"
            role="dialog"
            aria-modal="true"
        >
            <div className="edit-modal-card">
                <div className="edit-modal-header">
                    <div>
                        <h2>تعديل الاشتراك</h2>
                        <p>{subscriptionName}</p>
                    </div>

                    <button
                        type="button"
                        className="edit-modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form
                    className="edit-modal-form"
                    onSubmit={handleSubmit}
                >
                    <div className="edit-modal-grid">
                        {isCustomSubscription && (
                            <>
                                <div className="edit-modal-field full">
                                    <label>
                                        اسم التطبيق <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="اكتب اسم التطبيق"
                                        value={formData.name || ""}
                                        onChange={(event) =>
                                            updateField(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="edit-modal-field full">
                                    <label>
                                        رابط إلغاء الاشتراك
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="example.com/cancel"
                                        value={
                                            formData.cancelUrl || ""
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "cancelUrl",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}

                        <div className="edit-modal-field">
                            <label>
                                التصنيف <span>*</span>
                            </label>

                            <div className="edit-select-wrapper">
                                <select
                                    value={formData.category}
                                    onChange={(event) =>
                                        updateField(
                                            "category",
                                            event.target.value
                                        )
                                    }
                                >
                                    {categoryOptions.map(
                                        (category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        )
                                    )}
                                </select>

                                <span className="edit-select-arrow">
                                    ▾
                                </span>
                            </div>
                        </div>

                        <div className="edit-modal-field">
                            <label>
                                السعر <span>*</span>
                            </label>

                            <div className="edit-price-input">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={formData.price}
                                    onChange={(event) =>
                                        updateField(
                                            "price",
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                />

                                <span>ريال</span>
                            </div>
                        </div>

                        <div className="edit-modal-field">
                            <label>
                                مدة الاشتراك <span>*</span>
                            </label>

                            <div className="edit-select-wrapper">
                                <select
                                    value={formData.duration}
                                    onChange={(event) =>
                                        updateField(
                                            "duration",
                                            event.target.value
                                        )
                                    }
                                >
                                    {durationOptions.map(
                                        (duration) => (
                                            <option
                                                key={duration}
                                                value={duration}
                                            >
                                                {duration}
                                            </option>
                                        )
                                    )}
                                </select>

                                <span className="edit-select-arrow">
                                    ▾
                                </span>
                            </div>
                        </div>

                        <div className="edit-modal-field">
                            <label>
                                تاريخ الاشتراك <span>*</span>
                            </label>

                            <div className="arabic-calendar-field">
                                <button
                                    type="button"
                                    className={`arabic-calendar-display ${
                                        formData.renewalDate
                                            ? "has-value"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        const input =
                                            renewalDateInputRef.current as
                                                | (HTMLInputElement & {
                                                      showPicker?: () => void;
                                                  })
                                                | null;

                                        input?.showPicker?.();

                                        input?.focus();
                                    }}
                                >
                                    <span>
                                        {formatArabicDateDisplay(
                                            formData.renewalDate
                                        )}
                                    </span>

                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M7 3V6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M17 3V6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M4 9H20"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V18C20 19.6569 18.6569 21 17 21H7C5.34315 21 4 19.6569 4 18V7.5C4 6.11929 5.11929 5 6.5 5Z"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        />
                                    </svg>
                                </button>

                                <input
                                    ref={renewalDateInputRef}
                                    type="date"
                                    className="hidden-native-date-input"
                                    value={formData.renewalDate}
                                    onChange={(event) =>
                                        updateField(
                                            "renewalDate",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="edit-modal-field full">
                            <label style={{ color: "#4F46E5", fontWeight: "bold" }}>
                            </label>
                            <div className="arabic-calendar-field" style={{ opacity: 0.85 }}>
                                <div className="arabic-calendar-display" style={{ background: "#f3f4f6", border: "1px #e5e7eb" }}>
                                    <span style={{ color: "#1f2937", fontWeight: "600" }}>
                                        {formatArabicDateDisplay(calculatedRenewalDate)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="edit-modal-field">
                            <label>
                                الحالة <span>*</span>
                            </label>

                            <div className="edit-select-wrapper">
                                <select
                                    value={formData.status}
                                    onChange={(event) =>
                                        updateField(
                                            "status",
                                            event.target.value
                                        )
                                    }
                                >
                                    {statusOptions.map(
                                        (status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        )
                                    )}
                                </select>

                                <span className="edit-select-arrow">
                                    ▾
                                </span>
                            </div>
                        </div>

                        <div className="edit-modal-field">
                            <label>
                                التذكير قبل التجديد{" "}
                                <span>*</span>
                            </label>

                            <div className="edit-select-wrapper">
                                <select
                                    value={
                                        formData.reminderPreference ||
                                        "قبل بيوم"
                                    }
                                    onChange={(event) =>
                                        handleReminderPreferenceChange(
                                            event.target
                                                .value as ReminderPreference
                                        )
                                    }
                                >
                                    {reminderOptions.map(
                                        (option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>

                                <span className="edit-select-arrow">
                                    ▾
                                </span>
                            </div>
                        </div>

                        <div className="edit-modal-field full">
                            <label>
                                ملاحظات اختيارية
                            </label>

                            <textarea
                                placeholder="أضف ملاحظات حول هذا الاشتراك..."
                                value={formData.notes}
                                onChange={(event) =>
                                    updateField(
                                        "notes",
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="edit-modal-actions">
                        <button
                            type="submit"
                            className="edit-save-btn"
                        >
                            حفظ التعديلات
                        </button>

                        <button
                            type="button"
                            className="edit-cancel-btn"
                            onClick={onClose}
                        >
                            إلغاء
                        </button>
                    </div>
                </form>

                {isReminderConfirmOpen && (
                    <div
                        className="edit-modal-overlay nested-confirm-overlay"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="edit-modal-card compact-confirm-card edit-reminder-confirm-modal">
                            <div className="edit-modal-header">
                                <div>
                                    <h2>إيقاف التذكير</h2>

                                    <p>
                                        هل أنت متأكد من إيقاف
                                        التذكير لهذا الاشتراك؟
                                        لن تصلك تذكيرات قبل موعد
                                        التجديد في حال تمت
                                        الموافقة.
                                    </p>
                                </div>
                            </div>

                            <div className="edit-modal-actions confirm-actions">
                                <button
                                    type="button"
                                    className="edit-save-btn"
                                    onClick={() => {
                                        updateField(
                                            "reminderPreference",
                                            "إيقاف التذكير"
                                        );

                                        setIsReminderConfirmOpen(
                                            false
                                        );
                                    }}
                                >
                                    نعم، إيقاف التذكير
                                </button>

                                <button
                                    type="button"
                                    className="edit-cancel-btn"
                                    onClick={() =>
                                        setIsReminderConfirmOpen(
                                            false
                                        )
                                    }
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditSubscriptionModal;
