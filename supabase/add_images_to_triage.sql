-- ============================================================
-- SQL Migration: Add images column to public.triage_sessions
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- Add images column to public.triage_sessions if not exists
ALTER TABLE public.triage_sessions ADD COLUMN IF NOT EXISTS images text[];
