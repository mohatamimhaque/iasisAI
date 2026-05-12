import { FileText } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export const metadata = { title: "Marketing content" }

export default function AdminContentPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Marketing CMS"
      description="Edit landing-page hero copy, audience pages, and announcement banners directly. Versioned and publishable without a deploy."
      features={[
        "Hero, value-prop, and feature copy blocks",
        "Audience pages (Citizens / Doctors / Clinics / Government)",
        "Localisation: Bangla, English, regional languages",
        "Scheduled banners and announcements",
        "Rollback to any prior version",
      ]}
      backHref="/admin"
      backLabel="Back to admin"
    />
  )
}
