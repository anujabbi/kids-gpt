import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ComicPanel as ComicPanelType } from "@/types/comic";
import { Edit, Loader2 } from "lucide-react";

interface ComicPanelProps {
  panel: ComicPanelType;
  panelIndex: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (prompt: string, caption: string) => Promise<void>;
  onCancel: () => void;
}

export const ComicPanel = ({ 
  panel, 
  panelIndex, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}: ComicPanelProps) => {
  const [editPrompt, setEditPrompt] = useState(panel.prompt);
  const [editCaption, setEditCaption] = useState(panel.caption);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSave = async () => {
    setIsRegenerating(true);
    try {
      await onSave(editPrompt, editCaption);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-background border-2 rounded-lg">
      <CardContent className="p-0">
        {/* Panel Header */}
        <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
          <span className="font-semibold text-sm">Panel {panelIndex + 1}</span>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Image */}
        <div className="aspect-square bg-muted relative">
          <img 
            src={panel.imageUrl} 
            alt={`Panel ${panelIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isRegenerating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Regenerating...</p>
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        {!isEditing ? (
          <div className="p-4 bg-background">
            <p className="text-sm text-center font-medium">{panel.caption}</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Image Prompt</label>
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe the image..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Caption</label>
              <Input
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Panel caption..."
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="sm" 
                disabled={isRegenerating}
                className="flex-1"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate Panel'
                )}
              </Button>
              <Button 
                onClick={onCancel} 
                variant="outline" 
                size="sm"
                disabled={isRegenerating}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};