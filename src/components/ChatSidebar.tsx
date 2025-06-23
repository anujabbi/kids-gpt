
import { useState } from "react";
import { Plus, MessageSquare, Trash2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onNewChat,
  conversations,
  activeConversation,
  onSelectConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 w-64 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">ChatGPT</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={onNewChat}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New chat
          </Button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 py-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  activeConversation === conversation.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 mr-3 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conversation.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            ChatGPT Clone by Lovable
          </div>
        </div>
      </div>
    </>
  );
}
