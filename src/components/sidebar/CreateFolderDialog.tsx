
import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => void;
  isIconOnly?: boolean;
}

export function CreateFolderDialog({ onCreateFolder, isIconOnly = false }: CreateFolderDialogProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme } = useTheme();

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="border"
          style={{
            backgroundColor: currentTheme.colors.secondary,
            color: currentTheme.colors.text.primary,
            borderColor: currentTheme.colors.border
          }}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder to organize your conversations.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateFolder();
            }
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder}>Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
