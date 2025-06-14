import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Processing message:', message);

    // Step 1: Generate embedding for user message
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    });

    if (!embeddingResponse.ok) {
      console.error('OpenAI embedding error:', await embeddingResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate embedding' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Search for similar interview posts using vector similarity
    const { data: similarPosts, error: searchError } = await supabase.rpc(
      'match_interview_posts',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5
      }
    );

    if (searchError) {
      console.error('Vector search error:', searchError);
      // Fallback to regular search if vector search fails
      const { data: fallbackPosts } = await supabase
        .from('interview_posts')
        .select('*')
        .limit(3);
      
      return await generateResponse(fallbackPosts || [], message, openAIApiKey);
    }

    console.log('Found similar posts:', similarPosts?.length || 0);

    // Step 3: Generate AI response using similar posts
    return await generateResponse(similarPosts || [], message, openAIApiKey);

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateResponse(posts: any[], userMessage: string, apiKey: string) {
  // Enhanced context extraction with more detailed analysis
  const relevantContext = posts.map((post, index) => {
    const rounds = Array.isArray(post.rounds) ? post.rounds : [];
    const roundsDetail = rounds.map(round => 
      `  - ${round.roundName || 'Round'}: ${round.question || 'N/A'}\n    Approach: ${round.userAnswer || 'N/A'}`
    ).join('\n');
    
    return `Experience ${index + 1}:
Company: ${post.company}
Role: ${post.role}
Candidate: ${post.user_name}
Interview Rounds:
${roundsDetail || '  No detailed rounds available'}
Overall Experience: ${post.full_text}
Similarity Score: ${(post.similarity * 100).toFixed(1)}%
---`;
  }).join('\n\n');

  // Enhanced system prompt with better learning capabilities
  const systemPrompt = `You are an advanced AI interview preparation assistant trained on real candidate experiences. Analyze the provided interview data to give personalized, actionable advice.

REAL INTERVIEW EXPERIENCES FROM DATABASE:
${relevantContext || 'No specific experiences found in database, but I can provide general interview guidance based on common patterns.'}

CORE INSTRUCTIONS:
1. ANALYZE PATTERNS: Look for common themes across the experiences (question types, company culture, interview structure)
2. PROVIDE SPECIFIC EXAMPLES: Reference actual questions and approaches from the database
3. PERSONALIZE ADVICE: Tailor recommendations based on the user's specific query and role
4. HIGHLIGHT INSIGHTS: Extract key learnings from successful candidates
5. SUGGEST PREPARATION STRATEGIES: Based on real patterns from the data

RESPONSE FORMAT:
- Start with a brief analysis of relevant patterns found
- Provide specific, actionable advice with examples from the experiences
- Include recommended preparation steps
- End with encouragement and confidence-building tips

Remember: Your knowledge comes from real candidates who succeeded. Use their experiences to help the current user prepare effectively.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    console.error('OpenAI chat error:', await response.text());
    throw new Error('Failed to generate AI response');
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  return new Response(
    JSON.stringify({ 
      response: aiResponse,
      sources: posts.length > 0 ? posts.slice(0, 3).map(p => ({
        company: p.company,
        role: p.role,
        id: p.id
      })) : []
    }),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    }
  );
}