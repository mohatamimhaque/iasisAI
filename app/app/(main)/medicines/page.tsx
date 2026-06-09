import { Pill } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export const metadata = { title: "Medicines" }

export default function MedicinesPage() {
  return (
    <ComingSoon
      icon={Pill}
      title="Medicine search is coming soon"
      description="Search any medicine sold in Bangladesh, see generic equivalents, indications, contra-indications, side effects, and the nearest pharmacy that stocks it."
      features={[
        "Search 50,000+ medicines from the DGDA national registry",
        "Generic alternatives and price comparison",
        "Plain-language explanations powered by AI",
        "Live stock at nearby DGDA-licensed pharmacies",
        "Drug interaction warnings against your current medication",
        "Order home delivery from partner pharmacies",
      ]}
    />
  )
}
