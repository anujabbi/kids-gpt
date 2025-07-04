
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
import { detectImageRequest } from "@/utils/imageDetectionUtils";
import { useImageGeneration } from "@/hooks/useImageGeneration";

const Index = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    folders,
    activeConversation,
    loading,
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
  const { generateImage, isGenerating } = useImageGeneration();

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
      currentConv = await createNewConversation();
      if (!currentConv) return; // Failed to create conversation
    }

    const userMessage = createUserMessage(content, files);
    await addMessageToConversation(currentConv.id, userMessage);

    // Check if this is an image generation request
    const imageDetection = detectImageRequest(content);
    
    if (imageDetection.isImageRequest) {
      console.log('Detected image request, generating image with prompt:', imageDetection.extractedPrompt);
      
      // Generate image instead of text response
      const imageResult = await generateImage({
        prompt: imageDetection.extractedPrompt,
        size: '1024x1024',
        style: 'vivid',
        quality: 'standard'
      });
      
      if (imageResult) {
        const assistantMessage = {
          ...createAssistantMessage("Here's the image I created for you!"),
          generatedImage: {
            id: Date.now().toString(),
            url: imageResult.url,
            prompt: imageResult.prompt,
            timestamp: new Date(),
          }
        };
        await addMessageToConversation(currentConv.id, assistantMessage);
      } else {
        // Fallback to text response if image generation fails
        const fallbackMessage = createAssistantMessage("I'm sorry, I wasn't able to create an image right now. Let me help you with something else instead!");
        await addMessageToConversation(currentConv.id, fallbackMessage);
      }
    } else {
      // Normal text response
      const allMessages = [...currentConv.messages, userMessage];
      const result = await generateResponse(allMessages);
      
      if (result) {
        const assistantMessage = createAssistantMessage(result.response, result.homeworkScore);
        await addMessageToConversation(currentConv.id, assistantMessage);
      }
    }
  };

  const handleImageGenerated = async (imageUrl: string, prompt: string) => {
    let currentConv = getCurrentConversation();
    
    if (!currentConv) {
      currentConv = await createNewConversation();
      if (!currentConv) return; // Failed to create conversation
    }

    // Create a user message for the image generation request
    const userMessage = createUserMessage(`Generate an image: ${prompt}`);
    await addMessageToConversation(currentConv.id, userMessage);

    // Create an assistant message with the generated image
    const assistantMessage = {
      ...createAssistantMessage("Here's the image I created for you!"),
      generatedImage: {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date(),
      }
    };
    await addMessageToConversation(currentConv.id, assistantMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle coloring page special case with custom prompt
    if (suggestion === "🎨 Create coloring page") {
      const coloringPagePrompt = "Create a black-and-white line drawing for a printable coloring page. The drawing should be simple, bold, and kid-friendly, suitable for children. Avoid small, intricate details. The style should be fun and cartoonish, with clear outlines for easy coloring. Do not include any text, shading, or background clutter.";
      handleSendMessage(coloringPagePrompt);
    } else {
      handleSendMessage(suggestion);
    }
  };

  const currentMessages = getCurrentConversation()?.messages || [];

  if (loading) {
    return (
      <ThemedComponent variant="background" className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg">Loading your conversations...</div>
        </div>
      </ThemedComponent>
    );
  }

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
              
              {/* Logo */}
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                  boxShadow: `0 2px 8px ${currentTheme.colors.primary}20`
                }}
              >
                <div 
                  className="w-3 h-3 rounded-sm transform rotate-45"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                />
                <div 
                  className="absolute top-1 right-1 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>
              
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
                      "🎨 Draw a magical castle",
                      "🧮 Fun math games",
                      "🧠 Fun quiz",
                      "🌍 Learn about countries",
                      "🎨 Create coloring page"
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSuggestionClick(suggestion)}
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
          <ChatInput 
            onSendMessage={handleSendMessage} 
            onImageGenerated={handleImageGenerated}
            disabled={isTyping}
            isGeneratingImage={isGenerating}
          />
        </div>
      </ThemedComponent>
    </SidebarProvider>
  );
};

export default Index;
