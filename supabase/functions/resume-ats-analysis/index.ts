import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ATSAnalysisRequest {
  resumeContent: string;
  jobDescription?: string;
  fileName: string;
}

interface ATSAnalysisResponse {
  overallScore: number;
  keywordMatch: number;
  formatScore: number;
  readabilityScore: number;
  suggestions: string[];
  strengths: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
  jobSpecificFeedback?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, jobDescription, fileName }: ATSAnalysisRequest = await req.json();

    if (!resumeContent) {
      throw new Error('Resume content is required');
    }

    if (!anthropicApiKey) {
      throw new Error('Anthropic API key is not configured');
    }

    // Create the analysis prompt
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume optimization specialist. Your job is to analyze resumes and provide detailed feedback for improving ATS compatibility and job match.

Analyze the provided resume and return a JSON response with the following structure:
{
  "overallScore": number (0-100),
  "keywordMatch": number (0-100),
  "formatScore": number (0-100), 
  "readabilityScore": number (0-100),
  "suggestions": string[],
  "strengths": string[],
  "keywords": {
    "found": string[],
    "missing": string[]
  },
  "jobSpecificFeedback": string
}

Scoring Guidelines:
- overallScore: Overall ATS compatibility (average of other scores with weights)
- keywordMatch: How well keywords match job requirements
- formatScore: ATS-friendly formatting (standard headings, no complex layouts)
- readabilityScore: Clarity, structure, and organization

Provide specific, actionable suggestions and identify actual keywords from the content.`;

    let userPrompt = `Please analyze this resume for ATS compatibility:

Resume Content:
${resumeContent}

File Name: ${fileName}`;

    if (jobDescription && jobDescription.trim()) {
      userPrompt += `

Job Description:
${jobDescription}

Please provide analysis specifically tailored to this job posting, focusing on how well the resume matches the job requirements.`;
    } else {
      userPrompt += `

Please provide general ATS optimization advice since no specific job description was provided.`;
    }

    console.log('Sending request to Anthropic Claude for ATS analysis...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      
      if (response.status === 429) {
        throw new Error('Anthropic API rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 401) {
        throw new Error('Anthropic API key is invalid. Please check your API key.');
      } else if (response.status === 400) {
        throw new Error('Invalid request to Anthropic API. Please try again.');
      } else {
        throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
      }
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

    console.log('Received analysis from Anthropic Claude:', analysisText);

    // Try to parse the JSON response from Claude
    let analysis: ATSAnalysisResponse;
    try {
      // Remove any markdown formatting if present
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      console.error('Raw response:', analysisText);
      
      // Fallback to structured analysis if JSON parsing fails
      analysis = {
        overallScore: 75,
        keywordMatch: 70,
        formatScore: 80,
        readabilityScore: 75,
        suggestions: [
          "Unable to parse detailed analysis. Please try again.",
          "Ensure your resume uses standard section headings",
          "Include relevant keywords from the job description",
          "Use bullet points for better readability"
        ],
        strengths: [
          "Resume content provided for analysis"
        ],
        keywords: {
          found: [],
          missing: []
        },
        jobSpecificFeedback: "Analysis completed but detailed feedback unavailable due to parsing error."
      };
    }

    // Ensure scores are within valid range
    analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore || 75));
    analysis.keywordMatch = Math.max(0, Math.min(100, analysis.keywordMatch || 70));
    analysis.formatScore = Math.max(0, Math.min(100, analysis.formatScore || 80));
    analysis.readabilityScore = Math.max(0, Math.min(100, analysis.readabilityScore || 75));

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in resume-ats-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      overallScore: 0,
      keywordMatch: 0,
      formatScore: 0,
      readabilityScore: 0,
      suggestions: ["Error occurred during analysis. Please try again."],
      strengths: [],
      keywords: { found: [], missing: [] }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});