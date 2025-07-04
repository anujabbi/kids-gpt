
import { useParams, useNavigate } from "react-router-dom";
import { useChildConversations } from "@/hooks/useChildConversations";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MessageList } from "@/components/MessageList";
import { ThemedComponent } from "@/components/ThemedComponent";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ChildChatPage = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { 
    conversations, 
    child, 
    activeConversation, 
    loading, 
    setActiveConversation, 
    getCurrentConversation 
  } = useChildConversations(childId || '');

  if (loading) {
    return (
      <ThemedComponent variant="surface" className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8" />
          <div className="text-lg">Loading conversations...</div>
        </div>
      </ThemedComponent>
    );
  }

  if (!child) {
    return (
      <ThemedComponent variant="surface" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Child Not Found</h3>
          <p className="text-sm mb-4" style={{ color: currentTheme.colors.text.secondary }}>
            The requested child could not be found.
          </p>
          <Button onClick={() => navigate('/parents')}>
            Back to Parent Dashboard
          </Button>
        </div>
      </ThemedComponent>
    );
  }

  const currentConversation = getCurrentConversation();

  const handleBackClick = () => {
    navigate('/parents');
  };

  // Transform conversations to include child info for the sidebar
  const conversationsWithChild = conversations.map(conv => ({
    ...conv,
    child: child
  }));

  return (
    <ThemedComponent variant="surface" className="min-h-screen">
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <AppSidebar
            onNewChat={() => {}} // Disabled in read-only mode
            conversations={conversationsWithChild}
            folders={[]} // No folders in child view
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
            onDeleteConversation={() => {}} // Disabled in read-only mode
            onCreateFolder={() => {}} // Disabled in read-only mode
            onDeleteFolder={() => {}} // Disabled in read-only mode
            onRenameFolder={() => {}} // Disabled in read-only mode
          />

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Header with sidebar trigger and breadcrumbs */}
            <div className="border-b p-4" style={{ borderColor: currentTheme.colors.border }}>
              <div className="flex items-center gap-4 mb-3">
                <SidebarTrigger />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackClick}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={handleBackClick} className="cursor-pointer">
                        Parent Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={handleBackClick} className="cursor-pointer">
                        Child Activity
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{child.full_name}'s Conversations</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center gap-3">
                <h1 
                  className="text-xl font-semibold"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {currentConversation ? currentConversation.title : `Viewing ${child.full_name}'s Conversations`}
                </h1>
                <div 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.text.secondary 
                  }}
                >
                  Read Only
                </div>
              </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-hidden">
              {currentConversation ? (
                <div className="h-full overflow-y-auto">
                  <MessageList 
                    messages={currentConversation.messages} 
                    isTyping={false}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {conversations.length === 0 ? 'No Conversations' : 'Select a Conversation'}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      {conversations.length === 0 
                        ? `${child.full_name} hasn't started any conversations yet.`
                        : 'Choose a conversation from the sidebar to view the messages.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemedComponent>
  );
};

export default ChildChatPage;
