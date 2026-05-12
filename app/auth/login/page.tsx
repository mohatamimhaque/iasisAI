import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  return (
    <AuthShell
      quote={{
        body: "We've always wanted healthcare to feel like infrastructure — quiet, reliable, everywhere. Iasis is finally making that possible.",
        attribution: "Dr. R. Hossain, Internal Medicine, Dhaka",
      }}
    >
      <LoginForm />
    </AuthShell>
  )
}
