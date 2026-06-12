import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

function loadEnvFromFile(envPath: string): void {
  if (!existsSync(envPath)) {
    return
  }

  const content = readFileSync(envPath, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) {
      continue
    }

    const equalsIndex = line.indexOf("=")
    if (equalsIndex === -1) {
      continue
    }

    const key = line.slice(0, equalsIndex).trim()
    let value = line.slice(equalsIndex + 1).trim()
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const envPath = resolve(process.cwd(), ".env.local")
loadEnvFromFile(envPath)

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTriage() {
  console.log("Fetching triage sessions from database...")
  const { data, error } = await supabase
    .from("triage_sessions")
    .select("id, user_id, symptoms, urgency, deleted_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching triage sessions:", error)
    return
  }

  console.log(`Found ${data.length} triage sessions:`)
  for (const session of data) {
    console.log(`- ID: ${session.id}`)
    console.log(`  User ID: ${session.user_id}`)
    console.log(`  Symptoms: ${session.symptoms.substring(0, 50)}...`)
    console.log(`  Urgency: ${session.urgency}`)
    console.log(`  Deleted At: ${session.deleted_at}`)
    console.log(`  Created At: ${session.created_at}`)
    console.log("-----------------------------------------")
  }
}

checkTriage()
