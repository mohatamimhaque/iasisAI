import { Suspense } from "react"
import { getBrandingConfig } from "@/lib/site-config"
import { SignUpShell } from "@/components/auth/signup-shell"

export const metadata = {
  title: "Create your account",
}

export default async function SignUpPage() {
  const { logoUrl } = await getBrandingConfig()

  return (
    <Suspense fallback={null}>
      <SignUpShell logoUrl={logoUrl} />
    </Suspense>
  )
}
