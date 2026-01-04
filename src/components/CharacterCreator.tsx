import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles, Save, RefreshCw } from 'lucide-react';
import { ComicStyle, LibraryCharacter, CreateCharacterInput } from '@/types/comic';
import { ComicStyleCard } from './ComicStyleCard';
import { characterLibraryService } from '@/services/characterLibraryService';
import { geminiImageService } from '@/services/geminiImageService';
import { useToast } from '@/hooks/use-toast';

interface CharacterCreatorProps {
  onBack: () => void;
  onCharacterCreated: (character: LibraryCharacter) => void;
  initialStyle?: ComicStyle;
}

export const CharacterCreator = ({
  onBack,
  onCharacterCreated,
  initialStyle = 'cartoon'
}: CharacterCreatorProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visualDescription, setVisualDescription] = useState('');
  const [artStyle, setArtStyle] = useState<ComicStyle>(initialStyle);
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canGenerate = name.trim() && visualDescription.trim();
  const canSave = canGenerate && previewImage;

  const handleGeneratePreview = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const imageDataUrl = await geminiImageService.generateCharacter(
        name,
        visualDescription,
        artStyle
      );
      setPreviewImage(imageDataUrl);
      toast({
        title: 'Character generated!',
        description: 'Review the image and save to your library.'
      });
    } catch (error) {
      console.error('Failed to generate character:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!canSave || !previewImage) return;

    setIsSaving(true);
    try {
      const character = await characterLibraryService.saveComicCharacterToLibrary(
        name,
        description || `A ${artStyle} style character`,
        visualDescription,
        previewImage,
        artStyle,
        isPublic
      );

      toast({
        title: 'Character saved!',
        description: isPublic
          ? 'Your character is now available for everyone to use.'
          : 'Your character has been added to your library.'
      });

      onCharacterCreated(character);
    } catch (error) {
      console.error('Failed to save character:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Create New Character</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Character Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Luna the Dragon, Captain Zoom"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="visualDescription">Visual Description *</Label>
            <Textarea
              id="visualDescription"
              placeholder="Describe how your character looks: colors, clothing, special features, expressions..."
              value={visualDescription}
              onChange={e => setVisualDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {visualDescription.length}/500 - Be specific for better results!
            </p>
          </div>

          <div>
            <Label htmlFor="description">Personality (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your character's personality, role, or backstory..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              maxLength={200}
            />
          </div>

          <div>
            <Label>Art Style</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(['cartoon', 'ghibli', 'superhero', 'simple'] as ComicStyle[]).map(style => (
                <ComicStyleCard
                  key={style}
                  style={style}
                  selected={artStyle === style}
                  onSelect={setArtStyle}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="dragon, friendly, magic (comma separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="public">Share with Community</Label>
              <p className="text-xs text-muted-foreground">
                Let others use this character in their comics
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center space-y-4">
                  <Skeleton className="w-full h-full absolute" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 animate-pulse text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Creating your character...
                    </p>
                  </div>
                </div>
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt={name || 'Character preview'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Fill in the name and visual description, then click Generate to see your character!
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePreview}
                disabled={!canGenerate || isGenerating}
                className="flex-1"
                variant={previewImage ? 'secondary' : 'default'}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : previewImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>

              {previewImage && (
                <Button
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save to Library
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
