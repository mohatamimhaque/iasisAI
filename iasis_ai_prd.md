# Iasis AI — Product Requirements Document
**Next-Generation AI-Powered National Healthcare Platform**
**Version:** 2.0.0 | **Status:** Draft | **Last Updated:** May 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Tech Stack & Infrastructure](#3-tech-stack--infrastructure)
4. [Design System & Branding](#4-design-system--branding)
5. [User Personas](#5-user-personas)
6. [Platform Architecture Overview](#6-platform-architecture-overview)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [Feature Requirements](#8-feature-requirements)
   - 8.1 [Authentication (Supabase Auth)](#81-authentication-supabase-auth)
   - 8.2 [Health Profile Setup](#82-health-profile-setup)
   - 8.3 [AI Triage & Symptom Analysis](#83-ai-triage--symptom-analysis)
   - 8.4 [Clinic Matching & Test Recommendation](#84-clinic-matching--test-recommendation)
   - 8.5 [Diagnostic Lab Portal](#85-diagnostic-lab-portal)
   - 8.6 [Diagnosis & Digital Prescription](#86-diagnosis--digital-prescription)
   - 8.7 [Telemedicine](#87-telemedicine)
   - 8.8 [AI Chat Doctor (24/7)](#88-ai-chat-doctor-247)
   - 8.9 [Mental Health AI Module](#89-mental-health-ai-module)
   - 8.10 [Emergency Alert System](#810-emergency-alert-system)
   - 8.11 [Family Health Management](#811-family-health-management)
   - 8.12 [Pharmacy Integration](#812-pharmacy-integration)
   - 8.13 [Medicine Reminders](#813-medicine-reminders)
   - 8.14 [Service Packages & Payments](#814-service-packages--payments)
   - 8.15 [Admin Super Dashboard (Full Dynamic CMS)](#815-admin-super-dashboard-full-dynamic-cms)
   - 8.16 [AI API Management Panel](#816-ai-api-management-panel)
   - 8.17 [Support Panel](#817-support-panel)
9. [UI/UX Design Specification](#9-uiux-design-specification)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Security & Compliance](#11-security--compliance)
12. [API & Integration Requirements](#12-api--integration-requirements)
13. [Growth Roadmap](#13-growth-roadmap)
14. [Success Metrics (KPIs)](#14-success-metrics-kpis)
15. [Out of Scope (v1.0)](#15-out-of-scope-v10)
16. [Open Questions](#16-open-questions)

---

## 1. Executive Summary

**Iasis AI** (*Iasis* = Healing + *AI* = Intelligence) is an AI-powered national digital healthcare platform for Bangladesh targeting 170M+ citizens with limited access to quality healthcare.

The platform provides a **One Citizen — One Medical Profile** model: a lifelong unified health identity linked via secure registration (email/phone OTP), accessible via mobile app, web browser, hospital/clinic portals, and third-party APIs.

### Core Value Propositions

| For Citizens | For Doctors | For Clinics/Labs | For Government |
|---|---|---|---|
| Instant AI health guidance 24/7 | Full patient history at one glance | Automated test booking & billing | National health data & analytics |
| Telemedicine from home | AI-assisted diagnosis support | AI-powered report analysis | Fraud detection & audit trail |
| Unified digital health record | Digital prescription issuance | Geolocation-based patient matching | Population-level disease insight |

### Business Model
- **SaaS tiers** — patients pay per consultation type (AI-only or Doctor-verified)
- **B2B subscriptions** — clinics, labs, hospitals pay for portal access
- **API licensing** — third-party health apps, insurers, pharmacies
- **Government partnership** — national health digitization contract

---

## 2. Product Vision & Goals

### Vision Statement
> *"Every citizen in Bangladesh — regardless of location, income, or literacy — should have instant access to intelligent, trusted, and continuous healthcare."*

### Product Goals

| ID | Goal | Priority |
|---|---|---|
| G-01 | Launch national MVP in Bangladesh with Supabase Auth + email/phone OTP registration | P0 |
| G-02 | Onboard 1M citizens within 12 months of launch | P0 |
| G-03 | Achieve <3 min average AI triage response time | P0 |
| G-04 | Partner with 500+ diagnostic labs and clinics (Phase 1) | P1 |
| G-05 | Achieve 99.9% uptime SLA for emergency features | P0 |
| G-06 | Admin-controlled full CMS for all site content | P0 |
| G-07 | Expand to South Asia in Phase 2 | P2 |

---

## 3. Tech Stack & Infrastructure

### Core Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR/SSG web app, SEO, performance |
| **Deployment** | Vercel | CI/CD, edge functions, global CDN |
| **Database** | Supabase (PostgreSQL) | Primary relational data store |
| **Authentication** | Supabase Auth | Email/phone OTP, OAuth, JWT sessions |
| **File Storage** | Cloudflare R2 | Medical documents, images, lab reports, profile photos |
| **AI APIs** | Admin-configurable (any external LLM/AI) | AI triage, chat doctor, report analysis |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first, design tokens |
| **Icons** | Material Icons (Google) | Consistent icon system across all UI |
| **State** | Zustand / React Query | Client state + server data caching |
| **Real-time** | Supabase Realtime (WebSocket) | Live chat, notifications, telemedicine signaling |
| **Maps** | Google Maps / Mapbox | Clinic geolocation, distance calculation |
| **Payments** | bKash / Nagad / Stripe | Mobile banking, card payments |
| **Push Notifications** | FCM / Supabase Edge Functions | Alerts, reminders |
| **Email/SMS** | Resend / Twilio / SSL Wireless | OTP, notifications, alerts |

---

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  │
│  │ Next.js    │  │ Next.js    │  │ Hospital   │  │ 3rd    │  │
│  │ Web App    │  │ Mobile PWA │  │ Portal     │  │ Party  │  │
│  │ (Desktop)  │  │(Icon-UI)   │  │            │  │ API    │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │  HTTPS / REST / WebSocket
┌──────────────────────────▼───────────────────────────────────┐
│                     NEXT.JS API ROUTES                        │
│              (Auth middleware, Rate Limit, Routing)           │
└───────┬────────────┬────────────┬────────────┬───────────────┘
        │            │            │            │
  ┌─────▼──┐  ┌──────▼───┐ ┌─────▼──┐  ┌─────▼──┐
  │Supabase│  │Supabase  │ │AI API  │  │Cloudfl.│
  │  Auth  │  │Postgres  │ │Layer   │  │  R2    │
  │ (JWT)  │  │(RLS)     │ │(Admin  │  │Storage │
  └────────┘  └──────────┘ │Configu-│  └────────┘
                            │rable)  │
                            └────────┘
```

---

### Supabase Database Schema Overview

```sql
-- Core Tables
users                  -- Supabase Auth users (id, email, phone, role, created_at)
profiles               -- Extended user data (user_id, full_name, dob, gender, blood_group, patient_id)
health_records         -- Chronic conditions, allergies, medications per user
family_members         -- Dependent profiles linked to primary user
triage_sessions        -- AI triage history (user_id, symptoms, result, urgency, ai_model_used)
prescriptions          -- Digital prescriptions (doctor_id, patient_id, medicines[], qr_code, signed_at)
lab_reports            -- Report metadata (clinic_id, patient_id, r2_file_url, ai_analysis, uploaded_at)
appointments           -- Bookings (patient_id, doctor_id, clinic_id, slot, status)
telemedicine_sessions  -- Video call sessions (room_id, participants[], recording_url)
medicine_reminders     -- Reminder schedules (user_id, medicine, dose, times[], active)
payments               -- Transactions (user_id, amount, method, service_type, status)
support_tickets        -- Issue tickets (user_id, category, status, messages[])
clinics                -- Clinic directory (name, location, services[], pricing, rating)
doctors                -- Doctor registry (name, specialty, bmdc_id, verified, availability)

-- Admin CMS Tables
site_config            -- Dynamic site settings (key, value, updated_by, updated_at)
nav_items              -- Navbar links (label, href, icon, order, visible, role_visibility[])
footer_config          -- Footer sections, links, social media
ai_api_configs         -- AI API settings (name, endpoint, api_key_encrypted, model, active, guidelines)
feature_flags          -- Enable/disable features per role
```

---

### Cloudflare R2 Storage Structure

```
r2-bucket/
├── profile-photos/
│   └── {user_id}/avatar.webp
├── lab-reports/
│   └── {clinic_id}/{patient_id}/{report_id}.pdf
├── medical-documents/
│   └── {user_id}/{doc_id}.{ext}
├── prescriptions/
│   └── {prescription_id}/signed.pdf
├── site-assets/
│   ├── logo.svg
│   ├── favicon.ico
│   └── banners/
```

**R2 Access Pattern:**
- All uploads go through Next.js API route → signed URL generation → direct client upload to R2
- All reads via Cloudflare R2 public/signed URLs (never expose keys to client)
- Sensitive files (prescriptions, lab reports) use short-lived signed URLs (15 min TTL)
- Site assets (logo, favicon) use public bucket with CDN caching

---

## 4. Design System & Branding

### Brand Identity
- **Name:** Iasis AI
- **Tagline:** *National Intelligent Healthcare Ecosystem*
- **Tone:** Trustworthy, Clinical, Accessible, Modern
- **Logo & Favicon:** Admin-uploadable via Dashboard → Site Settings → Branding

### Color Palette

| Role | Name | HEX | RGB | Usage |
|---|---|---|---|---|
| **Primary Text / Dark** | Deep Navy | `#122056` | 18/32/86 | Page text, headings, dark backgrounds |
| **Accent / Interactive** | Royal Violet | `#5B65DC` | 91/101/220 | Primary buttons, links, active states |
| **Secondary Interactive** | Soft Periwinkle | `#EEEFFD` | 238/239/253 | Ghost buttons, hover states |
| **Page Background** | Ghost White | `#FAFAFD` | 250/250/253 | Page background, section fills |
| **Card / Menu White** | Pure White | `#FFFFFF` | 255/255/255 | Navbar, cards, modals |
| **Emergency Red** | Alert Red | `#DC3545` | — | Emergency-only components |
| **Success Green** | Confirm Green | `#198754` | — | Confirmed/completed states |
| **Warning Amber** | Caution Amber | `#FFC107` | — | Moderate urgency indicators |

### Typography
- **Display / Headings:** Sora (Google Fonts) — strong, clinical, modern
- **Body:** DM Sans — readable, neutral at 16px base
- **Monospace (IDs/lab values):** JetBrains Mono
- **Bengali support:** Hind Siliguri (Google Fonts) — full Unicode Bengali script

### Material Icons Usage
All icons use **Google Material Icons** (Material Symbols Outlined), loaded via:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
```

| Context | Icon Name | Usage |
|---|---|---|
| Home / Dashboard | `home` | Main nav |
| AI Chat | `smart_toy` | AI doctor |
| Triage | `medical_information` | Symptom checker |
| Profile | `account_circle` | User profile |
| Family | `group` | Family management |
| Prescriptions | `description` | Prescription list |
| Lab Reports | `biotech` | Lab results |
| Pharmacy | `local_pharmacy` | Pharmacy |
| Reminders | `alarm` | Medicine reminders |
| Telemedicine | `video_call` | Video consult |
| Emergency | `emergency` | Emergency alert |
| Settings | `settings` | Settings |
| Notifications | `notifications` | Alerts |
| Search | `search` | Search |
| Clinic | `local_hospital` | Clinic finder |
| Mental Health | `psychology` | Mental health |
| Admin | `admin_panel_settings` | Admin panel |
| Analytics | `bar_chart` | Dashboard stats |
| API | `api` | API management |
| Upload | `upload_file` | File upload |
| Download | `download` | Download |
| QR Code | `qr_code` | Prescription QR |
| Logout | `logout` | Sign out |
| Menu | `menu` | Mobile hamburger |
| Close | `close` | Dismiss |
| Add | `add_circle` | Add new item |
| Edit | `edit` | Edit action |
| Delete | `delete` | Remove item |
| Verified | `verified` | Doctor badge |

### Spacing & Grid
- 8px base unit
- Desktop: 12-column grid, 1280px max-width container
- Mobile: 4-column grid, 16px horizontal padding
- Card border-radius: 12px (standard), 20px (hero cards)

---

## 5. User Personas

### P-1: Rina, 34 — Rural Citizen (Primary)
- Lives in Sylhet, limited clinic access
- Uses Android smartphone, moderate digital literacy
- Needs: Bengali language, voice input, affordable AI triage
- Pain points: Travel cost to doctor, long queues, no medical records

### P-2: Dr. Arif, 42 — Specialist Physician
- Works at a Dhaka private hospital
- Needs: Fast patient history lookup, digital prescription, telemedicine
- Pain points: Patients arrive without records, prescription forgery

### P-3: Sakina, 28 — Lab Technician
- Manages test bookings and report uploads at a diagnostic center
- Needs: Easy patient ID lookup, bulk report upload, billing integration

### P-4: Karim, 55 — Family Account Holder
- Urban, manages health of wife, children, and elderly parents
- Needs: Multi-profile family management, medicine reminders, emergency contact

### P-5: Super Admin — Platform Owner
- Full CMS control, AI API management, analytics, RBAC management
- Needs: Dynamic site control without code deployment, AI model switching

---

## 6. Platform Architecture Overview

### Platform Access Channels

| Channel | Target Users | Key Capability |
|---|---|---|
| **Web App** (Next.js Desktop) | All roles | Full feature access, reports, dashboards |
| **Mobile PWA** (Next.js, icon-based UI) | Citizens, Patients | Voice triage, notifications, emergency alert |
| **Hospital/Clinic Portal** | Doctors, Labs | Patient lookup, report upload, billing |
| **Admin Dashboard** | Super Admin, OPS | Full CMS, AI API config, analytics |

---

## 7. User Roles & Permissions

### Role Hierarchy (6-tier RBAC)

| Tier | Role | Access Level |
|---|---|---|
| 1 | **Patient** | Own profile only |
| 2 | **Doctor** | Assigned patient records, prescription tools |
| 3 | **Diagnostic Clinic** | Test booking, lab report upload, billing |
| 4 | **Support Agent** | Read-only patient data for ticket resolution |
| 5 | **OPS Manager** | User management, analytics, incident management |
| 6 | **Super Admin** | Full system access, AI model control, site CMS, audit logs |

### Permission Matrix

| Feature | Patient | Doctor | Clinic | Support | OPS | Super Admin |
|---|---|---|---|---|---|---|
| View own health profile | ✅ | — | — | — | — | ✅ |
| View assigned patient records | — | ✅ | — | — | — | ✅ |
| Issue digital prescription | — | ✅ | — | — | — | ✅ |
| Upload lab reports | — | — | ✅ | — | — | ✅ |
| Access AI API settings | — | — | — | — | — | ✅ |
| Manage site CMS (navbar/footer/logo) | — | — | — | — | — | ✅ |
| View system audit logs | — | — | — | — | ✅ | ✅ |
| Manage user accounts | — | — | — | — | ✅ | ✅ |
| Handle support tickets | — | — | — | ✅ | ✅ | ✅ |

---

## 8. Feature Requirements

### 8.1 Authentication (Supabase Auth)

**Goal:** Secure, fast registration and login without NID dependency. Identity by email + phone + OTP.

#### Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| REG-01 | Citizen registers with: full name, phone number, and email | P0 |
| REG-02 | OTP sent to phone via SMS; email verification link sent simultaneously | P0 |
| REG-03 | Both phone OTP and email must be verified before account activation | P0 |
| REG-04 | Supabase Auth handles session management, JWT refresh, and token rotation | P0 |
| REG-05 | Optional: Google/Apple OAuth social login via Supabase OAuth providers | P1 |
| REG-06 | Unique Patient ID (12-character alphanumeric) generated on successful registration | P0 |
| REG-07 | Account recovery via registered phone OTP or email magic link | P0 |
| REG-08 | Support registration UI in Bengali and English | P0 |
| REG-09 | Failed login lockout after 5 attempts (Supabase rate limiting) | P0 |
| REG-10 | Supabase Row-Level Security (RLS) enforces data access at DB layer | P0 |

#### Auth Flow
```
Land on App / Web
    → Enter Full Name + Phone + Email
    → SMS OTP to Phone (Twilio/SSL Wireless via Supabase)
    → Email Verification Link (Resend/SendGrid via Supabase)
    → Both verified → Account Created
    → Redirect to Health Profile Setup
```

#### Supabase Auth Configuration
```typescript
// supabase/config.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Phone OTP sign-in
await supabase.auth.signInWithOtp({ phone: '+8801XXXXXXXXX' });

// Email magic link
await supabase.auth.signInWithOtp({ email: 'user@example.com' });

// OAuth (Google)
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

---

### 8.2 Health Profile Setup

**Goal:** Capture complete baseline health data at onboarding.

| ID | Requirement | Priority |
|---|---|---|
| HP-01 | Collect: full name, DOB, gender, blood group, height, weight | P0 |
| HP-02 | Capture chronic conditions (diabetes, hypertension, asthma, etc.) via searchable checklist | P0 |
| HP-03 | Capture known allergies (food, drug, environmental) | P0 |
| HP-04 | Capture current medications with dosage | P0 |
| HP-05 | Add up to 5 emergency contacts with phone numbers and relationship labels | P0 |
| HP-06 | Upload existing medical documents (PDFs, images) → stored in Cloudflare R2 | P1 |
| HP-07 | Profile completeness indicator (%) to encourage full data entry | P1 |
| HP-08 | Profile editable any time; all edits versioned and timestamped in Supabase | P0 |
| HP-09 | Profile photo upload → Cloudflare R2 → displayed in navbar and profile | P1 |

---

### 8.3 AI Triage & Symptom Analysis

**Goal:** Provide instant, voice-driven AI health assessment using admin-configured AI API.

| ID | Requirement | Priority |
|---|---|---|
| AT-01 | Voice input via microphone; Web Speech API (Bengali + English) | P0 |
| AT-02 | Medical NLP refines raw speech into structured symptom list | P0 |
| AT-03 | AI cross-references symptoms with patient's age, gender, chronic conditions | P0 |
| AT-04 | Output: possible conditions ranked by probability with brief explanations | P0 |
| AT-05 | Output: urgency classification — `LOW`, `MODERATE`, `HIGH`, `EMERGENCY` | P0 |
| AT-06 | EMERGENCY cases auto-trigger Emergency Alert System | P0 |
| AT-07 | Full triage session stored in patient's health timeline in Supabase | P0 |
| AT-08 | Disclaimer shown: "This is AI guidance, not a medical diagnosis" | P0 |
| AT-09 | AI model used is pulled from active AI API config set by admin | P0 |

#### AI API Call Structure for Triage
```typescript
// Called via Next.js API route /api/ai/triage
// Uses AI model configured by admin in dashboard

const payload = {
  model: adminConfig.model,           // e.g. "gemini-1.5-pro", "gpt-4o", "llama-3"
  system_prompt: adminConfig.triage_system_prompt,
  messages: [
    {
      role: "user",
      content: `
        Patient Profile:
        - Age: ${patient.age}, Gender: ${patient.gender}
        - Blood Group: ${patient.blood_group}
        - Chronic Conditions: ${patient.conditions.join(', ')}
        - Known Allergies: ${patient.allergies.join(', ')}
        - Current Medications: ${patient.medications.join(', ')}

        Reported Symptoms: "${userSymptomText}"

        Respond in JSON format:
        {
          "possible_conditions": [{ "name": string, "probability": number, "explanation": string }],
          "urgency": "LOW" | "MODERATE" | "HIGH" | "EMERGENCY",
          "recommended_tests": [string],
          "recommended_action": string,
          "disclaimer": string
        }
      `
    }
  ]
};
```

---

### 8.4 Clinic Matching & Test Recommendation

| ID | Requirement | Priority |
|---|---|---|
| CM-01 | AI recommends diagnostic tests based on triage output | P0 |
| CM-02 | Geolocation-based clinic matching within configurable radius (default: 10 km) | P0 |
| CM-03 | Filter clinics by: test availability, price range, operating hours, rating | P1 |
| CM-04 | Display clinic profile: name, address, map pin, services, pricing, rating | P0 |
| CM-05 | Patient can book appointment directly from the recommendation screen | P0 |
| CM-06 | Booking confirmation sent via SMS + in-app notification | P0 |
| CM-07 | Distance shown in km with estimated travel time | P1 |

---

### 8.5 Diagnostic Lab Portal

| ID | Requirement | Priority |
|---|---|---|
| DL-01 | Clinic searches patient by Patient ID to verify identity | P0 |
| DL-02 | Clinic uploads lab reports: PDF, JPG, PNG → stored in Cloudflare R2 | P0 |
| DL-03 | R2 signed URL generated server-side, never exposed to client | P0 |
| DL-04 | AI analyzes uploaded report for abnormal values using admin-configured AI API | P0 |
| DL-05 | Report automatically synced to patient's dashboard after upload | P0 |
| DL-06 | Patient receives real-time notification via Supabase Realtime | P0 |
| DL-07 | Reports are immutable after submission | P0 |

#### R2 Upload Flow
```
Clinic selects file
    → POST /api/storage/upload-url (Next.js API)
    → Server generates signed R2 PUT URL (15 min TTL)
    → Client uploads directly to R2
    → Server confirms upload, saves metadata to Supabase
    → Supabase triggers notification to patient
```

---

### 8.6 Diagnosis & Digital Prescription

| ID | Requirement | Priority |
|---|---|---|
| DP-01 | Doctor views full patient profile: history, triage results, lab reports | P0 |
| DP-02 | Doctor can accept, modify, or override AI-suggested diagnosis | P0 |
| DP-03 | Doctor creates structured digital prescription (medicines, dosage, frequency, duration) | P0 |
| DP-04 | Prescription signed with doctor's verified credentials | P0 |
| DP-05 | Prescription PDF generated and stored in Cloudflare R2 | P0 |
| DP-06 | Unique QR code generated per prescription for pharmacy verification | P0 |
| DP-07 | Prescription immutable after signing (Supabase RLS write-protection) | P0 |
| DP-08 | Prescription downloadable by patient as PDF from R2 signed URL | P1 |

---

### 8.7 Telemedicine

| ID | Requirement | Priority |
|---|---|---|
| TM-01 | Video call consultation (WebRTC via Daily.co / Jitsi / 100ms) | P0 |
| TM-02 | Audio-only fallback for low bandwidth | P0 |
| TM-03 | Patient books slot from doctor availability calendar | P0 |
| TM-04 | In-call: doctor can view records, write prescription during session | P0 |
| TM-05 | Consultation fee collected via bKash/Nagad/Stripe before session | P0 |
| TM-06 | Session recorded (with patient consent), stored in R2 | P1 |

---

### 8.8 AI Chat Doctor (24/7)

**Goal:** Always-on conversational AI using admin-configured external AI API.

| ID | Requirement | Priority |
|---|---|---|
| AC-01 | Chat interface with streaming responses | P0 |
| AC-02 | AI model and system prompt configurable by admin in dashboard | P0 |
| AC-03 | Patient health context automatically injected into AI system prompt | P0 |
| AC-04 | Conversation history stored per user in Supabase | P0 |
| AC-05 | Escalation path: AI recommends "See a Doctor" when needed | P0 |
| AC-06 | Medical disclaimer shown before first message of each session | P0 |
| AC-07 | Bengali and English language support | P0 |

#### AI Chat API Call Structure
```typescript
// POST /api/ai/chat
const payload = {
  model: adminConfig.chat_model,      // Set by admin
  stream: true,
  system: `
    ${adminConfig.chat_system_prompt}

    Patient Context:
    - Name: ${patient.name}
    - Age: ${patient.age}, Gender: ${patient.gender}
    - Blood Group: ${patient.blood_group}
    - Chronic Conditions: ${patient.conditions.join(', ')}
    - Known Allergies: ${patient.allergies.join(', ')}
    - Recent Triage: ${recentTriage?.summary || 'None'}

    Always end responses with: "This is AI guidance only. Consult a licensed doctor for medical decisions."
    Respond in the user's language (Bengali or English).
  `,
  messages: conversationHistory,      // Full chat history from Supabase
};

// Stream response back to client via SSE / ReadableStream
```

---

### 8.9 Mental Health AI Module

| ID | Requirement | Priority |
|---|---|---|
| MH-01 | PHQ-9 depression screening and GAD-7 anxiety scoring | P0 |
| MH-02 | Mood tracking with daily check-in (emoji-based for accessibility) | P0 |
| MH-03 | AI-powered mental health chat using admin-configured model + specialized system prompt | P0 |
| MH-04 | Mental health data stored in separate encrypted Supabase schema | P0 |
| MH-05 | Crisis detection: keywords trigger emergency contact notification | P0 |
| MH-06 | Resource links: helplines, breathing exercises, guided meditation | P0 |

---

### 8.10 Emergency Alert System

| ID | Requirement | Priority |
|---|---|---|
| EA-01 | Prominent SOS button always visible in mobile UI (bottom bar) | P0 |
| EA-02 | One-press activation → 30-second cancel window | P0 |
| EA-03 | Auto-notify all emergency contacts via SMS + in-app push | P0 |
| EA-04 | Location auto-shared with emergency contacts | P0 |
| EA-05 | Patient health summary (blood group, allergies, conditions) auto-sent | P0 |
| EA-06 | Emergency alert log stored with timestamp in patient profile | P0 |

---

### 8.11 Family Health Management

| ID | Requirement | Priority |
|---|---|---|
| FM-01 | Primary account holder can add up to 6 dependent profiles | P0 |
| FM-02 | Children (no separate account), elderly parents, spouse | P0 |
| FM-03 | Each dependent has own health profile, timeline, and prescriptions in Supabase | P0 |
| FM-04 | Medicine reminders configurable per dependent | P0 |
| FM-05 | Adult dependents (18+) can request independent profile control | P1 |

---

### 8.12 Pharmacy Integration

| ID | Requirement | Priority |
|---|---|---|
| PH-01 | Pharmacy verifies prescription via QR code scan | P0 |
| PH-02 | Patient can order medicines directly from prescription screen | P1 |
| PH-03 | Delivery tracking in-app | P1 |
| PH-04 | Generic medicine alternatives with price comparison | P1 |
| PH-05 | Expired/cancelled prescriptions rejected at fulfillment | P0 |
| PH-06 | Dispensation logged — prescription marked "filled" | P0 |

---

### 8.13 Medicine Reminders

| ID | Requirement | Priority |
|---|---|---|
| MR-01 | Set reminders: name, dose, frequency, start/end date | P0 |
| MR-02 | Push notification + alarm at scheduled time | P0 |
| MR-03 | Auto-populated from digital prescriptions | P1 |
| MR-04 | Mark dose as taken/skipped — adherence log | P1 |
| MR-05 | Manageable per family member | P0 |
| MR-06 | Persistent notification until dismissed | P0 |

---

### 8.14 Service Packages & Payments

| Package | Name | Target | Included |
|---|---|---|---|
| **Free** | Basic Access | All citizens | Profile, AI Chat (5/mo), reminders, emergency alert |
| **AI Plan** | AI Analysis | Everyday users | Full AI triage, AI report analysis, clinic matching |
| **Doctor Plan** | Verified Diagnosis | High-accuracy care | Doctor review, diagnosis, prescription, telemedicine |

| ID | Requirement | Priority |
|---|---|---|
| PAY-01 | bKash, Nagad, Rocket, VISA/Mastercard | P0 |
| PAY-02 | Per-consultation payment model | P0 |
| PAY-03 | Monthly subscription model | P1 |
| PAY-04 | Invoice/receipt per transaction stored in Supabase | P0 |
| PAY-05 | Refund if doctor doesn't respond within 2 hours | P1 |

---

### 8.15 Admin Super Dashboard (Full Dynamic CMS)

**Goal:** Admin can control every visual and functional aspect of the platform without code changes. Zero-deployment CMS.

#### Site Branding Control

| Feature | Description | Storage |
|---|---|---|
| Logo Upload | Replace site logo (SVG/PNG, max 200KB) | Cloudflare R2 → `site-assets/logo.svg` |
| Favicon Upload | Replace favicon (ICO/PNG 32×32) | Cloudflare R2 → `site-assets/favicon.ico` |
| Brand Colors | Edit primary/accent/bg HEX values | Supabase `site_config` table |
| Site Name | Edit platform display name | Supabase `site_config` table |
| Tagline | Edit hero tagline text | Supabase `site_config` table |

#### Navbar Control

| Feature | Description |
|---|---|
| Add Nav Link | Label + URL + Material Icon name + order index |
| Remove Nav Link | Soft-delete (hidden, not deleted) |
| Reorder Links | Drag-and-drop order in admin panel |
| Role Visibility | Set which nav items are visible to which user roles |
| Mobile Nav | Configure bottom tab bar icons and labels (mobile icon-based UI) |

**Navbar DB Schema:**
```sql
CREATE TABLE nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  label_bn TEXT,               -- Bengali label
  href TEXT NOT NULL,
  icon TEXT NOT NULL,          -- Material Icon name (e.g. "home", "smart_toy")
  order_index INT NOT NULL,
  visible BOOLEAN DEFAULT TRUE,
  role_visibility TEXT[] DEFAULT ARRAY['all'],  -- ['patient', 'doctor', 'admin']
  is_mobile_tab BOOLEAN DEFAULT FALSE,          -- Show in mobile bottom tab bar
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Footer Control

| Feature | Description |
|---|---|
| Footer Sections | Add/remove/reorder footer column sections |
| Footer Links | Add links per section with labels |
| Social Media | Facebook, Twitter/X, LinkedIn, YouTube URLs |
| Copyright Text | Editable copyright notice |
| Footer Logo | Same as site logo or separate footer variant |

**Footer DB Schema:**
```sql
CREATE TABLE footer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT,
  section_title_bn TEXT,
  links JSONB DEFAULT '[]',    -- [{ label, href, icon? }]
  order_index INT,
  visible BOOLEAN DEFAULT TRUE
);

CREATE TABLE site_social_links (
  platform TEXT PRIMARY KEY,   -- 'facebook', 'twitter', 'linkedin', 'youtube'
  url TEXT,
  visible BOOLEAN DEFAULT TRUE
);
```

#### Full Dynamic Site Config

```sql
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  value_type TEXT DEFAULT 'string',  -- 'string', 'json', 'boolean', 'color', 'url'
  label TEXT,                        -- Admin UI label
  category TEXT,                     -- 'branding', 'features', 'content', 'limits'
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example rows:
-- key: 'site_name',        value: 'Iasis AI'
-- key: 'tagline',          value: 'National Intelligent Healthcare Ecosystem'
-- key: 'primary_color',    value: '#5B65DC'
-- key: 'logo_url',         value: 'https://r2.iasis.ai/site-assets/logo.svg'
-- key: 'favicon_url',      value: 'https://r2.iasis.ai/site-assets/favicon.ico'
-- key: 'ai_chat_free_limit', value: '5'
-- key: 'maintenance_mode', value: 'false'
-- key: 'default_language', value: 'en'
```

#### User Management

| Feature | Description |
|---|---|
| Search Users | By name, email, phone, Patient ID |
| View Profile | Full profile view (read-only for support) |
| Suspend Account | Temporary ban with reason |
| Delete Account | Permanent deletion with audit log |
| Change Role | Promote/demote user roles |
| Verify Doctor | Approve doctor accounts, assign BMDC verification |

#### Analytics Dashboard

| Widget | Metric |
|---|---|
| Daily Active Users | Line chart — 7d / 30d / 90d |
| New Registrations | Bar chart — daily breakdown |
| AI Triage Volume | Total sessions, urgency breakdown |
| Consultation Revenue | MRR, daily revenue, payment method split |
| Top Clinics | By booking volume and revenue |
| Feature Usage | Which features used most |
| Error Rate | API error monitoring |

---

### 8.16 AI API Management Panel

**Goal:** Admin can add, configure, test, and switch between any external AI API provider without code changes.

#### AI API Config Panel Features

| Feature | Description |
|---|---|
| Add AI Provider | Name, API endpoint URL, API key (AES-256 encrypted in Supabase), model name |
| Module Assignment | Assign each provider to a module: Triage, Chat Doctor, Report Analysis, Mental Health |
| System Prompt Editor | Rich text editor for system prompts per module |
| Test AI Connection | Send test prompt and verify response before activating |
| Active/Inactive Toggle | Switch models without deployment |
| API Usage Logs | Token usage, response times, error rates per model |
| Guidelines Panel | Step-by-step guide showing required request format, headers, data structure |

#### AI API Database Schema

```sql
CREATE TABLE ai_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- e.g. "Gemini 1.5 Pro", "Claude 3", "Custom LLM"
  provider TEXT,                         -- e.g. "google", "anthropic", "openai", "custom"
  endpoint_url TEXT NOT NULL,            -- Full API endpoint
  api_key_encrypted TEXT NOT NULL,       -- AES-256 encrypted, never returned to client
  model TEXT NOT NULL,                   -- e.g. "gemini-1.5-pro-latest"
  module TEXT NOT NULL,                  -- 'triage', 'chat', 'report_analysis', 'mental_health'
  system_prompt TEXT,                    -- Admin-configurable system prompt
  is_active BOOLEAN DEFAULT FALSE,
  max_tokens INT DEFAULT 2000,
  temperature FLOAT DEFAULT 0.7,
  test_status TEXT,                      -- 'untested', 'passed', 'failed'
  test_response TEXT,                    -- Last test response snippet
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Admin API Integration Guidelines (Shown in Dashboard)

The admin dashboard includes a built-in **Integration Guide** panel with the following per-provider documentation:

---

**📋 How to Add an AI API — Step-by-Step Guide**

**Step 1 — Get API Credentials**
- Visit your AI provider's developer console
- Create an API key with appropriate permissions
- Note the model name(s) available on your plan

**Step 2 — Enter API Details in Dashboard**
```
Provider Name:    [e.g. Google Gemini]
API Endpoint:     [e.g. https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent]
API Key:          [Your secret key — stored encrypted, never shown again]
Model Name:       [e.g. gemini-1.5-pro-latest]
Assign Module:    [Triage / Chat Doctor / Report Analysis / Mental Health]
```

**Step 3 — Write System Prompt**
The system prompt controls how the AI behaves for each module. Guidelines:
- Always include the patient health context placeholders
- Specify response format (JSON for triage, natural language for chat)
- Include medical disclaimer instructions
- Specify language behavior (Bengali/English detection)

**Step 4 — Test the Connection**
Click **"Test Connection"** — the system will send a sample patient query and display the AI response. Verify the response format is correct before activating.

**Step 5 — Activate**
Toggle **"Active"** — this model immediately replaces the previous active model for that module across the entire platform.

---

**📦 Required Request Format by Provider**

| Provider | Auth Header | Request Body Structure |
|---|---|---|
| **OpenAI / GPT** | `Authorization: Bearer {api_key}` | `{ model, messages: [{role, content}], max_tokens }` |
| **Google Gemini** | `?key={api_key}` in URL | `{ contents: [{role, parts: [{text}]}], generationConfig }` |
| **Anthropic Claude** | `x-api-key: {api_key}` + `anthropic-version` | `{ model, max_tokens, system, messages }` |
| **Groq / LLaMA** | `Authorization: Bearer {api_key}` | `{ model, messages, max_tokens, stream }` |
| **Custom / Self-hosted** | Configurable header | Admin defines format in system prompt config |

**📤 Data Sent to AI API per Module**

*Triage Module:*
```json
{
  "patient_age": 34,
  "patient_gender": "female",
  "blood_group": "A+",
  "chronic_conditions": ["diabetes"],
  "allergies": ["penicillin"],
  "current_medications": ["metformin 500mg"],
  "symptoms": "fever for 3 days, headache, body ache",
  "language": "en"
}
```

*Chat Doctor Module:*
```json
{
  "patient_context": { "age": 34, "gender": "female", "conditions": [], "allergies": [] },
  "conversation_history": [
    { "role": "user", "content": "I have a headache" },
    { "role": "assistant", "content": "..." }
  ],
  "current_message": "Should I take paracetamol?"
}
```

*Report Analysis Module:*
```json
{
  "report_text": "CBC Report: WBC 11.5 (H), RBC 4.2, Hemoglobin 12.1 (L)...",
  "report_type": "blood_test",
  "patient_age": 34,
  "patient_gender": "female",
  "known_conditions": ["diabetes"]
}
```

**✅ Expected AI Response Format**

*Triage Response (JSON):*
```json
{
  "possible_conditions": [
    { "name": "Dengue Fever", "probability": 0.72, "explanation": "Fever + body ache pattern" },
    { "name": "Viral Flu", "probability": 0.20, "explanation": "Common in monsoon season" }
  ],
  "urgency": "HIGH",
  "recommended_tests": ["CBC", "Dengue NS1 Antigen", "Dengue IgM/IgG"],
  "recommended_action": "Visit a diagnostic center within 24 hours",
  "disclaimer": "This is AI guidance only. Consult a licensed doctor for diagnosis."
}
```

---

### 8.17 Support Panel

| ID | Requirement | Priority |
|---|---|---|
| SP-01 | Ticket system: submit via web/app | P0 |
| SP-02 | Categories: billing, medical record error, account access, complaint | P0 |
| SP-03 | Live chat (business hours) + AI chatbot (off-hours) | P0 |
| SP-04 | SLA: P1 < 1 hour, P2 < 24 hours, P3 < 72 hours | P1 |
| SP-05 | Account recovery with OTP verification | P0 |
| SP-06 | Support agent access restricted to ticket data only | P0 |

---

## 9. UI/UX Design Specification

### Design Philosophy

Iasis AI follows a **Clinical Modern** design language: clean, trustworthy, accessible, with premium touches. Not sterile — warm and human. Every element should communicate safety and intelligence.

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile (primary) | 320–767px | Icon-based bottom nav, card stack layout |
| Tablet | 768–1023px | Hybrid layout, collapsible sidebar |
| Desktop (primary) | 1024px+ | Full sidebar, data-dense dashboards |

### Desktop Layout

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Search | Nav Links | Notifications | Avatar │
├──────────┬───────────────────────────────────────────┤
│          │                                            │
│ SIDEBAR  │           MAIN CONTENT AREA               │
│ (240px)  │           (fills remaining width)         │
│          │                                            │
│ - Home   │                                            │
│ - Triage │                                            │
│ - Chat   │                                            │
│ - Labs   │                                            │
│ - Family │                                            │
│ - Rx     │                                            │
│ - ...    │                                            │
│          │                                            │
├──────────┴───────────────────────────────────────────┤
│  FOOTER: Logo | Links | Social | Copyright            │
└──────────────────────────────────────────────────────┘
```

### Mobile Layout (Icon-Based, like Facebook App)

```
┌─────────────────────┐
│ STATUS BAR           │
├─────────────────────┤
│ TOP BAR: Logo  🔔 👤 │
├─────────────────────┤
│                      │
│   MAIN CONTENT       │
│   (Full screen,      │
│    scrollable)       │
│                      │
│                      │
│                      │
├─────────────────────┤
│ BOTTOM TAB BAR:      │
│ 🏠  🩺  💬  👨‍👩‍👧  ⚙️  │
│Home Triage Chat Fam  │
└─────────────────────┘
```

**Mobile Bottom Tab Bar (configurable by admin):**
- Each tab shows Material Icon + label (admin can change icon, label, order, visibility)
- Active tab highlighted with `#5B65DC` color
- Emergency SOS button always visible as a floating action button (FAB) in red

### Key UI Components

**Card Component:**
- White background `#FFFFFF`, border-radius 12px
- Subtle shadow: `0 2px 8px rgba(18,32,86,0.08)`
- Left accent bar in `#5B65DC` for active/important cards
- Hover state: slight elevation increase

**Primary Button:**
- Background: `#5B65DC`, text: `#FFFFFF`
- Border-radius: 8px, padding: 12px 24px
- Icon + label (Material Icon left of text)
- Loading state: spinner animation

**Input Fields:**
- Background: `#FFFFFF`, border: 1px solid `#EEEFFD`
- Focus border: `#5B65DC`
- Error state: `#DC3545` border + helper text

**Urgency Badges:**
- LOW: `#198754` (green pill badge)
- MODERATE: `#FFC107` (amber)
- HIGH: `#FD7E14` (orange)
- EMERGENCY: `#DC3545` (red, pulsing animation)

### Accessibility
- WCAG 2.1 AA minimum contrast ratios enforced
- All interactive elements have `aria-label`
- Minimum tap target: 44×44px (mobile)
- Font size: 16px body (never below 14px)
- Bengali language toggle available on all pages
- Screen reader support (semantic HTML, ARIA roles)

---

## 10. Non-Functional Requirements

### Performance

| Metric | Target |
|---|---|
| API response time (p95) | < 500ms |
| AI triage response | < 3 seconds (streaming reduces perceived latency) |
| Page load (Next.js SSR) | < 1.5 seconds on 4G |
| Telemedicine call latency | < 150ms |
| Uptime SLA | 99.9% (emergency: 99.99%) |
| Cold start (Vercel Edge) | < 200ms |

### Scalability

| Metric | Target |
|---|---|
| Concurrent users (Phase 1) | 500,000 |
| Concurrent users (Phase 2) | 5,000,000 |
| Supabase connection pooling | PgBouncer enabled |
| R2 storage | Horizontally scalable (no hard limit) |

### Offline Capability (PWA)
- View cached health profile offline
- Medicine reminders fire offline (Service Worker)
- Emergency alert attempts on degraded connection

---

## 11. Security & Compliance

### Authentication Security

| Requirement | Implementation |
|---|---|
| JWT Sessions | Supabase Auth, 1-hour access token, 7-day refresh |
| Row-Level Security | All Supabase tables protected by RLS policies |
| API Key Encryption | AI API keys encrypted with AES-256 before storing |
| R2 Access | Signed URLs only (no public read on sensitive files) |
| Session Timeout | Auto-logout after 15 minutes inactivity |

### Data Protection

| Requirement | Detail |
|---|---|
| Encryption in Transit | TLS 1.3 for all API communication (Vercel/Cloudflare enforced) |
| Encryption at Rest | Supabase AES-256 for all stored health data |
| Mental Health Data | Separate encrypted Supabase schema, restricted RLS |
| AI API Keys | Never stored in plaintext, never returned to client |
| Prescription Data | Immutable after digital signature (RLS write-block) |

### Audit Logging

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,        -- 'create', 'read', 'update', 'delete', 'login'
  resource TEXT NOT NULL,      -- 'prescription', 'lab_report', 'profile', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. API & Integration Requirements

### Internal API Routes (Next.js)

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/api/auth/otp` | POST | Send phone/email OTP | Public |
| `/api/profile` | GET/PUT | Get/update health profile | Patient JWT |
| `/api/ai/triage` | POST | Run AI triage (uses admin config) | Patient JWT |
| `/api/ai/chat` | POST | AI chat doctor (streaming) | Patient JWT |
| `/api/storage/upload-url` | POST | Get R2 signed upload URL | Auth JWT |
| `/api/storage/download-url` | POST | Get R2 signed download URL | Auth JWT |
| `/api/admin/site-config` | GET/PUT | Read/update site settings | Admin JWT |
| `/api/admin/nav-items` | GET/PUT | Manage navbar config | Admin JWT |
| `/api/admin/ai-config` | GET/POST/PUT | Manage AI API configs | Admin JWT |
| `/api/admin/analytics` | GET | Platform analytics data | Admin/OPS JWT |

### Public API (Third-Party Partners)

| Endpoint | Purpose |
|---|---|
| `GET /v1/patient/summary` | Authorized 3rd party retrieves patient summary |
| `GET /v1/prescription/{id}` | Pharmacy verifies prescription authenticity |
| `POST /v1/report/upload` | External lab pushes report |
| `GET /v1/clinic/availability` | Aggregator checks clinic slot availability |

### External Service Integrations

| Integration | Purpose | Priority |
|---|---|---|
| **Supabase Auth** | Authentication, JWT, OTP | P0 |
| **Cloudflare R2** | All file storage | P0 |
| **Vercel** | Deployment, edge functions, CDN | P0 |
| **bKash / Nagad** | Mobile payment | P0 |
| **Twilio / SSL Wireless** | SMS OTP, emergency alerts | P0 |
| **Resend / SendGrid** | Email verification, notifications | P0 |
| **Google Maps / Mapbox** | Clinic geolocation | P0 |
| **FCM** | Mobile push notifications | P0 |
| **Daily.co / 100ms** | Telemedicine video calls | P0 |
| **Any LLM API** | AI features (admin-configurable) | P0 |

---

## 13. Growth Roadmap

### Phase 1 — Bangladesh National Launch (Months 1–12)

| Milestone | Target |
|---|---|
| MVP with Supabase Auth + admin CMS | Month 2 |
| AI triage + chat doctor (admin-configurable API) | Month 3 |
| Mobile app on Play Store + App Store (PWA/React Native) | Month 4 |
| Onboard 200 clinics and 100 doctors | Month 6 |
| 500K registered citizens | Month 9 |
| 1M registered citizens | Month 12 |

### Phase 2 — South Asia Expansion (Months 13–24)

| Target | Adaptation |
|---|---|
| Pakistan | Urdu NLP system prompt (admin-configurable), local payments |
| India | Hindi NLP, Aadhaar integration, UPI payments |
| Sri Lanka | Sinhala NLP, local payment gateways |

### Phase 3 — Developing Nations (Months 25–36)
- Offline-first architecture for low-connectivity regions
- Partnerships with WHO, USAID, health NGOs
- HL7 FHIR standard for interoperability

### Phase 4 — Global Ecosystem (Month 37+)
- GDPR compliance for Europe
- API marketplace for global health ecosystem
- AI research data partnerships (anonymized)

---

## 14. Success Metrics (KPIs)

### Growth KPIs

| Metric | Month 3 | Month 12 | Month 24 |
|---|---|---|---|
| Registered Citizens | 50K | 1M | 10M |
| Active Monthly Users | 20K | 400K | 4M |
| Partner Clinics & Labs | 50 | 500 | 2,000 |
| Verified Doctors | 25 | 300 | 2,000 |

### Engagement KPIs

| Metric | Target |
|---|---|
| AI Triage sessions / month | 200K (Month 12) |
| Telemedicine consultations / month | 50K (Month 12) |
| Average session duration | > 5 min |
| Medicine reminder adherence | > 70% |
| App store rating | ≥ 4.5 / 5 |

### Business KPIs

| Metric | Target |
|---|---|
| MRR (Month 12) | BDT 50L+ |
| Clinic partner retention | > 85% annually |
| Admin CMS usage | 100% of content changes without code deployment |

---

## 15. Out of Scope (v1.0)

- ❌ NID (National ID) integration — replaced by email/phone-based Supabase Auth
- ❌ Biometric selfie verification (Phase 2)
- ❌ Inpatient hospital bed management
- ❌ Surgical scheduling
- ❌ Insurance claim processing
- ❌ Wearable device integration
- ❌ AI-generated DICOM radiology reports (Phase 2)
- ❌ Multi-language beyond Bengali/English (Phase 2+)
- ❌ Blockchain health records
- ❌ AR/VR telemedicine
- ❌ Genetic/genomic data management

---

## 16. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| OQ-01 | Which AI API to use for MVP — OpenAI, Gemini, or Claude? (Admin can switch post-launch) | Tech Lead | Pre-dev |
| OQ-02 | BMDC registry — available as a queryable API or manual verification? | Business | Pre-dev |
| OQ-03 | What regulatory requirement exists for AI medical advice disclosure in Bangladesh? | Legal | Pre-dev |
| OQ-04 | Mental health data — separate Supabase project or separate schema? | Security Lead | Pre-dev |
| OQ-05 | Telemedicine legal framework for cross-district teleconsultation? | Legal | Pre-dev |
| OQ-06 | Will DICOM imaging be in Phase 1 MVP or Phase 2? | Product | Sprint planning |
| OQ-07 | Revenue split model for doctor payouts? | Business | Pre-launch |
| OQ-08 | Free tier AI triage limit — how many sessions per month? | Product | Sprint planning |
| OQ-09 | R2 bucket region — Singapore or closest to Bangladesh? | Tech Lead | Pre-dev |

---

## Appendix A — Glossary

| Term | Definition |
|---|---|
| **Patient ID** | Unique 12-character alphanumeric ID generated by Iasis AI on registration |
| **Supabase** | Open-source Firebase alternative using PostgreSQL with built-in auth, realtime, and storage |
| **Cloudflare R2** | S3-compatible object storage by Cloudflare, zero egress fees, ideal for medical files |
| **Vercel** | Next.js hosting platform with edge CDN, serverless functions, automatic CI/CD |
| **RLS** | Row-Level Security — Supabase/PostgreSQL feature that enforces per-row access rules at DB level |
| **BMDC** | Bangladesh Medical and Dental Council — doctor licensing authority |
| **AI Triage** | AI-powered initial assessment of patient symptoms before doctor involvement |
| **Digital Prescription** | Electronically signed prescription issued by licensed doctor on the platform |
| **DICOM** | Digital Imaging and Communications in Medicine |
| **PHQ-9** | Patient Health Questionnaire 9-item depression screening tool |
| **GAD-7** | Generalized Anxiety Disorder 7-item scale |
| **RBAC** | Role-Based Access Control |
| **CMS** | Content Management System — admin control of all site content |
| **Admin CMS** | The Iasis AI admin dashboard allowing zero-code site control |
| **Material Icons** | Google's open-source icon library used as the platform-wide icon system |

---

## Appendix B — Color Quick Reference

```
Primary Dark:   #122056  → Text, headings, dark UI elements
Accent:         #5B65DC  → CTA buttons, links, active states, card accents
Secondary:      #EEEFFD  → Ghost buttons, hover fills, list backgrounds
Background:     #FAFAFD  → Page canvas, section backgrounds
White:          #FFFFFF  → Cards, modals, navbar, input backgrounds
Emergency Red:  #DC3545  → Emergency-only components (pulsing animation)
Success Green:  #198754  → Confirmed/completed states
Warning Amber:  #FFC107  → Moderate urgency indicators
```

---

## Appendix C — Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only, never expose to client

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY= # Server-side only
CLOUDFLARE_R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=       # CDN URL for public assets only

# Payments
BKASH_APP_KEY=
BKASH_APP_SECRET=
NAGAD_MERCHANT_ID=
NAGAD_MERCHANT_KEY=

# SMS / Email
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
RESEND_API_KEY=

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Telemedicine
DAILY_CO_API_KEY=

# AI APIs (encrypted and stored in Supabase, not in env)
# Admin adds these via dashboard — never stored in .env
AI_ENCRYPTION_SECRET=            # Used to encrypt AI API keys before DB storage

# App
NEXT_PUBLIC_APP_URL=
NEXTAUTH_SECRET=
```

---

*Document maintained by Iasis AI Product Team.*
*Version 2.0 — Major revision: Removed NID dependency, migrated to Supabase Auth, added Cloudflare R2 storage, admin-configurable AI APIs, full dynamic CMS, Material Icons design system, and enhanced mobile-first UI/UX.*
*Classification: Internal — Confidential*
