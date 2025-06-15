import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Free, rule-based ATS analysis function
function performLocalATSAnalysis(resumeContent: string, jobDescription?: string, fileName?: string): ATSAnalysisResponse {
  const resume = resumeContent.toLowerCase();
  const job = jobDescription?.toLowerCase() || '';
  
  // Common ATS-friendly section headers
  const atsHeaders = [
    'experience', 'work experience', 'professional experience', 'employment',
    'education', 'skills', 'technical skills', 'core competencies',
    'summary', 'profile', 'objective', 'contact', 'certifications'
  ];
  
  // Common technical and soft skills keywords
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
    'management', 'leadership', 'communication', 'teamwork', 'problem solving',
    'project management', 'analytics', 'marketing', 'sales', 'customer service'
  ];
  
  // Extract keywords from job description if provided
  const jobKeywords = job ? extractKeywords(job) : [];
  const resumeKeywords = extractKeywords(resume);
  
  // Keyword matching analysis
  const foundKeywords = jobKeywords.filter(keyword => resume.includes(keyword));
  const missingKeywords = jobKeywords.filter(keyword => !resume.includes(keyword));
  const keywordMatchScore = jobKeywords.length > 0 
    ? Math.round((foundKeywords.length / jobKeywords.length) * 100)
    : Math.round((resumeKeywords.filter(k => commonSkills.includes(k)).length / commonSkills.length) * 100);
  
  // Format scoring
  const formatScore = calculateFormatScore(resume, atsHeaders);
  
  // Readability scoring
  const readabilityScore = calculateReadabilityScore(resumeContent);
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (keywordMatchScore * 0.4) + 
    (formatScore * 0.3) + 
    (readabilityScore * 0.3)
  );
  
  // Generate suggestions
  const suggestions = generateSuggestions(resume, formatScore, keywordMatchScore, missingKeywords);
  
  // Generate strengths
  const strengths = generateStrengths(resume, foundKeywords, formatScore);
  
  // Job-specific feedback
  const jobSpecificFeedback = jobDescription 
    ? `Based on the job description, your resume matches ${foundKeywords.length} out of ${jobKeywords.length} key requirements. ${
        foundKeywords.length > jobKeywords.length * 0.7 
          ? 'This is a strong match for the role.' 
          : 'Consider incorporating more relevant keywords and skills from the job posting.'
      }`
    : 'No job description provided. Analysis based on general ATS best practices.';
  
  return {
    overallScore,
    keywordMatch: keywordMatchScore,
    formatScore,
    readabilityScore,
    suggestions,
    strengths,
    keywords: {
      found: foundKeywords,
      missing: missingKeywords.slice(0, 10) // Limit to top 10 missing keywords
    },
    jobSpecificFeedback
  };
}

function extractKeywords(text: string): string[] {
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use']);
  
  return [...new Set(words.filter(word => !commonWords.has(word)))]
    .sort((a, b) => text.split(a).length - text.split(b).length)
    .slice(0, 50); // Top 50 most frequent keywords
}

function calculateFormatScore(resume: string, atsHeaders: string[]): number {
  let score = 60; // Base score
  
  // Check for standard headers
  const headerMatches = atsHeaders.filter(header => resume.includes(header));
  score += headerMatches.length * 5;
  
  // Check for bullet points
  if (resume.includes('•') || resume.includes('-') || resume.includes('*')) {
    score += 10;
  }
  
  // Check for contact information patterns
  if (resume.match(/@[a-z0-9.-]+\.[a-z]{2,}/)) score += 5; // Email
  if (resume.match(/\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4}/)) score += 5; // Phone
  
  // Penalize complex formatting indicators
  if (resume.includes('table') || resume.includes('chart')) score -= 10;
  if (resume.includes('image') || resume.includes('graphic')) score -= 10;
  
  return Math.min(100, Math.max(0, score));
}

function calculateReadabilityScore(resumeContent: string): number {
  let score = 70; // Base score
  
  const sentences = resumeContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = resumeContent.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Optimal range: 15-20 words per sentence
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    score += 15;
  } else if (avgWordsPerSentence < 10 || avgWordsPerSentence > 25) {
    score -= 10;
  }
  
  // Check for action verbs
  const actionVerbs = ['achieved', 'created', 'developed', 'implemented', 'managed', 'led', 'improved', 'designed', 'built', 'delivered'];
  const actionVerbCount = actionVerbs.filter(verb => resumeContent.toLowerCase().includes(verb)).length;
  score += actionVerbCount * 2;
  
  // Check for quantifiable achievements
  const numbers = resumeContent.match(/\d+%|\$\d+|\d+\+/g);
  if (numbers && numbers.length > 0) {
    score += Math.min(15, numbers.length * 3);
  }
  
  return Math.min(100, Math.max(0, score));
}

function generateSuggestions(resume: string, formatScore: number, keywordScore: number, missingKeywords: string[]): string[] {
  const suggestions: string[] = [];
  
  if (formatScore < 70) {
    suggestions.push('Use standard section headings like "Work Experience", "Education", and "Skills"');
    suggestions.push('Format your resume with clear bullet points and consistent spacing');
  }
  
  if (keywordScore < 60) {
    suggestions.push('Include more relevant keywords from the job description');
    suggestions.push('Add technical skills and industry-specific terms');
  }
  
  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding these relevant keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  
  if (!resume.includes('@')) {
    suggestions.push('Include a professional email address in your contact information');
  }
  
  if (!resume.includes('achieved') && !resume.includes('improved') && !resume.includes('increased')) {
    suggestions.push('Use action verbs and quantify your achievements with numbers and percentages');
  }
  
  suggestions.push('Save your resume as a .docx or .pdf file for best ATS compatibility');
  suggestions.push('Keep formatting simple and avoid complex layouts, tables, or graphics');
  
  return suggestions;
}

function generateStrengths(resume: string, foundKeywords: string[], formatScore: number): string[] {
  const strengths: string[] = [];
  
  if (foundKeywords.length > 5) {
    strengths.push(`Strong keyword relevance with ${foundKeywords.length} matching terms`);
  }
  
  if (formatScore > 80) {
    strengths.push('Well-structured format with clear sections');
  }
  
  if (resume.includes('@') && resume.match(/\d{3}/)) {
    strengths.push('Complete contact information provided');
  }
  
  if (resume.includes('•') || resume.includes('-')) {
    strengths.push('Good use of bullet points for readability');
  }
  
  const actionVerbs = ['achieved', 'created', 'developed', 'implemented', 'managed', 'led', 'improved'];
  const actionVerbCount = actionVerbs.filter(verb => resume.includes(verb)).length;
  if (actionVerbCount > 2) {
    strengths.push('Effective use of action verbs to describe accomplishments');
  }
  
  const numbers = resume.match(/\d+%|\$\d+|\d+\+/g);
  if (numbers && numbers.length > 2) {
    strengths.push('Quantified achievements with specific metrics');
  }
  
  if (strengths.length === 0) {
    strengths.push('Resume content successfully uploaded for analysis');
  }
  
  return strengths;
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

    console.log('Starting local ATS analysis...');

    // Perform free, rule-based ATS analysis
    const analysis = performLocalATSAnalysis(resumeContent, jobDescription, fileName);

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