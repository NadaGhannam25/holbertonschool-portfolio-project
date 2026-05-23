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
  passwordHash: text('password_hash').notNull(),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const subscriptionProviders = pgTable('subscription_providers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  cancelUrl: text('cancel_url'),
  isPopular: boolean('is_popular').default(true),
