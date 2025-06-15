-- Create interview experiences table
CREATE TABLE public.interview_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  interview_type TEXT NOT NULL, -- e.g., 'coding', 'behavioral', 'system design', 'technical'
  experience_level TEXT NOT NULL, -- e.g., 'entry', 'mid', 'senior', 'lead'
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  interview_process TEXT,
  questions_asked TEXT,
  tips TEXT,
  outcome TEXT, -- e.g., 'offered', 'rejected', 'pending'
  interview_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_experiences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Interview experiences are viewable by everyone" 
ON public.interview_experiences 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own interview experiences" 
ON public.interview_experiences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview experiences" 
ON public.interview_experiences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview experiences" 
ON public.interview_experiences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_experiences_updated_at
BEFORE UPDATE ON public.interview_experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create upvotes table for interview experiences
CREATE TABLE public.interview_experience_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.interview_experiences(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

-- Enable RLS for upvotes
ALTER TABLE public.interview_experience_upvotes ENABLE ROW LEVEL SECURITY;

-- Create policies for upvotes
CREATE POLICY "Upvotes are viewable by everyone" 
ON public.interview_experience_upvotes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own upvotes" 
ON public.interview_experience_upvotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" 
ON public.interview_experience_upvotes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create view for experiences with upvote counts and user profiles
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