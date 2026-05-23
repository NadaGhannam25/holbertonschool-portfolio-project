import 'dotenv/config';
import process from 'process';
import { Resend } from 'resend';

export async function sendResetPasswordEmail(
  data: ResetPasswordEmailData,
): Promise<boolean> {
