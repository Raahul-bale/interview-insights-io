import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Check, X, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, ChatConversation, ChatMessage } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useProfile';

interface ChatWidgetProps {
  experienceId: string;
  experienceOwnerId: string;
  experienceOwnerName: string;
}

const ChatWidget = ({ experienceId, experienceOwnerId, experienceOwnerName }: ChatWidgetProps) => {
  const { user } = useAuth();
  const { profile: ownerProfile } = useProfile(experienceOwnerId);
  const { 
    createConversation, 
    updateConversationStatus, 
    sendMessage, 
    fetchMessages, 
    getCurrentConversation,
    messages,
    loading 
  } = useChat(experienceId);

  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && experienceId) {
      loadConversation();
    }
  }, [user, experienceId]);

  const loadConversation = async () => {
    const conv = await getCurrentConversation();
    setConversation(conv);
    if (conv && conv.status === 'accepted') {
      fetchMessages(conv.id);
    }
  };

  const handleStartChat = async () => {
    if (!user) return;
    const newConv = await createConversation(experienceOwnerId);
    if (newConv) {
      setConversation(newConv);
    }
  };

  const handleAcceptChat = async () => {
    if (!conversation) return;
    await updateConversationStatus(conversation.id, 'accepted');
    await loadConversation();
  };

  const handleDeclineChat = async () => {
    if (!conversation) return;
    await updateConversationStatus(conversation.id, 'declined');
    await loadConversation();
  };

  const handleBlockUser = async () => {
    if (!conversation) return;
    await updateConversationStatus(conversation.id, 'blocked');
    await loadConversation();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !newMessage.trim()) return;
    
    await sendMessage(conversation.id, newMessage);
    setNewMessage('');
  };

  // Don't show chat widget for own experience
  if (user?.id === experienceOwnerId) {
    return null;
  }

  const getStatusBadge = () => {
    if (!conversation) return null;
    
    switch (conversation.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
        case 'accepted':
          return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
        case 'declined':
          return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
        case 'blocked':
          return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Blocked</Badge>;
        default:
          return null;
    }
  };

  const renderChatContent = () => {
    if (!conversation) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chat with Experience Author</h3>
          <p className="text-muted-foreground mb-4">
            Connect with {experienceOwnerName} to ask questions about their interview experience.
          </p>
          <Button onClick={handleStartChat} disabled={loading}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Chat Request
          </Button>
        </div>
      );
    }

    if (conversation.status === 'pending') {
      if (conversation.requester_id === user?.id) {
        return (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat Request Sent</h3>
            <p className="text-muted-foreground mb-4">
              Your chat request has been sent to {experienceOwnerName}. They will be notified and can accept or decline your request.
            </p>
            {getStatusBadge()}
          </div>
        );
      } else {
        return (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">New Chat Request</h3>
            <p className="text-muted-foreground mb-4">
              Someone wants to chat with you about your interview experience.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleAcceptChat} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button onClick={handleDeclineChat} disabled={loading} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button onClick={handleBlockUser} disabled={loading} variant="destructive" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Block
              </Button>
            </div>
          </div>
        );
      }
    }

    if (conversation.status === 'declined') {
      return (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chat Request Declined</h3>
          <p className="text-muted-foreground">
            The chat request was declined. You can send a new request if needed.
          </p>
        </div>
      );
    }

    if (conversation.status === 'blocked') {
      return (
        <div className="text-center py-8">
          <Shield className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Blocked</h3>
          <p className="text-muted-foreground">
            You are blocked from sending chat requests to this user.
          </p>
        </div>
      );
    }

    if (conversation.status === 'accepted') {
      return (
        <div className="flex flex-col h-96">
          <div className="flex items-center gap-3 p-3 border-b">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ownerProfile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{ownerProfile?.full_name || experienceOwnerName}</p>
              {getStatusBadge()}
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3">
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
          
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim() || loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat with Author
          {conversation?.status === 'pending' && (
            <Badge className="ml-2 bg-yellow-500 text-white" variant="secondary">
              {conversation.requester_id === user?.id ? 'Sent' : 'New'}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chat</DialogTitle>
        </DialogHeader>
        {renderChatContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ChatWidget;