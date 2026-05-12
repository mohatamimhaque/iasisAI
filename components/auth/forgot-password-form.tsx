"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    try {
      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback?next=/auth/update-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Check your inbox.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If an Iasis account exists for <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent
            a link to reset your password. The link expires in one hour.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
          Didn&apos;t get the email? Check your spam folder, or try again with a different address.
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setEmail("")
            }}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Try a different email
          </button>
          <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Forgot your password?</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter the email associated with your Iasis account and we&apos;ll send you a secure link to set a new one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
