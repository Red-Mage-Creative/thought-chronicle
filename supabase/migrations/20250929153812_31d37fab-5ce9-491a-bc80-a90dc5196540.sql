-- Remove the public read policy for app_config table
DROP POLICY IF EXISTS "App config is readable by everyone" ON public.app_config;

-- Create an enum for user roles (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create admin-only policies for app_config table
CREATE POLICY "Only admins can read app config" 
ON public.app_config 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update app config" 
ON public.app_config 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert app config" 
ON public.app_config 
FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete app config" 
ON public.app_config 
FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));