import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Wand2 } from 'lucide-react';
import { ComicCharacter } from '@/types/comic';
import { useCharacterGeneration } from '@/hooks/useCharacterGeneration';

interface CharacterGenerationSectionProps {
  characters: ComicCharacter[];
  onCharactersUpdate: (characters: ComicCharacter[]) => void;
  isVisible: boolean;
}

export function CharacterGenerationSection({ 
  characters, 
  onCharactersUpdate, 
  isVisible 
}: CharacterGenerationSectionProps) {
  const { generateCharacterImage, generateAllCharacters, isGenerating } = useCharacterGeneration();
  const [editingCharacter, setEditingCharacter] = useState<number | null>(null);
  const [editedCharacter, setEditedCharacter] = useState<ComicCharacter | null>(null);

  if (!isVisible) return null;

  const handleEditCharacter = (index: number) => {
    setEditingCharacter(index);
    setEditedCharacter({ ...characters[index] });
  };

  const handleSaveCharacter = async () => {
    if (editingCharacter === null || !editedCharacter) return;

    const updatedCharacters = [...characters];
    updatedCharacters[editingCharacter] = editedCharacter;
    onCharactersUpdate(updatedCharacters);
    setEditingCharacter(null);
    setEditedCharacter(null);
  };

  const handleCancelEdit = () => {
    setEditingCharacter(null);
    setEditedCharacter(null);
  };

  const handleGenerateCharacter = async (index: number) => {
    const character = characters[index];
    const generated = await generateCharacterImage(character);
    if (generated) {
      const updatedCharacters = [...characters];
      updatedCharacters[index] = generated;
      onCharactersUpdate(updatedCharacters);
    }
  };

  const handleGenerateAllCharacters = async () => {
    const generated = await generateAllCharacters(characters);
    onCharactersUpdate(generated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Characters
        </h3>
        <Button
          onClick={handleGenerateAllCharacters}
          disabled={isGenerating}
          size="sm"
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          Generate All
        </Button>
      </div>

      <div className="space-y-3">
        {characters.map((character, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {editingCharacter === index ? (
                  <Input
                    value={editedCharacter?.name || ''}
                    onChange={(e) => setEditedCharacter(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                    className="text-sm font-medium"
                  />
                ) : (
                  <span>{character.name}</span>
                )}
                
                <div className="flex gap-1">
                  {editingCharacter === index ? (
                    <>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveCharacter}>
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditCharacter(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateCharacter(index)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Wand2 className="h-3 w-3" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Generated Character Image */}
              {character.generatedImageUrl && (
                <div className="w-full">
                  <img
                    src={character.generatedImageUrl}
                    alt={character.name}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  {character.generationId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {character.generationId.substring(0, 8)}...
                    </p>
                  )}
                </div>
              )}
              
              {/* Character Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                {editingCharacter === index ? (
                  <Textarea
                    value={editedCharacter?.description || ''}
                    onChange={(e) => setEditedCharacter(prev => 
                      prev ? { ...prev, description: e.target.value } : null
                    )}
                    className="text-xs"
                    rows={2}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">{character.description}</p>
                )}
              </div>
              
              {/* Visual Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Visual Appearance</Label>
                {editingCharacter === index ? (
                  <Textarea
                    value={editedCharacter?.visualDescription || ''}
                    onChange={(e) => setEditedCharacter(prev => 
                      prev ? { ...prev, visualDescription: e.target.value } : null
                    )}
                    className="text-xs"
                    rows={2}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">{character.visualDescription}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}