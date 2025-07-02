
-- Update RLS policy for conversations to allow parents to view their children's conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view their own and family conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    user_id IN (
      SELECT p.id 
      FROM public.profiles p
      JOIN public.profiles parent ON parent.id = auth.uid()
      WHERE p.family_id = parent.family_id 
      AND parent.role = 'parent'
      AND p.role = 'child'
    )
  );

-- Update RLS policy for messages to allow parents to view their children's messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;

CREATE POLICY "Users can view messages from their own and family conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.user_id = auth.uid() OR 
      c.user_id IN (
        SELECT p.id 
        FROM public.profiles p
        JOIN public.profiles parent ON parent.id = auth.uid()
        WHERE p.family_id = parent.family_id 
        AND parent.role = 'parent'
        AND p.role = 'child'
      )
    )
  );
