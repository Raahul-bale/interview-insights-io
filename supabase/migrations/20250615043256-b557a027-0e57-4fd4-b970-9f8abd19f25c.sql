-- Create app_feedback table for user feedback about the application
CREATE TABLE public.app_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for app feedback
CREATE POLICY "Users can view all app feedback" 
ON public.app_feedback 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own app feedback" 
ON public.app_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app feedback" 
ON public.app_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own app feedback" 
ON public.app_feedback 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_feedback_updated_at
BEFORE UPDATE ON public.app_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();