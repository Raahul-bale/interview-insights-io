-- Enable full replica identity for real-time updates
ALTER TABLE public.interview_posts REPLICA IDENTITY FULL;
ALTER TABLE public.experience_upvotes REPLICA IDENTITY FULL;
ALTER TABLE public.experience_ratings REPLICA IDENTITY FULL;
ALTER TABLE public.experience_comments REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;