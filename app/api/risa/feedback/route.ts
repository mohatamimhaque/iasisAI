import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { message_id, feedback } = (await req.json()) as {
    message_id: string
    feedback: "up" | "down" | null
  }
  if (!message_id) return NextResponse.json({ error: "message_id required" }, { status: 400 })

  // Verify ownership via join
  const { data: msg } = await supabase
    .from("risa_messages")
    .select("id, conversation_id")
    .eq("id", message_id)
    .single()

  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: conv } = await supabase
    .from("risa_conversations")
    .select("user_id")
    .eq("id", msg.conversation_id)
    .single()

  if ((conv as { user_id: string } | null)?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await supabase.from("risa_messages").update({ feedback }).eq("id", message_id)

  return NextResponse.json({ ok: true })
}
