import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ComicStyleCard } from "@/components/ComicStyleCard";
import { ComicPanel } from "@/components/ComicPanel";
import { CharacterGenerationSection } from "@/components/CharacterGenerationSection";
import { useAuth } from "@/contexts/AuthContext";
import { ComicStyle, StoryPlan, ComicPanel as ComicPanelType, ComicCharacter } from "@/types/comic";
import { storyPlanningService } from "@/services/storyPlanningService";
import { useComicPanelGeneration } from "@/hooks/useComicPanelGeneration";
import { toast } from "@/hooks/use-toast";
import { Loader2, Share, RotateCcw, Sparkles, Wand2, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function ComicPage() {
  const { user, profile } = useAuth();
  const [storyIdea, setStoryIdea] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle | null>(null);
  const [storyPlan, setStoryPlan] = useState<StoryPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanelType[]>([]);
  const [characters, setCharacters] = useState<ComicCharacter[]>([]);
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  const [generationPhase, setGenerationPhase] = useState<'story' | 'characters' | 'panels' | 'complete'>('story');
  
  const { generatePanelWithReferences, generateAllPanels, isGenerating: isGeneratingPanels } = useComicPanelGeneration();

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

  const handleGenerateStoryPlan = async () => {
    if (!storyIdea.trim() || !selectedStyle) {
      toast({
        title: "Missing Information",
        description: "Please enter a story idea and select a comic style.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPlan(true);
    
    try {
      const plan = await storyPlanningService.generateStoryPlan(storyIdea.trim(), selectedStyle);
      if (!plan) {
        throw new Error('Failed to generate story plan');
      }
      
      setStoryPlan(plan);
      setCharacters(plan.characters);
      
      // Initialize empty comic panels based on the story plan
      const initialPanels: ComicPanelType[] = plan.panels.map((panelPlan, index) => ({
        id: `panel_${index}`,
        imageUrl: '',
        prompt: panelPlan.image_prompt,
        dialogue: panelPlan.dialogue,
        caption: panelPlan.caption,
        panelType: panelPlan.panel_type
      }));
      
      setComicPanels(initialPanels);
      setGenerationPhase('characters');
      
      toast({
        title: "Story Plan Created!",
        description: "Now let's generate character images for consistency!",
      });
      
    } catch (error) {
      console.error('Failed to generate story plan:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate story plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleStartOver = () => {
    setStoryIdea("");
    setSelectedStyle(null);
    setStoryPlan(null);
    setComicPanels([]);
    setCharacters([]);
    setGenerationPhase('story');
    setEditingPanel(null);
  };

  const handleCharactersUpdate = (updatedCharacters: ComicCharacter[]) => {
    setCharacters(updatedCharacters);
  };

  const handleGenerateComicPanels = async () => {
    if (!selectedStyle || characters.length === 0) return;

    try {
      const generatedPanels = await generateAllPanels(comicPanels, characters, selectedStyle);
      setComicPanels(generatedPanels);
      setGenerationPhase('complete');
      
      toast({
        title: "Comic Complete!",
        description: "Your comic strip has been generated with character consistency!",
      });
    } catch (error) {
      console.error('Failed to generate comic panels:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate comic panels. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPanel = (panelIndex: number) => {
    setEditingPanel(panelIndex);
  };

  const handleSavePanel = async (panelIndex: number, prompt: string, caption: string) => {
    if (!selectedStyle || characters.length === 0) return;

    try {
      // Get previous panel generation ID for reference
      const previousPanelGenerationId = panelIndex > 0 ? comicPanels[panelIndex - 1].generationId : undefined;
      
      // Update panel data
      const updatedPanel = {
        ...comicPanels[panelIndex],
        prompt,
        caption
      };

      // Generate with references
      const generatedPanel = await generatePanelWithReferences(
        updatedPanel,
        panelIndex,
        characters,
        selectedStyle,
        previousPanelGenerationId
      );

      if (generatedPanel) {
        const updatedPanels = [...comicPanels];
        updatedPanels[panelIndex] = generatedPanel;
        setComicPanels(updatedPanels);
        setEditingPanel(null);
        
        toast({
          title: "Panel Regenerated!",
          description: `Panel ${panelIndex + 1} has been updated with character consistency!`,
        });
      }
    } catch (error) {
      console.error(`Failed to regenerate panel ${panelIndex + 1}:`, error);
      toast({
        title: "Regeneration Failed",
        description: `Failed to regenerate panel ${panelIndex + 1}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleCancelPanelEdit = () => {
    setEditingPanel(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out my comic: "${storyPlan?.title}" - ${storyIdea}`).then(() => {
      toast({
        title: "Story Copied!",
        description: "Comic story has been copied to clipboard.",
      });
    });
  };

  const hasGeneratedCharacters = characters.some(char => char.generatedImageUrl);
  const allPanelsGenerated = comicPanels.every(panel => panel.imageUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Comic Strip Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create amazing 3-panel comics with consistent characters using AI!
          </p>
        </div>

        {generationPhase === 'story' ? (
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

            <div className="text-center">
              <Button
                onClick={handleGenerateStoryPlan}
                disabled={isGeneratingPlan || !storyIdea.trim() || !selectedStyle}
                size="lg"
                className="px-8"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Story Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Story Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Comic Generation Workflow
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex gap-8">
              {/* Main Comic Content */}
              <div className="flex-1 space-y-8">
                {/* Generation Progress */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Generation Progress</h3>
                      <span className="text-sm text-muted-foreground">
                        {generationPhase === 'characters' && 'Step 1: Generate Characters'}
                        {generationPhase === 'panels' && 'Step 2: Generate Comic Panels'}
                        {generationPhase === 'complete' && 'Complete!'}
                      </span>
                    </div>
                    
                    {generationPhase === 'characters' && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Generate character images first to ensure consistency across all panels.
                        </p>
                        <Button
                          onClick={() => setGenerationPhase('panels')}
                          disabled={!hasGeneratedCharacters}
                          className="flex items-center gap-2"
                        >
                          {hasGeneratedCharacters ? (
                            <>
                              <ArrowRight className="h-4 w-4" />
                              Generate Comic Panels
                            </>
                          ) : (
                            'Generate characters first'
                          )}
                        </Button>
                      </div>
                    )}

                    {generationPhase === 'panels' && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Now generate all comic panels using character references for consistency.
                        </p>
                        <Button
                          onClick={handleGenerateComicPanels}
                          disabled={isGeneratingPanels}
                          className="flex items-center gap-2"
                        >
                          {isGeneratingPanels ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating Panels...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              Generate All Panels
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comic Panels */}
                {generationPhase === 'complete' && (
                  <div className="flex flex-col gap-6 max-w-lg mx-auto">
                    {comicPanels.map((panel, index) => (
                      <ComicPanel
                        key={panel.id}
                        panel={panel}
                        panelIndex={index}
                        isEditing={editingPanel === index}
                        onEdit={() => handleEditPanel(index)}
                        onSave={(prompt, caption) => handleSavePanel(index, prompt, caption)}
                        onCancel={handleCancelPanelEdit}
                        isGenerating={false}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {generationPhase === 'complete' && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleShare} variant="default" size="lg">
                      <Share className="h-5 w-5 mr-2" />
                      Share Comic Story
                    </Button>
                    <Button onClick={handleStartOver} variant="outline" size="lg">
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Start Over
                    </Button>
                  </div>
                )}
              </div>

              {/* Characters Sidebar */}
              <div className="w-80">
                <CharacterGenerationSection
                  characters={characters}
                  onCharactersUpdate={handleCharactersUpdate}
                  isVisible={generationPhase === 'characters' || generationPhase === 'panels' || generationPhase === 'complete'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}