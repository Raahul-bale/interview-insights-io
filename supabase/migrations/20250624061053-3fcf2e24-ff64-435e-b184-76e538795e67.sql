
-- Add is_anonymous column to interview_posts table
ALTER TABLE public.interview_posts 
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.interview_posts.is_anonymous IS 'Indicates if the post was submitted anonymously. When true, user identity is hidden from other users but backend functionality like ratings and chat still work.';
