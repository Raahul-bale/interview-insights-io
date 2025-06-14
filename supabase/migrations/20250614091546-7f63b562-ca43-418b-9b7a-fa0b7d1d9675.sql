-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_interview_posts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  id uuid,
  company text,
  role text,
  user_name text,
  date date,
  rounds jsonb,
  full_text text,
  similarity float
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
    1 - (interview_posts.embedding <=> query_embedding) AS similarity
  FROM interview_posts
  WHERE interview_posts.embedding IS NOT NULL
    AND 1 - (interview_posts.embedding <=> query_embedding) > match_threshold
  ORDER BY interview_posts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;