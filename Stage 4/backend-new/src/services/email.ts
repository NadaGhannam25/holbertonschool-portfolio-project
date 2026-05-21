import 'dotenv/config';

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

const EMAIL_LOGO_URL =
  'https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png.jpeg';

const EMAIL_STYLES = `

  body,
  table,
  td,
  p,
  div,
  span,
  a {
    direction: rtl !important;
    text-align: right !important;
  }

  body {

    font-family:
      Tahoma,
      Arial,
      sans-serif;

    background: #FAFBFC;

    margin: 0;

    padding: 40px 0;
  }

  .wrapper {

    max-width: 650px;

    margin: auto;

    background: #FFFFFF;

    border-radius: 30px;

    overflow: hidden;

    border: 1px solid #D6DAE1;

    box-shadow:
      0 10px 35px rgba(102,108,192,0.10);
  }

  .header {

    background:
      linear-gradient(
        135deg,
        #666CC0 0%,
        #6E87C0 55%,
        #F9E1B3 100%
      );

    padding:
      55px
      40px
      42px;

    text-align: center !important;
  }

  .header img {

    display: block;

    margin:
      0 auto 24px auto;

    width: 180px;

    filter:
      drop-shadow(
        0 8px 16px rgba(0,0,0,0.15)
      );
  }

  .header h1 {

    color: #FFFFFF;

    font-size: 32px;

    font-weight: 800;

    margin: 0;

    letter-spacing: -.5px;

    text-align: center !important;
  }

  .body {

    padding: 46px;

    color: #292B2E;

    line-height: 2.1;

    font-size: 16px;
  }

  .body p {

    margin-top: 0;

    color: #46494E;

    font-size: 16px;
  }

  .card {

    background:
      linear-gradient(
        180deg,
        #FFFFFF,
        #FAFBFC
      );

    border:
      1px solid #E5E9F1;

    border-radius: 24px;

    padding: 30px;

    margin: 34px 0;

    box-shadow:
      0 4px 14px rgba(0,0,0,0.03);
  }

  .row {

    padding:
      16px 0;

    border-bottom:
      1px solid #E5E9F1;
  }

  .row:last-child {
    border-bottom: none;
  }

  .row span {

    display: block;

    color: #63676E;

    font-size: 14px;

    margin-bottom: 4px;
  }

  .row strong {

    color: #292B2E;

    font-size: 16px;

    font-weight: 700;
  }

  .btn-primary {

    display: inline-block;

    background:
      linear-gradient(
        135deg,
        #666CC0,
        #6E87C0
      );

    color: #FFFFFF !important;

    padding:
      16px 44px;

    border-radius: 999px;

    text-decoration: none;

    font-size: 15px;

    font-weight: 700;

    box-shadow:
      0 10px 20px rgba(102,108,192,0.25);
  }

  .btn-secondary {

    display: inline-block;

    background:
      linear-gradient(
        135deg,
        #F9E1B3,
        #F3B0B9
      );

    color: #292B2E !important;

    padding:
      16px 44px;

    border-radius: 999px;

    text-decoration: none;

    font-size: 15px;

    font-weight: 700;
  }

  .footer {

    background: #FAFBFC;

    padding: 28px;

    text-align: center !important;

    color: #63676E;

    font-size: 13px;

    border-top:
      1px solid #E5E9F1;
  }

  .manual-note {

    color: #63676E;

    font-size: 14px;

    line-height: 2;

    margin-top: 30px;
  }

`;

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ??
    'http://localhost:5173';
}

function formatDate(dateStr: string): string {

  const date = new Date(dateStr);

  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBillingCycle(
  cycle: string,
): string {

  const map: Record<string, string> = {
    weekly: 'اسبوعي',
    monthly: 'شهري',
    quarterly: 'كل ٣ شهور',
    semi_annual: 'كل ٦ شهور',
    yearly: 'سنوي',
  };

  return map[cycle] ?? cycle;
}

function buildReminderEmailHtml(
  data: ReminderEmailData,
): string {

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

<meta charset="UTF-8" />

<style>
${EMAIL_STYLES}
</style>

</head>

<body>

<div class="wrapper">

<div class="header">

<img
src="${EMAIL_LOGO_URL}"
alt="Dierha"
/>

<h1>
تذكير بتجديد اشتراك
</h1>

</div>

<div class="body">

<p>
مرحبًا
<strong>${data.userName}</strong>
</p>

<p>
نذكّرك بأن اشتراكك في
<strong>${data.subscriptionName}</strong>
سيتجدد قريبًا.
</p>

<div class="card">

<div class="row">
<span>الخدمة</span>
<strong>${data.subscriptionName}</strong>
</div>

<div class="row">
<span>تاريخ التجديد</span>
<strong>${formatDate(data.renewalDate)}</strong>
</div>

<div class="row">
<span>المبلغ</span>
<strong>${data.amount} ريال</strong>
</div>

<div class="row">
<span>دورة الدفع</span>
<strong>${formatBillingCycle(data.billingCycle)}</strong>
</div>

</div>

${
  data.cancelUrl
    ? `
      <p style="text-align:center !important; margin-top:28px;">

        <a
          href="${data.cancelUrl}"
          class="btn-secondary"
        >
          إلغاء الاشتراك
        </a>

      </p>
    `
    : `
      <p class="manual-note">

        هذا الاشتراك تمت إضافته يدويًا،
        لذلك لا يتوفر رابط إلغاء مباشر.

      </p>
    `
}

</div>

<div class="footer">
ديرها | منصة إدارة الاشتراكات
</div>

</div>

</body>
</html>
`;
}

function buildResetPasswordHtml(
  data: ResetPasswordEmailData,
): string {

  const resetUrl =
    `${getFrontendUrl()}/reset-password?token=${data.token}`;

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

<meta charset="UTF-8" />

<style>
${EMAIL_STYLES}
</style>

</head>

<body>

<div class="wrapper">

<div class="header">

<img
src="${EMAIL_LOGO_URL}"
alt="Dierha"
/>

<h1>
إعادة تعيين كلمة المرور
</h1>

</div>

<div class="body">

<p>
مرحبًا
<strong>${data.userName}</strong>
</p>

<p>
وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في
<strong>ديرها</strong>.
</p>

<div class="card">

<p>
لإكمال العملية،
اضغطي على الزر التالي
لاختيار كلمة مرور جديدة.
</p>

<p>
هذا الرابط صالح لمدة
<strong>15 دقيقة فقط</strong>.
</p>

</div>

<p
style="
text-align:center !important;
margin-top:28px;
"
>

<a
href="${resetUrl}"
class="btn-primary"
>
إعادة تعيين كلمة المرور
</a>

</p>

<p class="manual-note">

إذا لم تطلبي إعادة تعيين كلمة المرور،
يمكنك تجاهل هذه الرسالة بأمان.

</p>

</div>

<div class="footer">
ديرها | منصة إدارة الاشتراكات
</div>

</div>

</body>
</html>
`;
}

async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {

  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {

    console.warn(
      '[Email] RESEND_API_KEY is missing',
    );

    return false;
  }

  try {

    const response = await fetch(
      'https://api.resend.com/emails',
      {

        method: 'POST',

        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          from: params.from,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      },
    );

    if (!response.ok) {

      const errorBody =
        await response.json();

      console.error(
        '[Email] Failed to send:',
        errorBody,
      );

      return false;
    }

    console.log(
      `[Email] Sent to ${params.to}`,
    );

    return true;

  } catch (error) {

    console.error(
      '[Email] Error:',
      error,
    );

    return false;
  }
}

export async function sendReminderEmail(
  data: ReminderEmailData,
): Promise<boolean> {

  return sendEmail({

    from:
      process.env.RESEND_REMINDER_EMAIL ??
      'Dierha <reminders@dierha.com>',

    to: data.to,

    subject:
      `تذكير: ${data.subscriptionName} سيتجدد قريبًا`,

    html:
      buildReminderEmailHtml(data),
  });
}

export async function sendResetPasswordEmail(
  data: ResetPasswordEmailData,
): Promise<boolean> {

  return sendEmail({

    from:
      process.env.RESEND_SUPPORT_EMAIL ??
      'Dierha <support@dierha.com>',

    to: data.to,

    subject:
      'إعادة تعيين كلمة المرور',

    html:
      buildResetPasswordHtml(data),
  });
}
