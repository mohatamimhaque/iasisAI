






CREATE TABLE public.ai_api_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    module text NOT NULL,
    api_endpoint text,
    input_mode text DEFAULT 'text'::text NOT NULL,
    timeout_ms integer DEFAULT 30000 NOT NULL,
    system_prompt text,
    is_active boolean DEFAULT false NOT NULL,
    max_tokens integer DEFAULT 2000 NOT NULL,
    temperature numeric(3,2) DEFAULT 0.7 NOT NULL,
    test_status text DEFAULT 'untested'::text NOT NULL,
    test_response text,
    created_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_api_configs_module_check CHECK ((module = ANY (ARRAY['triage'::text, 'chat'::text, 'report_analysis'::text, 'mental_health'::text]))),
    CONSTRAINT ai_api_configs_test_status_check CHECK ((test_status = ANY (ARRAY['untested'::text, 'passed'::text, 'failed'::text])))
);




CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    clinic_id uuid,
    scheduled_at timestamp with time zone NOT NULL,
    reason text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    consultation_type text DEFAULT 'in_person'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT appointments_consultation_type_check CHECK ((consultation_type = ANY (ARRAY['in_person'::text, 'telemedicine'::text]))),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])))
);



CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])))
);



CREATE TABLE public.chat_threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ai_config_id uuid,
    title text DEFAULT 'New conversation'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.clinics (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    address text,
    division text,
    district text,
    city text,
    phone text,
    services text[] DEFAULT '{}'::text[],
    rating numeric(3,2),
    verified boolean DEFAULT false NOT NULL,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.doctors (
    id uuid NOT NULL,
    full_name text NOT NULL,
    specialty text NOT NULL,
    bmdc_id text,
    verified boolean DEFAULT false NOT NULL,
    bio text,
    consultation_fee integer DEFAULT 500 NOT NULL,
    years_experience integer,
    languages text[] DEFAULT ARRAY['en'::text, 'bn'::text],
    available_for_telemedicine boolean DEFAULT true NOT NULL,
    avatar_url text,
    rating numeric(3,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.emergency_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    trigger_source text DEFAULT 'manual'::text NOT NULL,
    location_lat numeric,
    location_lng numeric,
    location_label text,
    notes text,
    contacts_notified jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT emergency_alerts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'resolved'::text, 'cancelled'::text])))
);



CREATE TABLE public.emergency_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    relationship text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.family_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    full_name text NOT NULL,
    relationship text NOT NULL,
    date_of_birth date,
    gender text,
    blood_group text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT family_members_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])))
);



CREATE TABLE public.health_records (
    user_id uuid NOT NULL,
    height_cm integer,
    weight_kg numeric(5,2),
    chronic_conditions text[] DEFAULT '{}'::text[] NOT NULL,
    allergies text[] DEFAULT '{}'::text[] NOT NULL,
    current_medications jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.lab_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    clinic_id uuid,
    report_type text NOT NULL,
    title text NOT NULL,
    file_url text,
    ai_summary text,
    flagged_values jsonb,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.marketing_content (
    key text NOT NULL,
    page text NOT NULL,
    title text,
    body text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.medicine_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    family_member_id uuid,
    medicine_name text NOT NULL,
    dosage text,
    times text[] DEFAULT '{}'::text[] NOT NULL,
    frequency text DEFAULT 'daily'::text NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date,
    active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.medicines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    generic_name text NOT NULL,
    manufacturer text,
    strength text,
    form text DEFAULT 'tablet'::text NOT NULL,
    category text,
    indications text,
    contraindications text,
    side_effects text,
    price_bdt numeric(10,2),
    prescription_required boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.mental_health_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    kind text NOT NULL,
    score integer,
    severity text,
    answers jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mental_health_sessions_kind_check CHECK ((kind = ANY (ARRAY['phq9'::text, 'gad7'::text, 'mood'::text])))
);



CREATE TABLE public.nav_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    label text NOT NULL,
    href text NOT NULL,
    icon text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    role_visibility text[] DEFAULT ARRAY['patient'::text] NOT NULL,
    is_mobile_tab boolean DEFAULT false NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.pharmacies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    license_no text,
    address text NOT NULL,
    district text NOT NULL,
    division text,
    phone text,
    hours text,
    delivery_available boolean DEFAULT false NOT NULL,
    delivery_radius_km integer DEFAULT 5,
    verified boolean DEFAULT false NOT NULL,
    rating numeric(3,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.prescription_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_id uuid NOT NULL,
    medicine_name text NOT NULL,
    dosage text,
    frequency text,
    duration text,
    instructions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    appointment_id uuid,
    diagnosis text,
    notes text,
    status text DEFAULT 'active'::text NOT NULL,
    signed_at timestamp with time zone DEFAULT now() NOT NULL,
    qr_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verification_token text DEFAULT encode(extensions.gen_random_bytes(12), 'hex'::text) NOT NULL,
    CONSTRAINT prescriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'filled'::text, 'cancelled'::text, 'expired'::text])))
);



DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = 'public'::regnamespace) THEN
        CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'clinic', 'admin');
    END IF;
END $$;

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role public.user_role DEFAULT 'patient'::public.user_role NOT NULL,
    full_name text,
    phone text,
    date_of_birth date,
    gender text,
    blood_group text,
    division text,
    district text,
    avatar_url text,
    preferred_language text DEFAULT 'en'::text NOT NULL,
    onboarded boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])))
);



CREATE TABLE public.site_config (
    key text NOT NULL,
    value text,
    value_type text DEFAULT 'string'::text NOT NULL,
    label text,
    category text DEFAULT 'general'::text NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'P2'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_tickets_category_check CHECK ((category = ANY (ARRAY['billing'::text, 'medical_record'::text, 'account_access'::text, 'complaint'::text, 'other'::text]))),
    CONSTRAINT support_tickets_priority_check CHECK ((priority = ANY (ARRAY['P1'::text, 'P2'::text, 'P3'::text]))),
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])))
);



CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount_bdt numeric(10,2) NOT NULL,
    channel text NOT NULL,
    channel_ref text,
    kind text NOT NULL,
    reference_id uuid,
    status text DEFAULT 'paid'::text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_channel_check CHECK ((channel = ANY (ARRAY['bkash'::text, 'nagad'::text, 'rocket'::text, 'card'::text, 'cash'::text]))),
    CONSTRAINT transactions_kind_check CHECK ((kind = ANY (ARRAY['consultation'::text, 'lab_test'::text, 'subscription'::text, 'prescription'::text, 'refund'::text]))),
    CONSTRAINT transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])))
);



CREATE TABLE public.triage_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    family_member_id uuid,
    symptoms text NOT NULL,
    duration text,
    severity text,
    age integer,
    gender text,
    result jsonb,
    urgency text,
    model_used text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT triage_sessions_urgency_check CHECK ((urgency = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text, 'CRITICAL'::text])))
);



INSERT INTO public.ai_api_configs (id, name, provider, model, module, system_prompt, is_active, max_tokens, temperature, test_status, test_response, created_by, updated_at)
VALUES
    ('9ed6048a-3f22-469a-a8b1-bba50cb8bb60', 'OpenAI GPT-5 mini', 'openai', 'openai/gpt-5-mini', 'triage', 'You are a clinical triage assistant for Bangladesh. Be cautious, ranked, and recommend tests + urgency in JSON.', true, 2000, 0.70, 'untested', NULL, NULL, '2026-05-12 06:37:16.971314+00'),
    ('3c51cebf-50ce-4e47-8c46-a4bbe7ec68cc', 'OpenAI GPT-5 mini', 'openai', 'openai/gpt-5-mini', 'chat', 'You are a friendly AI health assistant for Bangladesh. Always end with a medical disclaimer.', true, 2000, 0.70, 'untested', NULL, NULL, '2026-05-12 06:37:16.971314+00'),
    ('5da46f05-3e43-4580-a004-81d08f0f5e19', 'OpenAI GPT-5 mini', 'openai', 'openai/gpt-5-mini', 'report_analysis', 'You analyse lab reports, flag abnormal values, and summarise in plain language.', true, 2000, 0.70, 'untested', NULL, NULL, '2026-05-12 06:37:16.971314+00'),
    ('47239e69-92f0-4da5-a80a-93388815e065', 'OpenAI GPT-5 mini', 'openai', 'openai/gpt-5-mini', 'mental_health', 'You are a compassionate, non-judgemental mental health support assistant. Detect crisis signals and recommend escalation.', true, 2000, 0.70, 'untested', NULL, NULL, '2026-05-12 06:37:16.971314+00');


















































ALTER TABLE ONLY public.ai_api_configs
    ADD CONSTRAINT ai_api_configs_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_pkey PRIMARY KEY (user_id);



ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_pkey PRIMARY KEY (key);



ALTER TABLE ONLY public.medicine_reminders
    ADD CONSTRAINT medicine_reminders_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.mental_health_sessions
    ADD CONSTRAINT mental_health_sessions_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.nav_items
    ADD CONSTRAINT nav_items_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.pharmacies
    ADD CONSTRAINT pharmacies_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.site_config
    ADD CONSTRAINT site_config_pkey PRIMARY KEY (key);



ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.triage_sessions
    ADD CONSTRAINT triage_sessions_pkey PRIMARY KEY (id);



CREATE INDEX appointments_doctor_idx ON public.appointments USING btree (doctor_id, scheduled_at DESC);



CREATE INDEX appointments_patient_idx ON public.appointments USING btree (patient_id, scheduled_at DESC);



CREATE INDEX chat_messages_thread_idx ON public.chat_messages USING btree (thread_id, created_at);



CREATE INDEX chat_threads_user_idx ON public.chat_threads USING btree (user_id, updated_at DESC);



CREATE INDEX clinics_district_idx ON public.clinics USING btree (district);



CREATE INDEX doctors_specialty_idx ON public.doctors USING btree (specialty);



CREATE INDEX emergency_alerts_user_idx ON public.emergency_alerts USING btree (user_id, created_at DESC);



CREATE INDEX emergency_contacts_user_idx ON public.emergency_contacts USING btree (user_id);



CREATE INDEX family_members_owner_idx ON public.family_members USING btree (owner_id);



CREATE INDEX lab_reports_patient_idx ON public.lab_reports USING btree (patient_id, reported_at DESC);



CREATE INDEX marketing_content_page_idx ON public.marketing_content USING btree (page);



CREATE INDEX medicine_reminders_user_idx ON public.medicine_reminders USING btree (user_id, active);



CREATE INDEX medicines_category_idx ON public.medicines USING btree (category);



CREATE INDEX medicines_name_idx ON public.medicines USING gin (to_tsvector('simple'::regconfig, ((name || ' '::text) || COALESCE(generic_name, ''::text))));



CREATE INDEX mental_health_sessions_user_idx ON public.mental_health_sessions USING btree (user_id, created_at DESC);



CREATE INDEX nav_items_role_idx ON public.nav_items USING gin (role_visibility);



CREATE INDEX pharmacies_district_idx ON public.pharmacies USING btree (district);



CREATE INDEX prescription_items_rx_idx ON public.prescription_items USING btree (prescription_id);



CREATE INDEX prescriptions_doctor_idx ON public.prescriptions USING btree (doctor_id, created_at DESC);



CREATE INDEX prescriptions_patient_idx ON public.prescriptions USING btree (patient_id, created_at DESC);



CREATE INDEX prescriptions_token_idx ON public.prescriptions USING btree (verification_token);



CREATE INDEX support_tickets_status_idx ON public.support_tickets USING btree (status);



CREATE INDEX support_tickets_user_idx ON public.support_tickets USING btree (user_id, created_at DESC);



CREATE INDEX transactions_channel_idx ON public.transactions USING btree (channel);



CREATE INDEX transactions_status_idx ON public.transactions USING btree (status);



CREATE INDEX transactions_user_idx ON public.transactions USING btree (user_id, created_at DESC);



CREATE INDEX triage_sessions_user_idx ON public.triage_sessions USING btree (user_id, created_at DESC);



CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER ai_api_configs_updated_at BEFORE UPDATE ON public.ai_api_configs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER chat_threads_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER health_records_updated_at BEFORE UPDATE ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER marketing_content_updated_at BEFORE UPDATE ON public.marketing_content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER medicine_reminders_updated_at BEFORE UPDATE ON public.medicine_reminders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



ALTER TABLE ONLY public.ai_api_configs
    ADD CONSTRAINT ai_api_configs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.chat_threads(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.chat_threads
    ADD CONSTRAINT chat_threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.emergency_alerts
    ADD CONSTRAINT emergency_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.lab_reports
    ADD CONSTRAINT lab_reports_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.medicine_reminders
    ADD CONSTRAINT medicine_reminders_family_member_id_fkey FOREIGN KEY (family_member_id) REFERENCES public.family_members(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.medicine_reminders
    ADD CONSTRAINT medicine_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.mental_health_sessions
    ADD CONSTRAINT mental_health_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.nav_items
    ADD CONSTRAINT nav_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES auth.users(id) ON DELETE RESTRICT;



ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.site_config
    ADD CONSTRAINT site_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.triage_sessions
    ADD CONSTRAINT triage_sessions_family_member_id_fkey FOREIGN KEY (family_member_id) REFERENCES public.family_members(id) ON DELETE SET NULL;



ALTER TABLE ONLY public.triage_sessions
    ADD CONSTRAINT triage_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE public.ai_api_configs ENABLE ROW LEVEL SECURITY;


CREATE POLICY ai_api_configs_admin_all ON public.ai_api_configs USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;


CREATE POLICY appointments_doctor_select ON public.appointments FOR SELECT USING ((auth.uid() = doctor_id));



CREATE POLICY appointments_doctor_write ON public.appointments FOR UPDATE USING ((auth.uid() = doctor_id)) WITH CHECK ((auth.uid() = doctor_id));



CREATE POLICY appointments_patient_select ON public.appointments FOR SELECT USING ((auth.uid() = patient_id));



CREATE POLICY appointments_patient_write ON public.appointments USING ((auth.uid() = patient_id)) WITH CHECK ((auth.uid() = patient_id));



ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;


CREATE POLICY chat_messages_owner_all ON public.chat_messages USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;


CREATE POLICY chat_threads_owner_all ON public.chat_threads USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;


CREATE POLICY clinics_public_read ON public.clinics FOR SELECT USING (true);



CREATE POLICY clinics_self_write ON public.clinics USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));



ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;


CREATE POLICY doctors_public_read ON public.doctors FOR SELECT USING (true);



CREATE POLICY doctors_self_write ON public.doctors USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));



ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;


CREATE POLICY emergency_alerts_owner_all ON public.emergency_alerts USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;


CREATE POLICY emergency_contacts_owner_all ON public.emergency_contacts USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;


CREATE POLICY family_members_owner_all ON public.family_members USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));



ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;


CREATE POLICY health_records_owner_all ON public.health_records USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;


CREATE POLICY lab_reports_clinic_all ON public.lab_reports USING ((auth.uid() = clinic_id)) WITH CHECK ((auth.uid() = clinic_id));



CREATE POLICY lab_reports_patient_select ON public.lab_reports FOR SELECT USING ((auth.uid() = patient_id));



ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;


CREATE POLICY marketing_content_admin_write ON public.marketing_content USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY marketing_content_public_read ON public.marketing_content FOR SELECT USING (true);



ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;


CREATE POLICY medicine_reminders_owner_all ON public.medicine_reminders USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;


CREATE POLICY medicines_admin_write ON public.medicines USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY medicines_public_read ON public.medicines FOR SELECT USING (true);



ALTER TABLE public.mental_health_sessions ENABLE ROW LEVEL SECURITY;


CREATE POLICY mental_health_sessions_owner_all ON public.mental_health_sessions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;


CREATE POLICY nav_items_admin_write ON public.nav_items USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY nav_items_public_read ON public.nav_items FOR SELECT USING (true);



ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;


CREATE POLICY pharmacies_admin_write ON public.pharmacies USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY pharmacies_public_read ON public.pharmacies FOR SELECT USING (true);



ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;


CREATE POLICY prescription_items_doctor_write ON public.prescription_items USING ((EXISTS ( SELECT 1
   FROM public.prescriptions p
  WHERE ((p.id = prescription_items.prescription_id) AND (p.doctor_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.prescriptions p
  WHERE ((p.id = prescription_items.prescription_id) AND (p.doctor_id = auth.uid())))));



CREATE POLICY prescription_items_via_parent ON public.prescription_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.prescriptions p
  WHERE ((p.id = prescription_items.prescription_id) AND ((p.patient_id = auth.uid()) OR (p.doctor_id = auth.uid()))))));



ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;


CREATE POLICY prescriptions_doctor_all ON public.prescriptions USING ((auth.uid() = doctor_id)) WITH CHECK ((auth.uid() = doctor_id));



CREATE POLICY prescriptions_patient_select ON public.prescriptions FOR SELECT USING ((auth.uid() = patient_id));



ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

create or replace function public.is_admin(check_user uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = check_user
            and role = 'admin'::public.user_role
    );
$$;

drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read
on public.profiles
for select
using (public.is_admin(auth.uid()));


CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE USING ((auth.uid() = id));



CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));



CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING ((auth.uid() = id));



CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING ((auth.uid() = id));



ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;


CREATE POLICY site_config_admin_write ON public.site_config USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY site_config_public_read ON public.site_config FOR SELECT USING (true);



ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;


CREATE POLICY support_tickets_admin_all ON public.support_tickets USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY support_tickets_owner_rw ON public.support_tickets USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));



ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


CREATE POLICY transactions_admin_all ON public.transactions USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



CREATE POLICY transactions_owner_read ON public.transactions FOR SELECT USING ((auth.uid() = user_id));



ALTER TABLE public.triage_sessions ENABLE ROW LEVEL SECURITY;


CREATE POLICY triage_sessions_owner_all ON public.triage_sessions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));







create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    requested_role text;
begin
    requested_role := new.raw_user_meta_data->>'role';

    insert into public.profiles (id, full_name, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        case
            when requested_role in ('patient', 'doctor', 'clinic', 'admin') then requested_role::public.user_role
            else 'patient'::public.user_role
        end
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();



create policy profiles_admin_read
on public.profiles
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.user_role
  )
);


ALTER TABLE public.chat_threads
    ADD COLUMN IF NOT EXISTS ai_config_id uuid;



-- Add deleted_at columns for soft delete
alter table public.profiles add column if not exists deleted_at timestamp with time zone;
alter table public.health_records add column if not exists deleted_at timestamp with time zone;
alter table public.lab_reports add column if not exists deleted_at timestamp with time zone;
alter table public.marketing_content add column if not exists deleted_at timestamp with time zone;
alter table public.medicine_reminders add column if not exists deleted_at timestamp with time zone;
alter table public.medicines add column if not exists deleted_at timestamp with time zone;
alter table public.mental_health_sessions add column if not exists deleted_at timestamp with time zone;
alter table public.pharmacies add column if not exists deleted_at timestamp with time zone;
alter table public.prescription_items add column if not exists deleted_at timestamp with time zone;
alter table public.prescriptions add column if not exists deleted_at timestamp with time zone;
alter table public.support_tickets add column if not exists deleted_at timestamp with time zone;
alter table public.transactions add column if not exists deleted_at timestamp with time zone;
alter table public.triage_sessions add column if not exists deleted_at timestamp with time zone;

-- Admin update/delete policies for bulk management
drop policy if exists profiles_admin_update on public.profiles;
drop policy if exists profiles_admin_delete on public.profiles;
drop policy if exists health_records_admin_update on public.health_records;
drop policy if exists health_records_admin_delete on public.health_records;
drop policy if exists lab_reports_admin_update on public.lab_reports;
drop policy if exists lab_reports_admin_delete on public.lab_reports;
drop policy if exists marketing_content_admin_update on public.marketing_content;
drop policy if exists marketing_content_admin_delete on public.marketing_content;
drop policy if exists medicine_reminders_admin_update on public.medicine_reminders;
drop policy if exists medicine_reminders_admin_delete on public.medicine_reminders;
drop policy if exists medicines_admin_update on public.medicines;
drop policy if exists medicines_admin_delete on public.medicines;
drop policy if exists mental_health_sessions_admin_update on public.mental_health_sessions;
drop policy if exists mental_health_sessions_admin_delete on public.mental_health_sessions;
drop policy if exists pharmacies_admin_update on public.pharmacies;
drop policy if exists pharmacies_admin_delete on public.pharmacies;
drop policy if exists prescription_items_admin_update on public.prescription_items;
drop policy if exists prescription_items_admin_delete on public.prescription_items;
drop policy if exists prescriptions_admin_update on public.prescriptions;
drop policy if exists prescriptions_admin_delete on public.prescriptions;
drop policy if exists support_tickets_admin_update on public.support_tickets;
drop policy if exists support_tickets_admin_delete on public.support_tickets;
drop policy if exists transactions_admin_update on public.transactions;
drop policy if exists transactions_admin_delete on public.transactions;
drop policy if exists triage_sessions_admin_update on public.triage_sessions;
drop policy if exists triage_sessions_admin_delete on public.triage_sessions;
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin(auth.uid()));

create policy health_records_admin_update on public.health_records
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy health_records_admin_delete on public.health_records
  for delete using (public.is_admin(auth.uid()));

create policy lab_reports_admin_update on public.lab_reports
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy lab_reports_admin_delete on public.lab_reports
  for delete using (public.is_admin(auth.uid()));

create policy marketing_content_admin_update on public.marketing_content
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy marketing_content_admin_delete on public.marketing_content
  for delete using (public.is_admin(auth.uid()));

create policy medicine_reminders_admin_update on public.medicine_reminders
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy medicine_reminders_admin_delete on public.medicine_reminders
  for delete using (public.is_admin(auth.uid()));

create policy medicines_admin_update on public.medicines
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy medicines_admin_delete on public.medicines
  for delete using (public.is_admin(auth.uid()));

create policy mental_health_sessions_admin_update on public.mental_health_sessions
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy mental_health_sessions_admin_delete on public.mental_health_sessions
  for delete using (public.is_admin(auth.uid()));

create policy pharmacies_admin_update on public.pharmacies
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy pharmacies_admin_delete on public.pharmacies
  for delete using (public.is_admin(auth.uid()));

create policy prescription_items_admin_update on public.prescription_items
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy prescription_items_admin_delete on public.prescription_items
  for delete using (public.is_admin(auth.uid()));

create policy prescriptions_admin_update on public.prescriptions
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy prescriptions_admin_delete on public.prescriptions
  for delete using (public.is_admin(auth.uid()));

create policy support_tickets_admin_update on public.support_tickets
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy support_tickets_admin_delete on public.support_tickets
  for delete using (public.is_admin(auth.uid()));

create policy transactions_admin_update on public.transactions
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy transactions_admin_delete on public.transactions
  for delete using (public.is_admin(auth.uid()));

create policy triage_sessions_admin_update on public.triage_sessions
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy triage_sessions_admin_delete on public.triage_sessions
  for delete using (public.is_admin(auth.uid()));



-- ============================================================
-- site_config – contact details seed
-- ============================================================

INSERT INTO public.site_config (key, value, value_type, label, category)
VALUES
  ('contact_email',             'hello@iasis.health',    'text', 'Contact email',     'contact'),
  ('contact_phone',             '+880 1700 000 000',     'text', 'Contact phone',      'contact'),
  ('contact_office',            'Gulshan-2, Dhaka 1212', 'text', 'Office address',     'contact'),
  ('contact_partnership_email', 'partners@iasis.health', 'text', 'Partnership email',  'contact')
ON CONFLICT (key) DO NOTHING;



-- ============================================================
-- pricing_plans
-- ============================================================

CREATE TABLE public.pricing_plans (
    id             uuid DEFAULT gen_random_uuid() NOT NULL,
    name           text NOT NULL,
    price          text NOT NULL,
    cadence        text NOT NULL DEFAULT 'forever',
    description    text,
    features       text[] DEFAULT '{}'::text[] NOT NULL,
    cta_label      text NOT NULL DEFAULT 'Get started',
    cta_href       text NOT NULL DEFAULT '/auth/sign-up',
    is_highlighted boolean DEFAULT false NOT NULL,
    is_active      boolean DEFAULT true NOT NULL,
    order_index    integer DEFAULT 0 NOT NULL,
    updated_by     uuid,
    updated_at     timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pricing_plans_pkey PRIMARY KEY (id),
    CONSTRAINT pricing_plans_updated_by_fkey
        FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TRIGGER pricing_plans_updated_at
    BEFORE UPDATE ON public.pricing_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY pricing_plans_public_read ON public.pricing_plans
    FOR SELECT USING (true);

CREATE POLICY pricing_plans_admin_all ON public.pricing_plans
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.pricing_plans
    (name, price, cadence, description, features, cta_label, cta_href, is_highlighted, is_active, order_index)
VALUES
  ('Free Citizen', '৳0', 'forever',
   'AI-first care, accessible to every Bangladeshi.',
   ARRAY['Unlimited AI triage and AI chat','Family member profiles','Medicine reminders','Lab report storage and AI summary','Emergency SOS to nearest hospital'],
   'Sign up free', '/auth/sign-up', false, true, 1),

  ('Doctor Consultation', '৳200', '/ consultation',
   'Verified BMDC doctor review and digital prescription.',
   ARRAY['Verified BMDC doctor','Audio or video telemedicine','Digital prescription with pharmacy QR','Follow-up chat within 7 days','Saved to your medical record'],
   'Get started', '/auth/sign-up', true, true, 2),

  ('Specialist', '৳800', '/ consultation',
   'Cardiology, neurology, oncology, mental health.',
   ARRAY['Senior consultant review','Priority appointment booking','Second-opinion detail report','Care plan with follow-ups','Audio/video on demand'],
   'Browse specialists', '/auth/sign-up', false, true, 3);



-- ============================================================
-- profiles – international location fields
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country        text,
  ADD COLUMN IF NOT EXISTS state_province text,
  ADD COLUMN IF NOT EXISTS city           text,
  ADD COLUMN IF NOT EXISTS address_line   text;
