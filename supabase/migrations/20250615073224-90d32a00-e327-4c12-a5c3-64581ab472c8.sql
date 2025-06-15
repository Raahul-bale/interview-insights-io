-- Add policy to allow requesters to update their own conversations
CREATE POLICY "Requesters can update their own conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (auth.uid() = requester_id);