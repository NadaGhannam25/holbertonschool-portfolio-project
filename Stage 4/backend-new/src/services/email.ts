import 'dotenv/config';
import process from 'process';
import { Resend } from 'resend';

rage/v1/object/public/assets/dierha-logo.png';
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

function buildResetPasswordHtml(data: ResetPasswordEmailData): string {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${data.token}`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8" /><style>${EMAIL_STYLES}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="${EMAIL_LOGO_URL}" alt="Dierha" />
    <h1>إعادة تعيين كلمة المرور</h1>
  </div>
  <div class="body">
    <p>مرحبًا <strong>${data.userName}</strong></p>
    <p>وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في ديرها.</p>
    <div class="card">
      <p>لإكمال العملية، اضغط على الزر التالي لاختيار كلمة مرور جديدة.</p>
      <p>هذا الرابط صالح لمدة <strong>15 دقيقة فقط</strong></p>
    </div>
    <p style="text-align:center !important; margin-top:28px;">
      <a href="${resetUrl}" class="btn-primary">إعادة تعيين كلمة المرور</a>
    </p>
    <p class="manual-note">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.</p>
  </div>
  <div class="footer">ديرها | منصة إدارة الاشتراكات</div>
</div>
</body></html>`;
}


export async function sendReminderEmail(
  data: ReminderEmailData,
): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from:
        process.env.RESEND_REMINDER_EMAIL ?? 'Dierha <reminders@dierha.com>',
      to: data.to,
      subject: `تذكير: اشتراك ${data.subscriptionName} سيتجدد قريبًا`,
      html: buildReminderHtml(data),
    });

    if (result.error) {
      console.error('[Email] Reminder error:', result.error);
      return false;
    }

    console.log('[Email] Reminder sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Reminder failed:', error);
    return false;
  }
}

export async function sendResetPasswordEmail(
  data: ResetPasswordEmailData,
): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_SUPPORT_EMAIL ?? 'Dierha <support@dierha.com>',
      to: data.to,
      subject: 'إعادة تعيين كلمة المرور - ديرها',
      html: buildResetPasswordHtml(data),
    });

    if (result.error) {
      console.error('[Email] Reset password error:', result.error);
      return false;
    }

    console.log('[Email] Reset password sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Reset password failed:', error);
    return false;
  }
}
