"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, Globe, Menu, type LucideIcon } from "lucide-react"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignOutButton, SignOutMenuItem } from "@/components/app-shell/sign-out-button"

function initials(name: string | null | undefined, email: string) {
  const base = (name ?? email).trim()
  if (!base) return "I"
  const parts = base.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "I"
}

interface TopBarProps {
  fullName: string | null
  email: string
  avatarUrl?: string | null
  logoUrl?: string | null
  mobileNavItems?: Array<{ href: string; label: string; icon: LucideIcon }>
  mobileNavLabel?: string
  settingsHref?: string
  notificationsHref?: string
  notificationCount?: number
}

export function TopBar({
  fullName,
  email,
  avatarUrl,
  logoUrl,
  mobileNavItems,
  mobileNavLabel,
  settingsHref,
  notificationsHref,
  notificationCount,
}: TopBarProps) {
  const showMobileNav = Boolean(mobileNavItems && mobileNavItems.length > 0)
  const showNotifications = Boolean(notificationsHref)
  const badgeCount = typeof notificationCount === "number" ? notificationCount : 0
  const badgeLabel = badgeCount > 99 ? "99+" : badgeCount.toString()
  const [lang, setLang] = useState("EN")

  const getLangFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/)
    if (!match) return null
    const value = decodeURIComponent(match[1])
    if (value.endsWith("/bn")) return "BN"
    if (value.endsWith("/en")) return "EN"
    return null
  }

  useEffect(() => {
    const syncLang = () => {
      const translateSelect = document.querySelector<HTMLSelectElement>(".goog-te-combo")
      const cookieLang = getLangFromCookie()
      if (translateSelect) {
        const value = translateSelect.value === "bn" ? "BN" : "EN"
        setLang(value)
        return true
      }
      if (cookieLang) {
        setLang(cookieLang)
        return false
      }
      return false
    }

    if (syncLang()) return

    const intervalId = window.setInterval(() => {
      if (syncLang()) {
        window.clearInterval(intervalId)
      }
    }, 500)

    return () => window.clearInterval(intervalId)
  }, [])

  const toggleTranslate = () => {
    const translateSelect = document.querySelector<HTMLSelectElement>(".goog-te-combo")
    if (translateSelect) {
      const next = translateSelect.value === "bn" ? "en" : "bn"
      translateSelect.value = next
      translateSelect.dispatchEvent(new Event("change"))
      setLang(next === "bn" ? "BN" : "EN")
      return
    }

    const translateElement = document.getElementById("google_translate_element")
    if (!translateElement) return
    const isHidden = translateElement.style.display === "none" || translateElement.style.display === ""
    translateElement.style.display = isHidden ? "block" : "none"
    translateElement.setAttribute("aria-hidden", isHidden ? "false" : "true")
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        {showMobileNav ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Primary navigation links.</SheetDescription>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b border-border px-4 pr-12">
                  <IasisLogo logoUrl={logoUrl} />
                  {mobileNavLabel ? (
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{mobileNavLabel}</span>
                  ) : null}
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile primary">
                  <ul className="space-y-1">
                    {mobileNavItems?.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t border-border p-3">
                  {settingsHref ? (
                    <Link
                      href={settingsHref}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                    >
                      Settings
                    </Link>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-md px-3 py-2">
                    <span className="truncate text-xs text-muted-foreground" title={email}>
                      {email}
                    </span>
                    <SignOutButton />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
        <Link href="/app" className="flex items-center">
          <IasisLogo logoUrl={logoUrl} />
        </Link>
      </div>
      <div className="hidden lg:block">
        <p className="notranslate font-serif text-xl tracking-tight text-foreground" translate="no">
          {fullName ? `Hello, ${fullName.split(" ")[0]}.` : "Hello."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Toggle language"
          onClick={toggleTranslate}
          className="gap-2"
        >
          <Globe className="size-4" />
          <span className="notranslate text-xs font-semibold tracking-wide" translate="no">
            {lang}
          </span>
        </Button>
        {showNotifications ? (
          <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
            <Link href={notificationsHref ?? "/app/notifications"} className="relative">
              <Bell className="size-5" />
              {badgeCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
                  {badgeLabel}
                </span>
              ) : null}
            </Link>
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-secondary/60"
              aria-label="Account menu"
            >
              <Avatar className="size-8">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName ?? "User avatar"} /> : null}
                <AvatarFallback className="notranslate bg-primary/10 text-xs text-primary" translate="no">
                  {initials(fullName, email)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="notranslate text-sm font-medium text-foreground" translate="no">
                {fullName ?? "Iasis member"}
              </span>
              <span className="notranslate truncate text-xs text-muted-foreground" translate="no">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="notranslate" translate="no">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/onboarding">Edit health profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
