-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  experience_owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experience_id, requester_id)
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat notifications table
CREATE TABLE public.chat_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chat_request', 'new_message')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = experience_owner_id);

CREATE POLICY "Users can create chat requests" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Experience owners can update conversation status" 
ON public.chat_conversations 
FOR UPDATE 
USING (auth.uid() = experience_owner_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id 
    AND (requester_id = auth.uid() OR experience_owner_id = auth.uid())
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can send messages in accepted conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id 
    AND (requester_id = auth.uid() OR experience_owner_id = auth.uid())
    AND status = 'accepted'
  )
);

-- Create policies for chat_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.chat_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.chat_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.chat_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.chat_conversations
ADD CONSTRAINT fk_chat_conversations_experience
FOREIGN KEY (experience_id) REFERENCES public.interview_posts(id) ON DELETE CASCADE;

ALTER TABLE public.chat_messages
ADD CONSTRAINT fk_chat_messages_conversation
FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

ALTER TABLE public.chat_notifications
ADD CONSTRAINT fk_chat_notifications_conversation
FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_chat_conversations_experience_id ON public.chat_conversations(experience_id);
CREATE INDEX idx_chat_conversations_requester_id ON public.chat_conversations(requester_id);
CREATE INDEX idx_chat_conversations_experience_owner_id ON public.chat_conversations(experience_owner_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_chat_notifications_user_id ON public.chat_notifications(user_id);
CREATE INDEX idx_chat_notifications_is_read ON public.chat_notifications(is_read);

-- Create function to update timestamps
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_notifications_updated_at
BEFORE UPDATE ON public.chat_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION public.create_chat_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for new chat request
    IF TG_TABLE_NAME = 'chat_conversations' THEN
      INSERT INTO public.chat_notifications (user_id, conversation_id, type)
      VALUES (NEW.experience_owner_id, NEW.id, 'chat_request');
    END IF;
    
    -- Create notification for new message
    IF TG_TABLE_NAME = 'chat_messages' THEN
      INSERT INTO public.chat_notifications (user_id, conversation_id, type)
      SELECT 
        CASE 
          WHEN NEW.sender_id = c.requester_id THEN c.experience_owner_id
          ELSE c.requester_id
        END,
        NEW.conversation_id,
        'new_message'
      FROM public.chat_conversations c
      WHERE c.id = NEW.conversation_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic notifications
CREATE TRIGGER create_chat_request_notification
AFTER INSERT ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.create_chat_notification();

CREATE TRIGGER create_new_message_notification
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.create_chat_notification();