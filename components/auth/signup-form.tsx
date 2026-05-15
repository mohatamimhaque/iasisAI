"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Role = "patient" | "doctor" | "clinic"

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "patient", label: "Citizen", description: "I'm here for my own healthcare" },
  { value: "doctor", label: "Doctor", description: "I want to practice on Iasis" },
  { value: "clinic", label: "Clinic / Hospital", description: "We want to onboard our facility" },
]

interface SignupFormProps {
  role: Role
  onRoleChange: (role: Role) => void
}

export function SignupForm({ role, onRoleChange }: SignupFormProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Create your account.</h1>
        <p className="text-sm text-muted-foreground">Join Iasis AI. Your role tailors the experience.</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-3">
          <Label>I am a...</Label>
          <RadioGroup
            value={role}
            onValueChange={(v) => onRoleChange(v as Role)}
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {ROLE_OPTIONS.map((opt) => (
              <Label
                key={opt.value}
                htmlFor={`role-${opt.value}`}
                className={`flex cursor-pointer flex-col rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${
                  role === opt.value ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem id={`role-${opt.value}`} value={opt.value} className="sr-only" />
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                <span className="mt-1 text-xs leading-snug text-muted-foreground">{opt.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Your full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repeat-password">Repeat</Label>
            <Input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to Iasis&apos; Terms of Service and Privacy Policy. Iasis is not a substitute
          for emergency medical care — call 999 in an emergency.
        </p>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
