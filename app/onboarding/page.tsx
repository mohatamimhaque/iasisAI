import { redirect } from "next/navigation"
import Link from "next/link"
import { Lock, ShieldCheck, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { getBrandingConfig } from "@/lib/site-config"

export const metadata = {
  title: "Tell us about you",
}

const TRUST_ITEMS = [
  { Icon: ShieldCheck, text: "Shared only with your care team" },
  { Icon: Lock,        text: "Encrypted at rest and in transit" },
  { Icon: Trash2,      text: "Delete or export your data anytime" },
]

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
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[1fr_1.25fr]">
      {/* ── Left: branding panel ── */}
      <div className="relative hidden overflow-hidden bg-[#070f09] lg:flex lg:flex-col lg:justify-between lg:p-10">
        {/* ambient glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-[28rem] rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-0 size-72 rounded-full bg-primary/15 blur-3xl"
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <IasisLogo inverse logoUrl={logoUrl} />
          </Link>
        </div>

        {/* Hero copy + trust list */}
        <div className="relative z-10 space-y-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">
              Health record
            </p>
            <h2 className="mt-4 font-serif text-[2.1rem] leading-[1.2] tracking-tight text-white">
              One record.<br />Every doctor.<br />Any country.
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Your health history travels with you — accessible to every member of your care
              team, exactly when they need it.
            </p>
          </div>

          <ul className="space-y-4">
            {TRUST_ITEMS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/65">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Icon className="size-4 text-primary" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[11px] text-white/25">
          Protected under applicable data protection laws.
        </p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-col bg-background">
        {/* Mobile-only top bar */}
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 lg:hidden">
          <Link href="/">
            <IasisLogo logoUrl={logoUrl} />
          </Link>
          <span className="text-xs text-muted-foreground">Profile setup</span>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="mx-auto max-w-[30rem]">
            {/* Heading */}
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Welcome
              </p>
              <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                Set up your health record.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A few details so doctors can treat you safely. Your name is required; everything
                else is optional and can be updated later.
              </p>
            </div>

            <OnboardingForm userId={user.id} defaultFullName={profile?.full_name ?? ""} />
          </div>
        </div>
      </div>
    </div>
  )
}
