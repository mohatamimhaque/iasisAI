-- ============================================================
-- RPC: verify_prescription
-- Run this in your Supabase SQL Editor to enable public 
-- prescription verification via QR code scanner.
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_prescription(
    rx_id uuid,
    rx_token text
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rx_record record;
    doc_name text;
    items_json jsonb;
    result jsonb;
BEGIN
    -- 1. Fetch prescription details matching ID and token
    SELECT p.id, p.diagnosis, p.status, p.signed_at, p.doctor_id
    INTO rx_record
    FROM public.prescriptions p
    WHERE p.id = rx_id AND p.verification_token = rx_token AND p.deleted_at IS NULL;

    -- 2. Return invalid if not found
    IF rx_record.id IS NULL THEN
        RETURN jsonb_build_object('valid', false);
    END IF;

    -- 3. Fetch doctor name
    SELECT pr.full_name
    INTO doc_name
    FROM public.profiles pr
    WHERE pr.id = rx_record.doctor_id;

    -- 4. Aggregate items to JSON
    SELECT coalesce(jsonb_agg(
        jsonb_build_object(
            'medicine_name', pi.medicine_name,
            'dosage', pi.dosage,
            'frequency', pi.frequency,
            'duration', pi.duration,
            'instructions', pi.instructions
        )
    ), '[]'::jsonb)
    INTO items_json
    FROM public.prescription_items pi
    WHERE pi.prescription_id = rx_id AND pi.deleted_at IS NULL;

    -- 5. Construct success result
    result := jsonb_build_object(
        'valid', true,
        'id', rx_record.id,
        'diagnosis', rx_record.diagnosis,
        'status', rx_record.status,
        'signed_at', rx_record.signed_at,
        'doctor_name', doc_name,
        'items', items_json
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to public/anonymous users since the verification page is public
GRANT EXECUTE ON FUNCTION public.verify_prescription(uuid, text) TO anon, authenticated;
