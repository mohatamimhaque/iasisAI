import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_UPLOAD_BYTES = 1_000_000
const AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }
  return value
}

function resolveKey(userId: string, contentType: string): string {
  if (contentType === "image/webp") return `profile-photos/${userId}.webp`
  if (contentType === "image/jpeg") return `profile-photos/${userId}.jpg`
  return `profile-photos/${userId}.png`
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

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const contentType = file.type ?? ""
    const size = file.size ?? 0

    if (!AVATAR_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (size && size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 1MB)" }, { status: 400 })
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

    const key = resolveKey(user.id, contentType)

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
