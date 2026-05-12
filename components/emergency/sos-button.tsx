"use client"

import { useEffect, useState, useTransition } from "react"
import { AlertTriangle, Phone, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { triggerEmergencyAlert } from "@/app/app/emergency/actions"

const COUNTDOWN_SECONDS = 30

export function SosButton() {
  const [open, setOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [pending, startTransition] = useTransition()
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Capture location once the dialog opens.
  useEffect(() => {
    if (!open) return
    setCountdown(COUNTDOWN_SECONDS)
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null),
        { timeout: 4000 },
      )
    }
  }, [open])

  // Countdown to auto-trigger.
  useEffect(() => {
    if (!open) return
    if (countdown <= 0) {
      void fire()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, countdown])

  function fire() {
    if (pending) return
    startTransition(async () => {
      try {
        const res = await triggerEmergencyAlert({
          location_lat: coords?.lat ?? null,
          location_lng: coords?.lng ?? null,
          location_label: coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : null,
        })
        setOpen(false)
        toast.success(
          res.contacts_notified > 0
            ? `Emergency alert sent. ${res.contacts_notified} contact${res.contacts_notified > 1 ? "s" : ""} notified.`
            : "Emergency alert logged. Add emergency contacts so we can notify them next time.",
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to trigger alert")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-destructive/30 lg:bottom-8 lg:right-8"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-30" />
        <span className="font-serif text-sm font-semibold">SOS</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <DialogTitle className="text-center font-serif text-2xl">Emergency alert</DialogTitle>
            <DialogDescription className="text-center">
              Your emergency contacts will be notified with your location and health summary in{" "}
              <span className="font-semibold text-destructive">{countdown}s</span>. Cancel below if you triggered
              this by mistake.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-xl bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="size-4 text-destructive" />
              <span>
                {coords
                  ? `Location captured (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`
                  : "Capturing your location…"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              We will share your blood group, allergies, and chronic conditions with your contacts so they can act
              fast.
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              <X className="size-4" />
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={fire} disabled={pending}>
              {pending ? "Sending…" : "Send now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
