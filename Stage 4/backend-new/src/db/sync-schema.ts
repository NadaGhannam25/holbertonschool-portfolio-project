import { pool } from './index';

export async function syncDatabaseSchema() {
  // MVP safety sync: keeps exis

    CREATE TABLE IF NOT EXISTS subscription_providers (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      category_id integer REFERENCES categories(id),
      logo_url text,
      website_url text,
      cancel_url text,
      is_popular boolean DEFAULT true,
      created_at timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id serial PRIMARY KEY,
      user_id integer REFERENCES users(id),
      provider_id integer REFERENCES subscription_providers(id),
      name texs_enabled boolean DEFAULT true,
      deleted_at timestamp,
      created_at timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id serial PRIMARY KEY,
      subscription_id integer REFERENCES subscriptions(id),
      old_price numeric(10, 2),
      new_price numeric(10, 2) NOT NULL,
      effective_from date,
      changed_at timestamp DEFAULT now()
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
    ALTER TABLE subscriptions AD
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
