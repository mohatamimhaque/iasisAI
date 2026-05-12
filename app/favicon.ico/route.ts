import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { getBrandingConfig } from "@/lib/site-config"

export async function GET() {
  noStore()
  const { faviconUrl } = await getBrandingConfig()

  if (!faviconUrl) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  }

  return NextResponse.redirect(faviconUrl, {
    status: 307,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
