import { createUIMessageStream, createUIMessageStreamResponse, generateId, type UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function extractOutputText(payload: unknown): string {
  if (!payload) return ""
  if (typeof payload === "string") return payload
  if (typeof payload === "object" && payload) {
    const data = payload as Record<string, unknown>
    const outputText =
      (typeof data.output_text === "string" && data.output_text) ||
      (typeof data.text === "string" && data.text) ||
      (typeof data.message === "string" && data.message) ||
      (typeof (data.message as Record<string, unknown>)?.content === "string" &&
        (data.message as Record<string, unknown>).content) ||
      (typeof (data.response as Record<string, unknown>)?.text === "string" &&
        (data.response as Record<string, unknown>).text) ||
      (typeof (data.result as Record<string, unknown>)?.text === "string" &&
        (data.result as Record<string, unknown>).text) ||
      (typeof (data.choices as Array<Record<string, unknown>>)?.[0]?.message?.content === "string" &&
        (data.choices as Array<Record<string, unknown>>)[0]?.message?.content) ||
      (typeof (data.choices as Array<Record<string, unknown>>)?.[0]?.text === "string" &&
        (data.choices as Array<Record<string, unknown>>)[0]?.text) ||
      ""

    if (outputText) return outputText

    if (data.output_json) {
      return JSON.stringify(data.output_json, null, 2)
    }
  }

  return ""
}

async function respondWithAssistantError(supabase: ReturnType<typeof createClient>, userId: string, threadId: string, message: string) {
  const content = message || "AI service is unavailable. Please try again."

  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: userId,
    role: "assistant",
    content,
  })

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const messageId = generateId()
      const textId = generateId()

      writer.write({ type: "start", messageId })
      writer.write({ type: "text-start", id: textId })
      writer.write({ type: "text-delta", id: textId, delta: content })
      writer.write({ type: "text-end", id: textId })
      writer.write({ type: "finish", finishReason: "error" })
    },
  })

  return createUIMessageStreamResponse({ stream })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const body = (await req.json()) as {
    messages: UIMessage[]
    threadId: string
    aiConfigId?: string | null
    imageUrl?: string | null
  }
  const { messages, threadId, aiConfigId, imageUrl } = body

  // Verify thread belongs to user
  const { data: thread } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .single()
  if (!thread) return new Response(JSON.stringify({ error: "Thread not found" }), { status: 404 })

  // Persist the latest user message (the last one in the array)
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
  if (lastUserMsg) {
    const text = getMessageText(lastUserMsg)
    if (text) {
      await supabase.from("chat_messages").insert({
        thread_id: threadId,
        user_id: user.id,
        role: "user",
        content: text,
      })
      // Bump thread updated_at + auto-title from first user message
      const { data: existing } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact" })
        .eq("thread_id", threadId)
        .eq("role", "user")
      if ((existing?.length ?? 0) <= 1) {
        await supabase
          .from("chat_threads")
          .update({ title: text.slice(0, 80) })
          .eq("id", threadId)
      } else {
        await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId)
      }
    }
  }

  const { data: selectedConfig } = aiConfigId
    ? await supabase
        .from("ai_api_configs")
        .select("id, name, api_endpoint, input_mode, timeout_ms, is_active")
        .eq("id", aiConfigId)
        .eq("module", "chat")
        .eq("is_active", true)
        .single()
    : { data: null }

  const { data: defaultConfig } = selectedConfig
    ? { data: selectedConfig }
    : await supabase
        .from("ai_api_configs")
        .select("id, name, api_endpoint, input_mode, timeout_ms, is_active")
        .eq("module", "chat")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

  if (!defaultConfig?.api_endpoint) {
    return respondWithAssistantError(
      supabase,
      user.id,
      threadId,
      "No approved chat API is configured. Please ask an admin to add one.",
    )
  }

  {
    const lastUserText = getMessageText(lastUserMsg ?? ({ parts: [] } as UIMessage))
    const timeoutMs = defaultConfig.timeout_ms ?? 30000
    const inputMode = defaultConfig.input_mode ?? "text"
    const normalizedImageUrl = typeof imageUrl === "string" && imageUrl.trim().length > 0 ? imageUrl.trim() : null
    const inputType = normalizedImageUrl ? (inputMode === "image" ? "image" : "both") : "text"
    if (inputMode === "image" && !normalizedImageUrl) {
      return respondWithAssistantError(supabase, user.id, threadId, "This model requires an image URL.")
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(defaultConfig.api_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module: "chat",
          model: defaultConfig.name,
          input: {
            type: inputType,
            text: lastUserText,
            image_url: normalizedImageUrl ?? undefined,
          },
          timeout_ms: timeoutMs,
          metadata: {
            user_id: user.id,
            session_id: threadId,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const rawText = await response.text()
      if (!response.ok) {
        return respondWithAssistantError(supabase, user.id, threadId, rawText || "AI request failed")
      }

      let payload: unknown = null
      try {
        payload = rawText ? JSON.parse(rawText) : null
      } catch {
        payload = rawText
      }

      if (payload && typeof payload === "object" && "error" in payload && (payload as Record<string, unknown>).error) {
        return respondWithAssistantError(
          supabase,
          user.id,
          threadId,
          String((payload as Record<string, unknown>).error),
        )
      }

      let outputText = extractOutputText(payload)
      if (!outputText && rawText) {
        outputText = rawText
      }
      if (!outputText) {
        outputText = "No response received from the AI model."
      }

      if (outputText) {
        await supabase.from("chat_messages").insert({
          thread_id: threadId,
          user_id: user.id,
          role: "assistant",
          content: outputText,
        })
      }

      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          const messageId = generateId()
          const textId = generateId()

          writer.write({ type: "start", messageId })
          writer.write({ type: "text-start", id: textId })
          writer.write({ type: "text-delta", id: textId, delta: outputText || "" })
          writer.write({ type: "text-end", id: textId })
          writer.write({ type: "finish", finishReason: "stop" })
        },
      })

      return createUIMessageStreamResponse({ stream })
    } catch (error) {
      clearTimeout(timeout)
      const message = error instanceof Error ? error.message : "AI request failed"
      return respondWithAssistantError(supabase, user.id, threadId, message)
    }
  }
}
