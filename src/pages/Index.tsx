import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response with some delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      "I understand your question. Let me help you with that.",
      "That's an interesting point. Here's what I think about it...",
      "I'd be happy to assist you with this. Based on what you've asked...",
      "Great question! Here's a comprehensive answer for you.",
      "Let me break this down for you in a clear and helpful way.",
      "I can definitely help with that. Here's my response...",
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const elaboration = `\n\nThis is a simulated response to demonstrate the ChatGPT interface. In a real implementation, this would connect to an AI service like OpenAI's API to generate meaningful responses based on your input: "${userMessage}"`;
    
    return baseResponse + elaboration;
  };

  const createNewConversation = (): Conversation => {
    const id = Date.now().toString();
    return {
      id,
      title: "New conversation",
      timestamp: new Date(),
      messages: [],
    };
  };

  const handleNewChat = () => {
    const newConv = createNewConversation();
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    let currentConv = getCurrentConversation();
    
    // Create new conversation if none exists
    if (!currentConv) {
      currentConv = createNewConversation();
      setConversations(prev => [currentConv!, ...prev]);
      setActiveConversation(currentConv.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === currentConv!.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            title: conv.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : conv.title
          }
        : conv
    ));

    setIsTyping(true);

    try {
      const response = await generateResponse(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConv!.id 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed.",
    });
  };

  const currentMessages = getCurrentConversation()?.messages || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AppSidebar
          onNewChat={handleNewChat}
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-gray-900">ChatGPT</h1>
            </div>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1">
            {currentMessages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-600 mb-8">
                    I'm here to assist you with questions, creative tasks, analysis, and more.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      "Explain quantum computing",
                      "Write a creative story",
                      "Help me plan a trip",
                      "Debug my code"
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-left justify-start h-auto p-4 text-gray-700 hover:bg-gray-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pb-4">
                {currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="flex gap-4 p-6 bg-gray-50">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs font-bold">AI</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-2">ChatGPT</div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
