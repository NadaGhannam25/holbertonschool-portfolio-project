import 'dotenv/config';
import cron from 'node-cron';
import { and, eq, lte } from 'drizzle-orm';
import { db } from '../db';
import { reminders, subscriptions, users } from '../db/schema';
import { sendReminderEmail } from './email';

async function runReminderJob(): Promise<void> {
  console.log('[Cron] Checking pending reminders...');

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
    .where(and(eq(reminders.sent, false), lte(reminders.remindAt, now)));

  if (pendingReminders.length === 0) {
    console.log('[Cron] No pending reminders');
    return;
  }

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

      if (sent) {
        await db
          .update(reminders)
          .set({ sent: true })
          .where(eq(reminders.id, reminder.reminderId));

        console.log(`[Cron] Reminder sent to ${reminder.userEmail}`);
      }
    } catch (error) {
      console.error(
        `[Cron] Failed to process reminder ${reminder.reminderId}:`,
        error,
      );
    }
  }

  console.log('[Cron] Reminder check completed');
}

export function startCronJobs(): void {
  cron.schedule('0 9 * * *', () => {
    runReminderJob().catch((error) => {
      console.error('[Cron] Reminder job failed:', error);
    });
  });

  console.log('[Cron] Daily reminder job scheduled at 9:00 AM');
}
