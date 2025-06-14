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

    // Step 1: Extract context from user query for better matching
    const { data: queryContext } = await supabase.rpc('extract_query_context', {
      user_query: message
    });

    const companies = queryContext?.[0]?.companies || [];
    const roles = queryContext?.[0]?.roles || [];
    
    console.log('Extracted context - Companies:', companies, 'Roles:', roles);

    // Step 2: Generate embedding for user message
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

    // Step 3: Search for similar interview posts using enhanced vector similarity
    const { data: similarPosts, error: searchError } = await supabase.rpc(
      'match_interview_posts_enhanced',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,
        match_count: 8,
        company_filter: companies.length > 0 ? companies[0] : null,
        role_filter: roles.length > 0 ? roles[0] : null
      }
    );

    if (searchError) {
      console.error('Enhanced vector search error:', searchError);
      // Fallback to regular search if enhanced search fails
      const { data: fallbackPosts } = await supabase
        .from('interview_posts')
        .select('*')
        .limit(3);
      
      return await generateResponse(fallbackPosts || [], message, openAIApiKey, queryContext?.[0]);
    }

    console.log('Found similar posts:', similarPosts?.length || 0);
    if (similarPosts && similarPosts.length > 0) {
      console.log('Top relevance scores:', similarPosts.slice(0, 3).map(p => p.relevance_score));
    }

    // Step 4: Generate AI response using enhanced similar posts
    return await generateResponse(similarPosts || [], message, openAIApiKey, queryContext?.[0]);

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateResponse(posts: any[], userMessage: string, apiKey: string, queryContext?: any) {
  // Enhanced context extraction with more detailed analysis
  const relevantContext = posts.map((post, index) => {
    const rounds = Array.isArray(post.rounds) ? post.rounds : [];
    const roundsDetail = rounds.map(round => 
      `  - ${round.roundName || 'Round'}: ${round.question || 'N/A'}\n    Approach: ${round.userAnswer || 'N/A'}`
    ).join('\n');
    
    const relevanceInfo = post.relevance_score ? 
      `Relevance Score: ${(post.relevance_score * 100).toFixed(1)}%` :
      `Similarity Score: ${(post.similarity * 100).toFixed(1)}%`;
    
    return `Experience ${index + 1}:
Company: ${post.company}
Role: ${post.role}
Candidate: ${post.user_name}
Interview Rounds:
${roundsDetail || '  No detailed rounds available'}
Overall Experience: ${post.full_text}
${relevanceInfo}
---`;
  }).join('\n\n');

  // Extract context information for enhanced responses
  const contextInfo = queryContext ? {
    companies: queryContext.companies || [],
    roles: queryContext.roles || [],
    topics: queryContext.topics || []
  } : { companies: [], roles: [], topics: [] };

  // Enhanced system prompt with better learning capabilities and context awareness
  const systemPrompt = `You are an advanced AI interview preparation assistant trained on real candidate experiences. You have access to a database of interview experiences and use vector similarity search to find the most relevant matches.

QUERY CONTEXT DETECTED:
- Companies mentioned: ${contextInfo.companies.join(', ') || 'None detected'}
- Roles mentioned: ${contextInfo.roles.join(', ') || 'None detected'}  
- Topics mentioned: ${contextInfo.topics.join(', ') || 'None detected'}

REAL INTERVIEW EXPERIENCES FROM DATABASE:
${relevantContext || 'No specific experiences found in database, but I can provide general interview guidance based on common patterns.'}

ENHANCED AI TRAINING INSTRUCTIONS:
1. PATTERN ANALYSIS: Analyze patterns across multiple experiences to identify common themes, question types, and successful approaches
2. CONTEXTUAL LEARNING: Use the detected context (companies, roles, topics) to provide highly targeted advice
3. EXPERIENCE SYNTHESIS: Combine insights from multiple candidates to create comprehensive preparation strategies
4. ADAPTIVE RESPONSES: Tailor your response style and content based on the user's specific situation and the quality of matched experiences
5. CONTINUOUS IMPROVEMENT: Learn from the relevance scores to understand which experiences are most valuable for different types of queries

RESPONSE STRATEGY:
- If high-relevance matches found (>80%): Provide detailed, specific advice based on those exact experiences
- If moderate-relevance matches found (60-80%): Combine insights from multiple experiences and extrapolate patterns
- If low-relevance matches found (<60%): Use general patterns from the database plus standard interview advice
- Always reference specific examples from the database when possible
- Provide actionable next steps and preparation strategies

LEARNING FEEDBACK LOOP:
The AI system learns from:
- Vector similarity scores between user queries and existing experiences
- Context extraction accuracy (companies, roles, topics)
- Relevance scoring that combines semantic similarity with exact matches
- User engagement patterns and follow-up questions

Remember: You are not just providing advice - you are a learning system that gets smarter with each interaction by understanding what makes interview experiences relevant and valuable to different types of queries.`;

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