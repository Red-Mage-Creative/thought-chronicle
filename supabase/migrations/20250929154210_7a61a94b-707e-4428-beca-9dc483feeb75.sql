-- Remove the still overly permissive public policy that exposes all data
DROP POLICY IF EXISTS "Public username lookup for uniqueness" ON public.profiles;

-- Create a secure function for username checking that doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.is_username_taken(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE username = check_username
  )
$$;

-- Create a secure function for email lookup by username (for authentication only)
CREATE OR REPLACE FUNCTION public.get_email_by_username(lookup_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email 
  FROM public.profiles 
  WHERE username = lookup_username
  LIMIT 1
$$;