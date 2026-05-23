import { pool } from './index';

export async function syncDatabaseSchema() {
  // MVP safety sync: keeps existing Supabase/Postgres tables compatible with the latest code.
  // It is idempotent, so running it more than onc

    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token text;
    ALTER TABLE users ADD COLUMN 
    ON CONFLICT DO NOTHING;

    SELECT setval(
      pg_get_serial_sequence('categories', 'id'),
      GREATEST((SELECT COALESCE(MAX(id), 1) FROM categories), 5),
      true
    );
  `);
}
