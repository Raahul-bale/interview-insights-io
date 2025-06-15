import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, ChatConversation, ChatMessage } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useProfile';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

const ChatConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, fetchMessages, messages } = useChat();
  
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [experienceDetails, setExperienceDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserId = conversation 
    ? (conversation.requester_id === user?.id ? conversation.experience_owner_id : conversation.requester_id)
    : null;
  
  const { profile: otherUserProfile } = useProfile(otherUserId || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      // Get conversation details
      const { data: convData, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      setConversation(convData as ChatConversation);

      // Get experience details
      const { data: expData } = await supabase
        .from('interview_posts')
        .select('company, role')
        .eq('id', convData.experience_id)
        .single();

      setExperienceDetails(expData);

      // Load messages if conversation is accepted
      if (convData.status === 'accepted') {
        fetchMessages(conversationId);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim()) return;
    
    await sendMessage(conversationId, newMessage);
    setNewMessage('');
  };

  if (!conversation) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading conversation...</h2>
          </div>
        </div>
      </>
    );
  }

  if (conversation.status !== 'accepted') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Chat {conversation.status === 'pending' ? 'Pending' : 'Not Available'}
                </h2>
                <p className="text-muted-foreground">
                  {conversation.status === 'pending' 
                    ? 'This chat request is still pending approval.'
                    : 'This chat conversation is no longer available.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="max-w-4xl mx-auto">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUserProfile?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {otherUserProfile?.full_name || 'Chat Conversation'}
                  </CardTitle>
                  {experienceDetails && (
                    <p className="text-sm text-muted-foreground">
                      About: {experienceDetails.company} - {experienceDetails.role}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="h-96 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ChatConversationPage;