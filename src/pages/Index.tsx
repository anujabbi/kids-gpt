
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ChatInput } from "@/components/ChatInput";
import { MessageList } from "@/components/MessageList";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedComponent } from "@/components/ThemedComponent";
import { FileAttachment } from "@/types/chat";
import { useConversations } from "@/hooks/useConversations";
import { useOpenAI } from "@/hooks/useOpenAI";
import { createUserMessage, createAssistantMessage } from "@/utils/messageUtils";

const Index = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    folders,
    activeConversation,
    setActiveConversation,
    getCurrentConversation,
    createNewConversation,
    addMessageToConversation,
    deleteConversation,
    createFolder,
    deleteFolder,
    renameFolder,
  } = useConversations();

  const { generateResponse, isTyping } = useOpenAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  const handleNewChat = (folderId?: string) => {
    createNewConversation(folderId);
  };

  const handleSendMessage = async (content: string, files?: FileAttachment[]) => {
    let currentConv = getCurrentConversation();
    
    if (!currentConv) {
      currentConv = createNewConversation();
    }

    const userMessage = createUserMessage(content, files);
    addMessageToConversation(currentConv.id, userMessage);

    const allMessages = [...currentConv.messages, userMessage];
    const result = await generateResponse(allMessages);
    
    if (result) {
      const assistantMessage = createAssistantMessage(result.response, result.homeworkScore);
      addMessageToConversation(currentConv.id, assistantMessage);
    }
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
          onSelectConversation={setActiveConversation}
          onDeleteConversation={deleteConversation}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
          onRenameFolder={renameFolder}
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
            <AppHeader />
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1">
            {currentMessages.length === 0 ? (
              <ThemedComponent variant="background" className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-4xl">
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
                    I'm here to help you learn, create, and have fun! What would you like to explore?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      "🦕 Cool dinosaur facts",
                      "🎨 Write a fun story",
                      "🧮 Fun math games",
                      "🧠 Fun quiz",
                      "🌍 Learn about countries",
                      "🎵 Music and instruments"
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
              <>
                <MessageList messages={currentMessages} isTyping={isTyping} />
                <div ref={messagesEndRef} />
              </>
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
