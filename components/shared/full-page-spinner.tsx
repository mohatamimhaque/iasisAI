export function FullPageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="spinner" aria-live="polite" aria-busy="true">
      <div className="lds-roller" aria-hidden="true">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="text-sm">{label}</div>
    </div>
  )
}
