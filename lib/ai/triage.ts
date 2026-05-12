import { z } from "zod"

export const TRIAGE_MODEL = "openai/gpt-5-mini"

export const triageSchema = z.object({
  possible_conditions: z
    .array(
      z.object({
        name: z.string().describe("Plain-language name of the condition"),
        probability: z.number().min(0).max(1).describe("Likelihood between 0 and 1"),
        explanation: z.string().describe("One short sentence why this is suspected"),
      }),
    )
    .min(1)
    .max(5),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  recommended_tests: z.array(z.string()).max(8),
  recommended_specialist: z
    .string()
    .describe("Type of specialist to consult, e.g. 'General Physician', 'Cardiologist'"),
  recommended_action: z
    .string()
    .describe("One actionable sentence about what to do next, including timeline"),
  red_flags: z
    .array(z.string())
    .describe("Symptoms that would warrant immediate emergency care"),
  disclaimer: z.string(),
})

export type TriageResult = z.infer<typeof triageSchema>

export const TRIAGE_SYSTEM_PROMPT = `You are Iasis AI, a medical triage assistant supporting citizens in Bangladesh.
Your job is to take a patient's reported symptoms and produce structured, safe guidance.

Rules:
- You are NOT diagnosing. You are suggesting likely possibilities and next steps.
- Always be cautious. If symptoms could indicate something life-threatening, mark urgency CRITICAL and tell them to go to an emergency room.
- Consider the context of Bangladesh (dengue, typhoid, water-borne illness, tuberculosis are common; air quality is poor in winter).
- Use plain, calm language. No jargon, no scary speculation.
- Always include a clear disclaimer that this is AI guidance and a licensed doctor must confirm any diagnosis.
- Limit possible_conditions to the 3-5 most likely.
- recommended_tests should be practical lab tests available in Bangladesh (CBC, Dengue NS1, etc.).
- recommended_specialist should be a real specialty.
- red_flags are warning signs that demand immediate care — list 2-4.`

export function buildTriagePrompt(input: {
  symptoms: string
  duration: string | null
  severity: string | null
  age: number | null
  gender: string | null
}) {
  return `Patient context:
- Age: ${input.age ?? "unknown"}
- Gender: ${input.gender ?? "unknown"}
- Duration of symptoms: ${input.duration ?? "unknown"}
- Severity (patient-reported): ${input.severity ?? "unknown"}

Reported symptoms (verbatim from the patient):
"""
${input.symptoms}
"""

Produce the triage assessment.`
}

export const URGENCY_LABEL: Record<TriageResult["urgency"], string> = {
  LOW: "Low — self-care is reasonable",
  MEDIUM: "Medium — see a doctor soon",
  HIGH: "High — see a doctor within 24 hours",
  CRITICAL: "Critical — go to an emergency room now",
}
