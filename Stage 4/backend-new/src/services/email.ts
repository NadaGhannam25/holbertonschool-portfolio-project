import 'dotenv/config';
import process from 'process';
import { Resend } from 'resend';

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
