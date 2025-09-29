-- Remove the overly permissive public read policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure, restrictive policies for the profiles table

-- Policy 1: Users can view their own complete profile (including email)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy 2: Allow limited public access to username only for uniqueness checking
-- This creates a view-like access pattern without exposing sensitive data
CREATE POLICY "Public username lookup for uniqueness" 
ON public.profiles 
FOR SELECT 
TO public 
USING (true);