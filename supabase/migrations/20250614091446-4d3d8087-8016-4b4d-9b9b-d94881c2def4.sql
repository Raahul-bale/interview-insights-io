-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for interview posts
CREATE TABLE public.interview_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  full_text TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for AI to search)
CREATE POLICY "Interview posts are viewable by everyone" 
ON public.interview_posts 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to insert
CREATE POLICY "Authenticated users can create interview posts" 
ON public.interview_posts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for vector similarity search
CREATE INDEX interview_posts_embedding_idx ON public.interview_posts 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_posts_updated_at
BEFORE UPDATE ON public.interview_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();