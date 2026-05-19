import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { LanguageToggle } from "@/components/language-toggle"
import { getBrandingConfig } from "@/lib/site-config"

const NAV = [
  { label: "Citizens", href: "/for-patients" },
  { label: "Doctors", href: "/for-doctors" },
  { label: "Clinics", href: "/for-clinics" },
  { label: "Government", href: "/for-government" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
]

export async function SiteHeader() {
  const { logoUrl } = await getBrandingConfig()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <Link href="/" className="flex items-center" aria-label="Iasis AI home">
          <IasisLogo logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2" suppressHydrationWarning>
          <LanguageToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
