import { NextResponse } from "next/server"

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    // 1. Resolve active MedGemma endpoint from Firebase Realtime Database
    let medgemmaUrl = ""
    try {
      const fbRes = await fetch("https://iasis-6e66e-default-rtdb.firebaseio.com/services/medgemma.json", { cache: "no-store" })
      if (fbRes.ok) {
        const fbData = await fbRes.json()
        medgemmaUrl = fbData?.url || ""
      }
    } catch (err) {
      console.error("[Proxy] Failed to read dynamic model URL from Firebase:", err)
    }

    if (!medgemmaUrl) {
      return new Response(JSON.stringify({ error: "MedGemma model is currently offline or unreachable." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 2. Parse the body of the request
    const body = await req.json()

    // Align messages content for Gemma3 multimodal input
    if (body && Array.isArray(body.messages)) {
      for (const msg of body.messages) {
        if (msg.role === "user" && Array.isArray(msg.content)) {
          let textItem = msg.content.find((item: any) => item.type === "text")
          const imageCount = msg.content.filter((item: any) => item.type === "image_url").length
          if (imageCount > 0 && textItem) {
            const imagePlaceholders = "<image>".repeat(imageCount)
            textItem.text = `${imagePlaceholders}\n${textItem.text}`
          }
        }
      }
    }

    // 3. Forward the request to the Kaggle-hosted FastAPI endpoint
    const response = await fetch(`${medgemmaUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(errorText, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[Proxy] Error routing chat completions request:", error)
    return new Response(JSON.stringify({ error: error.message || "Proxy request failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}
