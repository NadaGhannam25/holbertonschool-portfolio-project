import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  decimal,
  date,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: tpassword_hash').notNull(),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const subscriptionProviders = pgTable('subscription_providers', {
  id: serial('id').primaey(),
  name: text('name').notNull().unique(),
  categoryId: integer('ferences(() => categories.id),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  cancelUrl: text('cancel_url'),
  isPopular: boolean('is_popular').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  providerId: integer('provider_id').references(() => subscriptionProviders.id),
  name: text('name').notNull(),
  price: decimal('price', { precision: 18, scale: 2 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  renewalDate: date('renewal_date').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  billingCycle: text('billing_cycle').notNull(),
  notes: text('notes'),
  status: text('status').default('active'),
  cancelUrl: text('cancel_url'),
  reminderDays: integer('reminder_days').default(3),
  remindersEnabled: boolean('reminders_enabled').default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id),
  oldPrice: decimal('old_price', { precision: 18, scale: 2 }),
  newPrice: decimal('new_price', { precision: 18, scale: 2 }).notNull(),
  effectiveFrom: date('effective_from').notNull(),
  changedAt: timestamp('changed_at').defaultNow(),
});

export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  substionId: integer('subscription_id').references(() => subscriptions.id),
  remindAt: date('remind_at').notNull(),
  sent: boolean('sent').default(false),
  sentAt: timestamp('sent_at'),
});
