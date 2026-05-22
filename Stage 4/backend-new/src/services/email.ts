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
  'https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png';

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

    padding: 45px 0;

    color: #292B2E;
  }

  .wrapper {

    max-width: 660px;

    margin: auto;

    background: #FFFFFF;

    border-radius: 24px;

    overflow: hidden;

    border:
      1px solid #D6DAE1;

    box-shadow:
      0 8px 24px
      rgba(0,0,0,0.04);
  }

  .header {

    background:
      linear-gradient(
        135deg,
        #666CC0 0%,
        #6E87C0 45%,
        #F3B0B9 100%
      );

    padding:
      55px
      40px
      45px;

    text-align: center !important;

    color: white;
  }

  .header img {

    width: 220px;

    margin:
      0 auto 22px auto;

    display: block;

    background: white;

    border-radius: 24px;

    padding: 12px;

    box-shadow:
      0 12px 28px
      rgba(0,0,0,0.12);
  }

  .header h1 {

    margin: 0;

    font-size: 38px;

    font-weight: 800;

    color: white;

    text-align: center !important;
  }

  .body {

    padding:
      45px
      55px;

    line-height: 2.1;

    color: #292B2E;
  }

  .body p {

    font-size: 16px;

    color: #46494E;
  }

  .card {

    background:
      linear-gradient(
        180deg,
        #FFFFFF,
        #FAFBFC
      );

    border:
      1px solid #D6DAE1;

    border-radius: 24px;

    padding: 26px;

    margin: 35px 0;

    box-shadow:
      0 6px 16px
      rgba(102,108,192,0.06);
  }

  .row {

    padding: 20px 0;

    border-bottom:
      1px solid #E5E9F1;
  }

  .row:last-child {

    border-bottom: none;
  }

  .row span {

    display: block;

    color: #6E87C0;

    font-size: 14px;

    margin-bottom: 8px;

    font-weight: 700;
  }

  .row strong {

    color: #292B2E;

    font-size: 22px;

    font-weight: 800;
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
      18px
      52px;

    border-radius: 999px;

    text-decoration: none;

    font-size: 16px;

    font-weight: 800;

    box-shadow:
      0 12px 24px
      rgba(102,108,192,0.28);
  }

  .btn-secondary {

    display: inline-block;

    background:
      linear-gradient(
        135deg,
        #F3B0B9,
        #F9E1B3
      );

    color: #292B2E !important;

    padding:
      18px
      52px;

    border-radius: 999px;

    text-decoration: none;

    font-size: 16px;

    font-weight: 800;
  }

  .footer {

    margin-top: 40px;

    text-align: center !important;

    color: #63676E;

    font-size: 14px;

    padding: 30px;

    background: #FAFBFC;

    border-top:
      1px solid #E5E9F1;
  }

  .manual-note {

    color: #63676E;

    font-size: 15px;

    line-height: 2.2;

    margin-top: 35px;
  }
`;

function getFrontendUrl(): string {

  return (
    process.env.FRONTEND_URL ??
    'http://localhost:5173'
  );
}

function formatDate(
  dateStr: string,
): string {

  const date =
    new Date(dateStr);

  return date.toLocaleDateString(
    'ar-SA',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );
}

function formatBillingCycle(
  cycle: string,
): string {

  const map:
  Record<string, string> = {

    weekly: 'أسبوعي',

    monthly: 'شهري',

    quarterly: 'كل ٣ أشهر',

    semi_annual: 'كل ٦ أشهر',

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
      <strong>
        ${data.userName}
      </strong>

    </p>

    <p>

      نذكّرك بأن اشتراكك في

      <strong>
        ${data.subscriptionName}
      </strong>

      سيتجدد قريبًا.

    </p>

    <div class="card">

      <div class="row">

        <span>
          الخدمة
        </span>

        <strong>
          ${data.subscriptionName}
        </strong>

      </div>

      <div class="row">

        <span>
          تاريخ التجديد
        </span>

        <strong>

          ${formatDate(
            data.renewalDate,
          )}

        </strong>

      </div>

      <div class="row">

        <span>
          المبلغ
        </span>

        <strong>
          ${data.amount} ريال
        </strong>

      </div>

      <div class="row">

        <span>
          دورة الدفع
        </span>

        <strong>

          ${formatBillingCycle(
            data.billingCycle,
          )}

        </strong>

      </div>

    </div>

    ${
      data.cancelUrl

        ? `

          <p
            style="
              text-align:center !important;
              margin-top:28px;
            "
          >

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
      <strong>
        ${data.userName}
      </strong>

    </p>

    <p>

      وصلنا طلب لإعادة تعيين
      كلمة المرور الخاصة بحسابك
      في ديرها.

    </p>

    <div class="card">

      <p>

        لإكمال العملية،
        اضغطي على الزر التالي
        لاختيار كلمة مرور جديدة.

      </p>

      <p>

        هذا الرابط صالح لمدة

        <strong>
          15 دقيقة فقط
        </strong>

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

      إذا لم تطلبي إعادة
      تعيين كلمة المرور،
      يمكنك تجاهل الرسالة بأمان.

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

async function sendEmail(
  params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  },
): Promise<boolean> {

  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {

    console.warn(
      '[Email] RESEND_API_KEY is missing',
    );

    return false;
  }

  try {

    const response =
      await fetch(
        'https://api.resend.com/emails',
        {

          method: 'POST',

          headers: {

            Authorization:
              `Bearer ${apiKey}`,

            'Content-Type':
              'application/json',
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

export async function
sendReminderEmail(
  data: ReminderEmailData,
): Promise<boolean> {

  return sendEmail({

    from:
      process.env
        .RESEND_REMINDER_EMAIL ??

      'Dierha <reminders@dierha.com>',

    to: data.to,

    subject:
      `تذكير: ${data.subscriptionName} سيتجدد قريبًا`,

    html:
      buildReminderEmailHtml(
        data,
      ),
  });
}

export async function
sendResetPasswordEmail(
  data: ResetPasswordEmailData,
): Promise<boolean> {

  return sendEmail({

    from:
      process.env
        .RESEND_SUPPORT_EMAIL ??

      'Dierha <support@dierha.com>',

    to: data.to,

    subject:
      'إعادة تعيين كلمة المرور',

    html:
      buildResetPasswordHtml(
        data,
      ),
  });
}
