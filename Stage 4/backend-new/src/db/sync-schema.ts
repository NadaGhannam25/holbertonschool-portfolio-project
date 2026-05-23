import { pool } from './index';

export async function syncDatabaseSchema() {
  // MVP safety sync: keeps existing Supabase/Postgres tables compatible with the latest code.
  // It is idempotent, so running it more than once is safe.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      name text NOT NULL,
      email text NOT NUtamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id serial PRIMARY KEY,
      subscription_id integer REFERENCES subscriptions(id),
      remind_at date NOT NULL,
      sent boolean DEFAULT false,
      sent_at timestamp
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires timestamp;

    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider_id integer;
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date date;
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS end_date date;
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_days integer DEFAULT 3;
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminders_enabled boolean DEFAULT true;
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS deleted_at timestamp;

    UPDATE subscriptions
    SET start_date = renewal_date
    WHERE start_date IS NULL AND renewal_date IS NOT NULL;

    ALTER TABLE price_history ADD COLUMN IF NOT EXISTS effective_from date;
    ALTER TABLE price_history ADD COLUMN IF NOT EXISTS changed_at timestamp DEFAULT now();

    ALTER TABLE reminders ADD COLUMN IF NOT EXISTS sent_at timestamp;

    INSERT INTO categories (id, name)
    VALUES
      (1, 'ترفيه'),
      (2, 'عمل'),
      (3, 'تعليم'),
      (4, 'صحة'),
      (5, 'أخرى')
    ON CONFLICT DO NOTHING;

    SELECT setval(
      pg_get_serial_sequence('categories', 'id'),
      GREATEST((SELECT COALESCE(MAX(id), 1) FROM categories), 5),
      true
    );
  `);
}
