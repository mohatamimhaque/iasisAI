import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RISA_API_URL = process.env.RISA_API_URL ?? "https://risa.up.railway.app/chat/stream"

type RisaChunkEvent = { t?: string; lang?: string }
type RisaFinalEvent = { done: true; html?: string; lang?: string; ms?: number; session_id?: string }
type RisaEvent = RisaChunkEvent | RisaFinalEvent

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: {
    message?: string
    backend_session_id?: string
    conversation_id?: string
    source_lang?: string
    skip_translation?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { message, backend_session_id, conversation_id, source_lang, skip_translation } = body
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 })
  }

  let risaRes: Response
  try {
    risaRes = await fetch(RISA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: message.trim(),
        device_id: user.id,
        session_id: backend_session_id || undefined,
        source_lang: source_lang || undefined,
        skip_translation: skip_translation ?? false,
      }),
    })
  } catch {
    return NextResponse.json({ error: "RISA backend unreachable" }, { status: 502 })
  }

  if (!risaRes.ok || !risaRes.body) {
    return NextResponse.json({ error: "RISA backend error" }, { status: 502 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = risaRes.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      let finalEvent: RisaFinalEvent | null = null

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split("\n\n")
          buf = parts.pop() ?? ""
          for (const part of parts) {
            const trimmed = part.trim()
            if (!trimmed || trimmed.startsWith(": ")) continue
            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.slice(6).trim()
              try {
                const parsed = JSON.parse(jsonStr) as RisaEvent
                if ((parsed as RisaFinalEvent).done) {
                  finalEvent = parsed as RisaFinalEvent
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`))
              } catch {
                controller.enqueue(encoder.encode(`${trimmed}\n\n`))
              }
            }
          }
        }
      } catch (e) {
        console.error("[risa/stream] read error:", e)
      }

      // Persist after stream ends
      const sessionId = finalEvent?.session_id
      if (sessionId && message?.trim()) {
        try {
          let convId: string | null = conversation_id ?? null

          if (!convId) {
            const { data: existing } = await supabase
              .from("risa_conversations")
              .select("id")
              .eq("user_id", user.id)
              .eq("backend_session_id", sessionId)
              .maybeSingle()

            if (existing?.id) {
              convId = existing.id as string
            } else {
              const title = message.trim().slice(0, 80)
              const { data: nc } = await supabase
                .from("risa_conversations")
                .insert({
                  user_id: user.id,
                  backend_session_id: sessionId,
                  title,
                })
                .select("id")
                .single()
              convId = (nc?.id as string) ?? null
            }
          }

          if (convId) {
            await Promise.all([
              supabase
                .from("risa_conversations")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", convId),
              supabase.from("risa_messages").insert([
                { conversation_id: convId, role: "user", content: message.trim() },
                { conversation_id: convId, role: "assistant", content: finalEvent?.html ?? "" },
              ]),
            ])
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  _meta: {
                    conv_id: convId,
                    backend_session_id: sessionId,
                  },
                })}\n\n`
              )
            )
          }
        } catch (e) {
          console.error("[risa/stream] persist error:", e)
        }
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}
