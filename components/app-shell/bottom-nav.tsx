"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, Calendar, Home, MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/triage", label: "Triage", icon: Brain },
  { href: "/app/chat", label: "Chat", icon: MessageCircle },
  { href: "/app/appointments", label: "Visits", icon: Calendar },
  { href: "/app/family", label: "Family", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
