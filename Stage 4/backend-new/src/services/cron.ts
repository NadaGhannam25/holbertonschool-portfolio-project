import 'dotenv/config';
import cron from 'node-cron';
import { eq, and, lte } from 'drizzle-orm';
import { db } from '../db';
import { reminders, subscriptions, users } from '../db/schema';
import { sendReminderEmail } from './email';

async function runReminderJob(): Promise<void> {
  console.log('[Cron] بدء فحص التذكيرات...');

  const now = new Date();

  const pendingReminders = await db
    .select({
      reminderId: reminders.id,
      remindAt: reminders.remindAt,
      subscriptionId: subscriptions.id,
      subscriptionName: subscriptions.name,
      price: subscriptions.price,
      billingCycle: subscriptions.billingCycle,
      renewalDate: subscriptions.renewalDate,
      cancelUrl: subscriptions.cancelUrl,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reminders)
    .innerJoin(subscriptions, eq(reminders.subscriptionId, subscriptions.id))
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(reminders.sent, false),
        lte(reminders.remindAt, now),
      ),
    );

  if (pendingReminders.length === 0) {
    console.log('[Cron] لا توجد تذكيرات معلقة');
    return;
  }

  console.log(`[Cron] وجدنا ${pendingReminders.length} تذكير للارسال`);

  for (const reminder of pendingReminders) {
    try {
      const sent = await sendReminderEmail({
        to: reminder.userEmail,
        userName: reminder.userName,
        subscriptionName: reminder.subscriptionName,
        renewalDate: reminder.renewalDate,
        amount: reminder.price,
        billingCycle: reminder.billingCycle,
        cancelUrl: reminder.cancelUrl,
      });

      await db
        .update(reminders)
        .set({ sent: true })
        .where(eq(reminders.id, reminder.reminderId));

      if (sent) {
        console.log(`[Cron] تم ارسال التذكير لـ ${reminder.userEmail}`);
      }
    } catch (err) {
      console.error(`[Cron] خطا في معالجة التذكير ${reminder.reminderId}:`, err);
    }
  }

  console.log('[Cron] انتهى فحص التذكيرات');
}

export function startCronJobs(): void {
  cron.schedule('0 9 * * *', () => {
    runReminderJob().catch((err) => {
      console.error('[Cron] خطا في الcron job:', err);
    });
  });

  console.log('[Cron] Cron jobs مشغلة - تذكيرات يومية الساعة 9:00 صباحا');
}
