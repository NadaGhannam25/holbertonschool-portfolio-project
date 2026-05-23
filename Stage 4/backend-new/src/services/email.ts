import 'dotenv/config';
import process from 'process';
import { Resend } from 'resend';


interface ReminderEmailData {
  to: string;
  userName: string;
  subscriptionName: string;
  renewalDate: string;
  amount: string;
  billingCycle: string;
  cancelUrl?: string | null;
}

interface ResetPasswordEmailData {
  to: string;
  userName: string;
  token: string;
}


const resend = new Resend(process.env.RESEND_API_KEY);


const EMAIL_LOGO_URL =
  'https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png';

const EMAIL_STYLES = `
  body, table, td, p, div, span, a {
    direction: rtl !important;
    text-align: right !important;
  }
  body {
    font-family: Tahoma, Arial, sans-serif;
    background: #FAFBFC;
    margin: 0;
    padding: 45px 0;
    color: #292B2E;
  }
  .wrapper {
    max-width: 660px;
    margin: auto;
    background: #FFFFFF;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid #D6DAE1;
    box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  }
  .header {
    background: linear-gradient(
      135deg,
      #666CC0 0%,
      #6E87C0 45%,
      #F3B0B9 100%
    ) !important;
    padding: 55px 40px 45px;
    text-align: center !important;
    color: #FFFFFF !important;
  }
  .header img {
    width: 220px;
    margin: 0 auto 22px auto;
    display: block;
    background: transparent;
    border-radius: 24px;
    padding: 12px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.12);
  }
  .header h1 {
    margin: 0;
    font-size: 38px;
    font-weight: 800;
    color: #FFFFFF;
    text-align: center !important;
  }
  .body {
    padding: 45px 55px;
    line-height: 2.1;
    color: #292B2E;
  }
  .body p { font-size: 16px; color: #46494E; }
  .card {
    background: linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%);
    border: 1px solid #D6DAE1;
    border-radius: 24px;
    padding: 26px;
    margin: 35px 0;
    box-shadow: 0 6px 16px rgba(102,108,192,0.06);
  }
  .row { padding: 20px 0; border-bottom: 1px solid #E5E9F1; }
  .row:last-child { border-bottom: none; }
  .row span {
    display: block;
    color: #6E87C0;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 700;
  }
  .row strong { color: #292B2E; font-size: 22px; font-weight: 800; }
  .btn-primary, .btn-secondary {
    display: inline-block;
    background: linear-gradient(135deg, #F56F96) !important;
    color: #FFFFFF !important;
    padding: 18px 52px;
    border-radius: 999px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 800;
    border: none;
    box-shadow: 0 12px 24px rgba(255,92,147,0.28);
  }
  .footer {
    margin-top: 40px;
    text-align: center !important;
    color: #63676E;
    font-size: 14px;
    padding: 30px;
    background: #E5E9F1;
    border-top: 1px solid #D6DAE1;
  }
  .manual-note {
    color: #63676E;
    font-size: 15px;
    line-height: 2.2;
    margin-top: 35px;
  }
`;

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBillingCycle(cycle: string): string {
  const map: Record<string, string> = {
    weekly: 'أسبوعي',
    monthly: 'شهري',
    quarterly: 'كل ٣ أشهر',
    semi_annual: 'كل ٦ أشهر',
    yearly: 'سنوي',
  };
  return map[cycle] ?? cycle;
}


function buildReminderHtml(data: ReminderEmailData): string {
  const cancelSection = data.cancelUrl
    ? `<p style="text-align:center !important; margin-top:28px;">
         <a href="${data.cancelUrl}" class="btn-secondary">إلغاء الاشتراك</a>
       </p>`
    : `<p class="manual-note">
         هذا الاشتراك تمت إضافته يدويًا، لذلك لا يتوفر رابط إلغاء مباشر.
         يمكنك إضافة رابط إلغاء الاشتراك من صفحة تفاصيل الاشتراك.
       </p>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8" /><style>${EMAIL_STYLES}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="${EMAIL_LOGO_URL}" alt="Dierha" />
    <h1>تذكير بتجديد اشتراك</h1>
  </div>
  <div class="body">
    <p>مرحبًا <strong>${data.userName}</strong></p>
    <p>نذكّرك بأن اشتراكك في <strong>${data.subscriptionName}</strong> سيتجدد قريبًا.</p>
    <div class="card">
      <div class="row"><span>الخدمة</span><strong>${data.subscriptionName}</strong></div>
      <div class="row"><span>تاريخ التجديد</span><strong>${formatDate(data.renewalDate)}</strong></div>
      <div class="row"><span>المبلغ</span><strong>${data.amount} ريال</strong></div>
      <div class="row"><span>دورة الدفع</span><strong>${formatBillingCycle(data.billingCycle)}</strong></div>
    </div>
    ${cancelSection}
  </div>
  <div class="footer">ديرها | منصة إدارة الاشتراكات</div>
</div>
</body></html>`;
}

