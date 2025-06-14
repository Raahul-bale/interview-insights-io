import { useState, useRef, useEffect, FormEvent } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hi! I'm your AI interview prep assistant powered by real candidate experiences. Tell me about your upcoming interview and I'll help you prepare with insights from others who've been through similar processes.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage.text }
      });

      if (error) {
        console.error('AI chat error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      const aiResponseMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.response || 'Sorry, I could not generate a response.',
        timestamp: Date.now(),
        sources: data.sources || [],
        relevantExperiences: data.relevantExperiences || []
      };

      setMessages(prev => prev.filter(msg => msg.id !== aiThinkingMessage.id).concat(aiResponseMessage));

      // Show success message if sources were found
      if (data.sources && data.sources.length > 0) {
        toast({
          title: "Found relevant experiences!",
          description: `Based on ${data.sources.length} similar interview experiences.`,
        });
      }

    } catch (error) {
      console.error('Error calling AI chat:', error);
      
      let errorText = "Sorry, I encountered an error while processing your request. Please try again.";
      if (error instanceof Error && error.message) {
        errorText = error.message;
      }

      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: errorText,
        timestamp: Date.now(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== aiThinkingMessage.id).concat(errorMessage));
      
      toast({
        title: "Connection Error",
        description: "Unable to get AI response. Please try again.",
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