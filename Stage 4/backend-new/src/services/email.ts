import 'dotenv/config';
import process from 'process';
import { Resend } from 'resend';

rage/v1/object/public/assets/dierha-logo.png';
  }
function formatBillingCycle(cة</span><strong>${data.subscriptionName}</strong></div>
      <div class="row"><span>تاريخ التجديد</span><strong>${formatDate(data.renewalDate)}</strong></div>
      <div class="row"><span>المبلغ</span><str | منصة إدارة الاشتراكات</div>
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
