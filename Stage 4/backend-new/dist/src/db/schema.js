"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminders = exports.priceHistory = exports.subscriptions = exports.categories = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
});
exports.subscriptions = (0, pg_core_1.pgTable)("subscriptions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    name: (0, pg_core_1.text)("name").notNull(),
    price: (0, pg_core_1.decimal)("price", { precision: 10, scale: 2 }).notNull(),
    categoryId: (0, pg_core_1.integer)("category_id").references(() => exports.categories.id),
    renewalDate: (0, pg_core_1.date)("renewal_date").notNull(),
    billingCycle: (0, pg_core_1.text)("billing_cycle").notNull(),
    notes: (0, pg_core_1.text)("notes"),
    status: (0, pg_core_1.text)("status").default("active"),
    cancelUrl: (0, pg_core_1.text)("cancel_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.priceHistory = (0, pg_core_1.pgTable)("price_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    subscriptionId: (0, pg_core_1.integer)("subscription_id").references(() => exports.subscriptions.id),
    oldPrice: (0, pg_core_1.decimal)("old_price", { precision: 10, scale: 2 }),
    newPrice: (0, pg_core_1.decimal)("new_price", { precision: 10, scale: 2 }).notNull(),
    effectiveFrom: (0, pg_core_1.date)("effective_from").notNull(),
    changedAt: (0, pg_core_1.timestamp)("changed_at").defaultNow(),
});
exports.reminders = (0, pg_core_1.pgTable)("reminders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    subscriptionId: (0, pg_core_1.integer)("subscription_id").references(() => exports.subscriptions.id),
    remindAt: (0, pg_core_1.timestamp)("remind_at").notNull(),
    sent: (0, pg_core_1.boolean)("sent").default(false),
    sentAt: (0, pg_core_1.timestamp)("sent_at"),
});
//# sourceMappingURL=schema.js.map