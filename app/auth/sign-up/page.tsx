import { Suspense } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Create your account",
}

export default function SignUpPage() {
  return (
    <AuthShell
      quote={{
        body: "For the first time, a patient walks in and we already know who they are. No paperwork. No lost reports. We just begin treating.",
        attribution: "S. Rahman, Clinic Director, Chattogram",
      }}
    >
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  )
}
