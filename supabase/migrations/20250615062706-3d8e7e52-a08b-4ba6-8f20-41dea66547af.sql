-- Update existing follower counts to fix current data
UPDATE public.profiles 
SET follower_count = (
  SELECT COUNT(*) 
  FROM public.user_follows 
  WHERE following_id = profiles.user_id
),
following_count = (
  SELECT COUNT(*) 
  FROM public.user_follows 
  WHERE follower_id = profiles.user_id
);