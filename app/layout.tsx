import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { getBrandingConfig } from "@/lib/site-config"
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
    default: "Iasis AI — National Healthcare Infrastructure for Bangladesh",
    template: "%s · Iasis AI",
  },
  description:
    "Iasis AI is a national, AI-powered healthcare platform connecting every citizen, doctor, clinic, and hospital across Bangladesh. Symptom triage, telemedicine, lab reports, and prescriptions — in one place.",
  generator: "v0.app",
  applicationName: "Iasis AI",
  keywords: [
    "Iasis AI",
    "Bangladesh healthcare",
    "AI triage",
    "telemedicine Bangladesh",
    "digital health Bangladesh",
    "doctor appointment",
    "lab reports",
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl } = await getBrandingConfig()

  return {
    ...baseMetadata,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  }
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
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors closeButton position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
