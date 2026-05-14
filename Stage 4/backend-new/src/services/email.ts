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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildEmailHtml(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6fb; direction: rtl; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a5f, #2e5d9e); padding: 36px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; }
    .body { padding: 36px 40px; }
    .card { background: #f8f9ff; border: 1px solid #e2e8f8; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edf0f8; }
    .row:last-child { border-bottom: none; }
    .btn-cancel { display: inline-block; background: #fff; color: #e53e3e; border: 1.5px solid #e53e3e; padding: 12px 28px; border-radius: 50px; text-decoration: none; }
    .footer { background: #f4f6fb; padding: 24px 40px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>تذكير تجديد اشتراك</h1></div>
    <div class="body">
      <p>مرحبا <strong>${data.userName}</strong>،</p>
      <p>اشتراكك في <strong>${data.subscriptionName}</strong> سيتجدد خلال 3 ايام.</p>
      <div class="card">
        <div class="row"><span>الخدمة</span><strong>${data.subscriptionName}</strong></div>
        <div class="row"><span>تاريخ التجديد</span><strong>${formatDate(data.renewalDate)}</strong></div>
        <div class="row"><span>المبلغ</span><strong>${data.amount} ريال</strong></div>
      </div>
      ${data.cancelUrl ? `<a href="${data.cancelUrl}" class="btn-cancel">الغاء الاشتراك</a>` : ''}
    </div>
    <div class="footer"><p>2026 Dierha</p></div>
  </div>
</body>
</html>`;
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn('[Email] RESEND_API_KEY غير موجود'); return false; }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [data.to],
        subject: `تذكير: ${data.subscriptionName} سيتجدد خلال 3 ايام`,
        html: buildEmailHtml(data),
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('[Email] فشل الارسال:', err);
      return false;
    }
    console.log(`[Email] تم الارسال الى ${data.to}`);
    return true;
  } catch (error) {
    console.error('[Email] خطا:', error);
    return false;
  }
}
