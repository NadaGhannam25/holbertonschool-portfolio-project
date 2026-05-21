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
    font-family: Tahoma, Arial, sans-serif;
    background: #FAFBFC;
    margin: 0;
    padding: 0;
  }

  .wrapper {
    max-width: 620px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid #E5E9F1;
    box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  }

  .header {
    background: linear-gradient(
      135deg,
      #666CC0,
      #6E87C0
    );

    padding: 40px 40px 30px;
    text-align: center !important;
  }

  .header img {
    display: block;
    margin: 0 auto 18px auto;
  }

  .header h1 {
    color: #ffffff;
    font-size: 28px;
    margin: 0;
    font-weight: 700;
    text-align: center !important;
  }

  .body {
    padding: 40px;
    color: #292B2E;
    line-height: 2;
    font-size: 16px;
  }

  .body p {
    margin-top: 0;
    color: #46494E;
  }

  .card {
    background: #FAFBFC;
    border: 1px solid #E5E9F1;
    border-radius: 20px;
    padding: 24px;
    margin: 30px 0;
    line-height: 2;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #E5E9F1;
  }

  .row:last-child {
    border-bottom: none;
  }

  .row span {
    color: #63676E;
  }

  .row strong {
    color: #292B2E;
    font-weight: 700;
  }

  .btn-primary {
    display: inline-block;
    background: linear-gradient(
      135deg,
      #666CC0,
      #6E87C0
    );

    color: #ffffff !important;
    padding: 14px 34px;
    border-radius: 999px;
    text-decoration: none;
    font-weight: bold;
    font-size: 15px;
  }

  .btn-secondary {
    display: inline-block;
    background: linear-gradient(
      135deg,
      #F38DB9,
      #F9E1B3
    );

    color: #292B2E !important;
    padding: 14px 34px;
    border-radius: 999px;
    text-decoration: none;
    font-weight: bold;
    font-size: 15px;
  }

  .footer {
    background: #FAFBFC;
    padding: 24px;
    text-align: center !important;
    color: #63676E;
    font-size: 13px;
    border-top: 1px solid #E5E9F1;
  }

  .manual-note {
    color: #63676E;
    font-size: 14px;
    line-height: 2;
    margin-top: 28px;
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
        width="150"
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
    \`${getFrontendUrl()}/reset-password?token=\${data.token}\`;

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
        width="150"
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
          Authorization: \`Bearer \${apiKey}\`,
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
      \`[Email] Sent to \${params.to}\`,
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
      \`تذكير: \${data.subscriptionName} سيتجدد قريبًا\`,

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
