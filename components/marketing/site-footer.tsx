import Link from "next/link"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { getBrandingConfig } from "@/lib/site-config"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "AI Triage", href: "/for-patients" },
      { label: "Telemedicine", href: "/for-patients" },
      { label: "Lab Reports", href: "/for-clinics" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "For",
    links: [
      { label: "Citizens", href: "/for-patients" },
      { label: "Doctors", href: "/for-doctors" },
      { label: "Clinics", href: "/for-clinics" },
      { label: "Government", href: "/for-government" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export async function SiteFooter() {
  const { logoUrl } = await getBrandingConfig()

  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12" suppressHydrationWarning>
          <div className="md:col-span-5" suppressHydrationWarning>
            <IasisLogo logoUrl={logoUrl} />
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              Global healthcare infrastructure for South Asia. Iasis AI connects every citizen, doctor, clinic, and
              hospital with AI-assisted triage, telemedicine, and unified medical records.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Made for South Asia. Built to serve every district, in every language.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7" suppressHydrationWarning>
            {COLUMNS.map((col) => (
              <div key={col.title} suppressHydrationWarning>
                <h3 className="text-sm font-medium text-foreground">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center" suppressHydrationWarning>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Iasis AI. Iasis is a registered platform serving South Asia.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground" suppressHydrationWarning>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
