import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.en;

const defaultCategories = [
  "ترفيه",
  "عمل",

  "صحة",
  "أخرى",
];

async function seed() {
  consding categories...");

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
