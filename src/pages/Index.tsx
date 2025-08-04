import { useRef, useEffect, useState } from "react";
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
import { generatePersonalizedSuggestions, getDefaultSuggestions } from "@/utils/personalizedSuggestions";
import { supabase } from "@/integrations/supabase/client";

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

  // Add personality profile state
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);
  const [hasPersonalityProfile, setHasPersonalityProfile] = useState(false);
  const [refreshingSuggestions, setRefreshingSuggestions] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  // Extract reusable function for loading personalized suggestions
  const loadPersonalizedSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { personalityService } = await import('@/services/personalityService');
        const profile = await personalityService.getPersonalityProfile(user.id);
        
        if (profile && (profile.interests.length > 0 || profile.hobbies.length > 0 || profile.readingPreferences.length > 0 || profile.dreamJob)) {
          const suggestions = generatePersonalizedSuggestions(profile);
          setPersonalizedSuggestions(suggestions);
          setHasPersonalityProfile(true);
          console.log('Updated personalized suggestions:', suggestions);
        } else {
          setPersonalizedSuggestions([]);
          setHasPersonalityProfile(false);
        }
      }
    } catch (error) {
      console.error('Failed to load personalized suggestions:', error);
    }
  };

  // Refresh suggestions after a delay to ensure database is updated
  const refreshPersonalizedSuggestions = async () => {
    setRefreshingSuggestions(true);
    // Small delay to ensure the database transaction has completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    await loadPersonalizedSuggestions();
    setRefreshingSuggestions(false);
  };

  // Load personalized suggestions when component mounts
  useEffect(() => {
    loadPersonalizedSuggestions();
  }, []);

  const handleNewChat = (folderId?: string) => {
    createNewConversation(folderId);
  };

  const handlePersonalityQuiz = async () => {
    const quizConversation = await createNewConversation(undefined, 'personality-quiz');
    if (quizConversation) {
      setActiveConversation(quizConversation.id);
      
      // Start with an engaging introduction and first question
      const introMessage = `Hello! I'm so excited to learn about you! 🌟 

I'll ask you some fun questions to get to know the amazing person you are. After each question, you can choose to answer another one or tell me you're ready to learn what makes you special!

**Ready for your first question?** 

🎯 **Question 1:** What are you most interested in? What topics, activities, or subjects make you excited to learn more? Tell me about all the things that spark your curiosity!

*After you answer, just let me know if you'd like another question or if you're ready for me to tell you what makes you amazing!* ✨`;
      
      const assistantMessage = createAssistantMessage(introMessage);
      await addMessageToConversation(quizConversation.id, assistantMessage);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleSendMessage = async (content: string, files?: FileAttachment[]) => {
    let currentConv = getCurrentConversation();
    
    if (!currentConv) {
      currentConv = await createNewConversation();
      if (!currentConv) return;
    }

    const userMessage = createUserMessage(content, files);
    await addMessageToConversation(currentConv.id, userMessage);

    // Check if this is an image generation request
    const imageDetection = detectImageRequest(content);
    
    if (imageDetection.isImageRequest) {
      console.log('Detected image request, generating image with prompt:', imageDetection.extractedPrompt);
      
      const imageResult = await generateImage({
        prompt: imageDetection.extractedPrompt,
        size: '1024x1024',
        quality: 'auto'
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
        const fallbackMessage = createAssistantMessage("I'm sorry, I wasn't able to create an image right now. Let me help you with something else instead!");
        await addMessageToConversation(currentConv.id, fallbackMessage);
      }
    } else {
      const allMessages = [...currentConv.messages, userMessage];
      const result = await generateResponse(allMessages, currentConv.type);
      
      if (result) {
        const assistantMessage = createAssistantMessage(result.response, result.homeworkScore);
        await addMessageToConversation(currentConv.id, assistantMessage);
        
        // Enhanced personality quiz completion detection for sequential quiz
        if (currentConv.type === 'personality-quiz') {
          const response = result.response.toLowerCase();
          
          // Check for quiz completion indicators
          const isQuizComplete = (
            (response.includes('amazing and unique') && response.includes('based on your answers')) ||
            (response.includes('personality') && response.includes('summary') && response.length > 200) ||
            (response.includes('what makes you') && response.includes('special') && response.length > 150) ||
            (response.includes('here\'s what i learned about you') && response.length > 100) ||
            (response.includes('you are someone who') && response.includes('based on') && response.length > 150)
          );
          
          if (isQuizComplete) {
            console.log('Sequential quiz appears to be complete, extracting personality data...');
            // Import personality service dynamically to avoid circular dependencies
            const { personalityService } = await import('@/services/personalityService');
            await personalityService.extractAndSaveFromSequentialQuiz([...allMessages, assistantMessage]);
            
            // Refresh personalized suggestions after quiz completion
            console.log('Quiz completed, refreshing personalized suggestions...');
            await refreshPersonalizedSuggestions();
          }
        }
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
    if (suggestion === "🎨 Create coloring page") {
      const coloringPagePrompt = "Create a black-and-white line drawing for a printable coloring page. The drawing should be simple, bold, and kid-friendly, suitable for children. Avoid small, intricate details. The style should be fun and cartoonish, with clear outlines for easy coloring. Do not include any text, shading, or background clutter.";
      handleSendMessage(coloringPagePrompt);
    } else {
      handleSendMessage(suggestion);
    }
  };

  const currentMessages = getCurrentConversation()?.messages || [];
  const suggestionsToShow = hasPersonalityProfile ? personalizedSuggestions : getDefaultSuggestions();

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
              
              <button 
                onClick={handleHomeClick}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/app-icon.png" 
                  alt="KidsGPT Logo"
                  className="w-8 h-8 rounded-md object-cover"
                />
                
                <h1 
                  className="text-xl font-semibold"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  KidsGPT
                </h1>
              </button>
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
                    className="mb-6"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    I'm here to help you learn, create, and have fun! What would you like to explore?
                  </p>
                  
                  {hasPersonalityProfile && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border border-purple-200">
                        ✨ Personalized suggestions just for you!
                      </span>
                    </div>
                  )}
                  
                  {/* Show loading state when refreshing suggestions */}
                  {refreshingSuggestions && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200">
                        <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                        Updating your suggestions...
                      </span>
                    </div>
                  )}
                  
                  {/* Suggestion buttons */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {suggestionsToShow.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left justify-start h-auto p-4 min-h-[60px] whitespace-normal text-wrap"
                        style={{ 
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border,
                          backgroundColor: currentTheme.colors.surface
                        }}
                        disabled={refreshingSuggestions}
                      >
                        <span className="block w-full">{suggestion}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Personality Quiz Button - moved below and made smaller */}
                  <div className="mt-6">
                    <Button
                      onClick={handlePersonalityQuiz}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 py-2 rounded-full text-sm shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      🌟 Personalize
                    </Button>
                    <p 
                      className="text-xs mt-2"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      Take a fun quiz to get personalized recommendations!
                    </p>
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
