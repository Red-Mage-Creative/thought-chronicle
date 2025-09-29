-- Update profiles table to make username required and unique
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL,
ADD CONSTRAINT profiles_username_unique UNIQUE (username),
ADD CONSTRAINT profiles_username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Create app_config table for storing configuration values
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read app_config (for access code validation)
CREATE POLICY "App config is readable by everyone" 
ON public.app_config 
FOR SELECT 
USING (true);

-- Insert the signup access code
INSERT INTO public.app_config (key, value, description) 
VALUES ('signup_access_code', 'primadonna', 'Required access code for user registration');

-- Add trigger for automatic timestamp updates on app_config
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();