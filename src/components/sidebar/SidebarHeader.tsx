
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, User, BookOpen } from "lucide-react";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isParentView: boolean;
  onNewChat: (folderId?: string) => void;
  onCreateFolder: (name: string) => void;
}

export function SidebarHeader({ isCollapsed, isParentView, onNewChat, onCreateFolder }: SidebarHeaderProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleMyPageClick = () => {
    navigate('/my-page');
  };

  const handleComicClick = () => {
    navigate('/comic');
  };

  if (isCollapsed) {
    return (
      <div className="p-4 border-b">
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onNewChat()}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleComicClick}
            size="sm"
            className="w-full"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowCreateFolder(true)}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          {profile?.role === 'child' && (
            <Button
              onClick={handleMyPageClick}
              size="sm"
              variant="secondary"
              className="w-full"
            >
              <User className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CreateFolderDialog 
          open={showCreateFolder}
          onOpenChange={setShowCreateFolder}
          onCreateFolder={onCreateFolder}
        />
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      <div className="space-y-2">
        <Button
          onClick={() => onNewChat()}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isParentView ? "New Child Chat" : "New Chat"}
        </Button>
        
        <Button
          onClick={handleComicClick}
          className="w-full justify-start"
          size="sm"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          New Comic Strip
        </Button>

        <Button
          onClick={() => setShowCreateFolder(true)}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>

        {profile?.role === 'child' && (
          <Button
            onClick={handleMyPageClick}
            variant="secondary"
            className="w-full justify-start"
            size="sm"
          >
            <User className="mr-2 h-4 w-4" />
            My Personal Page
          </Button>
        )}
      </div>

      <CreateFolderDialog 
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onCreateFolder={onCreateFolder}
      />
    </div>
  );
}
