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
    if (!input.trim() || isLoading || isInitializing) return;

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
      const { data: experiences, error } = await supabase
        .from('interview_posts')
        .select('*')
        .or(`company.ilike.%${userMessage.text.toLowerCase()}%,role.ilike.%${userMessage.text.toLowerCase()}%,full_text.ilike.%${userMessage.text.toLowerCase()}%`)
        .limit(5);

      let relevantExperiences: RelevantExperience[] = [];
      let contextText = "";

      if (experiences && experiences.length > 0) {
        relevantExperiences = experiences.map(exp => ({
          id: exp.id,
          company: exp.company,
          role: exp.role,
          snippet: exp.full_text ? exp.full_text.substring(0, 100) + "..." : ""
        }));

        contextText = experiences.map(exp => 
          `${exp.company} ${exp.role} interview: ${exp.full_text}`
        ).join('\n\n');
      }

      // Generate AI response using local model
      let aiResponse = "I understand you're looking for interview advice. Based on the experiences in our database, here are some general tips:\n\n";

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
            return_full_text: false
          });

          if (result && result[0] && result[0].generated_text) {
            aiResponse = result[0].generated_text.trim();
          }
        } catch (aiError) {
          console.error('AI generation error:', aiError);
          // Fallback response
          if (relevantExperiences.length > 0) {
            aiResponse = `I found ${relevantExperiences.length} relevant interview experience(s) for your query. Here are some key insights:\n\n`;
            aiResponse += relevantExperiences.map(exp => 
              `• ${exp.company} - ${exp.role}: ${exp.snippet}`
            ).join('\n');
          } else {
            aiResponse = "I'd be happy to help with your interview preparation! Could you provide more specific details about the company, role, or type of interview you're preparing for?";
          }
        }
      } else {
        // Fallback when AI is not ready
        if (relevantExperiences.length > 0) {
          aiResponse = `I found ${relevantExperiences.length} relevant interview experience(s) that might help:\n\n`;
          aiResponse += relevantExperiences.map(exp => 
            `• ${exp.company} - ${exp.role}: ${exp.snippet}`
          ).join('\n');
        } else {
          aiResponse = "I'd be happy to help with your interview preparation! Could you provide more specific details about the company, role, or type of interview you're preparing for?";
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
                        "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                        message.sender === "user" 
                          ? "bg-primary text-primary-foreground ml-12" 
                          : "bg-muted text-foreground mr-12"
                      )}>
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{message.text}</span>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            
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