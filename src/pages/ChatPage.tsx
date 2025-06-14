import { useState } from "react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hi! I'm your AI interview prep assistant. Tell me about your upcoming interview and I'll help you prepare with relevant experiences from other candidates.",
      isUser: false,
      timestamp: "Just now"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      message: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response based on common interview queries
    setTimeout(() => {
      let aiResponse = "";
      const query = inputMessage.toLowerCase();

      if (query.includes("google") || query.includes("interview with google")) {
        aiResponse = `Fetching relevant past experiences for Google interviews...

Based on recent experiences shared by users:

🔍 **Common Google Interview Pattern:**
- Online Assessment (Medium difficulty)
- 2-3 Technical Rounds
- Focus on algorithms, system design, and behavioral questions

📝 **Frequently Asked Questions:**
- Two Sum and variations
- LRU Cache implementation
- System design: URL shortener, chat application
- Behavioral: "Tell me about a time you overcame a challenge"

💡 **Tips from successful candidates:**
- Practice coding on whiteboard/paper
- Explain your thought process clearly
- Ask clarifying questions before jumping to solutions
- Review Google's leadership principles

Would you like me to find specific experiences for your role or dive deeper into any particular round?`;
      } else if (query.includes("microsoft") || query.includes("interview with microsoft")) {
        aiResponse = `Fetching relevant Microsoft interview experiences...

Based on recent user submissions:

🔍 **Microsoft Interview Structure:**
- Coding Assessment
- Technical Interview rounds
- Behavioral assessment

📝 **Common Question Types:**
- Binary trees and graph problems
- Database optimization
- System design scenarios
- Behavioral questions about teamwork

💡 **Success Tips:**
- Emphasize collaboration in behavioral answers
- Show problem-solving approach step by step
- Prepare for questions about Microsoft's products

What specific role are you interviewing for? I can provide more targeted preparation advice.`;
      } else if (query.includes("amazon")) {
        aiResponse = `Fetching Amazon interview insights...

🔍 **Amazon Interview Focus:**
- Leadership Principles are crucial
- Multiple technical rounds
- Bar raiser interview

📝 **Key Areas:**
- Data structures and algorithms
- System design and scalability
- Customer obsession examples
- Ownership and bias for action stories

💡 **Preparation Strategy:**
- Study all 16 Leadership Principles with examples
- Practice STAR method for behavioral questions
- Focus on large-scale system design

Need help with specific leadership principles or technical topics?`;
      } else if (query.includes("prepare") || query.includes("help") || query.includes("tips")) {
        aiResponse = `I'd love to help you prepare! Here's how I can assist:

🎯 **Preparation Areas:**
- Company-specific interview patterns
- Common technical questions
- Behavioral interview strategies
- System design approaches

💬 **Just tell me:**
- Which company you're interviewing with
- What role you're applying for
- Any specific areas you're worried about

I'll pull relevant experiences from our database and give you targeted preparation advice!

What would you like to focus on first?`;
      } else {
        aiResponse = `I understand you're looking for interview preparation help! 

To give you the most relevant advice, could you please tell me:
- Which company you're interviewing with?
- What position you're applying for?
- Any specific concerns or areas you'd like to focus on?

I have access to hundreds of real interview experiences shared by candidates, and I can provide targeted preparation based on your specific situation.`;
      }

      const aiMessage = {
        id: messages.length + 2,
        message: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.message}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground max-w-[80%] rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message... (e.g., 'I have an interview with Google for SDE role')"
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Tips */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setInputMessage("I have an interview with Google for Software Engineer role")}>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-1">Google Interview</h3>
                <p className="text-xs text-muted-foreground">Get Google-specific prep tips</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setInputMessage("Help me prepare for system design interview")}>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-1">System Design</h3>
                <p className="text-xs text-muted-foreground">Learn from design experiences</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setInputMessage("What are common behavioral interview questions?")}>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-sm mb-1">Behavioral Tips</h3>
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