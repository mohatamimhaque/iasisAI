import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { getBrandingConfig } from "@/lib/site-config"

export const metadata = {
  title: "Tell us about you",
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarded")
    .eq("id", user.id)
    .single()

  if (profile?.onboarded) redirect("/app")

  const { logoUrl } = await getBrandingConfig()

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/">
            <IasisLogo logoUrl={logoUrl} />
          </Link>
          <span className="text-xs text-muted-foreground">Step 1 of 1</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <p className="text-sm uppercase tracking-wider text-primary">Welcome</p>
        <h1 className="mt-3 text-balance font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Let&apos;s set up your health record.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
          A few details so doctors can treat you safely. Everything is private and protected by Bangladesh&apos;s data
          protection guidelines. You can update or delete it anytime.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <OnboardingForm userId={user.id} defaultFullName={profile?.full_name ?? ""} />
        </div>
      </main>
    </div>
  )
}
