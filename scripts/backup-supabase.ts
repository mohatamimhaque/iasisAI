import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFromFile(envPath: string): void {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function runPgDump(
  dbUrl: string,
  outputPath: string,
  tableNames: string[],
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const args = [
      `--dbname=${dbUrl}`,
      "--format=plain",
      "--no-owner",
      "--no-privileges",
      ...tableNames.map((tableName) => `--table=public.${tableName}`),
      `--file=${outputPath}`,
    ];

    const child = spawn("pg_dump", args, { stdio: "inherit" });
    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`pg_dump exited with code ${code ?? "unknown"}`));
    });
  });
}

function runSupabaseDump(
  dbUrl: string,
  outputPath: string,
  tableNames: string[],
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const args = [
      "supabase",
      "db",
      "dump",
      "--db-url",
      dbUrl,
      "--file",
      outputPath,
      "--",
      ...tableNames.map((tableName) => `--table=public.${tableName}`),
    ];

    const child = spawn("npx", args, { stdio: "inherit", shell: true });
    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`supabase db dump exited with code ${code ?? "unknown"}`));
    });
  });
}

async function main(): Promise<void> {
  const envPath = resolve(process.cwd(), ".env.local");
  loadEnvFromFile(envPath);

  const dbUrl =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!dbUrl) {
    throw new Error(
      "Missing database URL. Set POSTGRES_URL_NON_POOLING (or POSTGRES_PRISMA_URL/POSTGRES_URL) in .env.local.",
    );
  }

  const outputDir = resolve(process.cwd(), "supabase");
  ensureDir(outputDir);

  const tablesToBackup = [
    "ai_api_configs",
    "appointments",
    "chat_messages",
    "chat_threads",
    "clinics",
    "doctors",
    "emergency_alerts",
    "emergency_contacts",
    "family_members",
    "health_records",
    "lab_reports",
    "marketing_content",
    "medicine_reminders",
    "medicines",
    "mental_health_sessions",
    "nav_items",
    "pharmacies",
    "prescription_items",
    "prescriptions",
    "profiles",
    "site_config",
    "support_tickets",
    "transactions",
    "triage_sessions",
  ];

  const outputPath = resolve(outputDir, "initial-database.sql");
  try {
    await runPgDump(dbUrl, outputPath, tablesToBackup);
  } catch (error) {
    console.warn(
      "pg_dump failed; falling back to Supabase CLI (npx supabase db dump).",
    );
    await runSupabaseDump(dbUrl, outputPath, tablesToBackup);
  }

  console.log(`Backup written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
