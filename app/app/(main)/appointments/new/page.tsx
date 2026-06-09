import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { BookingForm } from "@/components/appointments/booking-form"

export const metadata = {
  title: "Book appointment",
}

export default async function NewAppointmentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, full_name, specialty, consultation_fee, available_for_telemedicine")
    .order("full_name", { ascending: true })

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/app/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to appointments
      </Link>

      <header className="mt-6">
        <p className="text-sm uppercase tracking-wider text-primary">Book a consultation</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Choose a doctor</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          All doctors on Iasis are BMDC-verified. Telemedicine consultations are available the same day.
        </p>
      </header>

      <div className="mt-8">
        <BookingForm doctors={doctors ?? []} />
      </div>
    </div>
  )
}
