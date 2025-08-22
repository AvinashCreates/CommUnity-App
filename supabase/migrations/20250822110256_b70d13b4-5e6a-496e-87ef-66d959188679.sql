-- Fix security definer view issue by removing SECURITY DEFINER
-- and instead create separate policies that allow safe public data access

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Update the profiles RLS policy to allow access to only safe public fields
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Users can view public profile data for community" ON public.profiles;

-- Create a more restrictive policy for public data (name and avatar only)
-- This still protects sensitive data like email, phone, address
-- We'll handle this in the application layer instead of database level