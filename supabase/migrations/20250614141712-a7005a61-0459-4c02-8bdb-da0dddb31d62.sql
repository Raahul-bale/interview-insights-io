-- Create experience upvotes table
CREATE TABLE public.experience_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

-- Enable RLS
ALTER TABLE public.experience_upvotes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all upvotes" 
ON public.experience_upvotes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own upvotes" 
ON public.experience_upvotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" 
ON public.experience_upvotes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add upvote count to interview_posts table
ALTER TABLE public.interview_posts 
ADD COLUMN upvote_count INTEGER NOT NULL DEFAULT 0;

-- Create function to update upvote count
CREATE OR REPLACE FUNCTION public.update_experience_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update upvote count for the experience
  UPDATE public.interview_posts 
  SET upvote_count = (
    SELECT COUNT(*) 
    FROM public.experience_upvotes 
    WHERE experience_id = COALESCE(NEW.experience_id, OLD.experience_id)
  )
  WHERE id = COALESCE(NEW.experience_id, OLD.experience_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for upvote count updates
CREATE TRIGGER update_experience_upvotes_trigger
  AFTER INSERT OR DELETE ON public.experience_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_experience_upvotes();