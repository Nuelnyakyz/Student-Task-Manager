-- Create preferences table for user settings
CREATE TABLE IF NOT EXISTS public.preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on preferences
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own preferences
CREATE POLICY "Users can view their own preferences"
ON public.preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upsert/update their own preferences"
ON public.preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Optional index for quick lookups
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON public.preferences(user_id);
