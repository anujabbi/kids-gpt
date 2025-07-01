
import { useState } from "react";
import { Folder, ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";

interface Folder {
  id: string;
  name: string;
  timestamp: Date;
}

interface FolderSectionProps {
  folder: Folder;
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  onDelete: (folderId: string) => void;
  children?: React.ReactNode;
}

export function FolderSection({
  folder,
  isExpanded,
  isCollapsed,
  onToggle,
  onNewChat,
  onRename,
  onDelete,
  children
}: FolderSectionProps) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const { currentTheme } = useTheme();

  const handleRenameFolder = (folderId: string) => {
    if (editingFolderName.trim()) {
      onRename(folderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  const startRenaming = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  return (
    <div className="mb-2">
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={onToggle}
          className="group w-full p-3 rounded-lg transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: currentTheme.colors.text.primary
          }}
        >
          {isExpanded ? (
            <ChevronDown 
              className="h-4 w-4" 
              style={{ color: currentTheme.colors.text.secondary }}
            />
          ) : (
            <ChevronRight 
              className="h-4 w-4" 
              style={{ color: currentTheme.colors.text.secondary }}
            />
          )}
          <Folder 
            className="h-4 w-4" 
            style={{ color: currentTheme.colors.text.secondary }}
          />
          {!isCollapsed && (
            <span className="flex-1 text-sm truncate text-left">
              {editingFolderId === folder.id ? (
                <Input
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onBlur={() => handleRenameFolder(folder.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameFolder(folder.id);
                    } else if (e.key === 'Escape') {
                      setEditingFolderId(null);
                      setEditingFolderName("");
                    }
                  }}
                  className="h-6 text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary
                  }}
                  autoFocus
                />
              ) : (
                folder.name
              )}
            </span>
          )}
        </SidebarMenuButton>
        {!isCollapsed && (
          <div className="flex gap-1">
            <Button
              onClick={() => onNewChat(folder.id)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-opacity-20"
              style={{ 
                color: currentTheme.colors.text.secondary,
                backgroundColor: 'transparent'
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startRenaming(folder);
              }}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-opacity-20"
              style={{ 
                color: currentTheme.colors.text.secondary,
                backgroundColor: 'transparent'
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder.id);
              }}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-opacity-20"
              style={{ 
                color: currentTheme.colors.text.secondary,
                backgroundColor: 'transparent'
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </SidebarMenuItem>
      
      {/* Conversations in folder */}
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
