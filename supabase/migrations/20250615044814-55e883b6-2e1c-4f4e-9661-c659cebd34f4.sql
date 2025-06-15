-- Fix security warnings by setting search_path for all functions

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update match_interview_posts function
CREATE OR REPLACE FUNCTION public.match_interview_posts(query_embedding vector, match_threshold double precision, match_count integer)
RETURNS TABLE(id uuid, company text, role text, user_name text, date date, rounds jsonb, full_text text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    1 - (interview_posts.embedding <=> query_embedding) AS similarity
  FROM interview_posts
  WHERE interview_posts.embedding IS NOT NULL
    AND 1 - (interview_posts.embedding <=> query_embedding) > match_threshold
  ORDER BY interview_posts.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- Update match_interview_posts_enhanced function
CREATE OR REPLACE FUNCTION public.match_interview_posts_enhanced(query_embedding vector, match_threshold double precision DEFAULT 0.6, match_count integer DEFAULT 8, company_filter text DEFAULT NULL::text, role_filter text DEFAULT NULL::text)
RETURNS TABLE(id uuid, company text, role text, user_name text, date date, rounds jsonb, full_text text, similarity double precision, relevance_score double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    1 - (interview_posts.embedding <=> query_embedding) AS similarity,
    -- Calculate enhanced relevance score based on multiple factors
    (
      (1 - (interview_posts.embedding <=> query_embedding)) * 0.7 + -- Vector similarity (70%)
      CASE 
        WHEN company_filter IS NOT NULL AND LOWER(interview_posts.company) LIKE LOWER('%' || company_filter || '%') THEN 0.2
        ELSE 0
      END + -- Company match bonus (20%)
      CASE 
        WHEN role_filter IS NOT NULL AND LOWER(interview_posts.role) LIKE LOWER('%' || role_filter || '%') THEN 0.1
        ELSE 0
      END -- Role match bonus (10%)
    ) AS relevance_score
  FROM interview_posts
  WHERE interview_posts.embedding IS NOT NULL
    AND 1 - (interview_posts.embedding <=> query_embedding) > match_threshold
  ORDER BY relevance_score DESC, interview_posts.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- Update extract_query_context function
CREATE OR REPLACE FUNCTION public.extract_query_context(user_query text)
RETURNS TABLE(companies text[], roles text[], topics text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  query_lower text := LOWER(user_query);
  company_keywords text[] := ARRAY[
    'google', 'microsoft', 'amazon', 'facebook', 'meta', 'apple', 'netflix', 'uber', 
    'airbnb', 'spotify', 'twitter', 'linkedin', 'salesforce', 'adobe', 'nvidia',
    'tesla', 'stripe', 'square', 'dropbox', 'slack', 'zoom', 'shopify', 'palantir'
  ];
  role_keywords text[] := ARRAY[
    'software engineer', 'sde', 'senior engineer', 'staff engineer', 'principal engineer',
    'frontend', 'backend', 'fullstack', 'data scientist', 'machine learning', 'devops',
    'product manager', 'engineering manager', 'technical lead', 'architect'
  ];
  topic_keywords text[] := ARRAY[
    'system design', 'coding', 'algorithms', 'data structures', 'behavioral', 
    'leadership', 'culture fit', 'technical', 'architecture', 'scalability'
  ];
  found_companies text[] := '{}';
  found_roles text[] := '{}';
  found_topics text[] := '{}';
  keyword text;
BEGIN
  -- Extract companies
  FOREACH keyword IN ARRAY company_keywords
  LOOP
    IF query_lower LIKE '%' || keyword || '%' THEN
      found_companies := array_append(found_companies, keyword);
    END IF;
  END LOOP;
  
  -- Extract roles
  FOREACH keyword IN ARRAY role_keywords
  LOOP
    IF query_lower LIKE '%' || keyword || '%' THEN
      found_roles := array_append(found_roles, keyword);
    END IF;
  END LOOP;
  
  -- Extract topics
  FOREACH keyword IN ARRAY topic_keywords
  LOOP
    IF query_lower LIKE '%' || keyword || '%' THEN
      found_topics := array_append(found_topics, keyword);
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT found_companies, found_roles, found_topics;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

-- Update update_experience_rating function
CREATE OR REPLACE FUNCTION public.update_experience_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update check_monthly_submission_limit function
CREATE OR REPLACE FUNCTION public.check_monthly_submission_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.interview_posts 
    WHERE user_id = user_uuid 
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  );
END;
$function$;

-- Update get_top_experiences function
CREATE OR REPLACE FUNCTION public.get_top_experiences(limit_count integer DEFAULT 5)
RETURNS TABLE(id uuid, company text, role text, user_name text, date date, rounds jsonb, average_rating numeric, rating_count integer, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update search_experiences function
CREATE OR REPLACE FUNCTION public.search_experiences(search_query text, limit_count integer DEFAULT 10)
RETURNS TABLE(id uuid, company text, role text, user_name text, date date, rounds jsonb, full_text text, average_rating numeric, rating_count integer, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update update_experience_upvotes function
CREATE OR REPLACE FUNCTION public.update_experience_upvotes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update get_top_app_feedback function
CREATE OR REPLACE FUNCTION public.get_top_app_feedback(limit_count integer DEFAULT 5)
RETURNS TABLE(id uuid, user_name text, feedback text, rating integer, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update get_app_average_rating function
CREATE OR REPLACE FUNCTION public.get_app_average_rating()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating::DECIMAL), 0) 
    FROM public.app_feedback
  );
END;
$function$;