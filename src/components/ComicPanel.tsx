import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ComicPanel as ComicPanelType } from "@/types/comic";
import { Edit, Loader2, Play } from "lucide-react";

interface ComicPanelProps {
  panel: ComicPanelType;
  panelIndex: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (prompt: string, caption: string) => Promise<void>;
  onCancel: () => void;
  isGenerating?: boolean;
}

export const ComicPanel = ({ 
  panel, 
  panelIndex, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  isGenerating = false
}: ComicPanelProps) => {
  const [editPrompt, setEditPrompt] = useState(panel.prompt);
  const [editCaption, setEditCaption] = useState(panel.caption);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Update local state when panel prop changes
  useEffect(() => {
    setEditPrompt(panel.prompt);
    setEditCaption(panel.caption);
  }, [panel.prompt, panel.caption]);

  const handleSave = async () => {
    setIsRegenerating(true);
    try {
      await onSave(editPrompt, editCaption);
    } finally {
      setIsRegenerating(false);
    }
  };

  const hasImage = Boolean(panel.imageUrl);

  return (
    <Card className="relative overflow-hidden bg-background border rounded-md">
      <CardContent className="p-4">
        {!isEditing && hasImage ? (
          <>
            {/* Edit Button Overlay */}
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background rounded-full"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            {/* Generated Image View */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Panel {panelIndex + 1}</h3>
              </div>
              
              <div className="aspect-square bg-muted relative rounded">
                <img 
                  src={panel.imageUrl} 
                  alt={`Panel ${panelIndex + 1}`}
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
                {(isRegenerating || isGenerating) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">{isGenerating ? 'Generating...' : 'Regenerating...'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Panel Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Panel {panelIndex + 1}</h3>
            </div>

            {/* Image Preview (if exists) */}
            {hasImage && (
              <div className="aspect-square bg-muted relative rounded">
                <img 
                  src={panel.imageUrl} 
                  alt={`Panel ${panelIndex + 1}`}
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
                {isRegenerating && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Regenerating...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Image Placeholder */}
            {!hasImage && (
              <div className="aspect-square bg-muted rounded flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Ready to generate</p>
                </div>
              </div>
            )}

            {/* Exact Prompt Editor */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Exact Prompt {hasImage ? '(for regeneration)' : '(will be sent to AI)'}
              </label>
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="The exact prompt that will be sent to the AI..."
                rows={6}
                className="text-sm"
              />
            </div>

            {/* Caption Editor */}
            <div>
              <label className="text-sm font-medium mb-1 block">Caption</label>
              <Textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Panel caption or dialogue..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="sm" 
                disabled={isRegenerating || isGenerating}
                className="flex-1"
              >
                {(isRegenerating || isGenerating) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {hasImage ? 'Regenerating...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {hasImage ? 'Regenerate Panel' : 'Generate Panel'}
                  </>
                )}
              </Button>
              {isEditing && (
                <Button 
                  onClick={onCancel} 
                  variant="outline" 
                  size="sm"
                  disabled={isRegenerating || isGenerating}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};