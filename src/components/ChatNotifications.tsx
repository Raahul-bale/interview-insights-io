import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircle, Bell, Check, X, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, ChatNotification } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

const ChatNotifications = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    fetchNotifications, 
    markNotificationAsRead, 
    updateConversationStatus 
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchNotificationDetails();
    }
  }, [notifications]);

  const fetchNotificationDetails = async () => {
    try {
      const details = await Promise.all(
        notifications.map(async (notification) => {
          const { data: conversation } = await supabase
            .from('chat_conversations')
            .select(`
              *,
              interview_posts(company, role)
            `)
            .eq('id', notification.conversation_id)
            .single();

          return {
            ...notification,
            conversation,
          };
        })
      );
      setNotificationDetails(details);
    } catch (error) {
      console.error('Error fetching notification details:', error);
    }
  };

  const handleNotificationClick = async (notification: ChatNotification) => {
    await markNotificationAsRead(notification.id);
  };

  const handleAcceptChat = async (conversationId: string, notificationId: string) => {
    await updateConversationStatus(conversationId, 'accepted');
    await markNotificationAsRead(notificationId);
    setIsOpen(false);
  };

  const handleDeclineChat = async (conversationId: string, notificationId: string) => {
    await updateConversationStatus(conversationId, 'declined');
    await markNotificationAsRead(notificationId);
  };

  const NotificationItem = ({ detail }: { detail: any }) => {
    const { profile } = useProfile(
      detail.type === 'chat_request' ? detail.conversation?.requester_id : detail.conversation?.experience_owner_id
    );

    const isNewChatRequest = detail.type === 'chat_request';
    const senderName = profile?.full_name || 'Unknown User';
    const experienceTitle = detail.conversation?.interview_posts 
      ? `${detail.conversation.interview_posts.company} - ${detail.conversation.interview_posts.role}`
      : 'Experience';

    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium truncate">{senderName}</p>
                {isNewChatRequest && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    New Request
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {isNewChatRequest 
                  ? `Wants to chat about: ${experienceTitle}`
                  : `New message about: ${experienceTitle}`
                }
              </p>
              
              <p className="text-xs text-muted-foreground">
                {new Date(detail.created_at).toLocaleString()}
              </p>
              
              {isNewChatRequest && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleAcceptChat(detail.conversation_id, detail.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeclineChat(detail.conversation_id, detail.id)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageCircle className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              variant="destructive"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Chat Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {notificationDetails.length > 0 ? (
              <ScrollArea className="h-96 px-4">
                {notificationDetails.map((detail) => (
                  <NotificationItem key={detail.id} detail={detail} />
                ))}
              </ScrollArea>
            ) : (
              <div className="text-center py-8 px-4">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default ChatNotifications;