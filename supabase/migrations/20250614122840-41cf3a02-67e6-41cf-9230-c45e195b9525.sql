-- Create ratings table for user experiences
CREATE TABLE public.experience_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.interview_posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

-- Enable RLS
ALTER TABLE public.experience_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.experience_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate experiences" ON public.experience_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON public.experience_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON public.experience_ratings FOR DELETE USING (auth.uid() = user_id);

-- Add average rating and rating count to interview_posts
ALTER TABLE public.interview_posts 
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Function to update experience ratings
CREATE OR REPLACE FUNCTION public.update_experience_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and count for the experience
  UPDATE public.interview_posts 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0) 
      FROM public.experience_ratings 
      WHERE experience_id = COALESCE(NEW.experience_id, OLD.experience_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM public.experience_ratings 
      WHERE experience_id = COALESCE(NEW.experience_id, OLD.experience_id)
    )
  WHERE id = COALESCE(NEW.experience_id, OLD.experience_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
CREATE TRIGGER update_experience_rating_on_insert
  AFTER INSERT ON public.experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

CREATE TRIGGER update_experience_rating_on_update
  AFTER UPDATE ON public.experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

CREATE TRIGGER update_experience_rating_on_delete
  AFTER DELETE ON public.experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

-- Function to check monthly submission limit
CREATE OR REPLACE FUNCTION public.check_monthly_submission_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.interview_posts 
    WHERE user_id = user_uuid 
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get top rated experiences
CREATE OR REPLACE FUNCTION public.get_top_experiences(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id UUID,
  company TEXT,
  role TEXT,
  user_name TEXT,
  date DATE,
  rounds JSONB,
  average_rating DECIMAL,
  rating_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    interview_posts.id,
    interview_posts.company,
    interview_posts.role,
    interview_posts.user_name,
    interview_posts.date,
    interview_posts.rounds,
    interview_posts.average_rating,
    interview_posts.rating_count,
    interview_posts.created_at
  FROM public.interview_posts
  WHERE interview_posts.rating_count > 0
  ORDER BY interview_posts.average_rating DESC, interview_posts.rating_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search experiences
CREATE OR REPLACE FUNCTION public.search_experiences(search_query TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  company TEXT,
  role TEXT,
  user_name TEXT,
  date DATE,
  rounds JSONB,
  full_text TEXT,
  average_rating DECIMAL,
  rating_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    interview_posts.id,
    interview_posts.company,
    interview_posts.role,
    interview_posts.user_name,
    interview_posts.date,
    interview_posts.rounds,
    interview_posts.full_text,
    interview_posts.average_rating,
    interview_posts.rating_count,
    interview_posts.created_at
  FROM public.interview_posts
  WHERE 
    interview_posts.full_text ILIKE '%' || search_query || '%' OR
    interview_posts.company ILIKE '%' || search_query || '%' OR
    interview_posts.role ILIKE '%' || search_query || '%'
  ORDER BY 
    interview_posts.average_rating DESC, 
    interview_posts.rating_count DESC,
    interview_posts.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;