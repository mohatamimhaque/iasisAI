import { Store } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export const metadata = { title: "Pharmacies" }

export default function PharmaciesPage() {
  return (
    <ComingSoon
      icon={Store}
      title="Find a pharmacy near you"
      description="Locate DGDA-licensed pharmacies in your area, scan your prescription QR for instant verification, and order medicines with home delivery."
      features={[
        "Map view of licensed pharmacies in your district",
        "Real-time stock check before you visit",
        "Scan prescription QR for one-tap verification",
        "Home delivery in 60 minutes inside Dhaka",
        "bKash / Nagad / cash on delivery",
        "Trusted partners only — counterfeit-medicine protection",
      ]}
    />
  )
}
