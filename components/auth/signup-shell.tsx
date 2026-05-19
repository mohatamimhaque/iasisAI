"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { LanguageToggle } from "@/components/language-toggle"
import { SignupForm } from "@/components/auth/signup-form"

type Role = "patient" | "doctor" | "clinic"

const ROLE_PANEL: Record<Role, {
  src: string
  alt: string
  objectFit: "cover" | "contain"
  bg: string
  quote: { body: string; attribution: string }
}> = {
  patient: {
    src: "/marketing/citizen-mobile-health.svg",
    alt: "Citizen using Iasis AI mobile app for health management",
    objectFit: "contain",
    bg: "#f0faf4",
    quote: {
      body: "Iasis found what was wrong in minutes. The doctor confirmed it the same afternoon. I didn't even leave my village.",
      attribution: "Amina B., Rajshahi",
    },
  },
  doctor: {
    src: "/marketing/doctor-portrait.jpg",
    alt: "Verified doctor ready to consult on Iasis AI",
    objectFit: "cover",
    bg: "#0f1a13",
    quote: {
      body: "For the first time, a patient walks in and we already know who they are. No paperwork. No lost reports. We just begin treating.",
      attribution: "S. Rahman, Clinic Director, Chattogram",
    },
  },
  clinic: {
    src: "/marketing/clinic-interior.jpg",
    alt: "Modern clinic interior — onboarded on Iasis AI",
    objectFit: "cover",
    bg: "#0f1a13",
    quote: {
      body: "We onboarded 12 doctors in a single morning. Appointments, records, and payments — all in one place from day one.",
      attribution: "Operations Lead, Ibn Sina Hospital, Dhaka",
    },
  },
}

export function SignUpShell({ logoUrl }: { logoUrl?: string | null }) {
  const searchParams = useSearchParams()
  const rawRole = searchParams.get("role") as Role | null
  const initial: Role = rawRole && rawRole in ROLE_PANEL ? rawRole : "patient"

  const [role, setRole] = useState<Role>(initial)
  const panel = ROLE_PANEL[role]

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      {/* Left: role-aware image panel */}
      <div className="relative hidden overflow-hidden lg:block" style={{ backgroundColor: panel.bg }}>
        {/* All 3 images stacked — cross-fade on role change */}
        {(Object.keys(ROLE_PANEL) as Role[]).map((r) => {
          const p = ROLE_PANEL[r]
          return (
            <div
              key={r}
              aria-hidden={role !== r}
              className={`absolute inset-0 transition-opacity duration-500 ${role === r ? "opacity-100" : "opacity-0"}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={r === initial}
                sizes="50vw"
                className={p.objectFit === "contain" ? "object-contain" : "object-cover"}
                unoptimized={p.src.endsWith(".svg")}
              />
            </div>
          )
        })}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-foreground/75 via-foreground/30 to-transparent" />

        {/* Logo + quote */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-background">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex w-fit">
              <IasisLogo inverse logoUrl={logoUrl} />
            </Link>
            <LanguageToggle className="text-background hover:bg-background/10" />
          </div>

          {/* Quote — re-mounts on role change to trigger fade-in */}
          <figure key={role} className="max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both">
            <blockquote className="font-serif text-2xl leading-snug tracking-tight">
              &ldquo;{panel.quote.body}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-background/80">{panel.quote.attribution}</figcaption>
          </figure>
        </div>
      </div>

      {/* Right: sign-up form */}
      <div className="flex flex-col bg-background">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/">
            <IasisLogo logoUrl={logoUrl} />
          </Link>
          <LanguageToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 sm:px-12">
          <div className="w-full max-w-sm">
            <SignupForm role={role} onRoleChange={setRole} />
          </div>
        </div>
      </div>
    </div>
  )
}
