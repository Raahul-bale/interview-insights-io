import { supabase } from "@/integrations/supabase/client";

export interface RelevantExperience {
  id: string;
  company: string;
  role: string;
  snippet: string;
}

export interface ChatResponse {
  advice: string;
  relevantExperienceSnippets?: RelevantExperience[];
}

export interface ChatInput {
  query: string;
}

class InterviewPrepChatService {
  private async getPastExperiences(query: string): Promise<RelevantExperience[]> {
    try {
      console.log(`[ChatService] Searching for experiences with query: "${query}"`);
      
      // Enhanced search logic based on query analysis
      const searchTerms = query.toLowerCase();
      let searchQuery = '';
      
      // Company-specific searches
      if (searchTerms.includes('google')) {
        searchQuery = 'company.ilike.%google%';
      } else if (searchTerms.includes('microsoft')) {
        searchQuery = 'company.ilike.%microsoft%';
      } else if (searchTerms.includes('amazon')) {
        searchQuery = 'company.ilike.%amazon%';
      } else if (searchTerms.includes('meta') || searchTerms.includes('facebook')) {
        searchQuery = 'company.ilike.%meta%,company.ilike.%facebook%';
      } else if (searchTerms.includes('apple')) {
        searchQuery = 'company.ilike.%apple%';
      } else if (searchTerms.includes('netflix')) {
        searchQuery = 'company.ilike.%netflix%';
      } else if (searchTerms.includes('uber')) {
        searchQuery = 'company.ilike.%uber%';
      } else if (searchTerms.includes('airbnb')) {
        searchQuery = 'company.ilike.%airbnb%';
      }
      // Interview type searches
      else if (searchTerms.includes('system design')) {
        searchQuery = 'full_text.ilike.%system design%,full_text.ilike.%scalability%,full_text.ilike.%architecture%';
      } else if (searchTerms.includes('behavioral')) {
        searchQuery = 'full_text.ilike.%behavioral%,full_text.ilike.%leadership%,full_text.ilike.%conflict%';
      } else if (searchTerms.includes('coding') || searchTerms.includes('algorithm')) {
        searchQuery = 'full_text.ilike.%coding%,full_text.ilike.%algorithm%,full_text.ilike.%leetcode%';
      } else if (searchTerms.includes('technical')) {
        searchQuery = 'full_text.ilike.%technical%,full_text.ilike.%programming%';
      }
      // Role-specific searches
      else if (searchTerms.includes('software engineer') || searchTerms.includes('sde')) {
        searchQuery = 'role.ilike.%software%,role.ilike.%sde%,role.ilike.%engineer%';
      } else if (searchTerms.includes('frontend') || searchTerms.includes('front-end')) {
        searchQuery = 'role.ilike.%frontend%,role.ilike.%front-end%,full_text.ilike.%react%,full_text.ilike.%javascript%';
      } else if (searchTerms.includes('backend') || searchTerms.includes('back-end')) {
        searchQuery = 'role.ilike.%backend%,role.ilike.%back-end%,full_text.ilike.%api%,full_text.ilike.%server%';
      } else if (searchTerms.includes('data scientist') || searchTerms.includes('data science')) {
        searchQuery = 'role.ilike.%data%,full_text.ilike.%machine learning%,full_text.ilike.%statistics%';
      }
      // General keyword search
      else {
        // Extract key terms for general search
        const keyTerms = searchTerms.split(' ').filter(term => 
          term.length > 3 && 
          !['interview', 'question', 'help', 'with', 'about', 'what', 'how', 'the', 'and', 'for'].includes(term)
        );
        
        if (keyTerms.length > 0) {
          searchQuery = keyTerms.map(term => `full_text.ilike.%${term}%`).join(',');
        }
      }

      let experiences = [];
      if (searchQuery) {
        const { data, error } = await supabase
          .from('interview_posts')
          .select('*')
          .or(searchQuery)
          .limit(5);

        if (error) {
          console.error('[ChatService] Database error:', error);
          return [];
        }

        experiences = data || [];
      }

      console.log(`[ChatService] Found ${experiences.length} experiences`);

      const relevantExperiences = experiences.map(exp => {
        let snippet = exp.full_text ? exp.full_text.substring(0, 150) : '';
        if (exp.full_text && exp.full_text.length > 150) snippet += "...";
        
        // Add key question if available
        if (exp.rounds && exp.rounds.length > 0 && exp.rounds[0].question) {
          snippet += ` Key Question: ${exp.rounds[0].question.substring(0, 100)}...`;
        }

        return {
          id: exp.id,
          company: exp.company,
          role: exp.role,
          snippet: snippet.trim(),
        };
      });

      return relevantExperiences;
    } catch (error) {
      console.error('[ChatService] Error fetching experiences:', error);
      return [];
    }
  }

  private generateAdvice(query: string, experiences: RelevantExperience[]): string {
    const searchTerms = query.toLowerCase();
    
    let advice = "";

    if (experiences.length > 0) {
      // Generate advice based on found experiences
      const companies = [...new Set(experiences.map(exp => exp.company))];
      const roles = [...new Set(experiences.map(exp => exp.role))];

      if (companies.length === 1) {
        // Company-specific advice
        const company = companies[0];
        advice = `Based on ${experiences.length} real ${company} interview experience${experiences.length > 1 ? 's' : ''}:\n\n`;
        
        experiences.forEach((exp, index) => {
          advice += `**${exp.company} - ${exp.role}:**\n${exp.snippet}\n\n`;
        });
        
        advice += `**${company}-specific tips:**\n`;
        advice += `• Research ${company}'s recent projects and engineering culture\n`;
        advice += `• Practice problems similar to ${company}'s interview style\n`;
        advice += `• Prepare for their specific behavioral question patterns\n`;
        advice += `• Review the role requirements carefully`;
      } else {
        // Multi-company or role-specific advice
        advice = `Based on ${experiences.length} relevant interview experiences:\n\n`;
        
        experiences.forEach((exp) => {
          advice += `**${exp.company} - ${exp.role}:**\n${exp.snippet}\n\n`;
        });
        
        if (searchTerms.includes('system design')) {
          advice += `**System Design Tips:**\n`;
          advice += `• Start by clarifying requirements and constraints\n`;
          advice += `• Design high-level architecture first\n`;
          advice += `• Discuss data storage and database choices\n`;
          advice += `• Consider scalability, load balancing, and caching`;
        } else if (searchTerms.includes('behavioral')) {
          advice += `**Behavioral Interview Tips:**\n`;
          advice += `• Use the STAR method (Situation, Task, Action, Result)\n`;
          advice += `• Prepare 3-5 detailed examples from past experiences\n`;
          advice += `• Focus on leadership, problem-solving, and teamwork\n`;
          advice += `• Be specific with metrics and outcomes`;
        } else if (searchTerms.includes('coding')) {
          advice += `**Coding Interview Tips:**\n`;
          advice += `• Practice on LeetCode, HackerRank, or similar platforms\n`;
          advice += `• Master data structures and algorithms\n`;
          advice += `• Think out loud during the interview\n`;
          advice += `• Start with brute force, then optimize`;
        }
      }
    } else {
      // Generate general advice when no specific experiences found
      if (searchTerms.includes('system design')) {
        advice = `**System Design Interview Tips:**\n\n`;
        advice += `• Start by clarifying requirements and constraints\n`;
        advice += `• Design high-level architecture first\n`;
        advice += `• Discuss data storage and database choices\n`;
        advice += `• Consider scalability, load balancing, and caching\n`;
        advice += `• Talk about monitoring and failure handling\n`;
        advice += `• Draw diagrams to visualize your design\n`;
        advice += `• Discuss trade-offs between different approaches`;
      } else if (searchTerms.includes('behavioral')) {
        advice = `**Behavioral Interview Tips:**\n\n`;
        advice += `• Use the STAR method (Situation, Task, Action, Result)\n`;
        advice += `• Prepare 3-5 detailed examples from past experiences\n`;
        advice += `• Focus on leadership, problem-solving, and teamwork\n`;
        advice += `• Be specific with metrics and outcomes\n`;
        advice += `• Practice common questions like "Tell me about a time when..."\n`;
        advice += `• Show growth mindset and learning from failures`;
      } else if (searchTerms.includes('coding')) {
        advice = `**Coding Interview Tips:**\n\n`;
        advice += `• Practice on LeetCode, HackerRank, or similar platforms\n`;
        advice += `• Master data structures (arrays, trees, graphs, hash tables)\n`;
        advice += `• Learn algorithms (sorting, searching, dynamic programming)\n`;
        advice += `• Think out loud during the interview\n`;
        advice += `• Start with brute force, then optimize\n`;
        advice += `• Test your code with examples\n`;
        advice += `• Ask clarifying questions about requirements`;
      } else {
        advice = `I'd be happy to help with your interview preparation!\n\n`;
        advice += `**For specific advice, try asking about:**\n`;
        advice += `• Specific companies: "Google software engineer interview"\n`;
        advice += `• Interview types: "system design interview tips"\n`;
        advice += `• Behavioral interviews: "behavioral interview questions"\n`;
        advice += `• Coding prep: "coding interview preparation"\n\n`;
        advice += `What specific aspect of interview prep would you like help with?`;
      }
    }

    return advice;
  }

  async getChatResponse(input: ChatInput): Promise<ChatResponse> {
    try {
      console.log(`[ChatService] Processing query: "${input.query}"`);
      
      // Get relevant experiences
      const experiences = await this.getPastExperiences(input.query);
      
      // Generate advice based on experiences and query
      const advice = this.generateAdvice(input.query, experiences);
      
      console.log(`[ChatService] Generated advice based on ${experiences.length} experiences`);
      
      return {
        advice,
        relevantExperienceSnippets: experiences,
      };
    } catch (error) {
      console.error('[ChatService] Error in getChatResponse:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }
}

export const chatService = new InterviewPrepChatService();