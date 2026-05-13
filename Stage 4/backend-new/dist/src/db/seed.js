"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema_1 = require("./schema");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const db = (0, node_postgres_1.drizzle)(pool);
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
            .insert(schema_1.categories)
            .values({ name })
            .onConflictDoNothing();
    }
    console.log("Seeding done!");
    process.exit(0);
}
seed();
//# sourceMappingURL=seed.js.map