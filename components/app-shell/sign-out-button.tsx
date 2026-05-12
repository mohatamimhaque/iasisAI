"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

async function signOut(router: ReturnType<typeof useRouter>) {
  const supabase = createClient()
  await supabase.auth.signOut()
  router.push("/")
  router.refresh()
}

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label="Sign out"
      onClick={() => signOut(router)}
    >
      <LogOut className="size-4" />
    </Button>
  )
}

export function SignOutMenuItem() {
  const router = useRouter()
  return (
    <DropdownMenuItem onSelect={(e) => {
      e.preventDefault()
      signOut(router)
    }}>
      <LogOut className="mr-2 size-4" />
      Sign out
    </DropdownMenuItem>
  )
}
