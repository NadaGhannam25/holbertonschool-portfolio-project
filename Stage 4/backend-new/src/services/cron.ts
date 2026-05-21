import 'dotenv/config';
import cron from 'node-cron';
import { and, eq, lte } from 'drizzle-orm';
import { db } from '../db';
import { reminders, subscriptionProviders, subscriptions, users } from '../db/schema';
import { sendReminderEmail } from './email';

type BillingCycle =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'yearly';

function parseDate(dateValue: string | Date) {
  if (dateValue instanceof Date) return new Date(dateValue);

  const [year, month, day] = dateValue.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function moveDateForward(
  date: Date,
  billingCycle: BillingCycle,
) {
  switch (billingCycle) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;

    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;

    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;

    case 'semi_annual':
      date.setMonth(date.getMonth() + 6);
      break;

    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;

    default:
      date.setMonth(date.getMonth() + 1);
  }
}

async function createNextReminder(
  subscription: typeof subscriptions.$inferSelect,
) {
  if (!subscription.remindersEnabled) return;

  const renewalDate = parseDate(subscription.renewalDate);
  renewalDate.setHours(23, 59, 59, 999);

  const remindAt = parseDate(subscription.renewalDate);

  remindAt.setDate(
    remindAt.getDate() - (subscription.reminderDays ?? 3),
  );

  const now = new Date();

  if (renewalDate < now) return;

  await db.insert(reminders).values({
    subscriptionId: subscription.id,
    remindAt: formatDate(
      remindAt <= now ? now : remindAt,
    ),
    sent: false,
    sentAt: null,
  });
}

async function runReminderJob(): Promise<void> {
  console.log('[Cron] Checking pending reminders...');

  const today = new Date()
    .toISOString()
    .split('T')[0];

  const pendingReminders = await db
    .select({
      reminderId: reminders.id,
      remindAt: reminders.remindAt,

      subscriptionId: subscriptions.id,
      subscriptionName: subscriptions.name,
      price: subscriptions.price,
      billingCycle: subscriptions.billingCycle,
      renewalDate: subscriptions.renewalDate,
      subscriptionCancelUrl: subscriptions.cancelUrl,

      providerCancelUrl: subscriptionProviders.cancelUrl,

      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reminders)
    .innerJoin(
      subscriptions,
      eq(reminders.subscriptionId, subscriptions.id),
    )
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .leftJoin(
      subscriptionProviders,
      eq(subscriptions.providerId, subscriptionProviders.id),
    )
    .where(
      and(
        eq(reminders.sent, false),
        lte(reminders.remindAt, today),
      ),
    );

  console.log(
    `[Cron] Pending reminders count: ${pendingReminders.length}`,
  );

  for (const reminder of pendingReminders) {
    try {
      const sent = await sendReminderEmail({
        to: reminder.userEmail,
        userName: reminder.userName,
        subscriptionName: reminder.subscriptionName,
        renewalDate: reminder.renewalDate,
        amount: reminder.price,
        billingCycle: reminder.billingCycle,
        cancelUrl:
          reminder.subscriptionCancelUrl ??
          reminder.providerCancelUrl ??
          null,
      });

      if (sent) {
        await db
          .update(reminders)
          .set({
            sent: true,
            sentAt: new Date(),
          })
          .where(eq(reminders.id, reminder.reminderId));

        console.log(
          `[Cron] Reminder sent to ${reminder.userEmail}`,
        );
      } else {
        console.warn(
          `[Cron] Email failed for ${reminder.userEmail}`,
        );
      }
    } catch (error) {
      console.error(
        `[Cron] Failed to process reminder ${reminder.reminderId}:`,
        error,
      );
    }
  }
}

async function updateExpiredSubscriptions() {
  console.log('[Cron] Updating expired subscriptions...');

  const allSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'));

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  for (const subscription of allSubscriptions) {
    const renewalDate = parseDate(subscription.renewalDate);

    renewalDate.setHours(0, 0, 0, 0);

    let updated = false;

    while (renewalDate <= today) {
      moveDateForward(
        renewalDate,
        subscription.billingCycle as BillingCycle,
      );

      updated = true;
    }

    if (!updated) continue;

    const nextRenewalDate = formatDate(renewalDate);

    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        renewalDate: nextRenewalDate,
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();

    await db
      .delete(reminders)
      .where(eq(reminders.subscriptionId, subscription.id));

    await createNextReminder(updatedSubscription);

    console.log(
      `[Cron] Subscription ${subscription.id} moved to ${nextRenewalDate}`,
    );
  }
}

export function startCronJobs(): void {
  cron.schedule('* * * * *', async () => {
    try {
      await runReminderJob();
    } catch (error) {
      console.error('[Cron] Reminder job failed:', error);
    }
  });

  cron.schedule('5 9 * * *', async () => {
    try {
      console.log('[Cron] Running daily renewal update...');

      await updateExpiredSubscriptions();

      console.log('[Cron] Daily renewal update completed');
    } catch (error) {
      console.error(
        '[Cron] Daily renewal update failed:',
        error,
      );
    }
  });

  console.log(
    '[Cron] Reminder sender scheduled every minute',
  );

  console.log(
    '[Cron] Renewal updater scheduled daily at 9:05 AM',
  );
}
