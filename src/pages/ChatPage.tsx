import { useState, useRef, useEffect, FormEvent } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { pipeline, Pipeline } from "@huggingface/transformers";

// Enhanced interfaces for structured responses
interface RelevantExperience {
  id: string;
  company: string;
  role: string;
  similarity?: number;
  snippet?: string;
}

interface Source {
  id: string;
  company: string;
  role: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
  isLoading?: boolean;
  relevantExperiences?: RelevantExperience[];
  sources?: Source[];
}

// Formatting function for timestamps
function FormattedTimestamp({ timestamp }: { timestamp: number }) {
  const [clientFormattedTime, setClientFormattedTime] = useState<string>('');

  useEffect(() => {
    setClientFormattedTime(
      new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [timestamp]);

  if (!clientFormattedTime) {
    return <div className="text-xs mt-1 opacity-70 text-right h-4">--:--</div>;
  }

  return (
    <div className="text-xs mt-1 opacity-70 text-right">
      {clientFormattedTime}
    </div>
  );
}

const ChatPage = () => {
  const { toast } = useToast();
  const [aiPipeline, setAiPipeline] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hi! I'm your AI interview prep assistant running locally in your browser. I'll help you prepare with insights from real candidate experiences. Please wait while I initialize...",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize AI pipeline
  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsInitializing(true);
        console.log('Initializing AI pipeline...');
        
        // Use a small, efficient model for text generation
        const textGenerator = await pipeline(
          'text-generation',
          'onnx-community/Qwen2.5-0.5B-Instruct',
          { 
            device: 'wasm'
          }
        );
        
        setAiPipeline(textGenerator);
        
        // Update welcome message
        setMessages(prev => prev.map(msg => 
          msg.id === "welcome-1" 
            ? { ...msg, text: "Hi! I'm your AI interview prep assistant running locally in your browser. I can help you prepare for interviews based on real candidate experiences. Ask me about specific companies, roles, or interview types!" }
            : msg
        ));
        
        toast({
          title: "AI Ready!",
          description: "Local AI assistant is now ready to help with your interview prep.",
        });
        
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === "welcome-1" 
            ? { ...msg, text: "Sorry, I couldn't initialize properly. You can still search through interview experiences, but AI responses may be limited." }
            : msg
        ));
        
        toast({
          title: "AI Initialization Failed",
          description: "Using fallback mode. Some features may be limited.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAI();
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const aiThinkingMessage: ChatMessage = {
      id: `ai-thinking-${Date.now()}`,
      sender: "ai",
      text: "Analyzing your query and searching through relevant interview experiences...",
      isLoading: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiThinkingMessage]);
    scrollToBottom();

    try {
      // Search for relevant experiences in the database
      const searchTerms = userMessage.text.toLowerCase();
      
      // Improved search logic for common interview topics
      let searchQuery = '';
      if (searchTerms.includes('google')) {
        searchQuery = 'company.ilike.%google%';
      } else if (searchTerms.includes('microsoft')) {
        searchQuery = 'company.ilike.%microsoft%';
      } else if (searchTerms.includes('amazon')) {
        searchQuery = 'company.ilike.%amazon%';
      } else if (searchTerms.includes('meta') || searchTerms.includes('facebook')) {
        searchQuery = 'company.ilike.%meta%,company.ilike.%facebook%';
      } else if (searchTerms.includes('system design')) {
        searchQuery = 'full_text.ilike.%system design%,role.ilike.%design%';
      } else if (searchTerms.includes('behavioral')) {
        searchQuery = 'full_text.ilike.%behavioral%';
      } else if (searchTerms.includes('coding') || searchTerms.includes('algorithm')) {
        searchQuery = 'full_text.ilike.%coding%,full_text.ilike.%algorithm%';
      } else {
        // General search
        const cleanedTerms = searchTerms.replace(/[^a-zA-Z0-9\s]/g, '');
        searchQuery = `company.ilike.%${cleanedTerms}%,role.ilike.%${cleanedTerms}%,full_text.ilike.%${cleanedTerms}%`;
      }
      
      const { data: experiences, error } = await supabase
        .from('interview_posts')
        .select('*')
        .or(searchQuery)
        .limit(5);

      console.log('Database search results:', { experiences, error, query: userMessage.text });

      let relevantExperiences: RelevantExperience[] = [];
      let contextText = "";

      if (experiences && experiences.length > 0) {
        relevantExperiences = experiences.map(exp => ({
          id: exp.id,
          company: exp.company,
          role: exp.role,
          snippet: exp.full_text ? exp.full_text.substring(0, 150) + "..." : ""
        }));

        contextText = experiences.map(exp => 
          `Company: ${exp.company}\nRole: ${exp.role}\nExperience: ${exp.full_text?.substring(0, 500)}`
        ).join('\n\n---\n\n');
      }

      // Generate AI response - prioritize database results
      let aiResponse = "";

      if (relevantExperiences.length > 0) {
        aiResponse = `Based on ${relevantExperiences.length} real interview experience(s), here's what you should know:\n\n`;
        
        // Add specific insights from each experience
        relevantExperiences.forEach((exp, index) => {
          aiResponse += `${exp.company} - ${exp.role}:\n${exp.snippet}\n\n`;
        });
        
        aiResponse += `Key Takeaways:\n• Research the company's recent projects and initiatives\n• Practice coding problems on platforms like LeetCode\n• Prepare for behavioral questions using the STAR method\n• Review system design fundamentals if applicable`;
      } else {
        // Provide specific advice for common questions
        if (searchTerms.includes('system design')) {
          aiResponse = `System Design Interview Tips:\n\n• Start with clarifying requirements and constraints\n• Design high-level architecture first\n• Discuss data storage and database choices\n• Consider scalability, load balancing, and caching\n• Talk about monitoring and failure handling\n\nTry asking about specific companies for more targeted advice!`;
        } else if (searchTerms.includes('behavioral')) {
          aiResponse = `Behavioral Interview Tips:\n\n• Use the STAR method (Situation, Task, Action, Result)\n• Prepare examples from past experiences\n• Show leadership and problem-solving skills\n• Be specific with metrics and outcomes\n• Practice common questions like "Tell me about a time when..."\n\nTry asking about specific companies for their behavioral interview style!`;
        } else if (searchTerms.includes('coding') || searchTerms.includes('algorithm')) {
          aiResponse = `Coding Interview Tips:\n\n• Practice on LeetCode, HackerRank, or similar platforms\n• Master data structures (arrays, trees, graphs, hash tables)\n• Learn common algorithms (sorting, searching, dynamic programming)\n• Think out loud during the interview\n• Start with brute force, then optimize\n\nTry asking about specific companies for their coding interview format!`;
        } else {
          aiResponse = `I'd be happy to help with your interview preparation! Here are some general tips:\n\n• Research the company thoroughly\n• Practice relevant technical skills\n• Prepare behavioral examples using STAR method\n• Review common interview formats for this role\n\nFor more specific advice, try asking about:\n• Specific companies (Google, Microsoft, Amazon, etc.)\n• Interview types (system design, behavioral, coding)\n• Specific roles (Software Engineer, Product Manager, etc.)`;
        }
      }

      if (aiPipeline && !isInitializing) {
        try {
          const prompt = `You are an interview preparation assistant. A user asked: "${userMessage.text}"

${contextText ? `Based on these real interview experiences:\n${contextText}\n\n` : ''}

Provide helpful, specific advice for interview preparation. Keep your response concise and actionable. Focus on practical tips.

Response:`;

          const result = await aiPipeline(prompt, {
            max_new_tokens: 200,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
            pad_token_id: 50256
          });

          if (result && result[0] && result[0].generated_text) {
            aiResponse = result[0].generated_text.trim();
          }
        } catch (aiError) {
          console.error('AI generation error:', aiError);
          // Keep the database-based response we already generated above
        }
      }

      const aiResponseMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponse,
        timestamp: Date.now(),
        relevantExperiences: relevantExperiences
      };

      setMessages(prev => prev.filter(msg => msg.id !== aiThinkingMessage.id).concat(aiResponseMessage));

      // Show success message if experiences were found
      if (relevantExperiences.length > 0) {
        toast({
          title: "Found relevant experiences!",
          description: `Based on ${relevantExperiences.length} similar interview experiences.`,
        });
      }

    } catch (error) {
      console.error('Error in AI chat:', error);
      
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: "Sorry, I encountered an error while processing your request. Please try again or ask a different question.",
        timestamp: Date.now(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== aiThinkingMessage.id).concat(errorMessage));
      
      toast({
        title: "Processing Error",
        description: "Unable to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI Interview Prep Assistant
            </h1>
            <p className="text-muted-foreground">
              Get personalized interview preparation based on real experiences
            </p>
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message: ChatMessage) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full",
                        message.sender === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                       <div className={cn(
                         "max-w-[85%] rounded-lg px-4 py-3 text-sm break-words",
                         message.sender === "user" 
                           ? "bg-primary text-primary-foreground ml-8" 
                           : "bg-muted text-foreground mr-8"
                       )}>
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{message.text}</span>
                          </div>
                        ) : (
                          <>
                            <div className="whitespace-pre-wrap break-words">{message.text}</div>
                            
                            {/* Show relevant experiences for AI messages */}
                            {message.sender === "ai" && message.relevantExperiences && message.relevantExperiences.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-muted-foreground/20">
                                <p className="text-xs text-muted-foreground mb-2 flex items-center">
                                  <Bot className="h-3 w-3 mr-1" />
                                  Based on {message.relevantExperiences.length} relevant experiences:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {message.relevantExperiences.map((exp, index) => (
                                    <Badge 
                                      key={exp.id} 
                                      variant="secondary" 
                                      className="text-xs px-2 py-1"
                                    >
                                      {exp.company} - {exp.role}
                                      {exp.similarity && (
                                        <span className="ml-1 text-[10px] opacity-70">
                                          {Math.round(exp.similarity * 100)}%
                                        </span>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <FormattedTimestamp timestamp={message.timestamp} />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your interview prep... (e.g., 'I have a Google SDE interview')"
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    size="sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Tips */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setInput("I have an interview with Google for Software Engineer role")}>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-1">🔍 Google Interview</h3>
                <p className="text-xs text-muted-foreground">Get Google-specific prep tips</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setInput("Help me prepare for system design interview")}>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-1">🏗️ System Design</h3>
                <p className="text-xs text-muted-foreground">Learn from design experiences</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setInput("What are common behavioral interview questions?")}>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-1">💬 Behavioral Tips</h3>
                <p className="text-xs text-muted-foreground">Master behavioral questions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;