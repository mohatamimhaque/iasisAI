import { CreditCard } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export const metadata = { title: "Payments" }

export default function AdminPaymentsPage() {
  return (
    <ComingSoon
      icon={CreditCard}
      title="Payments dashboard"
      description="Live revenue and reconciliation across bKash, Nagad, Rocket, and card processors. Launches with our payments integration."
      features={[
        "Per-channel volume and success rate",
        "Refund and chargeback workflow",
        "Doctor payout schedule and ledger",
        "Tax and VAT reports for Bangladesh",
        "Audit trail with admin attribution",
      ]}
      backHref="/admin"
      backLabel="Back to admin"
    />
  )
}
