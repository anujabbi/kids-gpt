
-- Create conversation_folders table for organizing conversations
CREATE TABLE public.conversation_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table to store conversation metadata
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  folder_id UUID REFERENCES public.conversation_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table to store individual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  attachments JSONB,
  generated_image JSONB,
  homework_misuse_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.conversation_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_folders
CREATE POLICY "Users can view their own folders" 
  ON public.conversation_folders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
  ON public.conversation_folders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
  ON public.conversation_folders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
  ON public.conversation_folders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages from their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (conversation_id IN (
    SELECT id FROM public.conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages in their conversations" 
  ON public.messages 
  FOR UPDATE 
  USING (conversation_id IN (
    SELECT id FROM public.conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete messages from their conversations" 
  ON public.messages 
  FOR DELETE 
  USING (conversation_id IN (
    SELECT id FROM public.conversations WHERE user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_conversation_folders_user_id ON public.conversation_folders(user_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_folder_id ON public.conversations(folder_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
