
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { ImageGenerationParams } from "@/services/imageGenerationService";

interface ImageGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
}

export function ImageGenerationDialog({ open, onOpenChange, onImageGenerated }: ImageGenerationDialogProps) {
  const { currentTheme } = useTheme();
  const { generateImage, isGenerating } = useImageGeneration();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1792x1024" | "1024x1792">("1024x1024");
  const [style, setStyle] = useState<"vivid" | "natural">("vivid");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const params: ImageGenerationParams = {
      prompt: prompt.trim(),
      size,
      style,
      quality: 'standard',
    };

    const result = await generateImage(params);
    if (result) {
      onImageGenerated(result.url, result.prompt);
      onOpenChange(false);
      setPrompt("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ backgroundColor: currentTheme.colors.background }}>
        <DialogHeader>
          <DialogTitle style={{ color: currentTheme.colors.text.primary }}>
            <Palette className="inline h-5 w-5 mr-2" />
            Generate Image
          </DialogTitle>
          <DialogDescription style={{ color: currentTheme.colors.text.secondary }}>
            Describe what you'd like me to draw for you!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" style={{ color: currentTheme.colors.text.primary }}>
              What should I draw?
            </Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="A friendly dragon reading a book..."
              disabled={isGenerating}
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: currentTheme.colors.text.primary }}>Size</Label>
              <Select value={size} onValueChange={(value: any) => setSize(value)} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                  <SelectItem value="1792x1024">Wide (1792×1024)</SelectItem>
                  <SelectItem value="1024x1792">Tall (1024×1792)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label style={{ color: currentTheme.colors.text.primary }}>Style</Label>
              <Select value={style} onValueChange={(value: any) => setStyle(value)} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivid">Vivid & Colorful</SelectItem>
                  <SelectItem value="natural">Natural & Realistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Image"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
