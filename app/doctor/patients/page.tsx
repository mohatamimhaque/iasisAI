import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Patients",
}

export default async function DoctorPatientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Doctor portal</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Patients</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          A roster of everyone you have seen on Iasis, with their full medical history a click away.
        </p>
      </header>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-5" />
        </span>
        <h2 className="mt-4 font-serif text-2xl text-foreground">No patient records yet</h2>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          Once you complete consultations, your patients will appear here with their full Iasis health timeline
          accessible.
        </p>
      </div>
    </div>
  )
}
