import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { LanguageToggle } from "@/components/language-toggle"
import { getBrandingConfig } from "@/lib/site-config"

interface AuthShellProps {
  children: React.ReactNode
  quote?: {
    body: string
    attribution: string
  }
}

export async function AuthShell({ children, quote }: AuthShellProps) {
  const { logoUrl } = await getBrandingConfig()

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      {/* Left: editorial image with overlay */}
      <div className="relative hidden lg:block">
        <Image
          src="/marketing/doctor-portrait.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-foreground/70 via-foreground/30 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-background">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex w-fit">
              <IasisLogo inverse logoUrl={logoUrl} />
            </Link>
            <LanguageToggle className="text-background hover:bg-background/10" />
          </div>

          {quote ? (
            <figure className="max-w-md">
              <blockquote className="font-serif text-2xl leading-snug tracking-tight">
                &ldquo;{quote.body}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm text-background/80">{quote.attribution}</figcaption>
            </figure>
          ) : null}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col bg-background">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/">
            <IasisLogo logoUrl={logoUrl} />
          </Link>
          <LanguageToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 sm:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
