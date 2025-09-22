-- Add missing bio column to profiles used by Settings page upsert
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;
