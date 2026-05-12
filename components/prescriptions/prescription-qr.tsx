"use client"

import { QRCodeSVG } from "qrcode.react"

interface Props {
  url: string
}

export function PrescriptionQR({ url }: Props) {
  return (
    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border border-border bg-background p-2 sm:h-36 sm:w-36">
      <QRCodeSVG value={url} size={128} level="M" bgColor="transparent" fgColor="currentColor" />
    </div>
  )
}
