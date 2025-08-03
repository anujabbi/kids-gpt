import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ComicStyleCard } from "@/components/ComicStyleCard";
import { ComicPanel } from "@/components/ComicPanel";
import { useAuth } from "@/contexts/AuthContext";
import { ComicStyle, StoryPlan, ComicPanel as ComicPanelType } from "@/types/comic";
import { storyPlanningService } from "@/services/storyPlanningService";
import { imageGenerationService } from "@/services/imageGenerationService";
import { generateProfessionalImagePrompt } from "@/utils/comicPrompts";
import { toast } from "@/hooks/use-toast";
import { Loader2, Share, RotateCcw, Sparkles, Play, Edit2, Check, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function ComicPage() {
  const { user, profile } = useAuth();
  const [storyIdea, setStoryIdea] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle | null>(null);
  const [storyPlan, setStoryPlan] = useState<StoryPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanelType[]>([]);
  const [generatingPanels, setGeneratingPanels] = useState<boolean[]>([false, false, false]);
  const [editingCharacter, setEditingCharacter] = useState<number | null>(null);
  const [editedCharacter, setEditedCharacter] = useState<{ description: string; visualDescription: string } | null>(null);
  const [editingPanel, setEditingPanel] = useState<number | null>(null);

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
      
      toast({
        title: "Story Plan Created!",
        description: "Your funny comic story is ready. Now generate each panel!",
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
    setGeneratingPanels([false, false, false]);
  };

  const handleEditCharacter = (index: number) => {
    const character = storyPlan?.characters[index];
    if (character) {
      setEditingCharacter(index);
      setEditedCharacter({
        description: character.description,
        visualDescription: character.visualDescription
      });
    }
  };

  const handleSaveCharacter = (index: number) => {
    if (!storyPlan || !editedCharacter) return;

    const updatedStoryPlan = {
      ...storyPlan,
      characters: storyPlan.characters.map((char, i) => 
        i === index 
          ? { ...char, description: editedCharacter.description, visualDescription: editedCharacter.visualDescription }
          : char
      )
    };
    
    setStoryPlan(updatedStoryPlan);
    setEditingCharacter(null);
    setEditedCharacter(null);
    
    toast({
      title: "Character Updated!",
      description: "Character details have been saved successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditingCharacter(null);
    setEditedCharacter(null);
  };

  const handleEditPanel = (panelIndex: number) => {
    setEditingPanel(panelIndex);
  };

  const handleSavePanel = async (panelIndex: number, prompt: string, caption: string) => {
    if (!storyPlan || !selectedStyle || !profile?.family_id) return;

    const newGeneratingPanels = [...generatingPanels];
    newGeneratingPanels[panelIndex] = true;
    setGeneratingPanels(newGeneratingPanels);

    try {
      const characterDescriptions = storyPlan.characters
        .map(char => `${char.name}: ${char.visualDescription}`)
        .join('. ');
      
      const enhancedPrompt = generateProfessionalImagePrompt(
        prompt,
        comicPanels[panelIndex].panelType,
        selectedStyle,
        panelIndex + 1,
        characterDescriptions,
        comicPanels[panelIndex].dialogue
      );

      const generatedImage = await imageGenerationService.generateImage(
        {
          prompt: enhancedPrompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        },
        profile.family_id
      );

      // Update the panel with the new prompt, caption and generated image
      const updatedPanels = [...comicPanels];
      updatedPanels[panelIndex] = {
        ...updatedPanels[panelIndex],
        imageUrl: generatedImage.url,
        prompt,
        caption
      };
      setComicPanels(updatedPanels);
      setEditingPanel(null);
      
      toast({
        title: "Panel Regenerated!",
        description: `Panel ${panelIndex + 1} has been updated successfully!`,
      });
      
    } catch (error) {
      console.error(`Failed to regenerate panel ${panelIndex + 1}:`, error);
      toast({
        title: "Regeneration Failed",
        description: `Failed to regenerate panel ${panelIndex + 1}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      const newGeneratingPanels = [...generatingPanels];
      newGeneratingPanels[panelIndex] = false;
      setGeneratingPanels(newGeneratingPanels);
    }
  };

  const handleCancelPanelEdit = () => {
    setEditingPanel(null);
  };

  const getExactPrompt = (panelIndex: number) => {
    if (!storyPlan || !selectedStyle) return '';
    
    const panel = comicPanels[panelIndex];
    const characterDescriptions = storyPlan.characters
      .map(char => `${char.name}: ${char.visualDescription}`)
      .join('. ');
    
    return generateProfessionalImagePrompt(
      panel.prompt,
      panel.panelType,
      selectedStyle,
      panelIndex + 1,
      characterDescriptions,
      panel.dialogue
    );
  };

  const handleShare = () => {
    // For now, just copy the story idea
    navigator.clipboard.writeText(`Check out my comic: "${storyPlan?.title}" - ${storyIdea}`).then(() => {
      toast({
        title: "Story Copied!",
        description: "Comic story has been copied to clipboard.",
      });
    });
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

        {!storyPlan ? (
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
          // Story Plan & Comic Display
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex gap-8">
              {/* Main Comic Content */}
              <div className="flex-1 space-y-8">
                {/* Comic Panels */}
                <div className="flex flex-col gap-6 max-w-lg mx-auto">
                  {comicPanels.map((panel, index) => (
                    <ComicPanel
                      key={panel.id}
                      panel={{
                        ...panel,
                        prompt: getExactPrompt(index)
                      }}
                      panelIndex={index}
                      isEditing={editingPanel === index}
                      onEdit={() => handleEditPanel(index)}
                      onSave={(prompt, caption) => handleSavePanel(index, prompt, caption)}
                      onCancel={handleCancelPanelEdit}
                      isGenerating={generatingPanels[index]}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
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
              </div>

              {/* Characters Sidebar */}
              <div className="w-80 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Characters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {storyPlan.characters.map((character, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-primary">{character.name}</h4>
                          {editingCharacter !== index && (
                            <Button
                              onClick={() => handleEditCharacter(index)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {editingCharacter === index ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium block mb-1">Personality & Traits:</label>
                              <Textarea
                                value={editedCharacter?.description || ''}
                                onChange={(e) => setEditedCharacter(prev => prev ? {...prev, description: e.target.value} : null)}
                                className="text-sm min-h-[80px]"
                                placeholder="Detailed personality, traits, mannerisms..."
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium block mb-1">Physical Appearance:</label>
                              <Textarea
                                value={editedCharacter?.visualDescription || ''}
                                onChange={(e) => setEditedCharacter(prev => prev ? {...prev, visualDescription: e.target.value} : null)}
                                className="text-sm min-h-[100px]"
                                placeholder="Detailed physical description for consistency..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveCharacter(index)}
                                size="sm"
                                className="h-7"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                                className="h-7"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <strong className="text-xs">Personality:</strong>
                              <p className="text-sm text-muted-foreground">{character.description}</p>
                            </div>
                            <div>
                              <strong className="text-xs">Appearance:</strong>
                              <p className="text-xs text-muted-foreground leading-relaxed">{character.visualDescription}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}