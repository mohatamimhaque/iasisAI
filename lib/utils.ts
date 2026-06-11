import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves the redirection URL for Supabase authentication.
 * It will prioritize configured environment variables (like NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL)
 * for production/online environment, fallback to legacy NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL if set,
 * and dynamically fallback to window.location.origin in the browser.
 */
export function getRedirectUrl(path: string = "/auth/callback") {
  let baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/+$/, "")
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = `https://${baseUrl}`
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
  }

  if (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL) {
    return process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
  }

  if (typeof window !== "undefined") {
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${window.location.origin}${cleanPath}`
  }

  return `http://localhost:3000${path}`
}
