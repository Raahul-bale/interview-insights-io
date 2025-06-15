import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, User, Clock, Check, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useProfile';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

interface ConversationWithDetails {
  id: string;
  experience_id: string;
  requester_id: string;
  experience_owner_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
  experience?: {
    company: string;
    role: string;
  };
  last_message?: {
    message: string;
    created_at: string;
    sender_id: string;
  };
}

const ChatConversationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchConversations, conversations, updateConversationStatus } = useChat();
  const [conversationsWithDetails, setConversationsWithDetails] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      await fetchConversations();
      
      // Get detailed conversation info (exclude declined conversations)
      const { data: detailedConversations, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          interview_posts(company, role)
        `)
        .or(`requester_id.eq.${user?.id},experience_owner_id.eq.${user?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get last message for each conversation
      const conversationsWithMessages = await Promise.all(
        (detailedConversations || []).map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            experience: conv.interview_posts,
            last_message: lastMessage,
            status: conv.status as 'pending' | 'accepted' | 'declined' | 'blocked'
          } as ConversationWithDetails;
        })
      );

      setConversationsWithDetails(conversationsWithMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const ConversationItem = ({ conversation }: { conversation: ConversationWithDetails }) => {
    const otherUserId = conversation.requester_id === user?.id 
      ? conversation.experience_owner_id 
      : conversation.requester_id;
    
    const { profile: otherUserProfile } = useProfile(otherUserId);
    
    const getStatusBadge = () => {
      switch (conversation.status) {
        case 'pending':
          return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
        case 'accepted':
          return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
        case 'declined':
          return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
        default:
          return null;
      }
    };

    const handleClick = () => {
      if (conversation.status === 'accepted') {
        navigate(`/chat/${conversation.id}`);
      }
    };

    const handleAccept = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await updateConversationStatus(conversation.id, 'accepted');
      loadConversations();
    };

    const handleDecline = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await updateConversationStatus(conversation.id, 'declined');
      loadConversations();
    };

    const handleBlock = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await updateConversationStatus(conversation.id, 'blocked');
      loadConversations();
    };

    return (
      <Card 
        className={`mb-4 transition-colors ${
          conversation.status === 'accepted' ? 'cursor-pointer hover:bg-muted/50' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUserProfile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">
                  {otherUserProfile?.full_name || 'Unknown User'}
                </h3>
                {getStatusBadge()}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                About: {conversation.experience?.company} - {conversation.experience?.role}
              </p>
              
              {conversation.last_message && (
                <div className="bg-muted/30 rounded p-2 mb-2">
                  <p className="text-sm truncate">
                    {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                    {conversation.last_message.message}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {conversation.last_message 
                  ? new Date(conversation.last_message.created_at).toLocaleDateString()
                  : new Date(conversation.created_at).toLocaleDateString()
                }
              </div>

              {/* Show action buttons for pending conversations where current user is the experience owner */}
              {conversation.status === 'pending' && conversation.experience_owner_id === user?.id && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={handleAccept} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    onClick={handleDecline} 
                    variant="outline" 
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                  <Button 
                    onClick={handleBlock} 
                    variant="destructive" 
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Block
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-8">Loading conversations...</h1>
            </div>
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">My Chat Conversations</h1>
            </div>

            {conversationsWithDetails.length > 0 ? (
              <ScrollArea className="h-[600px]">
                {conversationsWithDetails.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
              </ScrollArea>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
                  <p className="text-muted-foreground">
                    Start chatting with experience authors by visiting their posts and clicking "Chat with Author".
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatConversationsPage;