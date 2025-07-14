-- Fix the get_user_profile function to use correct column name
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  coins INTEGER,
  referral_code TEXT,
  last_claim TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, email, username, coins, referral_code, last_claim
  FROM public.profiles
  WHERE id = user_uuid;
$$;