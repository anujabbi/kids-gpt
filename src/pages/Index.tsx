import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedComponent } from "@/components/ThemedComponent";
import { getSystemPrompt } from "@/utils/systemPrompts";
import { Message, Conversation, Folder } from "@/types/chat";
import { convertFileToAttachment } from "@/utils/fileUtils";

const Index = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
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

  const generateResponse = async (messages: Message[]): Promise<string> => {
    const apiKey = localStorage.getItem("openai_api_key");
    
    if (!apiKey) {
      throw new Error("OpenAI API key not found. Please add your API key in Settings.");
    }

    try {
      // Get user age from localStorage
      const userAge = localStorage.getItem("user_age");
      
      // Get age-appropriate system message
      const systemMessage = {
        role: "system" as const,
        content: getSystemPrompt(userAge || undefined)
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            systemMessage,
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  };

  const createNewConversation = (folderId?: string): Conversation => {
    const id = Date.now().toString();
    return {
      id,
      title: "New conversation",
      timestamp: new Date(),
      messages: [],
      folderId,
    };
  };

  const handleNewChat = (folderId?: string) => {
    const newConv = createNewConversation(folderId);
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setSidebarOpen(false);
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      timestamp: new Date(),
    };
    setFolders(prev => [newFolder, ...prev]);
    toast({
      title: "Folder created",
      description: `Folder "${name}" has been created.`,
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    // Move conversations from folder to root
    setConversations(prev => prev.map(conv => 
      conv.folderId === folderId 
        ? { ...conv, folderId: undefined }
        : conv
    ));
    
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    toast({
      title: "Folder deleted",
      description: "The folder has been removed and conversations moved to root.",
    });
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, name: newName }
        : folder
    ));
    toast({
      title: "Folder renamed",
      description: `Folder has been renamed to "${newName}".`,
    });
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    let currentConv = getCurrentConversation();
    
    // Create new conversation if none exists
    if (!currentConv) {
      currentConv = createNewConversation();
      setConversations(prev => [currentConv!, ...prev]);
      setActiveConversation(currentConv.id);
    }

    // Convert files to attachments if provided
    const attachments = files ? files.map(convertFileToAttachment) : undefined;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      attachments,
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
      // Get all messages including the current user message
      const allMessages = [...currentConv.messages, userMessage];
      
      const response = await generateResponse(allMessages);
      
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
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
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
      <ThemedComponent variant="background" className="flex min-h-screen w-full">
        <AppSidebar
          onNewChat={handleNewChat}
          conversations={conversations}
          folders={folders}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header 
            className="flex items-center justify-between p-4 border-b"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border 
            }}
          >
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 
                className="text-xl font-semibold"
                style={{ color: currentTheme.colors.text.primary }}
              >
                KidsGPT
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="h-8 w-8"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1">
            {currentMessages.length === 0 ? (
              <ThemedComponent variant="background" className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <h2 
                    className="text-3xl font-bold mb-4"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    How can I help you today?
                  </h2>
                  <p 
                    className="mb-8"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
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
                        className="text-left justify-start h-auto p-4"
                        style={{ 
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border,
                          backgroundColor: currentTheme.colors.surface
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </ThemedComponent>
            ) : (
              <div className="pb-4">
                {currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div 
                    className="flex gap-4 p-6"
                    style={{ backgroundColor: currentTheme.colors.surface }}
                  >
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    >
                      <div className="text-white text-xs font-bold">AI</div>
                    </div>
                    <div className="flex-1">
                      <div 
                        className="text-sm font-medium mb-2"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        KidsGPT
                      </div>
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
      </ThemedComponent>
    </SidebarProvider>
  );
};

export default Index;
