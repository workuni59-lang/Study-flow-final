-- Create a function to look up a user's UUID in auth.users by email.
-- This is called by the webhook worker via db.rpc() as a fallback when
-- the Polar user_id doesn't match any profile ID directly.

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY SELECT u.id FROM auth.users u WHERE u.email = p_email LIMIT 1;
END;
$$;
