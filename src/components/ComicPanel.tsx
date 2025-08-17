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
  onSave: (prompt: string) => Promise<void>;
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
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Update local state when panel prop changes
  useEffect(() => {
    setEditPrompt(panel.prompt);
  }, [panel.prompt]);

  const handleSave = async () => {
    setIsRegenerating(true);
    try {
      await onSave(editPrompt);
    } finally {
      setIsRegenerating(false);
    }
  };

  const hasImage = Boolean(panel.imageUrl);

  return (
    <Card className="relative overflow-hidden bg-background border rounded-md">
      <CardContent className="p-4">
        {!isEditing ? (
          <>
            {/* Generated Image View */}
            <div className="space-y-3">
              <div className="aspect-square bg-muted relative rounded">
                {hasImage ? (
                  <>
                    <img 
                      src={panel.imageUrl} 
                      alt={`Comic panel`}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
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
                    {(isRegenerating || isGenerating) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                        <div className="text-white text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">{isGenerating ? 'Generating...' : 'Regenerating...'}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Ready to generate</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="mt-2"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit & Generate
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dialogue Section */}
              {panel.dialogue && (
                <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Dialogue:</div>
                  <div className="text-sm italic">{panel.dialogue}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* AI Prompt in Image Space */}
            <div className="aspect-square bg-muted relative rounded p-4 flex flex-col">
              <label className="text-sm font-medium mb-2 block">
                Message to AI to generate image
              </label>
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe what you want the AI to generate for this panel..."
                className="text-sm flex-1 resize-none bg-background"
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
              <Button 
                onClick={onCancel} 
                variant="outline" 
                size="sm"
                disabled={isRegenerating || isGenerating}
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