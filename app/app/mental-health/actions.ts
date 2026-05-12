"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, phq9Severity, gad7Severity } from "@/lib/mental-health"

export async function submitPhq9(formData: FormData) {
  return submitAssessment(formData, "phq9", PHQ9_QUESTIONS.length, phq9Severity)
}

export async function submitGad7(formData: FormData) {
  return submitAssessment(formData, "gad7", GAD7_QUESTIONS.length, gad7Severity)
}

async function submitAssessment(
  formData: FormData,
  kind: "phq9" | "gad7",
  numQuestions: number,
  severityFn: (score: number) => string,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const answers: Record<string, number> = {}
  let score = 0
  for (let i = 0; i < numQuestions; i++) {
    const raw = formData.get(`q${i}`)
    if (raw == null) throw new Error(`Please answer question ${i + 1}`)
    const value = Number(raw)
    if (Number.isNaN(value) || value < 0 || value > 3) throw new Error(`Invalid answer for question ${i + 1}`)
    answers[`q${i}`] = value
    score += value
  }

  const severity = severityFn(score)

  const { error } = await supabase.from("mental_health_sessions").insert({
    user_id: user.id,
    kind,
    score,
    severity,
    answers,
  })
  if (error) throw new Error(error.message)

  revalidatePath("/app/mental-health")
  redirect("/app/mental-health")
}

export async function recordMood(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const score = Number(formData.get("score"))
  const notes = String(formData.get("notes") ?? "").trim() || null
  if (Number.isNaN(score) || score < 1 || score > 5) throw new Error("Pick a mood")

  const { error } = await supabase.from("mental_health_sessions").insert({
    user_id: user.id,
    kind: "mood",
    score,
    notes,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/app/mental-health")
}
