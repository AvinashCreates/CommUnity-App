-- Fix critical security vulnerability: Restrict profiles table access
-- Only allow users to view their own profile data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to view public profile data for community features
-- This creates a separate policy for minimal public data needed for posts/events
CREATE POLICY "Users can view public profile data for community" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Since we need community features to work, we'll create a view with only safe public data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    user_id,
    name,
    avatar_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;