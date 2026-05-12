import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getBrandingConfig = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_config")
    .select("key, value")
    .in("key", ["logo_url", "favicon_url"])

  if (error || !data) {
    return { logoUrl: null, faviconUrl: null }
  }

  const map = new Map<string, string>()
  for (const row of data) {
    if (row.value) {
      map.set(row.key, row.value)
    }
  }

  return {
    logoUrl: map.get("logo_url") ?? null,
    faviconUrl: map.get("favicon_url") ?? null,
  }
})
