"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  Bell,
  BellRing,
  Brain,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  Home,
  LifeBuoy,
  MessageCircle,
  Pill,
  Settings,
  Store,
  Users,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { SignOutButton } from "@/components/app-shell/sign-out-button"

export const APP_NAV = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/triage", label: "AI Triage", icon: Brain },
  { href: "/app/chat", label: "AI Chat", icon: MessageCircle },
  { href: "/app/appointments", label: "Appointments", icon: Calendar },
  { href: "/app/telemedicine", label: "Telemedicine", icon: Video },
  { href: "/app/clinics", label: "Find care", icon: Building2 },
  { href: "/app/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/app/lab-reports", label: "Lab Reports", icon: FlaskConical },
  { href: "/app/records", label: "Records", icon: FileText },
  { href: "/app/medicines", label: "Medicines", icon: Pill },
  { href: "/app/pharmacies", label: "Pharmacies", icon: Store },
  { href: "/app/reminders", label: "Reminders", icon: BellRing },
  { href: "/app/mental-health", label: "Mental Health", icon: HeartPulse },
  { href: "/app/family", label: "Family", icon: Users },
  { href: "/app/emergency", label: "Emergency", icon: AlertTriangle },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/billing", label: "Plans & billing", icon: CreditCard },
  { href: "/app/support", label: "Support", icon: LifeBuoy },
]

export function AppSidebar({ userEmail, logoUrl }: { userEmail: string; logoUrl?: string | null }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-svh w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/app" className="flex items-center">
          <IasisLogo logoUrl={logoUrl} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6" aria-label="Primary">
        <ul className="space-y-1">
          {APP_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/app/settings"
          className="notranslate flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          translate="no"
        >
          <Settings className="size-4" />
          Settings
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md px-3 py-2">
          <span
            className="notranslate truncate text-xs text-muted-foreground"
            translate="no"
            title={userEmail}
          >
            {userEmail}
          </span>
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
