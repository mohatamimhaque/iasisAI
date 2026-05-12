import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Authentication error",
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div className="space-y-2">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Something went wrong.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {params?.error
              ? `We couldn't complete authentication: ${params.error}.`
              : "We couldn't complete authentication. Please try signing in again."}
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
