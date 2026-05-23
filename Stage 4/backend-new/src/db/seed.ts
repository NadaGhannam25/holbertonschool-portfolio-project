import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { categories } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

const defaultCategories = [
  "ترفيه",
  "عمل",
  "تعليم",
  "صحة",
  "أخرى",
];

async function seed() {
  console.log("Seeding categories...");

  for (const name of defaultCategories) {
    await db
      .insert(cegories)
      .values({ name })
      .onCoNothing();
  }

  console.log("Seeding done!");
  process.exit(0);
}

seed();
