import { Video } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export const metadata = { title: "Video consultation" }

export default function DoctorVideoConsultPage() {
  return (
    <ComingSoon
      icon={Video}
      title="Video consultation room is coming"
      description="The full doctor video room — with in-call AI scribe, prescription drafting, and patient record access — launches with our Daily.co WebRTC integration."
      features={[
        "Encrypted 1:1 video with screen share",
        "AI-generated SOAP notes during the call",
        "Draft prescription from inside the call",
        "Patient record sidebar with consent log",
        "Auto-saved recording for medical-legal record",
      ]}
      backHref="/doctor/appointments"
      backLabel="Back to appointments"
    />
  )
}
