const STEPS = [
  {
    n: "01",
    title: "Tell Iasis what's wrong.",
    body: "Type or speak your symptoms in Bangla or English. Iasis asks the right follow-up questions, in seconds.",
  },
  {
    n: "02",
    title: "Get a guided triage.",
    body: "Receive urgency level, possible conditions, recommended tests, and the right specialty — all in clear language.",
  },
  {
    n: "03",
    title: "Reach the right doctor.",
    body: "Book a verified specialist online or at a nearby clinic. Your full history travels with you — no repeated paperwork.",
  },
  {
    n: "04",
    title: "Everything in one record.",
    body: "Prescriptions, lab reports, follow-ups, and family history live in one secure record you control for life.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" suppressHydrationWarning>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16" suppressHydrationWarning>
          <div className="lg:col-span-5" suppressHydrationWarning>
            <p className="text-sm uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-3 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
              From symptom to specialist — without leaving home.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              Iasis AI is designed for the realities of Bangladesh: low bandwidth, multiple languages, deep regional
              variation, and a healthcare system that needs to scale to every village.
            </p>
          </div>

          <ol className="lg:col-span-7" suppressHydrationWarning>
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                className={`grid grid-cols-[auto_1fr] gap-6 py-8 ${
                  i !== STEPS.length - 1 ? "border-b border-border/60" : ""
                }`}
              >
                <span className="font-serif text-2xl text-primary">{step.n}</span>
                <div>
                  <h3 className="font-serif text-2xl tracking-tight text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
