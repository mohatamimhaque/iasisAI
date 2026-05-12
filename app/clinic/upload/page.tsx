import { LabUploadForm } from "@/components/clinic/lab-upload-form"

export const metadata = {
  title: "Upload lab report",
}

export default function UploadLabReportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Diagnostic lab</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Upload a lab report</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Reports sync immediately to the patient&apos;s health timeline and to their treating doctor.
        </p>
      </header>

      <div className="mt-8">
        <LabUploadForm />
      </div>
    </div>
  )
}
