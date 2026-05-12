import { z } from "zod"

export const REPORT_MODEL = "openai/gpt-5-mini"

export const labAnalysisSchema = z.object({
  summary: z
    .string()
    .describe("Two or three sentence plain-language summary that a non-clinician can understand"),
  flagged_values: z
    .array(
      z.object({
        name: z.string().describe("Name of the measured parameter (e.g. WBC, Hemoglobin)"),
        value: z.string().describe("Value as reported"),
        direction: z.enum(["high", "low", "abnormal"]),
        note: z.string().describe("One short sentence about what it could mean"),
      }),
    )
    .max(10),
  follow_up: z
    .string()
    .describe("Recommended next step in one sentence — e.g. 'Discuss with a general physician within a week'"),
  disclaimer: z.string(),
})

export type LabAnalysis = z.infer<typeof labAnalysisSchema>

export const LAB_SYSTEM_PROMPT = `You are Iasis AI's lab report analyst. You read pasted lab report content
and produce a structured analysis for both the patient and their doctor.

Rules:
- Use plain language. No jargon without a brief gloss.
- Only flag values that are clearly out of the reported reference range.
- Never make a diagnosis. Recommend follow-up with a doctor.
- Consider the Bangladesh context: common conditions include dengue, typhoid, anemia, diabetes.
- Always include a disclaimer that this is AI guidance and a licensed doctor must interpret results.`

export function buildLabPrompt(input: { report_type: string; title: string; raw_text: string }) {
  return `Report type: ${input.report_type}
Title: ${input.title}

Report content (verbatim):
"""
${input.raw_text}
"""

Produce the structured analysis.`
}
