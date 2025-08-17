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
import { useCharacterGeneration } from "@/hooks/useCharacterGeneration";
import { toast } from "@/hooks/use-toast";
import { Loader2, Share, RotateCcw, Sparkles, Wand2, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function ComicPage() {
  const {
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();
  const [storyIdea, setStoryIdea] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle | null>(null);
  const [storyPlan, setStoryPlan] = useState<StoryPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanelType[]>([]);
  const [characters, setCharacters] = useState<ComicCharacter[]>([]);
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  const [generationPhase, setGenerationPhase] = useState<'story' | 'characters' | 'panels' | 'complete'>('story');
  const { generateCharacterImage } = useCharacterGeneration();
  const {
    generatePanelWithReferences,
    generateAllPanels,
    isGenerating: isGeneratingPanels
  } = useComicPanelGeneration();

  // Check if user is a child
  const isChild = profile?.role === 'child';
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Comic Strip Generator</h1>
            <p className="text-muted-foreground mb-4">Please sign in to create comics</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  if (!isChild) {
    return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="absolute top-6 left-4 z-10">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
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
      </div>;
  }
  const handleGenerateStoryPlan = async () => {
    console.log('handleGenerateStoryPlan called!');
    console.log('storyIdea:', storyIdea);
    console.log('selectedStyle:', selectedStyle);
    if (!storyIdea.trim() || !selectedStyle) {
      console.log('Missing story idea or style');
      toast({
        title: "Missing Information",
        description: "Please enter a story idea and select a comic style.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Starting story plan generation...');
    
    // Immediately show the next screen
    setGenerationPhase('characters');
    setIsGeneratingPlan(true);
    
    toast({
      title: "Creating Your Comic!",
      description: "Generating story plan and characters..."
    });

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
        panelType: panelPlan.panel_type
      }));
      setComicPanels(initialPanels);
      
      // Set characters without images first
      const charactersWithoutImages = plan.characters.map(char => ({
        ...char,
        generatedImageUrl: undefined,
        generationId: undefined
      }));
      setCharacters(charactersWithoutImages);
      
      toast({
        title: "Story Plan Complete!",
        description: `Created ${plan.characters.length} characters and ${plan.panels.length} panels!`
      });
      
      // Now start generating character images progressively
      await generateCharactersProgressively(plan.characters);
      
    } catch (error) {
      console.error('Failed to generate story plan:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate story plan. Please try again.",
        variant: "destructive"
      });
      // Reset to story phase if there's an error
      setGenerationPhase('story');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const generateCharactersProgressively = async (planCharacters: ComicCharacter[]) => {
    for (let i = 0; i < planCharacters.length; i++) {
      try {
        const character = planCharacters[i];
        const generatedCharacter = await generateCharacterImage(character);
        
        if (generatedCharacter) {
          setCharacters(prev => {
            const updated = [...prev];
            updated[i] = generatedCharacter;
            return updated;
          });
          
          toast({
            title: `Character Generated!`,
            description: `${generatedCharacter.name} is ready!`
          });
        }
      } catch (error) {
        console.error(`Failed to generate character ${i + 1}:`, error);
        // Continue with next character even if one fails
      }
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
  const handleCreateComicPanels = () => {
    console.log('handleCreateComicPanels called - moving to panels phase');
    setGenerationPhase('panels');
    toast({
      title: "Comic Panels Created!",
      description: "Edit each panel and generate them individually!"
    });
  };
  const handleEditPanel = (panelIndex: number) => {
    setEditingPanel(panelIndex);
  };
  const handleSavePanel = async (panelIndex: number, prompt: string) => {
    if (!selectedStyle || characters.length === 0) return;
    try {
      // Get previous panel generation ID for reference
      const previousPanelGenerationId = panelIndex > 0 ? comicPanels[panelIndex - 1].generationId : undefined;

      // Update panel data
      const updatedPanel = {
        ...comicPanels[panelIndex],
        prompt
      };

      // Generate with references
      const generatedPanel = await generatePanelWithReferences(updatedPanel, panelIndex, characters, selectedStyle, previousPanelGenerationId);
      if (generatedPanel) {
        const updatedPanels = [...comicPanels];
        updatedPanels[panelIndex] = generatedPanel;
        setComicPanels(updatedPanels);
        setEditingPanel(null);
        
        // Check if all panels are now generated
        if (updatedPanels.every(panel => panel.imageUrl)) {
          setGenerationPhase('complete');
        }
        
        toast({
          title: "Panel Regenerated!",
          description: `Panel ${panelIndex + 1} has been updated with character consistency!`
        });
      }
    } catch (error) {
      console.error(`Failed to regenerate panel ${panelIndex + 1}:`, error);
      toast({
        title: "Regeneration Failed",
        description: `Failed to regenerate panel ${panelIndex + 1}. Please try again.`,
        variant: "destructive"
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
        description: "Comic story has been copied to clipboard."
      });
    });
  };
  const hasGeneratedCharacters = characters.some(char => char.generatedImageUrl);
  const allPanelsGenerated = comicPanels.every(panel => panel.imageUrl);
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
      <div className="absolute top-6 left-4 z-10">
        <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="flex items-center gap-2 backdrop-blur-sm bg-transparent rounded text-left text-base">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="text-6xl animate-bounce">🎨</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Comic Creator
            </h1>
            <div className="text-6xl animate-bounce" style={{
            animationDelay: '0.2s'
          }}>✨</div>
          </div>
          <p className="text-xl text-purple-700 dark:text-purple-300 font-medium">
            Make your own awesome comic strips! 🦸‍♀️📚
          </p>
        </div>

        {generationPhase === 'story' ?
      // Input Section
      <div className="max-w-3xl mx-auto space-y-8 animate-scale-in">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-800/90 dark:to-purple-900/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-purple-700 dark:text-purple-300">
                  <div className="text-3xl">💭</div>
                  <span className="font-bold">What's your story idea?</span>
                  <div className="text-3xl">🚀</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Textarea value={storyIdea} onChange={e => setStoryIdea(e.target.value)} placeholder="A dinosaur becomes a chef 🦕👨‍🍳&#10;A superhero who loves donuts 🦸‍♂️🍩&#10;A cat that can fly 🐱✈️&#10;&#10;Tell me your amazing story idea!" rows={6} className="text-lg min-h-[160px] border-2 border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm resize-none" />
                  <div className="absolute -top-2 -right-2 text-2xl animate-pulse">🌟</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-pink-50/90 dark:from-gray-800/90 dark:to-pink-900/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-pink-700 dark:text-pink-300">
                  <div className="text-3xl">🎨</div>
                  <span className="font-bold">Pick your art style!</span>
                  <div className="text-3xl">🖌️</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-6 justify-center max-w-4xl mx-auto">
                  {(['cartoon', 'ghibli', 'superhero', 'simple'] as ComicStyle[]).map(style => <div key={style} className="hover-scale">
                      <ComicStyleCard style={style} selected={selectedStyle === style} onSelect={setSelectedStyle} />
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button onClick={handleGenerateStoryPlan} disabled={isGeneratingPlan || !storyIdea.trim() || !selectedStyle} size="lg" className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                {isGeneratingPlan ? <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Creating your story... ✨</span>
                  </div> : <div className="flex items-center gap-3">
                    <div className="text-2xl">🎭</div>
                    <span>Make My Comic!</span>
                    <div className="text-2xl">🎉</div>
                  </div>}
              </Button>
            </div>
          </div> :
      // Comic Generation Workflow
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex gap-8 max-lg:flex-col">
              {/* Main Comic Content */}
              <div className="flex-1 space-y-8">
                {/* Generation Progress */}
                <Card className="border-0 shadow-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="text-4xl">
                          {generationPhase === 'characters' && '👥'}
                          {generationPhase === 'panels' && '🖼️'}
                          {generationPhase === 'complete' && '🎉'}
                        </div>
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {generationPhase === 'characters' && 'Step 1: Create Your Characters!'}
                          {generationPhase === 'panels' && 'Step 2: Make Your Comic Panels!'}
                          {generationPhase === 'complete' && 'Your Comic is Ready!'}
                        </h3>
                      </div>
                    </div>
                    
                    {generationPhase === 'characters' && <div className="text-center space-y-6">
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6">
                          <div className="text-lg text-blue-700 dark:text-blue-300 mb-4 font-medium">
                            🎭 First, let's create your characters so they look the same in every panel!
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Look at the Characters section on the right to generate your character images →
                          </div>
                        </div>
                        <Button onClick={handleCreateComicPanels} disabled={!hasGeneratedCharacters} size="lg" className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 border-0 rounded-2xl shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50">
                          {hasGeneratedCharacters ? <div className="flex items-center gap-3">
                              <div className="text-xl">🎨</div>
                              <span>Now Make Comic Panels!</span>
                              <ArrowRight className="h-5 w-5" />
                            </div> : <div className="flex items-center gap-2">
                              <div className="text-xl">⏳</div>
                              <span>Create characters first</span>
                            </div>}
                        </Button>
                      </div>}

                    {generationPhase === 'panels' && <div className="text-center space-y-6">
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6">
                          <div className="text-lg text-blue-700 dark:text-blue-300 mb-4 font-medium">
                            🎨 Your comic panels are ready to edit and generate!
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Edit any panel text below, then click "Generate Panel" for each one
                          </div>
                        </div>
                      </div>}
                  </CardContent>
                </Card>

                {/* Comic Panels */}
                {(generationPhase === 'panels' || generationPhase === 'complete') && <div className="space-y-8">
                    {generationPhase === 'complete' && <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                      <CardContent className="p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                          Your Comic is Ready!
                        </h2>
                        <p className="text-lg text-orange-600 dark:text-orange-400">
                          Look how awesome your comic turned out! 🌟
                        </p>
                      </CardContent>
                    </Card>}
                    
                    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
                      {comicPanels.map((panel, index) => <div key={panel.id} className="transform hover:scale-105 transition-all duration-300">
                          <ComicPanel panel={panel} panelIndex={index} isEditing={editingPanel === index} onEdit={() => handleEditPanel(index)} onSave={(prompt) => handleSavePanel(index, prompt)} onCancel={handleCancelPanelEdit} isGenerating={isGeneratingPanels} />
                        </div>)}
                    </div>
                  </div>}

                {/* Action Buttons */}
                {generationPhase === 'complete' && <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-8">
                    <Button onClick={handleShare} size="lg" className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 rounded-2xl shadow-xl transform transition-all duration-200 hover:scale-105">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">📤</div>
                        <span>Share My Comic!</span>
                        <Share className="h-5 w-5" />
                      </div>
                    </Button>
                    <Button onClick={handleStartOver} variant="outline" size="lg" className="px-8 py-4 text-lg font-bold border-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">🔄</div>
                        <span>Make Another Comic!</span>
                        <RotateCcw className="h-5 w-5" />
                      </div>
                    </Button>
                  </div>}
              </div>

              {/* Characters Sidebar */}
              <div className="w-80 max-lg:w-full">
                <div className="sticky top-4">
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="flex items-center justify-center gap-3 text-xl text-pink-700 dark:text-pink-300">
                        <div className="text-2xl">👥</div>
                        <span>Your Characters</span>
                        <div className="text-2xl">✨</div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CharacterGenerationSection 
                        characters={characters} 
                        onCharactersUpdate={handleCharactersUpdate} 
                        isVisible={generationPhase === 'characters' || generationPhase === 'panels' || generationPhase === 'complete'}
                        isLoadingStoryPlan={isGeneratingPlan}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>;
}