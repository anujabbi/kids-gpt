import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ComicStyleCard } from "@/components/ComicStyleCard";
import { ComicPanel } from "@/components/ComicPanel";
import { CharacterLibrary } from "@/components/CharacterLibrary";
import { CharacterCreator } from "@/components/CharacterCreator";
import { useAuth } from "@/contexts/AuthContext";
import { ComicStyle, StoryPlan, ComicPanel as ComicPanelType, LibraryCharacter } from "@/types/comic";
import { storyPlanningService } from "@/services/storyPlanningService";
import { geminiImageService } from "@/services/geminiImageService";
import { characterLibraryService } from "@/services/characterLibraryService";
import { toast } from "@/hooks/use-toast";
import { Loader2, Share, RotateCcw, ArrowRight, ArrowLeft, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GenerationPhase = 'characters' | 'story' | 'panels' | 'complete';

export default function ComicPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Character selection state
  const [selectedCharacters, setSelectedCharacters] = useState<LibraryCharacter[]>([]);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);

  // Story state
  const [storyIdea, setStoryIdea] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle>("cartoon");
  const [storyPlan, setStoryPlan] = useState<StoryPlan | null>(null);

  // Generation state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingPanels, setIsGeneratingPanels] = useState(false);
  const [comicPanels, setComicPanels] = useState<ComicPanelType[]>([]);
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>('characters');
  const [currentGeneratingPanel, setCurrentGeneratingPanel] = useState<number | null>(null);

  // Check if user is a child
  const isChild = profile?.role === 'child';

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Comic Strip Generator</h1>
            <p className="text-muted-foreground mb-4">Please sign in to create comics</p>
            <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
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
              <Button onClick={() => window.location.href = '/'}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSelectCharacter = (character: LibraryCharacter) => {
    if (selectedCharacters.length < 3) {
      setSelectedCharacters(prev => [...prev, character]);
      // Increment use count
      characterLibraryService.incrementUseCount(character.id);
    }
  };

  const handleDeselectCharacter = (characterId: string) => {
    setSelectedCharacters(prev => prev.filter(c => c.id !== characterId));
  };

  const handleCharacterCreated = (character: LibraryCharacter) => {
    setShowCharacterCreator(false);
    handleSelectCharacter(character);
    toast({
      title: "Character added!",
      description: `${character.name} has been added to your comic.`
    });
  };

  const handleProceedToStory = () => {
    if (selectedCharacters.length === 0) {
      toast({
        title: "Select Characters",
        description: "Please select at least one character for your comic.",
        variant: "destructive"
      });
      return;
    }
    setGenerationPhase('story');
  };

  const handleGenerateStoryPlan = async () => {
    if (!storyIdea.trim()) {
      toast({
        title: "Missing Story Idea",
        description: "Please enter a story idea for your comic.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    setGenerationPhase('panels');

    try {
      // Generate story plan with character names
      const characterNames = selectedCharacters.map(c => c.name).join(', ');
      const enhancedIdea = `${storyIdea}\n\nUse these characters: ${characterNames}`;

      const plan = await storyPlanningService.generateStoryPlan(enhancedIdea, selectedStyle);
      if (!plan) {
        throw new Error('Failed to generate story plan');
      }

      setStoryPlan(plan);

      // Initialize panels
      const initialPanels: ComicPanelType[] = plan.panels.map((panelPlan, index) => ({
        id: `panel_${index}`,
        imageUrl: '',
        prompt: panelPlan.image_prompt,
        dialogue: panelPlan.dialogue,
        panelType: panelPlan.panel_type
      }));
      setComicPanels(initialPanels);

      toast({
        title: "Story Plan Ready!",
        description: "Now generating your comic panels with consistent characters..."
      });

      // Generate all panels sequentially with character references
      await generateAllPanelsWithGemini(initialPanels);

    } catch (error) {
      console.error('Failed to generate story plan:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
      setGenerationPhase('story');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const generateAllPanelsWithGemini = async (panels: ComicPanelType[]) => {
    setIsGeneratingPanels(true);
    const characterImageUrls = selectedCharacters.map(c => c.imageUrl);
    const updatedPanels = [...panels];

    for (let i = 0; i < panels.length; i++) {
      setCurrentGeneratingPanel(i);

      try {
        const previousPanelImage = i > 0 ? updatedPanels[i - 1].imageUrl : undefined;

        const imageDataUrl = await geminiImageService.generatePanel(
          panels[i].prompt,
          characterImageUrls,
          selectedStyle,
          i + 1,
          panels.length,
          previousPanelImage
        );

        // Upload to Supabase Storage for persistent URL
        const imageUrl = await characterLibraryService.uploadImageFromDataUrl(
          imageDataUrl,
          user.id
        );

        updatedPanels[i] = {
          ...updatedPanels[i],
          imageUrl,
          generationId: crypto.randomUUID()
        };

        setComicPanels([...updatedPanels]);

        toast({
          title: `Panel ${i + 1} Complete!`,
          description: `Generated panel ${i + 1} of ${panels.length}`
        });

      } catch (error) {
        console.error(`Failed to generate panel ${i + 1}:`, error);
        toast({
          title: `Panel ${i + 1} Failed`,
          description: error instanceof Error ? error.message : "Generation failed",
          variant: "destructive"
        });
      }
    }

    setCurrentGeneratingPanel(null);
    setIsGeneratingPanels(false);

    if (updatedPanels.every(p => p.imageUrl)) {
      setGenerationPhase('complete');
      toast({
        title: "Comic Complete!",
        description: "Your comic is ready to share!"
      });
    }
  };

  const handleRegeneratePanel = async (panelIndex: number, prompt: string, dialogue?: string) => {
    setIsGeneratingPanels(true);
    setCurrentGeneratingPanel(panelIndex);

    try {
      const characterImageUrls = selectedCharacters.map(c => c.imageUrl);
      const previousPanelImage = panelIndex > 0 ? comicPanels[panelIndex - 1].imageUrl : undefined;

      const imageDataUrl = await geminiImageService.generatePanel(
        prompt,
        characterImageUrls,
        selectedStyle,
        panelIndex + 1,
        comicPanels.length,
        previousPanelImage
      );

      const imageUrl = await characterLibraryService.uploadImageFromDataUrl(
        imageDataUrl,
        user.id
      );

      const updatedPanels = [...comicPanels];
      updatedPanels[panelIndex] = {
        ...updatedPanels[panelIndex],
        prompt,
        dialogue,
        imageUrl,
        generationId: crypto.randomUUID()
      };

      setComicPanels(updatedPanels);
      setEditingPanel(null);

      toast({
        title: "Panel Regenerated!",
        description: `Panel ${panelIndex + 1} has been updated.`
      });

    } catch (error) {
      console.error(`Failed to regenerate panel:`, error);
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPanels(false);
      setCurrentGeneratingPanel(null);
    }
  };

  const handleStartOver = () => {
    setSelectedCharacters([]);
    setStoryIdea("");
    setSelectedStyle("cartoon");
    setStoryPlan(null);
    setComicPanels([]);
    setGenerationPhase('characters');
    setEditingPanel(null);
    setShowCharacterCreator(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Check out my comic: "${storyPlan?.title}" - ${storyIdea}`
    ).then(() => {
      toast({
        title: "Story Copied!",
        description: "Comic story has been copied to clipboard."
      });
    });
  };

  // Character Creator View
  if (showCharacterCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-6">
          <CharacterCreator
            onBack={() => setShowCharacterCreator(false)}
            onCharacterCreated={handleCharacterCreated}
            initialStyle={selectedStyle}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
      <div className="absolute top-6 left-4 z-10">
        <Button
          onClick={() => generationPhase === 'characters' ? navigate('/') : handleStartOver()}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 backdrop-blur-sm bg-transparent rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          {generationPhase === 'characters' ? 'Back' : 'Start Over'}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="text-6xl animate-bounce">🎨</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Comic Creator
            </h1>
            <div className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          </div>
          <p className="text-xl text-purple-700 dark:text-purple-300 font-medium">
            {generationPhase === 'characters' && 'Choose your characters!'}
            {generationPhase === 'story' && 'Tell your story!'}
            {generationPhase === 'panels' && 'Creating your comic...'}
            {generationPhase === 'complete' && 'Your comic is ready!'}
          </p>
        </div>

        {/* Phase: Character Selection */}
        {generationPhase === 'characters' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-scale-in">
            {/* Style Selection (for filtering) */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-pink-50/90 dark:from-gray-800/90 dark:to-pink-900/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-pink-700 dark:text-pink-300">
                  <div className="text-3xl">🎨</div>
                  <span className="font-bold">Pick your art style!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-6 justify-center">
                  {(['cartoon', 'ghibli', 'superhero', 'simple'] as ComicStyle[]).map(style => (
                    <div key={style} className="hover-scale">
                      <ComicStyleCard
                        style={style}
                        selected={selectedStyle === style}
                        onSelect={setSelectedStyle}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Character Library */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-800/90 dark:to-purple-900/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-purple-700 dark:text-purple-300">
                  <Users className="w-8 h-8" />
                  <span className="font-bold">Choose Your Characters</span>
                  <span className="text-lg font-normal">({selectedCharacters.length}/3)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CharacterLibrary
                  selectedCharacters={selectedCharacters}
                  onSelectCharacter={handleSelectCharacter}
                  onDeselectCharacter={handleDeselectCharacter}
                  onCreateNew={() => setShowCharacterCreator(true)}
                  maxCharacters={3}
                  filterStyle={selectedStyle}
                />
              </CardContent>
            </Card>

            {/* Proceed Button */}
            <div className="text-center">
              <Button
                onClick={handleProceedToStory}
                disabled={selectedCharacters.length === 0}
                size="lg"
                className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span>Continue to Story</span>
                  <ArrowRight className="h-6 w-6" />
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Story Input */}
        {generationPhase === 'story' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-scale-in">
            {/* Selected Characters Preview */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-blue-900/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">Your Characters:</span>
                  <div className="flex gap-3">
                    {selectedCharacters.map(char => (
                      <div key={char.id} className="flex items-center gap-2 bg-white/60 dark:bg-gray-700/60 rounded-full px-3 py-1">
                        <img
                          src={char.imageUrl}
                          alt={char.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{char.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Story Input */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-800/90 dark:to-purple-900/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-purple-700 dark:text-purple-300">
                  <div className="text-3xl">💭</div>
                  <span className="font-bold">What happens in your story?</span>
                  <div className="text-3xl">🚀</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  value={storyIdea}
                  onChange={e => setStoryIdea(e.target.value)}
                  placeholder={`What adventure will ${selectedCharacters.map(c => c.name).join(' and ')} go on?\n\nExample: They discover a magical garden and meet a talking butterfly...`}
                  rows={6}
                  className="text-lg min-h-[160px] border-2 border-purple-200 dark:border-purple-700 focus:border-purple-400 rounded-2xl bg-white/80 dark:bg-gray-800/80 resize-none"
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setGenerationPhase('characters')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg rounded-2xl"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Characters
              </Button>
              <Button
                onClick={handleGenerateStoryPlan}
                disabled={isGeneratingPlan || !storyIdea.trim()}
                size="lg"
                className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                {isGeneratingPlan ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Creating your comic...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6" />
                    <span>Create My Comic!</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Panels Generation */}
        {(generationPhase === 'panels' || generationPhase === 'complete') && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Progress Header */}
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-4xl">
                    {generationPhase === 'complete' ? '🎉' : '🎨'}
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {generationPhase === 'complete'
                      ? 'Your Comic is Ready!'
                      : `Generating Panel ${(currentGeneratingPanel ?? 0) + 1} of ${comicPanels.length}...`}
                  </h3>
                </div>
                {isGeneratingPanels && (
                  <div className="flex justify-center gap-2">
                    {comicPanels.map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-colors ${
                          i < (currentGeneratingPanel ?? 0)
                            ? 'bg-green-500'
                            : i === currentGeneratingPanel
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comic Panels */}
            <div className="flex flex-col gap-8">
              {comicPanels.map((panel, index) => (
                <div key={panel.id} className="transform hover:scale-[1.02] transition-all duration-300">
                  <ComicPanel
                    panel={panel}
                    panelIndex={index}
                    isEditing={editingPanel === index}
                    onEdit={() => setEditingPanel(index)}
                    onSave={(prompt, dialogue) => handleRegeneratePanel(index, prompt, dialogue)}
                    onCancel={() => setEditingPanel(null)}
                    isGenerating={isGeneratingPanels && currentGeneratingPanel === index}
                    comicStyle={selectedStyle}
                    characters={selectedCharacters.map(c => ({
                      name: c.name,
                      description: c.description,
                      visualDescription: c.visualDescription,
                      generatedImageUrl: c.imageUrl
                    }))}
                    panelNumber={index + 1}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {generationPhase === 'complete' && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-8">
                <Button
                  onClick={handleShare}
                  size="lg"
                  className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 rounded-2xl shadow-xl transform transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">📤</div>
                    <span>Share My Comic!</span>
                    <Share className="h-5 w-5" />
                  </div>
                </Button>
                <Button
                  onClick={handleStartOver}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-bold border-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">🔄</div>
                    <span>Make Another Comic!</span>
                    <RotateCcw className="h-5 w-5" />
                  </div>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
