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

export const users = pgTable('users', 
                             
