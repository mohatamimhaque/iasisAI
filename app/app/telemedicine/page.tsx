import { Video } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export const metadata = { title: "Video consultation" }

export default function TelemedicinePage() {
  return (
    <ComingSoon
      icon={Video}
      title="Video consultations are coming soon"
      description="Secure, end-to-end-encrypted video consultations with verified doctors across Bangladesh — built on WebRTC and integrated with bKash and Nagad for fee collection."
      features={[
        "HD video and audio optimised for 4G connections",
        "In-call AI scribe captures notes and prescription drafts",
        "Pay via bKash, Nagad, Rocket, or card before the session",
        "Cross-district teleconsultation with verified BMDC doctors",
        "Auto-saved to your medical record with consent",
        "Family member can join remotely in emergencies",
      ]}
      backHref="/app/appointments"
      backLabel="Browse appointments"
    />
  )
}
