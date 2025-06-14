-- Enhance the match function to provide better context and learning
CREATE OR REPLACE FUNCTION match_interview_posts_enhanced(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 8,
  company_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  company text,
  role text,
  user_name text,
  date date,
  rounds jsonb,
  full_text text,
  similarity float,
  relevance_score float
)
LANGUAGE plpgsql
AS $$
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
$$;

-- Create a function to extract keywords from user queries for better matching
CREATE OR REPLACE FUNCTION extract_query_context(user_query text)
RETURNS TABLE(
  companies text[],
  roles text[],
  topics text[]
)
LANGUAGE plpgsql
AS $$
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
$$;