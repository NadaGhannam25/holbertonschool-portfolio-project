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
  resetPasswordToken: text('reset_password_toke
