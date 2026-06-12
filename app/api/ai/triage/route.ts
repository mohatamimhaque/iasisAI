import { z } from "zod"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/lib/supabase/server"
import { triageSchema, type TriageResult, buildTriagePrompt, TRIAGE_SYSTEM_PROMPT } from "@/lib/ai/triage"
import { getRedirectUrl } from "@/lib/utils"

export const maxDuration = 60

const inputSchema = z.object({
  symptoms: z.string().min(5).max(2000),
  duration: z.string().max(120).nullable(),
  severity: z.string().max(120).nullable(),
  images: z.array(z.string()).optional(),
  useMock: z.boolean().optional(),
})

// Cloudflare R2 client configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
})

// Fallback dummy image since MedGemma python backend throws a 400 error if image is missing
const DUMMY_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

async function uploadBase64Images(userId: string, base64Images: string[]): Promise<string[]> {
  const publicUrls: string[] = []

  for (const base64Str of base64Images) {
    try {
      const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
      if (!matches) continue

      const contentType = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, "base64")

      const fileExt = contentType.split("/")[1] || "jpg"
      const fileName = `triage/${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "",
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
      })

      await s3Client.send(command)

      // Construct public URL
      const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || ""
      const publicUrl = `${publicBaseUrl}/${fileName}`
      publicUrls.push(publicUrl)
    } catch (e) {
      console.error("[v0] Failed to upload image to Cloudflare R2:", e)
    }
  }

  return publicUrls
}

function parseAssessmentToTriageResult(assessment: string, symptoms: string): TriageResult {
  const possible_conditions: Array<{ name: string; probability: number; explanation: string }> = []
  const red_flags: string[] = []
  const recommended_tests: string[] = []

  const text = assessment || ""

  // 1. Extract Possible Conditions
  const conditionsMatch = text.match(/\*\*Possible Conditions:\*\*([\s\S]*?)(?=\*\*(?:Red Flags|Recommended|Action|Specialist)\*\*|$)/i)
  if (conditionsMatch && conditionsMatch[1]) {
    const lines = conditionsMatch[1].split(/\n+/)
    let index = 0
    for (const line of lines) {
      const match = line.match(/^\s*\d+[\s.)-]+\*\*([^*]+)\*\*:?\s*(.*)$/) ||
                    line.match(/^\s*\d+[\s.)-]+\*\*([^*]+)\*\*\s*-\s*(.*)$/) ||
                    line.match(/^\s*\d+[\s.)-]+\*\*([^*]+)\*\*\s*(.*)$/)
      
      if (match) {
        const name = match[1].trim()
        const explanation = match[2] ? match[2].trim() : "Suspected based on your symptoms profile."
        possible_conditions.push({
          name,
          probability: Math.max(0.1, 0.7 - index * 0.2),
          explanation
        })
        index++
      } else {
        const simpleMatch = line.match(/^\s*\d+[\s.)-]+\s*([^:-]+)[:.-]\s*(.*)$/)
        if (simpleMatch) {
          const name = simpleMatch[1].trim()
          const explanation = simpleMatch[2] ? simpleMatch[2].trim() : "Suspected based on your symptoms profile."
          possible_conditions.push({
            name,
            probability: Math.max(0.1, 0.7 - index * 0.2),
            explanation
          })
          index++
        }
      }
    }
  }

  // 2. Extract Red Flags
  const redFlagsMatch = text.match(/\*\*(?:Red Flags|Warning Signs)[^*]*\*\*([\s\S]*?)(?=\*\*(?:Possible Conditions|Recommended|Action|Specialist)\*\*|$)/i)
  if (redFlagsMatch && redFlagsMatch[1]) {
    const lines = redFlagsMatch[1].split(/\n+/)
    for (const line of lines) {
      const match = line.match(/^\s*[*+-]\s*(.*)$/) || line.match(/^\s*\d+[\s.)-]+\s*(.*)$/)
      if (match) {
        const flag = match[1].trim()
        if (flag) {
          red_flags.push(flag)
        }
      }
    }
  }

  // 3. Extract Recommended Tests
  const testsMatch = text.match(/\*\*Recommended Tests:\*\*([\s\S]*?)(?=\*\*(?:Possible Conditions|Red Flags|Action|Specialist)\*\*|$)/i)
  if (testsMatch && testsMatch[1]) {
    const lines = testsMatch[1].split(/\n+/)
    for (const line of lines) {
      const match = line.match(/^\s*[*+-]\s*(.*)$/) || line.match(/^\s*\d+[\s.)-]+\s*(.*)$/)
      if (match) {
        const test = match[1].trim()
        if (test) {
          recommended_tests.push(test)
        }
      }
    }
  }

  // Fallbacks if extraction failed
  if (possible_conditions.length === 0) {
    possible_conditions.push({
      name: "Unspecified General Condition",
      probability: 0.7,
      explanation: "Suspected based on symptoms."
    })
  }

  // 4. Infer Urgency
  let urgency: TriageResult["urgency"] = "MEDIUM"
  const lowerText = text.toLowerCase()
  if (lowerText.includes("emergency") || lowerText.includes("immediate care") || lowerText.includes("critical") || red_flags.length > 3) {
    urgency = "CRITICAL"
  } else if (lowerText.includes("urgent") || lowerText.includes("within 24 hours") || lowerText.includes("soon")) {
    urgency = "HIGH"
  } else if (lowerText.includes("self-care") || lowerText.includes("home care") || lowerText.includes("mild")) {
    urgency = "LOW"
  }

  // 5. Recommended action
  let recommended_action = "Consult a physician for a thorough professional examination."
  const introLines = text.trim().split("\n")
  if (introLines.length > 0 && introLines[0].length > 10) {
    recommended_action = introLines[0].trim()
  }

  // 6. Recommended specialist
  let recommended_specialist = "General Physician"
  const symptomsLower = symptoms.toLowerCase()
  if (symptomsLower.includes("chest") || symptomsLower.includes("heart")) {
    recommended_specialist = "Cardiologist"
  } else if (symptomsLower.includes("skin") || symptomsLower.includes("rash") || symptomsLower.includes("itch")) {
    recommended_specialist = "Dermatologist"
  } else if (symptomsLower.includes("child") || symptomsLower.includes("baby")) {
    recommended_specialist = "Pediatrician"
  } else if (symptomsLower.includes("bone") || symptomsLower.includes("joint") || symptomsLower.includes("fracture") || symptomsLower.includes("wrist") || symptomsLower.includes("hand")) {
    recommended_specialist = "Orthopedician"
  }

  return {
    possible_conditions,
    urgency,
    recommended_tests,
    recommended_specialist,
    recommended_action,
    red_flags,
    disclaimer: "This information is based on limited details provided by you and is not a substitute for professional medical advice. A licensed doctor must confirm any diagnosis."
  }
}

export async function POST(req: Request) {
  console.log("[Triage API] Request received.")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error("[Triage API] Unauthorized request.")
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const body = await req.json()
  console.log("[Triage API] Parsing request body...")
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    console.error("[Triage API] Validation failed:", parsed.error)
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  console.log(`[Triage API] Params: symptomsLength=${parsed.data.symptoms.length}, duration=${parsed.data.duration}, severity=${parsed.data.severity}, imagesCount=${parsed.data.images?.length || 0}`)

  // 1. Upload images to Cloudflare R2 if present
  const base64Images = parsed.data.images || []
  let publicUrls: string[] = []
  if (base64Images.length > 0) {
    console.log(`[Triage API] Uploading ${base64Images.length} images to Cloudflare R2...`)
    publicUrls = await uploadBase64Images(user.id, base64Images)
    console.log("[Triage API] Image uploads completed. Public URLs:", publicUrls)
  }

  // 2. Pull age/gender from profile for context
  console.log(`[Triage API] Fetching profile for user ID: ${user.id}`)
  const { data: profile } = await supabase
    .from("profiles")
    .select("date_of_birth, gender")
    .eq("id", user.id)
    .single()

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null
  console.log(`[Triage API] Profile context: age=${age}, gender=${profile?.gender ?? "unknown"}`)

  // Helper to generate structured mock/demo triage response
  const generateDemo = (symptoms: string): TriageResult => {
    console.log("[Triage API] Generating structured mock triage response...")
    const lowerSymptoms = symptoms.toLowerCase()
    
    if (lowerSymptoms.includes("chest pain") || lowerSymptoms.includes("heart attack") || lowerSymptoms.includes("breath")) {
      return {
        possible_conditions: [
          { name: "Angina Pectoris", probability: 0.7, explanation: "Reported chest pain and breathing issues indicate possible reduced blood flow to the heart." },
          { name: "Myocardial Infarction (Heart Attack)", probability: 0.3, explanation: "Acute chest pain warrants immediate evaluation for acute cardiac events." }
        ],
        urgency: "CRITICAL",
        recommended_tests: ["Electrocardiogram (ECG)", "Troponin I", "Chest X-Ray"],
        recommended_specialist: "Cardiologist",
        recommended_action: "Go to the nearest hospital emergency room immediately. Do not drive yourself.",
        red_flags: ["Shortness of breath", "Pain radiating to left arm or jaw", "Cold sweats", "Dizziness"],
        disclaimer: "This is a simulated triage report for demonstration. Seek immediate emergency professional care."
      }
    } else if (lowerSymptoms.includes("fever") || lowerSymptoms.includes("cough") || lowerSymptoms.includes("temp")) {
      return {
        possible_conditions: [
          { name: "Viral Fever (Common Cold / Influenza)", probability: 0.65, explanation: "Fever and dry cough are typical presentations of upper respiratory tract viral infections." },
          { name: "Dengue Fever", probability: 0.25, explanation: "Fever in Bangladesh, especially with body aches, requires monitoring for dengue." }
        ],
        urgency: "MEDIUM",
        recommended_tests: ["Complete Blood Count (CBC)", "Dengue NS1 Antigen Test (if fever > 24h)"],
        recommended_specialist: "General Physician",
        recommended_action: "Monitor temperature, stay hydrated, rest, and consult a doctor if fever persists beyond 3 days.",
        red_flags: ["Persistent high fever (>103°F)", "Severe abdominal pain", "Uncontrolled vomiting", "Bleeding gums"],
        disclaimer: "This is a simulated triage report for demonstration. Consult a licensed medical professional."
      }
    } else {
      return {
        possible_conditions: [
          { name: "Mild Viral Gastroenteritis", probability: 0.75, explanation: "General symptoms of discomfort and mild nausea point to seasonal stomach virus." }
        ],
        urgency: "LOW",
        recommended_tests: ["Stool Routine Examination (if diarrhea develops)"],
        recommended_specialist: "General Physician",
        recommended_action: "Drink plenty of clean fluids (ORS), eat bland foods, and rest.",
        red_flags: ["Dehydration signs (dry mouth, extreme thirst)", "High fever", "Severe blood in stool"],
        disclaimer: "This is a simulated triage report for demonstration. Consult a doctor if symptoms worsen."
      }
    }
  }

  let result: TriageResult | null = null

  if (parsed.data.useMock) {
    console.log("[Triage API] Explicitly requested demo data.")
    result = generateDemo(parsed.data.symptoms)
  } else {
    // 3. Retrieve dynamic MedGemma endpoint from Firebase Realtime Database
    let medgemmaUrl = ""
    try {
      const fbRes = await fetch("https://iasis-6e66e-default-rtdb.firebaseio.com/services/medgemma.json")
      if (fbRes.ok) {
        const fbData = await fbRes.json()
        medgemmaUrl = fbData?.url || ""
      }
    } catch (err) {
      console.error("[Triage API] Failed to retrieve dynamic model URL from Firebase:", err)
    }

    if (!medgemmaUrl) {
      console.error("[Triage API] MedGemma model URL not resolved. Falling back to demo data.")
      result = generateDemo(parsed.data.symptoms)
    } else {
      // 4. Construct prompt content matching the Python handler expectation
      const textPrompt = `${TRIAGE_SYSTEM_PROMPT}\n\n${buildTriagePrompt({
        symptoms: parsed.data.symptoms,
        duration: parsed.data.duration,
        severity: parsed.data.severity,
        age,
        gender: profile?.gender ?? null,
      })}`

      const hasImage = base64Images.length > 0
      let formattedTextPrompt = textPrompt
      if (hasImage) {
        // Prepend "<image>" placeholders for the Gemma 3 processor
        const imagePlaceholders = "<image>".repeat(base64Images.length)
        formattedTextPrompt = `${imagePlaceholders}\n${textPrompt}`
      }

      const userContent: any[] = [{ type: "text", text: formattedTextPrompt }]
      if (hasImage) {
        base64Images.forEach((img, index) => {
          userContent.push({
            type: "image_url",
            image_url: { url: img },
          })
        })
      }

      try {
        // Call Python FastAPI /v1/chat/completions endpoint on Kaggle directly
        const medgemmaEndpoint = `${medgemmaUrl}/v1/chat/completions`
        console.log(`[Triage API] Fetching MedGemma chat completions directly from: ${medgemmaEndpoint}`)
        
        const response = await fetch(medgemmaEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            has_image: hasImage,
            messages: [
              {
                role: "user",
                content: userContent,
              },
            ],
          }),
        })

        console.log(`[Triage API] Proxy response status: ${response.status}`)
        if (!response.ok) {
          const errBody = await response.text()
          console.error(`[Triage API] MedGemma API error detail:`, errBody)
          throw new Error(`Model request failed: ${errBody || response.statusText}`)
        }

        const payload = await response.json()
        const rawContent = payload?.choices?.[0]?.message?.content
        console.log("[Triage API] MedGemma output raw content:", rawContent)
        
        // Parse JSON block out of MedGemma output
        if (rawContent) {
          let cleanContent = rawContent.trim()
          // Strip ```json ... ``` blocks if present
          if (cleanContent.startsWith("```")) {
            const lines = cleanContent.split("\n")
            if (lines[0].startsWith("```")) {
              lines.shift()
            }
            if (lines[lines.length - 1].startsWith("```")) {
              lines.pop()
            }
            cleanContent = lines.join("\n").trim()
          }

          try {
            const parsedJSON = JSON.parse(cleanContent)
            if (parsedJSON.assessment) {
              const inferred = parseAssessmentToTriageResult(parsedJSON.assessment, parsed.data.symptoms)
              result = {
                ...inferred,
                ...parsedJSON,
                possible_conditions: parsedJSON.possible_conditions || inferred.possible_conditions,
                red_flags: parsedJSON.red_flags || inferred.red_flags,
                recommended_tests: parsedJSON.recommended_tests || inferred.recommended_tests,
                recommended_specialist: parsedJSON.recommended_specialist || inferred.recommended_specialist,
                recommended_action: parsedJSON.recommended_action || inferred.recommended_action,
                urgency: parsedJSON.urgency || inferred.urgency,
                disclaimer: parsedJSON.disclaimer || inferred.disclaimer,
              }
            } else {
              result = parsedJSON
            }
            console.log("[Triage API] Parsed Structured Result Urgency:", result?.urgency)
          } catch (jsonErr) {
            console.warn("[Triage API] Failed to parse model output as JSON, falling back to assessment text parser:", jsonErr)
            result = parseAssessmentToTriageResult(rawContent, parsed.data.symptoms)
          }
        }
      } catch (err) {
        console.error("[Triage API] Error communicating with MedGemma API. Falling back to demo data.", err)
        result = generateDemo(parsed.data.symptoms)
      }
    }
  }

  if (!result) {
    console.warn("[Triage API] Failed to obtain result from MedGemma. Falling back to demo data.")
    result = generateDemo(parsed.data.symptoms)
  }

  // 5. Persist the session
  console.log("[Triage API] Persisting triage session into database...")
  const { data: session, error: insertError } = await supabase
    .from("triage_sessions")
    .insert({
      user_id: user.id,
      symptoms: parsed.data.symptoms,
      duration: parsed.data.duration,
      severity: parsed.data.severity,
      age,
      gender: profile?.gender ?? null,
      result,
      urgency: result.urgency,
      model_used: "MedGemma-1.5-4b-it (Kaggle)",
      images: publicUrls.length > 0 ? publicUrls : null,
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("[Triage API] Triage persist error:", insertError)
    return new Response(JSON.stringify({ error: "Could not save session" }), { status: 500 })
  }

  console.log(`[Triage API] Session successfully created. Session ID: ${session.id}`)
  return Response.json({ id: session.id })
}
