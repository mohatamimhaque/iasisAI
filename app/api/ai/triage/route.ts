import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { triageSchema, type TriageResult } from "@/lib/ai/triage"

export const maxDuration = 60

const inputSchema = z.object({
  symptoms: z.string().min(5).max(2000),
  duration: z.string().max(120).nullable(),
  severity: z.string().max(120).nullable(),
})

function extractTriageResult(payload: unknown): TriageResult | null {
  const direct = triageSchema.safeParse(payload)
  if (direct.success) return direct.data

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>
    const candidates = [data.result, data.triage, data.output_json, data.data, data.output]
    for (const candidate of candidates) {
      const parsed = triageSchema.safeParse(candidate)
      if (parsed.success) return parsed.data
    }
  }

  return null
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const body = await req.json()
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  // Pull age/gender from profile for context
  const { data: profile } = await supabase
    .from("profiles")
    .select("date_of_birth, gender")
    .eq("id", user.id)
    .single()

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  const { data: config } = await supabase
    .from("ai_api_configs")
    .select("id, name, api_endpoint, timeout_ms, is_active")
    .eq("module", "triage")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!config?.api_endpoint) {
    return new Response(JSON.stringify({ error: "No approved triage API is configured." }), { status: 502 })
  }

  const timeoutMs = config.timeout_ms ?? 30000
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let result: TriageResult | null = null
  try {
    const response = await fetch(config.api_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: "triage",
        input: {
          type: "text",
          text: parsed.data.symptoms,
        },
        symptoms: parsed.data.symptoms,
        duration: parsed.data.duration,
        severity: parsed.data.severity,
        age,
        gender: profile?.gender ?? null,
        metadata: {
          user_id: user.id,
        },
        timeout_ms: timeoutMs,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const rawText = await response.text()
    if (!response.ok) {
      return new Response(JSON.stringify({ error: rawText || "AI request failed" }), { status: 502 })
    }

    let payload: unknown = null
    try {
      payload = rawText ? JSON.parse(rawText) : null
    } catch {
      payload = rawText
    }

    if (payload && typeof payload === "object" && "error" in payload && (payload as Record<string, unknown>).error) {
      return new Response(JSON.stringify({ error: (payload as Record<string, unknown>).error }), { status: 502 })
    }

    result = extractTriageResult(payload)
    if (!result) {
      return new Response(JSON.stringify({ error: "Invalid triage response from API" }), { status: 502 })
    }
  } catch (err) {
    clearTimeout(timeout)
    console.log("[v0] Triage API error:", err)
    return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 502 })
  }

  // Persist the session
  const { data: session, error: insertError } = await supabase
    .from("triage_sessions")
    .insert({
      user_id: user.id,
      symptoms: parsed.data.symptoms,
      duration: parsed.data.duration,
      severity: parsed.data.severity,
      age,
      gender: profile?.gender ?? null,
      result,
      urgency: result.urgency,
      model_used: config.name,
    })
    .select("id")
    .single()

  if (insertError) {
    console.log("[v0] Triage persist error:", insertError)
    return new Response(JSON.stringify({ error: "Could not save session" }), { status: 500 })
  }

  return Response.json({ id: session.id })
}
