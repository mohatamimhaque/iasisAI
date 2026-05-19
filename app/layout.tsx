import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { getBrandingConfig } from "@/lib/site-config"
import GoogleTranslate from "@/components/GoogleTranslate"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const baseMetadata: Metadata = {
  title: {
    default: "Iasis AI — Global Healthcare Infrastructure for South Asia",
    template: "%s · Iasis AI",
  },
  description:
    "Iasis AI is a global, AI-powered healthcare platform connecting every citizen, doctor, clinic, and hospital across South Asia. Symptom triage, telemedicine, lab reports, and prescriptions — in one place.",
  generator: "v0.app",
  applicationName: "Iasis AI",
  keywords: [
    "Iasis AI",
    "South Asia healthcare",
    "AI triage",
    "telemedicine South Asia",
    "digital health South Asia",
    "doctor appointment",
    "lab reports",
  ],
}

export const metadata: Metadata = {
  ...baseMetadata,
  icons: { icon: "/favicon.ico" },
  other: {
    "sf-pro-font": '<link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1518" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <GoogleTranslate />
        {children}
        <Toaster richColors closeButton position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
