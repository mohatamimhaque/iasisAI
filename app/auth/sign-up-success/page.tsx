import Link from "next/link"
import { Mail } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Check your email",
}

export default function SignUpSuccessPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-5" />
        </span>
        <div className="space-y-2">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Check your email.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ve sent you a confirmation link. Click it to verify your account and finish setting up your Iasis
            profile.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
