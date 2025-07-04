
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarHeader as SidebarHeaderBase } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { UserProfileSection } from "./UserProfileSection";
import { CreateFolderDialog } from "./CreateFolderDialog";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isParentView: boolean;
  onNewChat: (folderId?: string) => void;
  onCreateFolder: (name: string) => void;
}

export function SidebarHeader({ 
  isCollapsed, 
  isParentView, 
  onNewChat, 
  onCreateFolder 
}: SidebarHeaderProps) {
  const { currentTheme } = useTheme();

  return (
    <SidebarHeaderBase 
      className="p-4 border-b"
      style={{ borderColor: currentTheme.colors.border }}
    >
      {!isCollapsed && (
        <>
          <UserProfileSection isCollapsed={isCollapsed} />

          {!isParentView && (
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => onNewChat()}
                className="flex-1 border"
                style={{
                  backgroundColor: currentTheme.colors.secondary,
                  color: currentTheme.colors.text.primary,
                  borderColor: currentTheme.colors.border
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
              <CreateFolderDialog onCreateFolder={onCreateFolder} />
            </div>
          )}
        </>
      )}
      {isCollapsed && (
        <div className="space-y-2">
          <UserProfileSection isCollapsed={isCollapsed} />
          
          {!isParentView && (
            <>
              <Button
                onClick={() => onNewChat()}
                size="icon"
                className="border"
                style={{
                  backgroundColor: currentTheme.colors.secondary,
                  color: currentTheme.colors.text.primary,
                  borderColor: currentTheme.colors.border
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <CreateFolderDialog onCreateFolder={onCreateFolder} isIconOnly />
            </>
          )}
        </div>
      )}
    </SidebarHeaderBase>
  );
}
