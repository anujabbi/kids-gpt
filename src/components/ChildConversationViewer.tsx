
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MessageList } from "@/components/MessageList";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedComponent } from "@/components/ThemedComponent";
import { useParentConversations } from "@/hooks/useParentConversations";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileImageDisplay } from "@/components/ProfileImageDisplay";
import { Badge } from "@/components/ui/badge";

export const ChildConversationViewer = () => {
  const { currentTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    children,
    activeConversation,
    loading,
    setActiveConversation,
    getCurrentConversation,
    getChildForConversation,
  } = useParentConversations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const currentConversation = getCurrentConversation();
  const currentChild = currentConversation ? getChildForConversation(currentConversation) : null;
  const currentMessages = currentConversation?.messages || [];

  if (loading) {
    return (
      <ThemedComponent variant="background" className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg">Loading conversations...</div>
        </div>
      </ThemedComponent>
    );
  }

  if (children.length === 0) {
    return (
      <ThemedComponent variant="background" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No children found</h3>
          <p className="text-muted-foreground">
            No children are currently added to your family.
          </p>
        </div>
      </ThemedComponent>
    );
  }

  return (
    <SidebarProvider>
      <ThemedComponent variant="background" className="flex min-h-screen w-full">
        <AppSidebar
          onNewChat={() => {}} // Disabled for parents
          conversations={conversations}
          folders={[]} // No folders for parent view
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
          onDeleteConversation={() => {}} // Disabled for parents
          onCreateFolder={() => {}} // Disabled for parents
          onDeleteFolder={() => {}} // Disabled for parents
          onRenameFolder={() => {}} // Disabled for parents
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
                Child Activity Monitor
              </h1>

              {currentChild && (
                <Badge variant="secondary" className="ml-4">
                  Viewing: {currentChild.full_name}
                </Badge>
              )}
            </div>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1">
            {!currentConversation ? (
              <ThemedComponent variant="background" className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <h2 
                    className="text-2xl font-bold mb-4"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    Monitor Your Children's Conversations
                  </h2>
                  <p 
                    className="mb-6"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    Select a conversation from the sidebar to view your child's chat history and safety scores.
                  </p>
                  
                  {/* Show children summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {children.map((child) => {
                      const childConversations = conversations.filter(conv => (conv as any).userId === child.id);
                      return (
                        <div 
                          key={child.id}
                          className="p-4 border rounded-lg"
                          style={{ 
                            borderColor: currentTheme.colors.border,
                            backgroundColor: currentTheme.colors.surface 
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <ProfileImageDisplay
                              userId={child.id}
                              isUser={false}
                              size="sm"
                            />
                            <h3 
                              className="font-semibold"
                              style={{ color: currentTheme.colors.text.primary }}
                            >
                              {child.full_name}
                            </h3>
                          </div>
                          <p 
                            className="text-sm"
                            style={{ color: currentTheme.colors.text.secondary }}
                          >
                            {childConversations.length} conversation{childConversations.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ThemedComponent>
            ) : (
              <>
                <MessageList messages={currentMessages} isTyping={false} />
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>

          {/* No input for parents - read-only view */}
          {currentConversation && (
            <div 
              className="p-4 border-t text-center text-sm"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.secondary 
              }}
            >
              📖 Read-only view - You are monitoring {currentChild?.full_name}'s conversation
            </div>
          )}
        </div>
      </ThemedComponent>
    </SidebarProvider>
  );
};
