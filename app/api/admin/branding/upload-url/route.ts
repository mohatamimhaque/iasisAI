import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_UPLOAD_BYTES = 250_000

const LOGO_TYPES = new Set(["image/svg+xml", "image/png", "image/jpeg", "image/webp"])
const FAVICON_TYPES = new Set(["image/x-icon", "image/vnd.microsoft.icon", "image/png"])

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }
  return value
}

function resolveKey(asset: "logo" | "favicon", contentType: string): string {
  if (asset === "logo") {
    if (contentType === "image/svg+xml") return "site-assets/logo.svg"
    if (contentType === "image/webp") return "site-assets/logo.webp"
    if (contentType === "image/jpeg") return "site-assets/logo.jpg"
    return "site-assets/logo.png"
  }

  if (contentType === "image/png") return "site-assets/favicon.png"
  return "site-assets/favicon.ico"
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const asset = formData.get("asset")
    const file = formData.get("file")

    if (asset !== "logo" && asset !== "favicon") {
      return NextResponse.json({ error: "Invalid asset" }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const contentType = file.type ?? ""
    const size = file.size ?? 0

    if (asset === "logo" && !LOGO_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported logo file type" }, { status: 400 })
    }

    if (asset === "favicon" && !FAVICON_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported favicon file type" }, { status: 400 })
    }

    if (size && size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const accountId = getEnv("R2_ACCOUNT_ID")
    const accessKeyId = getEnv("R2_ACCESS_KEY_ID")
    const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY")
    const bucketName = getEnv("R2_BUCKET_NAME")
    const publicUrlBase = getEnv("R2_PUBLIC_URL")

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })

    const key = resolveKey(asset, contentType)

    const buffer = Buffer.from(await file.arrayBuffer())

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Body: buffer,
    })
    const publicUrl = `${publicUrlBase.replace(/\/$/, "")}/${key}`

    await client.send(command)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
