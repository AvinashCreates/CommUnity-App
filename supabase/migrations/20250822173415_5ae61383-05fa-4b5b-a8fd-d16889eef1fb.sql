-- Insert default admin user
-- First create a default admin in auth.users (this will be handled by the application)
-- Then ensure the admin role exists in user_roles

-- Create or update the default admin role assignment function
CREATE OR REPLACE FUNCTION public.ensure_default_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if default admin exists, if not we'll handle it in the application
  -- This function will be called from the application after creating the default admin user
  
  -- Get the admin user by email (we'll use admin@community.local)
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@community.local' 
  LIMIT 1;
  
  -- If admin user exists, ensure they have admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Also ensure they have a profile
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (admin_user_id, 'System Administrator', 'admin@community.local')
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email;
  END IF;
END;
$$;

-- Add a function to delete posts (admin only)
CREATE OR REPLACE FUNCTION public.delete_community_post(post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can delete posts';
  END IF;
  
  -- Delete related likes first
  DELETE FROM public.post_likes WHERE post_id = delete_community_post.post_id;
  
  -- Delete the post
  DELETE FROM public.community_posts WHERE id = delete_community_post.post_id;
  
  RETURN TRUE;
END;
$$;

-- RLS policy to allow admins to delete any post
CREATE POLICY "Admins can delete any post"
ON public.community_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));