import { cn } from "@/lib/utils"

interface IasisLogoProps {
  className?: string
  showWordmark?: boolean
  inverse?: boolean
  logoUrl?: string | null
}

export function IasisLogo({ className, showWordmark = true, inverse = false, logoUrl }: IasisLogoProps) {
  const showImage = Boolean(logoUrl)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span aria-hidden="true" className="relative inline-flex h-7 w-7 items-center justify-center">
        {showImage ? (
          <img src={logoUrl ?? ""} alt="Iasis AI logo" className="h-7 w-7 rounded-md object-contain" />
        ) : (
          <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="1"
              y="1"
              width="30"
              height="30"
              rx="9"
              className={inverse ? "fill-background" : "fill-primary"}
            />
            <path
              d="M16 8.5v15M8.5 16h15"
              className={inverse ? "stroke-primary" : "stroke-primary-foreground"}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="16"
              cy="16"
              r="3.25"
              className={cn(inverse ? "stroke-primary" : "stroke-primary-foreground", "fill-transparent")}
              strokeWidth="1.5"
            />
          </svg>
        )}
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-serif text-xl tracking-tight",
            inverse ? "text-background" : "text-foreground",
          )}
        >
          iasis<span className={inverse ? "text-background/70" : "text-primary"}>.</span>
        </span>
      ) : null}
      <span className="sr-only">Iasis AI</span>
    </div>
  )
}
