#!/usr/bin/env node

/**
 * Apply Database Seeder Script
 *
 * This script applies a generated SQL seeder file to the database
 *
 * Usage:
 *   npm run db:apply-seeder <filename>
 */

const { Client } = require("pg");
const { readFileSync } = require("fs");
const { join } = require("path");

async function applySeeder(filename) {
  if (!filename) {
    console.error("❌ Please provide a seeder filename");
    console.log("Usage: npm run db:apply-seeder <filename>");
    process.exit(1);
  }

  const client = new Client({
    host: "localhost",
    port: 54322,
    database: "postgres",
    user: "postgres",
    password: "postgres",
  });

  try {
    console.log(`🌱 Applying seeder: ${filename}`);

    await client.connect();
    console.log("🔗 Connected to database");

    // Read the SQL file
    const filePath = join(process.cwd(), "supabase", filename);
    const sqlContent = readFileSync(filePath, "utf8");

    console.log("📄 Executing SQL seeder...");

    // Execute the SQL
    await client.query(sqlContent);

    console.log("✅ Seeder applied successfully!");
    console.log("");
    console.log(
      "🎉 Your KawanStudy database has been seeded with comprehensive sample data!"
    );
    console.log("📊 You can now test all features with realistic data");
  } catch (error) {
    console.error("❌ Error applying seeder:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Get filename from command line arguments
const filename = process.argv[2];
applySeeder(filename);
