// PostgreSQL connection pool.
// Reads credentials from backend/.env (never hardcode passwords in code).
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "postgres",
  max: 10,
});

// Small helper so route files stay clean.
export const query = (text, params) => pool.query(text, params);

export async function testConnection() {
  const result = await pool.query("SELECT current_database() AS db, now() AS ts");
  return result.rows[0];
}
