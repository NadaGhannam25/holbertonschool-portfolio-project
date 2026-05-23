import React, { useState, useEffect } from 'react';

type CancelModalProps = {
    isOpen: boolean;
    onClose: () => void;
    subscriptionName: string;
    cancelUrl?: string;
};

const CancelSubscriptionModal = ({ isOpen, onClose, subscriptionName, cancelUrl }: CancelModalProps) => {
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (isOpen) setStep(1);
    }, [isOpen]);

    if (!isOpen) return null;

    const WarningIcon = () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1D47DA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    );

    // أيقونة الرابط
    const LinkIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
    );

    return (
        <div className="modal-overlay" style={overlayStyle} onClick={onClose}>
            <div className="modal-card" style={cardStyle} onClick={(e) => e.stopPropagation()}>
                
                {step === 1 ? (
                    <>
                        <div style={iconCircleStyle}><WarningIcon /></div>
                        <h2 style={{ color: '#111827', marginBottom: '10px', fontSize: '20px' }}>هل أنت متأكد من حذف الاشتراك؟</h2>
                        <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '15px', lineHeight: '1.5' }}>
                            سيؤدي ذلك إلى حذف اشتراكك في <strong>{subscriptionName}</strong> للأبد ولا يمكن التراجع عن هذه العملية.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button onClick={() => setStep(2)} style={deleteBtnStyle}>نعم، حذف الاشتراك</button>
                            <button onClick={onClose} style={secondaryBtn}>إلغاء</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ ...iconCircleStyle, backgroundColor: '#eff6ff' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1D47DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </div>
                        <h2 style={{ color: '#111827', marginBottom: '10px' }}>خطوات الإلغاء</h2>
                        <p style={{ color: '#4b5563', marginBottom: '20px' }}>يرجى الانتقال للموقع الرسمي لإتمام العملية:</p>
                        
                        {cancelUrl ? (
                            <a href={cancelUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                                <LinkIcon /> الانتقال لموقع الإلغاء
                            </a>
                        ) : (
                            <p style={{ color: '#ef4444' }}>الرابط غير متوفر حالياً.</p>
                        )}

                        <button onClick={onClose} style={{ ...secondaryBtn, marginTop: '20px', width: '100%', flex: 'none' }}>إغلاق</button>
                    </>
                )}
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '30px', borderRadius: '28px',
    width: '90%', maxWidth: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const iconCircleStyle: React.CSSProperties = {
    width: '70px', height: '70px', backgroundColor: '#fff1f2', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
};

const deleteBtnStyle: React.CSSProperties = {
    flex: 2, padding: '12px', backgroundColor: '#1D47DA', color: 'white',
    border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer'
};

const secondaryBtn: React.CSSProperties = {
    flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#4b5563',
    border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer'
};

const linkStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', 
    backgroundColor: '#eff6ff', color: '#1D47DA', borderRadius: '14px', 
    textDecoration: 'none', fontWeight: 'bold', border: '1px dashed #1D47DA', width: '100%', boxSizing: 'border-box'
};

export default CancelSubscriptionModal;
