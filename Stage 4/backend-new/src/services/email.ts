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

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBillingCycle(cycle: string): string {
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
    body {
      font-family: Arial, sans-serif;
      background: #f4f6fb;
      direction: rtl;
      margin: 0;
      padding: 0;
    }

    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .header {
      background: linear-gradient(135deg, #1e3a5f, #2e5d9e);
      padding: 32px 40px;
      text-align: center;
    }

    .header h1 {
      color: #ffffff;
      font-size: 22px;
      margin: 0;
    }

    .body {
      padding: 32px 40px;
      color: #1f2937;
    }

    .card {
      background: #f8f9ff;
      border: 1px solid #e2e8f8;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #edf0f8;
    }

    .row:last-child {
      border-bottom: none;
    }

    .btn-cancel {
      display: inline-block;
      background: #ffffff;
      color: #e53e3e;
      border: 1.5px solid #e53e3e;
      padding: 12px 28px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
    }

    .footer {
      background: #f4f6fb;
      padding: 20px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
    }

    .manual-note {
      color: #6b7280;
      font-size: 14px;
      margin-top: 24px;
      line-height: 1.8;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="header">
      <h1>تذكير بتجديد اشتراك</h1>
    </div>

    <div class="body">

      <p>
        مرحبًا <strong>${data.userName}</strong>،
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
            <p style="text-align:center; margin-top:28px;">
              <a href="${data.cancelUrl}" class="btn-cancel">
                إدارة أو إلغاء الاشتراك
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
      <p>ديرها | منصة إدارة الاشتراكات</p>
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
    body {
      font-family: Arial, sans-serif;
      background: #f4f6fb;
      direction: rtl;
      margin: 0;
      padding: 0;
    }

    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .header {
      background: linear-gradient(135deg, #1e3a5f, #2e5d9e);
      padding: 32px 40px;
      text-align: center;
    }

    .header h1 {
      color: #ffffff;
      font-size: 22px;
      margin: 0;
    }

    .body {
      padding: 32px 40px;
      color: #1f2937;
    }

    .card {
      background: #f8f9ff;
      border: 1px solid #e2e8f8;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      line-height: 1.8;
    }

    .btn-reset {
      display: inline-block;
      background: #1e3a5f;
      color: #ffffff;
      border: 1.5px solid #1e3a5f;
      padding: 12px 28px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
    }

    .footer {
      background: #f4f6fb;
      padding: 20px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
    }

    .manual-note {
      color: #6b7280;
      font-size: 14px;
      margin-top: 24px;
      line-height: 1.8;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="header">
      <h1>إعادة تعيين كلمة المرور</h1>
    </div>

    <div class="body">

      <p>
        مرحبًا <strong>${data.userName}</strong>،
      </p>

      <p>
        وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في
        <strong>ديرها</strong>.
      </p>

      <div class="card">

        <p>
          لإكمال العملية، اضغطي على الزر التالي
          لاختيار كلمة مرور جديدة.
        </p>

        <p>
          هذا الرابط صالح لمدة
          <strong>15 دقيقة فقط</strong>.
        </p>

      </div>

      <p style="text-align:center; margin-top:28px;">
        <a href="${resetUrl}" class="btn-reset">
          إعادة تعيين كلمة المرور
        </a>
      </p>

      <p class="manual-note">
        إذا لم تطلبي إعادة تعيين كلمة المرور،
        يمكنك تجاهل هذه الرسالة بأمان.
      </p>

    </div>

    <div class="footer">
      <p>ديرها | منصة إدارة الاشتراكات</p>
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

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY is missing');
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

      const errorBody = await response.json();

      console.error(
        '[Email] Failed to send:',
        errorBody,
      );

      return false;
    }

    console.log(`[Email] Sent to ${params.to}`);

    return true;

  } catch (error) {

    console.error('[Email] Error:', error);

    return false;
  }
}

export async function sendReminderEmail(
  data: ReminderEmailData,
): Promise<boolean> {

  return sendEmail({
    from:
      process.env.RESEND_REMINDER_EMAIL ??
      'Dierha <reminder@dierha.com>',

    to: data.to,

    subject:
      `تذكير: ${data.subscriptionName} سيتجدد قريبًا`,

    html: buildReminderEmailHtml(data),
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

    subject: 'إعادة تعيين كلمة المرور',

    html: buildResetPasswordHtml(data),
  });
}
