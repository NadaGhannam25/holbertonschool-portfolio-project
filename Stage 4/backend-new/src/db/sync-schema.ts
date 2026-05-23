import { pool } from './index';

export async function syncDatabaseSchema() {
  // MVP safety sync: keeps existing Supabase/Postgres tables compatible with the latest code.
  // It is idempotent, so running it more than onc
