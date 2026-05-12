"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { generateObject } from "ai"
import { createClient } from "@/lib/supabase/server"
import { LAB_SYSTEM_PROMPT, REPORT_MODEL, buildLabPrompt, labAnalysisSchema } from "@/lib/ai/lab-analysis"

export async function uploadLabReport(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const patient_id = String(formData.get("patient_id") ?? "").trim()
  const report_type = String(formData.get("report_type") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const raw_text = String(formData.get("raw_text") ?? "").trim()
  const file_url = String(formData.get("file_url") ?? "").trim() || null

  if (!patient_id) throw new Error("Patient ID is required")
  if (!report_type) throw new Error("Report type is required")
  if (!title) throw new Error("Report title is required")
  if (!raw_text) throw new Error("Paste the report content so AI can analyse it")

  // Verify the patient exists.
  const { data: patient } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", patient_id)
    .maybeSingle()
  if (!patient) throw new Error("No patient found with that ID")

  // Run AI analysis (best-effort — store report even if AI fails).
  let ai_summary: string | null = null
  let flagged_values: unknown[] | null = null
  try {
    const { object } = await generateObject({
      model: REPORT_MODEL,
      schema: labAnalysisSchema,
      system: LAB_SYSTEM_PROMPT,
      prompt: buildLabPrompt({ report_type, title, raw_text }),
    })
    ai_summary = object.summary
    flagged_values = object.flagged_values
  } catch (err) {
    console.log("[v0] lab AI analysis failed:", (err as Error).message)
  }

  const { error } = await supabase.from("lab_reports").insert({
    patient_id,
    clinic_id: user.id,
    report_type,
    title,
    file_url,
    ai_summary,
    flagged_values,
    reported_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)

  revalidatePath("/clinic/reports")
  revalidatePath("/clinic")
  redirect("/clinic/reports")
}
