"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, FileSignature, Home, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { SignOutButton } from "@/components/app-shell/sign-out-button"

const NAV = [
  { href: "/doctor", label: "Overview", icon: Home },
  { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  { href: "/doctor/patients", label: "Patients", icon: Users },
  { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileSignature },
]

export function DoctorSidebar({ userEmail, logoUrl }: { userEmail: string; logoUrl?: string | null }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-svh w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/doctor" className="flex items-center gap-2">
          <IasisLogo logoUrl={logoUrl} />
        </Link>
      </div>
      <div className="px-6 pt-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Doctor portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6" aria-label="Primary">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/doctor" && pathname.startsWith(item.href))
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
          href="/doctor/settings"
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
