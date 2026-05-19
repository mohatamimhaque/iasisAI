"use client"

import { useEffect, useState } from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

type LanguageToggleProps = {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
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
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle language"
      onClick={toggleTranslate}
      className={["gap-2", className].filter(Boolean).join(" ")}
    >
      <Globe className="size-4" />
      <span className="notranslate text-xs font-semibold tracking-wide" translate="no">
        {lang}
      </span>
    </Button>
  )
}
