import { useState, useRef, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import AboutUs from "@/components/AboutUs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatService, type RelevantExperience } from "@/services/chatService";

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
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load chat from session storage
    if (typeof window !== 'undefined') {
      const savedMessages = sessionStorage.getItem('chatMessages');
      if (savedMessages) {
        try {
          return JSON.parse(savedMessages);
        } catch (error) {
          console.error('Failed to parse saved messages:', error);
        }
      }
    }
    return [
      {
        id: "welcome-1",
        sender: "ai",
        text: "Hi! I'm your AI interview prep assistant. I can help you prepare for interviews based on real candidate experiences. Ask me about specific companies, roles, or interview types!",
        timestamp: Date.now()
      }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Save messages to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Clear chat on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('chatMessages');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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

    console.log('Chat: Starting submission, isLoading:', isLoading);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    console.log('Chat: Set loading to true');

    const aiThinkingMessage: ChatMessage = {
      id: `ai-thinking-${Date.now()}`,
      sender: "ai",
      text: "Thinking and checking past experiences...",
      isLoading: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiThinkingMessage]);
    scrollToBottom();

    // Add timeout as fallback
    const timeoutId = setTimeout(() => {
      console.log('Chat: Timeout reached, forcing loading to false');
      setIsLoading(false);
    }, 30000); // 30 second timeout

    try {
      console.log('Chat: Calling chatService');
      const response = await chatService.getChatResponse({ query: userMessage.text });
      console.log('Chat: Got response from chatService', response);
      
      clearTimeout(timeoutId);
      
      const aiResponseMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.advice,
        timestamp: Date.now(),
        relevantExperiences: response.relevantExperienceSnippets
      };

      setMessages(prev => prev.filter(msg => msg.id !== aiThinkingMessage.id).concat(aiResponseMessage));

      // Show success message if experiences were found
      if (response.relevantExperienceSnippets && response.relevantExperienceSnippets.length > 0) {
        toast({
          title: "Found relevant experiences!",
          description: `Based on ${response.relevantExperienceSnippets.length} similar interview experiences.`,
        });
      }

    } catch (error) {
      console.error('Chat: Error in handleSubmit:', error);
      clearTimeout(timeoutId);
      
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: error instanceof Error ? error.message : "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== aiThinkingMessage.id).concat(errorMessage));
      
      toast({
        title: "Processing Error",
        description: "Unable to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('Chat: Setting loading to false');
      clearTimeout(timeoutId);
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

  const chatPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Interview Prep Assistant",
    "description": "Get personalized interview preparation based on real experiences with our AI assistant",
    "url": "https://your-domain.com/chat",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Interview Prep AI Assistant",
      "applicationCategory": "BusinessApplication",
      "description": "AI-powered interview preparation based on real candidate experiences"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="AI Interview Prep Assistant - Interview Insights"
        description="Get personalized interview preparation based on real experiences. Chat with our AI assistant for company-specific tips, behavioral questions, and technical interview advice."
        keywords="AI interview preparation, interview assistant, personalized interview coaching, interview chat bot, AI career advice"
        canonicalUrl="/chat"
        schema={chatPageSchema}
      />
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
            <CardHeader className="border-b flex-shrink-0">
              <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                  <div className="p-4 space-y-4">
                    {messages.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex w-full",
                          message.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                         <div className={cn(
                            "max-w-[80%] rounded-lg px-4 py-3 text-sm break-words overflow-hidden",
                            message.sender === "user" 
                              ? "bg-primary text-primary-foreground ml-auto" 
                              : "bg-muted text-foreground mr-auto"
                          )}>
                          {message.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{message.text}</span>
                            </div>
                          ) : (
                            <>
                              <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.text}</div>
                              
                              {/* Show relevant experiences for AI messages */}
                               {message.sender === "ai" && message.relevantExperiences && message.relevantExperiences.length > 0 && (
                                 <div className="mt-3 pt-2 border-t border-muted-foreground/20">
                                   <p className="text-xs text-muted-foreground mb-2 flex items-center">
                                     <Bot className="h-3 w-3 mr-1" />
                                     Based on {message.relevantExperiences.length} relevant experiences (click to view details):
                                   </p>
                                   <div className="flex flex-wrap gap-1">
                                     {message.relevantExperiences.map((exp, index) => (
                                       <Link 
                                         key={exp.id} 
                                         to={`/experience/${exp.id}`}
                                         className="inline-block"
                                       >
                                         <Badge 
                                           variant="secondary" 
                                           className="text-xs px-2 py-1 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1"
                                         >
                                           {exp.company} - {exp.role}
                                           <ExternalLink className="h-2 w-2" />
                                         </Badge>
                                       </Link>
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
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="border-t bg-background flex-shrink-0">
                <div className="p-4">
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
                    Press Enter to send, Shift+Enter for new line | Loading: {isLoading ? 'Yes' : 'No'}
                  </p>
                </div>
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

      <AboutUs />
    </div>
  );
};

export default ChatPage;