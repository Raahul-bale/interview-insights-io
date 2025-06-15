import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatConversation {
  id: string;
  experience_id: string;
  requester_id: string;
  experience_owner_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatNotification {
  id: string;
  user_id: string;
  conversation_id: string;
  type: 'chat_request' | 'new_message';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useChat = (experienceId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Create a new chat conversation
  const createConversation = async (experienceOwnerId: string) => {
    if (!user || !experienceId) return null;

    try {
      setLoading(true);
      
      // Check if there's already a conversation for this experience
      const { data: existingConv, error: checkError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('requester_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      // If conversation exists, handle based on status
      if (existingConv) {
        if (existingConv.status === 'pending') {
          toast({
            title: "Chat Request Already Sent",
            description: "You already have a pending chat request with this user.",
            variant: "destructive",
          });
          return null;
        } else if (existingConv.status === 'accepted') {
          toast({
            title: "Chat Already Active",
            description: "You already have an active chat with this user.",
            variant: "destructive",
          });
          return null;
        } else if (existingConv.status === 'blocked') {
          toast({
            title: "Request Blocked",
            description: "You are blocked from sending chat requests to this user.",
            variant: "destructive",
          });
          return null;
        }
        // If declined, allow creating a new request (update existing to pending)
        else if (existingConv.status === 'declined') {
          const { data, error } = await supabase
            .from('chat_conversations')
            .update({ 
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingConv.id)
            .select()
            .single();

          if (error) throw error;

          toast({
            title: "Chat Request Sent",
            description: "Your chat request has been sent to the experience author.",
          });

          return data as ChatConversation;
        }
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          experience_id: experienceId,
          requester_id: user.id,
          experience_owner_id: experienceOwnerId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Chat Request Sent",
        description: "Your chat request has been sent to the experience author.",
      });

      return data as ChatConversation;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to send chat request.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update conversation status (accept/decline/block)
  const updateConversationStatus = async (conversationId: string, status: 'accepted' | 'declined' | 'blocked') => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Chat Request Accepted" : status === 'blocked' ? "User Blocked" : "Chat Request Declined",
        description: status === 'accepted' 
          ? "You can now chat with this user." 
          : status === 'blocked'
          ? "User has been blocked from sending you chat requests."
          : "Chat request has been declined.",
      });

      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error('Error updating conversation status:', error);
      toast({
        title: "Error",
        description: "Failed to update chat request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, message: string) => {
    if (!user || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message: message.trim()
        });

      if (error) throw error;

      // Refresh messages
      fetchMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`requester_id.eq.${user.id},experience_owner_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations((data || []) as ChatConversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as ChatNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get conversation for current experience
  const getCurrentConversation = async () => {
    if (!user || !experienceId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('requester_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ChatConversation;
    } catch (error) {
      console.error('Error getting current conversation:', error);
      return null;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Create unique channel names to avoid conflicts when hook is used in multiple components
    const channelId = Math.random().toString(36).substring(7);
    
    const conversationsChannel = supabase
      .channel(`chat-conversations-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `requester_id=eq.${user.id}`
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `experience_owner_id=eq.${user.id}`
        },
        () => fetchConversations()
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel(`chat-notifications-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  // Get blocked users for an experience
  const getBlockedUsers = async (experienceId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('experience_owner_id', user.id)
        .eq('status', 'blocked');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  };

  // Unblock a user
  const unblockUser = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'declined' })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "User Unblocked",
        description: "User has been unblocked and can send chat requests again.",
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user.",
        variant: "destructive",
      });
    }
  };

  return {
    conversations,
    messages,
    notifications,
    loading,
    createConversation,
    updateConversationStatus,
    sendMessage,
    fetchConversations,
    fetchMessages,
    fetchNotifications,
    markNotificationAsRead,
    getCurrentConversation,
    getBlockedUsers,
    unblockUser
  };
};