import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";

// USERS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// CATEGORIES
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// SUBSCRIPTIONS
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  renewalDate: date("renewal_date").notNull(),
  billingCycle: text("billing_cycle").notNull(),
  notes: text("notes"),
  status: text("status").default("active"),
  cancelUrl: text("cancel_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PRICE HISTORY
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  effectiveFrom: date("effective_from").notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
});

// REMINDERS
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  remindAt: timestamp("remind_at").notNull(),
  sent: boolean("sent").default(false),
});
