-- Demo data for local/dev use
-- Inserts 8 patients, 8 doctors, and 8 clinics

begin;

insert into auth.users
  (id, email, aud, role, encrypted_password, raw_app_meta_data, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'rina.ahmed@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Rina Ahmed"}'),
  ('22222222-2222-4222-8222-222222222222', 'karim.hossain@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Karim Hossain"}'),
  ('33333333-3333-4333-8333-333333333333', 'sakina.begum@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Sakina Begum"}'),
  ('44444444-4444-4444-8444-444444444444', 'arif.hasan@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Arif Hasan"}'),
  ('55555555-5555-4555-8555-555555555555', 'farzana.islam@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Farzana Islam"}'),
  ('66666666-6666-4666-8666-666666666666', 'nazmul.haque@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Nazmul Haque"}'),
  ('77777777-7777-4777-8777-777777777777', 'nusrat.jahan@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Nusrat Jahan"}'),
  ('88888888-8888-4888-8888-888888888888', 'tanvir.rahman@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Tanvir Rahman"}'),

  ('aaaaaaa1-1111-4111-8111-111111111111', 'dr.arif.rahman@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Arif Rahman"}'),
  ('aaaaaaa2-2222-4222-8222-222222222222', 'dr.sultana.akter@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Sultana Akter"}'),
  ('aaaaaaa3-3333-4333-8333-333333333333', 'dr.farid.uddin@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Farid Uddin"}'),
  ('aaaaaaa4-4444-4444-8444-444444444444', 'dr.laila.noor@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Laila Noor"}'),
  ('aaaaaaa5-5555-4555-8555-555555555555', 'dr.mahbub.alam@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Mahbub Alam"}'),
  ('aaaaaaa6-6666-4666-8666-666666666666', 'dr.rupa.das@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Rupa Das"}'),
  ('aaaaaaa7-7777-4777-8777-777777777777', 'dr.imran.kabir@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Imran Kabir"}'),
  ('aaaaaaa8-8888-4888-8888-888888888888', 'dr.nusrat.karim@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Nusrat Karim"}'),
  ('aaaaaaa9-9999-4999-8999-999999999999', 'dr.fahim.chowdhury@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Fahim Chowdhury"}'),
  ('aaaaaaa0-0000-4000-8000-000000000000', 'dr.tahmina.haque@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Tahmina Haque"}'),

  ('bbbbbbb1-1111-4111-8111-111111111111', 'green.path@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Green Path Diagnostics"}'),
  ('bbbbbbb2-2222-4222-8222-222222222222', 'prime.lab@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Prime Lab Center"}'),
  ('bbbbbbb3-3333-4333-8333-333333333333', 'citycare.diagnostics@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"CityCare Diagnostics"}'),
  ('bbbbbbb4-4444-4444-8444-444444444444', 'sunrise.diagnostics@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Sunrise Diagnostic Lab"}'),
  ('bbbbbbb5-5555-4555-8555-555555555555', 'delta.health@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Delta Health Lab"}'),
  ('bbbbbbb6-6666-4666-8666-666666666666', 'careline.diagnostics@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Careline Diagnostics"}'),
  ('bbbbbbb7-7777-4777-8777-777777777777', 'lifespan.lab@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Lifespan Lab"}'),
  ('bbbbbbb8-8888-4888-8888-888888888888', 'harmony.diagnostics@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Harmony Diagnostics"}'),
  ('bbbbbbb9-9999-4999-8999-999999999999', 'apollo.diagnostics@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Apollo Diagnostics"}'),
  ('bbbbbbb0-0000-4000-8000-000000000000', 'metro.diagnostics@example.com', 'authenticated', 'authenticated', crypt('Password123!', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{"full_name":"Metro Diagnostics"}')

on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  phone = excluded.phone,
  date_of_birth = excluded.date_of_birth,
  gender = excluded.gender,
  blood_group = excluded.blood_group,
  division = excluded.division,
  district = excluded.district,
  avatar_url = excluded.avatar_url,
  onboarded = excluded.onboarded;

insert into public.profiles
  (id, role, full_name, phone, date_of_birth, gender, blood_group, division, district, avatar_url, onboarded)
values
  ('11111111-1111-4111-8111-111111111111', 'patient', 'Rina Ahmed', '+8801700000001', '1990-02-12', 'female', 'A+', 'Sylhet', 'Sylhet', null, true),
  ('22222222-2222-4222-8222-222222222222', 'patient', 'Karim Hossain', '+8801700000002', '1985-09-23', 'male', 'O+', 'Dhaka', 'Gulshan', null, true),
  ('33333333-3333-4333-8333-333333333333', 'patient', 'Sakina Begum', '+8801700000003', '1994-05-18', 'female', 'B+', 'Chattogram', 'Pahartali', null, true),
  ('44444444-4444-4444-8444-444444444444', 'patient', 'Arif Hasan', '+8801700000004', '1979-11-08', 'male', 'AB+', 'Rajshahi', 'Boalia', null, true),
  ('55555555-5555-4555-8555-555555555555', 'patient', 'Farzana Islam', '+8801700000005', '1998-03-03', 'female', 'O-', 'Khulna', 'Sonadanga', null, true),
  ('66666666-6666-4666-8666-666666666666', 'patient', 'Nazmul Haque', '+8801700000006', '1988-07-15', 'male', 'A-', 'Barishal', 'Kotwali', null, true),
  ('77777777-7777-4777-8777-777777777777', 'patient', 'Nusrat Jahan', '+8801700000007', '1992-12-27', 'female', 'B-', 'Rangpur', 'Rangpur Sadar', null, true),
  ('88888888-8888-4888-8888-888888888888', 'patient', 'Tanvir Rahman', '+8801700000008', '1983-01-30', 'male', 'AB-', 'Mymensingh', 'Mymensingh Sadar', null, true),

  ('aaaaaaa1-1111-4111-8111-111111111111', 'doctor', 'Dr. Arif Rahman', '+8801800000001', '1980-04-02', 'male', 'A+', 'Dhaka', 'Tejgaon', null, true),
  ('aaaaaaa2-2222-4222-8222-222222222222', 'doctor', 'Dr. Sultana Akter', '+8801800000002', '1986-06-19', 'female', 'B+', 'Chattogram', 'Panchlaish', null, true),
  ('aaaaaaa3-3333-4333-8333-333333333333', 'doctor', 'Dr. Farid Uddin', '+8801800000003', '1975-10-12', 'male', 'O+', 'Sylhet', 'Zindabazar', null, true),
  ('aaaaaaa4-4444-4444-8444-444444444444', 'doctor', 'Dr. Laila Noor', '+8801800000004', '1989-09-01', 'female', 'A-', 'Rajshahi', 'Shah Makhdum', null, true),
  ('aaaaaaa5-5555-4555-8555-555555555555', 'doctor', 'Dr. Mahbub Alam', '+8801800000005', '1978-12-22', 'male', 'B-', 'Khulna', 'Khalishpur', null, true),
  ('aaaaaaa6-6666-4666-8666-666666666666', 'doctor', 'Dr. Rupa Das', '+8801800000006', '1991-02-14', 'female', 'O-', 'Barishal', 'Nathullabad', null, true),
  ('aaaaaaa7-7777-4777-8777-777777777777', 'doctor', 'Dr. Imran Kabir', '+8801800000007', '1983-05-28', 'male', 'AB+', 'Rangpur', 'Modern More', null, true),
  ('aaaaaaa8-8888-4888-8888-888888888888', 'doctor', 'Dr. Nusrat Karim', '+8801800000008', '1987-08-06', 'female', 'AB-', 'Mymensingh', 'Ganginarpar', null, true),
  ('aaaaaaa9-9999-4999-8999-999999999999', 'doctor', 'Dr. Fahim Chowdhury', '+8801800000009', '1976-04-15', 'male', 'A+', 'Dhaka', 'Dhanmondi', null, true),
  ('aaaaaaa0-0000-4000-8000-000000000000', 'doctor', 'Dr. Tahmina Haque', '+8801800000010', '1990-01-22', 'female', 'O+', 'Chattogram', 'Nasirabad', null, true),

  ('bbbbbbb1-1111-4111-8111-111111111111', 'clinic', 'Green Path Diagnostics', '+8801900000001', null, 'other', null, 'Dhaka', 'Banani', null, true),
  ('bbbbbbb2-2222-4222-8222-222222222222', 'clinic', 'Prime Lab Center', '+8801900000002', null, 'other', null, 'Chattogram', 'Agrabad', null, true),
  ('bbbbbbb3-3333-4333-8333-333333333333', 'clinic', 'CityCare Diagnostics', '+8801900000003', null, 'other', null, 'Sylhet', 'Amberkhana', null, true),
  ('bbbbbbb4-4444-4444-8444-444444444444', 'clinic', 'Sunrise Diagnostic Lab', '+8801900000004', null, 'other', null, 'Rajshahi', 'Kazla', null, true),
  ('bbbbbbb5-5555-4555-8555-555555555555', 'clinic', 'Delta Health Lab', '+8801900000005', null, 'other', null, 'Khulna', 'Shib Bari', null, true),
  ('bbbbbbb6-6666-4666-8666-666666666666', 'clinic', 'Careline Diagnostics', '+8801900000006', null, 'other', null, 'Barishal', 'Nathullabad', null, true),
  ('bbbbbbb7-7777-4777-8777-777777777777', 'clinic', 'Lifespan Lab', '+8801900000007', null, 'other', null, 'Rangpur', 'Jahaj Company', null, true),
  ('bbbbbbb8-8888-4888-8888-888888888888', 'clinic', 'Harmony Diagnostics', '+8801900000008', null, 'other', null, 'Mymensingh', 'Maskanda', null, true),
  ('bbbbbbb9-9999-4999-8999-999999999999', 'clinic', 'Apollo Diagnostics', '+8801900000009', null, 'other', null, 'Dhaka', 'Uttara', null, true),
  ('bbbbbbb0-0000-4000-8000-000000000000', 'clinic', 'Metro Diagnostics', '+8801900000010', null, 'other', null, 'Chattogram', 'Halishahar', null, true)

on conflict (id) do nothing;

insert into public.doctors
  (id, full_name, specialty, bmdc_id, verified, bio, consultation_fee, years_experience, languages, available_for_telemedicine, avatar_url, rating)
values
  ('aaaaaaa1-1111-4111-8111-111111111111', 'Dr. Arif Rahman', 'Cardiology', 'BMDC-1001', true, 'Cardiology specialist focused on preventive care.', 800, 12, array['en','bn'], true, null, 4.7),
  ('aaaaaaa2-2222-4222-8222-222222222222', 'Dr. Sultana Akter', 'Gynecology', 'BMDC-1002', true, 'Women''s health and prenatal care.', 700, 10, array['en','bn'], true, null, 4.6),
  ('aaaaaaa3-3333-4333-8333-333333333333', 'Dr. Farid Uddin', 'Medicine', 'BMDC-1003', true, 'General medicine and chronic disease management.', 600, 15, array['en','bn'], true, null, 4.5),
  ('aaaaaaa4-4444-4444-8444-444444444444', 'Dr. Laila Noor', 'Dermatology', 'BMDC-1004', true, 'Skin, hair, and allergy care.', 650, 8, array['en','bn'], true, null, 4.4),
  ('aaaaaaa5-5555-4555-8555-555555555555', 'Dr. Mahbub Alam', 'Orthopedics', 'BMDC-1005', true, 'Joint and spine care.', 900, 14, array['en','bn'], true, null, 4.6),
  ('aaaaaaa6-6666-4666-8666-666666666666', 'Dr. Rupa Das', 'Pediatrics', 'BMDC-1006', true, 'Child health and immunization.', 550, 7, array['en','bn'], true, null, 4.5),
  ('aaaaaaa7-7777-4777-8777-777777777777', 'Dr. Imran Kabir', 'Neurology', 'BMDC-1007', true, 'Neurology and headache care.', 950, 11, array['en','bn'], true, null, 4.7),
  ('aaaaaaa8-8888-4888-8888-888888888888', 'Dr. Nusrat Karim', 'Psychiatry', 'BMDC-1008', true, 'Mental health and counseling.', 650, 9, array['en','bn'], true, null, 4.4),
  ('aaaaaaa9-9999-4999-8999-999999999999', 'Dr. Fahim Chowdhury', 'Endocrinology', 'BMDC-1009', true, 'Diabetes and hormonal care.', 850, 13, array['en','bn'], true, null, 4.5),
  ('aaaaaaa0-0000-4000-8000-000000000000', 'Dr. Tahmina Haque', 'ENT', 'BMDC-1010', true, 'ENT and allergy care.', 600, 6, array['en','bn'], true, null, 4.3)

on conflict (id) do nothing;

insert into public.clinics
  (id, name, description, address, division, district, city, phone, services, rating, verified, logo_url)
values
  ('bbbbbbb1-1111-4111-8111-111111111111', 'Green Path Diagnostics', 'Full-service diagnostic center.', 'Road 12, Banani', 'Dhaka', 'Dhaka', 'Dhaka', '+8801900000001', array['CBC','X-Ray','Ultrasound'], 4.5, true, null),
  ('bbbbbbb2-2222-4222-8222-222222222222', 'Prime Lab Center', 'Modern lab services and imaging.', 'Agrabad Access Road', 'Chattogram', 'Chattogram', 'Chattogram', '+8801900000002', array['Blood Test','ECG','MRI'], 4.4, true, null),
  ('bbbbbbb3-3333-4333-8333-333333333333', 'CityCare Diagnostics', 'Reliable lab reports with fast turnaround.', 'Amberkhana Main Road', 'Sylhet', 'Sylhet', 'Sylhet', '+8801900000003', array['Urine Test','CT Scan','X-Ray'], 4.3, true, null),
  ('bbbbbbb4-4444-4444-8444-444444444444', 'Sunrise Diagnostic Lab', 'Affordable diagnostics and imaging.', 'Kazla Bypass', 'Rajshahi', 'Rajshahi', 'Rajshahi', '+8801900000004', array['CBC','Ultrasound','ECG'], 4.2, true, null),
  ('bbbbbbb5-5555-4555-8555-555555555555', 'Delta Health Lab', 'Community diagnostics with home sample pickup.', 'Shib Bari Circle', 'Khulna', 'Khulna', 'Khulna', '+8801900000005', array['Blood Sugar','Lipid Profile','ECG'], 4.1, true, null),
  ('bbbbbbb6-6666-4666-8666-666666666666', 'Careline Diagnostics', 'Trusted lab in Barishal city.', 'Nathullabad', 'Barishal', 'Barishal', 'Barishal', '+8801900000006', array['CBC','X-Ray','Thyroid Profile'], 4.2, true, null),
  ('bbbbbbb7-7777-4777-8777-777777777777', 'Lifespan Lab', 'Advanced imaging and pathology.', 'Jahaj Company More', 'Rangpur', 'Rangpur', 'Rangpur', '+8801900000007', array['MRI','CT Scan','CBC'], 4.3, true, null),
  ('bbbbbbb8-8888-4888-8888-888888888888', 'Harmony Diagnostics', 'Multi-specialty diagnostics.', 'Maskanda', 'Mymensingh', 'Mymensingh', 'Mymensingh', '+8801900000008', array['Ultrasound','X-Ray','CBC'], 4.2, true, null),
  ('bbbbbbb9-9999-4999-8999-999999999999', 'Apollo Diagnostics', 'Advanced diagnostics and imaging.', 'Sector 7, Uttara', 'Dhaka', 'Dhaka', 'Dhaka', '+8801900000009', array['CT Scan','X-Ray','CBC'], 4.4, true, null),
  ('bbbbbbb0-0000-4000-8000-000000000000', 'Metro Diagnostics', 'Community lab and imaging.', 'Halishahar Main Road', 'Chattogram', 'Chattogram', 'Chattogram', '+8801900000010', array['Ultrasound','ECG','CBC'], 4.1, true, null)

on conflict (id) do nothing;

insert into public.health_records
  (user_id, height_cm, weight_kg, chronic_conditions, allergies, current_medications)
values
  ('11111111-1111-4111-8111-111111111111', 162, 56.5, array['asthma'], array['penicillin'], '[{"name":"Salbutamol","schedule":"as needed"}]'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 170, 72.0, array['hypertension'], array[]::text[], '[{"name":"Amlodipine","schedule":"daily"}]'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 155, 50.2, array[]::text[], array['peanuts'], '[]'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 176, 81.8, array['diabetes'], array[]::text[], '[{"name":"Metformin","schedule":"500mg twice daily"}]'::jsonb)
on conflict (user_id) do nothing;

insert into public.medicines
  (id, name, generic_name, manufacturer, strength, form, category, indications, contraindications, side_effects, price_bdt, prescription_required)
values
  ('b7b3d60f-2e8d-4b3a-9c6f-7b2a7b0a1111', 'Napa', 'Paracetamol', 'Beximco', '500mg', 'tablet', 'Analgesic', 'Fever, pain', 'Severe liver disease', 'Nausea, rash', 2.50, false),
  ('b7b3d60f-2e8d-4b3a-9c6f-7b2a7b0a2222', 'Seclo', 'Omeprazole', 'Square', '20mg', 'capsule', 'Gastro', 'GERD, ulcers', 'Hypersensitivity', 'Headache', 6.00, true),
  ('b7b3d60f-2e8d-4b3a-9c6f-7b2a7b0a3333', 'Glucophage', 'Metformin', 'Sanofi', '500mg', 'tablet', 'Diabetes', 'Type 2 diabetes', 'Severe renal impairment', 'GI upset', 8.00, true),
  ('b7b3d60f-2e8d-4b3a-9c6f-7b2a7b0a4444', 'Cetrizine', 'Cetirizine', 'Incepta', '10mg', 'tablet', 'Allergy', 'Allergic rhinitis', 'Hypersensitivity', 'Drowsiness', 4.00, false)
on conflict (id) do nothing;

insert into public.pharmacies
  (id, name, license_no, address, district, division, phone, hours, delivery_available, delivery_radius_km, verified, rating)
values
  ('c0e45e31-1c6a-4e1c-92d4-000000000001', 'Lazz Pharma', 'LIC-1001', 'Banani, Dhaka', 'Dhaka', 'Dhaka', '+8801900001001', '9am-10pm', true, 5, true, 4.5),
  ('c0e45e31-1c6a-4e1c-92d4-000000000002', 'CarePlus Pharmacy', 'LIC-1002', 'Agrabad, Chattogram', 'Chattogram', 'Chattogram', '+8801900001002', '8am-11pm', true, 6, true, 4.3),
  ('c0e45e31-1c6a-4e1c-92d4-000000000003', 'City Pharmacy', 'LIC-1003', 'Zindabazar, Sylhet', 'Sylhet', 'Sylhet', '+8801900001003', '9am-9pm', false, 3, false, 4.1),
  ('c0e45e31-1c6a-4e1c-92d4-000000000004', 'Sunrise Pharmacy', 'LIC-1004', 'Kazla, Rajshahi', 'Rajshahi', 'Rajshahi', '+8801900001004', '10am-10pm', true, 4, true, 4.2)
on conflict (id) do nothing;

insert into public.triage_sessions
  (id, user_id, symptoms, duration, severity, age, gender, result, urgency, model_used)
values
  ('d4a2d8a7-9f18-4bc8-8f8f-000000000001', '11111111-1111-4111-8111-111111111111', 'Fever and body ache', '3 days', 'moderate', 34, 'female', '{"possible_conditions":[{"name":"Viral fever","probability":0.65}]}', 'MEDIUM', 'openai/gpt-5-mini'),
  ('d4a2d8a7-9f18-4bc8-8f8f-000000000002', '22222222-2222-4222-8222-222222222222', 'Chest tightness', '1 day', 'high', 39, 'male', '{"possible_conditions":[{"name":"Angina","probability":0.52}]}', 'HIGH', 'openai/gpt-5-mini'),
  ('d4a2d8a7-9f18-4bc8-8f8f-000000000003', '33333333-3333-4333-8333-333333333333', 'Skin rash and itch', '5 days', 'low', 30, 'female', '{"possible_conditions":[{"name":"Allergy","probability":0.7}]}', 'LOW', 'openai/gpt-5-mini'),
  ('d4a2d8a7-9f18-4bc8-8f8f-000000000004', '44444444-4444-4444-8444-444444444444', 'Severe headache', '2 days', 'high', 45, 'male', '{"possible_conditions":[{"name":"Migraine","probability":0.6}]}', 'HIGH', 'openai/gpt-5-mini')
on conflict (id) do nothing;

insert into public.lab_reports
  (id, patient_id, clinic_id, report_type, title, file_url, ai_summary, flagged_values, reported_at)
values
  ('e6e1b2d0-1e2c-4b55-9a9d-000000000001', '11111111-1111-4111-8111-111111111111', 'bbbbbbb1-1111-4111-8111-111111111111', 'cbc', 'CBC Report', null, 'Mild anemia detected.', '{"hemoglobin":11.2}'::jsonb, now()),
  ('e6e1b2d0-1e2c-4b55-9a9d-000000000002', '22222222-2222-4222-8222-222222222222', 'bbbbbbb2-2222-4222-8222-222222222222', 'lipid', 'Lipid Profile', null, 'LDL slightly elevated.', '{"ldl":138}'::jsonb, now()),
  ('e6e1b2d0-1e2c-4b55-9a9d-000000000003', '33333333-3333-4333-8333-333333333333', 'bbbbbbb3-3333-4333-8333-333333333333', 'thyroid', 'Thyroid Profile', null, 'TSH within range.', '{}'::jsonb, now()),
  ('e6e1b2d0-1e2c-4b55-9a9d-000000000004', '44444444-4444-4444-8444-444444444444', 'bbbbbbb4-4444-4444-8444-444444444444', 'glucose', 'Blood Sugar', null, 'Fasting glucose high.', '{"glucose_fasting":152}'::jsonb, now())
on conflict (id) do nothing;

insert into public.prescriptions
  (id, patient_id, doctor_id, appointment_id, diagnosis, notes, status, signed_at, qr_code)
values
  ('f0f0a001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'aaaaaaa1-1111-4111-8111-111111111111', null, 'Viral fever', 'Rest and hydration', 'active', now(), null),
  ('f0f0a001-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'aaaaaaa5-5555-4555-8555-555555555555', null, 'Hypertension', 'Monitor BP weekly', 'active', now(), null),
  ('f0f0a001-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'aaaaaaa4-4444-4444-8444-444444444444', null, 'Allergic dermatitis', 'Avoid allergens', 'active', now(), null),
  ('f0f0a001-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'aaaaaaa7-7777-4777-8777-777777777777', null, 'Migraine', 'Limit screen time', 'active', now(), null)
on conflict (id) do nothing;

insert into public.prescription_items
  (id, prescription_id, medicine_name, dosage, frequency, duration, instructions)
values
  ('f1f1a001-0000-4000-8000-000000000001', 'f0f0a001-0000-4000-8000-000000000001', 'Paracetamol', '500mg', 'every 6 hours', '3 days', 'After meals'),
  ('f1f1a001-0000-4000-8000-000000000002', 'f0f0a001-0000-4000-8000-000000000002', 'Amlodipine', '5mg', 'once daily', '30 days', 'Morning'),
  ('f1f1a001-0000-4000-8000-000000000003', 'f0f0a001-0000-4000-8000-000000000003', 'Cetirizine', '10mg', 'once daily', '7 days', 'At night'),
  ('f1f1a001-0000-4000-8000-000000000004', 'f0f0a001-0000-4000-8000-000000000004', 'Naproxen', '250mg', 'twice daily', '5 days', 'With food')
on conflict (id) do nothing;

insert into public.medicine_reminders
  (id, user_id, family_member_id, medicine_name, dosage, times, frequency, start_date, end_date, active, notes)
values
  ('f2f2a001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', null, 'Paracetamol', '500mg', array['08:00','14:00','20:00'], 'daily', current_date, current_date + 3, true, 'After meals'),
  ('f2f2a001-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', null, 'Amlodipine', '5mg', array['09:00'], 'daily', current_date, null, true, null),
  ('f2f2a001-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', null, 'Cetirizine', '10mg', array['22:00'], 'daily', current_date, current_date + 7, true, 'At night'),
  ('f2f2a001-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', null, 'Metformin', '500mg', array['08:00','20:00'], 'daily', current_date, null, true, null)
on conflict (id) do nothing;

insert into public.mental_health_sessions
  (id, user_id, kind, score, severity, answers, notes)
values
  ('f3f3a001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'phq9', 6, 'mild', '{"q1":1,"q2":1,"q3":1}'::jsonb, null),
  ('f3f3a001-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'gad7', 4, 'minimal', '{"q1":1,"q2":0}'::jsonb, null),
  ('f3f3a001-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'mood', 3, 'stable', '{"mood":"ok"}'::jsonb, 'Feeling better'),
  ('f3f3a001-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'phq9', 10, 'moderate', '{"q1":2,"q2":2,"q3":1}'::jsonb, null)
on conflict (id) do nothing;

insert into public.marketing_content
  (key, page, title, body, updated_by)
values
  ('home_hero_title', 'home', 'AI care for every citizen', 'Instant triage, trusted doctors, and unified records.', 'aaaaaaa1-1111-4111-8111-111111111111'),
  ('home_hero_body', 'home', null, 'Iasis AI brings connected healthcare to Bangladesh.', 'aaaaaaa1-1111-4111-8111-111111111111'),
  ('clinic_cta_title', 'for-clinics', 'Partner with Iasis', 'Grow your diagnostics business with smart referrals.', 'bbbbbbb1-1111-4111-8111-111111111111'),
  ('doctor_cta_title', 'for-doctors', 'Join the Iasis network', 'See patients online with verified records.', 'aaaaaaa2-2222-4222-8222-222222222222')
on conflict (key) do nothing;

insert into public.support_tickets
  (id, user_id, category, subject, description, status, priority)
values
  ('f4f4a001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'account_access', 'Login issue', 'Cannot receive OTP', 'open', 'P2'),
  ('f4f4a001-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'billing', 'Payment failed', 'bKash payment failed twice', 'open', 'P2'),
  ('f4f4a001-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'medical_record', 'Incorrect blood group', 'Profile shows wrong blood group', 'in_progress', 'P2'),
  ('f4f4a001-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'other', 'Feedback', 'Great experience', 'resolved', 'P3')
on conflict (id) do nothing;

insert into public.transactions
  (id, user_id, amount_bdt, channel, channel_ref, kind, reference_id, status, description)
values
  ('f5f5a001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 200.00, 'bkash', 'BK-1001', 'consultation', null, 'paid', 'AI triage package'),
  ('f5f5a001-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 500.00, 'nagad', 'NG-1002', 'consultation', null, 'paid', 'Doctor consult'),
  ('f5f5a001-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 150.00, 'card', 'CD-1003', 'lab_test', null, 'paid', 'CBC test'),
  ('f5f5a001-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 999.00, 'rocket', 'RK-1004', 'subscription', null, 'paid', 'Monthly plan')
on conflict (id) do nothing;

commit;
