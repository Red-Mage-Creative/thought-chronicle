-- Remove the insecure email lookup function that enables email harvesting
DROP FUNCTION IF EXISTS public.get_email_by_username(text);

-- Keep is_username_taken for signup validation but it's less critical
-- since it only confirms existence, not retrieving private data like emails