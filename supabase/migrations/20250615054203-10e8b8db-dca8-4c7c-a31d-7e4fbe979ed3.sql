-- Drop and recreate the view with correct column names
DROP VIEW IF EXISTS public.interview_experiences_with_details;

-- Create the corrected view
CREATE VIEW public.interview_experiences_with_details AS
SELECT 
  ie.*,
  COALESCE(p.full_name, 'Anonymous') as author_name,
  p.avatar_url as author_avatar,
  COALESCE(upvote_counts.upvote_count, 0) as upvote_count
FROM public.interview_experiences ie
LEFT JOIN public.profiles p ON ie.user_id = p.user_id
LEFT JOIN (
  SELECT 
    experience_id,
    COUNT(*) as upvote_count
  FROM public.interview_experience_upvotes
  GROUP BY experience_id
) upvote_counts ON ie.id = upvote_counts.experience_id
ORDER BY ie.created_at DESC;