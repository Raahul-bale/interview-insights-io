-- Create function to get top app feedback
CREATE OR REPLACE FUNCTION public.get_top_app_feedback(limit_count integer DEFAULT 5)
RETURNS TABLE(id uuid, user_name text, feedback text, rating integer, created_at timestamp with time zone)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    app_feedback.id,
    app_feedback.user_name,
    app_feedback.feedback,
    app_feedback.rating,
    app_feedback.created_at
  FROM public.app_feedback
  ORDER BY app_feedback.rating DESC, app_feedback.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- Create function to get average app rating
CREATE OR REPLACE FUNCTION public.get_app_average_rating()
RETURNS DECIMAL
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating::DECIMAL), 0) 
    FROM public.app_feedback
  );
END;
$function$;