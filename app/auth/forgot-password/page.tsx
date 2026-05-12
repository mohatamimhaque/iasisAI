import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot password",
  description: "Reset your Iasis AI account password.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      quote={{
        body: "Your health record is yours. Recovering access should be just as private and just as simple.",
        attribution: "— Iasis Security Team",
      }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
