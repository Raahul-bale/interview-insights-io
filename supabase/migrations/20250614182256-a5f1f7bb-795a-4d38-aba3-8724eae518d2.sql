-- Create comments table for experience posts
CREATE TABLE public.experience_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.experience_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Comments are viewable by everyone" 
ON public.experience_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.experience_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.experience_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.experience_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_experience_comments_updated_at
BEFORE UPDATE ON public.experience_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_experience_comments_experience_id ON public.experience_comments(experience_id);
CREATE INDEX idx_experience_comments_created_at ON public.experience_comments(created_at DESC);