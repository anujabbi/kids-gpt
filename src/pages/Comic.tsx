import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ComicStyleCard } from "@/components/ComicStyleCard";
import { ComicPanel } from "@/components/ComicPanel";
import { useAuth } from "@/contexts/AuthContext";
import { ComicStyle } from "@/utils/comicPrompts";
import { Comic, ComicGenerationRequest, PanelEditRequest } from "@/types/comic";
import { comicService } from "@/services/comicService";
import { toast } from "@/hooks/use-toast";
import { Loader2, Share, RotateCcw, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function ComicPage() {
  const { user, profile } = useAuth();
  const [storyIdea, setStoryIdea] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle | null>(null);
  const [comic, setComic] = useState<Comic | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [editingPanelIndex, setEditingPanelIndex] = useState<number | null>(null);

  // Check if user is a child
  const isChild = profile?.role === 'child';

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Comic Strip Generator</h1>
            <p className="text-muted-foreground mb-4">Please sign in to create comics</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Comic Strip Generator</h1>
              <p className="text-muted-foreground mb-4">
                Only children can create comics. This feature is designed for kids to express their creativity!
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!storyIdea.trim() || !selectedStyle) {
      toast({
        title: "Missing Information",
        description: "Please enter a story idea and select a comic style.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep("Preparing your comic story...");
    
    try {
      const request: ComicGenerationRequest = {
        storyIdea: storyIdea.trim(),
        comicStyle: selectedStyle,
      };

      setGenerationProgress(25);
      setGenerationStep("Creating panel 1...");
      
      // Simulate progress updates
      setTimeout(() => {
        setGenerationProgress(50);
        setGenerationStep("Creating panel 2...");
      }, 1000);
      
      setTimeout(() => {
        setGenerationProgress(75);
        setGenerationStep("Creating panel 3...");
      }, 2000);

      const newComic = await comicService.generateComic(request);
      
      setGenerationProgress(100);
      setGenerationStep("Finishing up...");
      
      setTimeout(() => {
        setComic(newComic);
        toast({
          title: "Comic Created!",
          description: "Your comic strip has been generated successfully!",
        });
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate comic:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate comic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStep("");
    }
  };

  const handlePanelEdit = (panelIndex: number) => {
    setEditingPanelIndex(panelIndex);
  };

  const handlePanelSave = async (panelIndex: number, prompt: string, caption: string) => {
    if (!comic) return;

    try {
      const request: PanelEditRequest = {
        comicId: comic.id,
        panelIndex,
        prompt,
        caption,
      };

      const updatedPanel = await comicService.regeneratePanel(request);
      
      // Update the comic state
      const updatedPanels = [...comic.panels];
      updatedPanels[panelIndex] = updatedPanel;
      setComic({ ...comic, panels: updatedPanels });
      
      setEditingPanelIndex(null);
      
      toast({
        title: "Panel Updated",
        description: "Your panel has been regenerated successfully!",
      });
    } catch (error) {
      console.error('Failed to regenerate panel:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update panel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (!comic) return;
    
    const shareUrl = `${window.location.origin}/publishedComic/${comic.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Comic link has been copied to clipboard.",
      });
    });
  };

  const handleStartOver = () => {
    setStoryIdea("");
    setSelectedStyle(null);
    setComic(null);
    setEditingPanelIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Comic Strip Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create amazing 3-panel comics with AI!
          </p>
        </div>

        {!comic ? (
          // Input Section
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  What's your comic about?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={storyIdea}
                  onChange={(e) => setStoryIdea(e.target.value)}
                  placeholder="A dinosaur becomes a chef, A superhero who loves donuts, A cat that can fly..."
                  rows={5}
                  className="text-lg min-h-[120px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choose Your Comic Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-3 justify-center">
                  {(['cartoon', 'ghibli', 'superhero'] as ComicStyle[]).map((style) => (
                    <ComicStyleCard
                      key={style}
                      style={style}
                      selected={selectedStyle === style}
                      onSelect={setSelectedStyle}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !storyIdea.trim() || !selectedStyle}
                size="lg"
                className="px-8"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Your Comic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Comic
                  </>
                )}
              </Button>
              
              {isGenerating && (
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-center">{generationStep}</p>
                      <Progress value={generationProgress} className="w-full" />
                      <p className="text-xs text-muted-foreground text-center">
                        This may take a minute or two...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Comic Display
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{comic.title}</h2>
              <p className="text-muted-foreground">"{comic.storyIdea}"</p>
            </div>

            {/* Comic Panels */}
            <div className="flex flex-col md:flex-row gap-2 mb-8 max-w-3xl mx-auto">
              {comic.panels.map((panel, index) => (
                <ComicPanel
                  key={panel.id}
                  panel={panel}
                  panelIndex={index}
                  isEditing={editingPanelIndex === index}
                  onEdit={() => handlePanelEdit(index)}
                  onSave={(prompt, caption) => handlePanelSave(index, prompt, caption)}
                  onCancel={() => setEditingPanelIndex(null)}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleShare} variant="default" size="lg">
                <Share className="h-5 w-5 mr-2" />
                Share Comic
              </Button>
              <Button onClick={handleStartOver} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}