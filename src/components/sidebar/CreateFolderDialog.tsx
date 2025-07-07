
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({ onCreateFolder, open, onOpenChange }: CreateFolderDialogProps) {
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder}>Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
