import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Star, Users, User, Check } from 'lucide-react';
import { LibraryCharacter, ComicStyle } from '@/types/comic';
import { characterLibraryService } from '@/services/characterLibraryService';
import { COMIC_STYLES } from '@/utils/comicPrompts';

interface CharacterLibraryProps {
  selectedCharacters: LibraryCharacter[];
  onSelectCharacter: (character: LibraryCharacter) => void;
  onDeselectCharacter: (characterId: string) => void;
  onCreateNew: () => void;
  maxCharacters?: number;
  filterStyle?: ComicStyle;
}

export const CharacterLibrary = ({
  selectedCharacters,
  onSelectCharacter,
  onDeselectCharacter,
  onCreateNew,
  maxCharacters = 3,
  filterStyle
}: CharacterLibraryProps) => {
  const [featuredCharacters, setFeaturedCharacters] = useState<LibraryCharacter[]>([]);
  const [publicCharacters, setPublicCharacters] = useState<LibraryCharacter[]>([]);
  const [myCharacters, setMyCharacters] = useState<LibraryCharacter[]>([]);
  const [searchResults, setSearchResults] = useState<LibraryCharacter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
    loadCharacters();
  }, [filterStyle]);

  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const [featured, publicChars, mine] = await Promise.all([
        characterLibraryService.getFeaturedCharacters(),
        characterLibraryService.getPublicCharacters(filterStyle),
        characterLibraryService.getMyCharacters()
      ]);

      // Filter by style if specified
      const filterByStyle = (chars: LibraryCharacter[]) =>
        filterStyle ? chars.filter(c => c.artStyle === filterStyle) : chars;

      setFeaturedCharacters(filterByStyle(featured));
      setPublicCharacters(filterByStyle(publicChars));
      setMyCharacters(filterByStyle(mine));
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await characterLibraryService.searchCharacters(searchQuery, filterStyle);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const isSelected = (characterId: string) =>
    selectedCharacters.some(c => c.id === characterId);

  const canSelectMore = selectedCharacters.length < maxCharacters;

  const handleCharacterClick = (character: LibraryCharacter) => {
    if (isSelected(character.id)) {
      onDeselectCharacter(character.id);
    } else if (canSelectMore) {
      onSelectCharacter(character);
    }
  };

  const CharacterCard = ({ character }: { character: LibraryCharacter }) => {
    const selected = isSelected(character.id);
    const styleConfig = COMIC_STYLES[character.artStyle];

    return (
      <Card
        className={`cursor-pointer transition-all duration-200 overflow-hidden ${
          selected
            ? 'ring-2 ring-primary bg-primary/5'
            : canSelectMore
            ? 'hover:bg-muted/50 hover:scale-[1.02]'
            : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => handleCharacterClick(character)}
      >
        <div className="relative aspect-square">
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
          {selected && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="bg-primary text-primary-foreground rounded-full p-2">
                <Check className="w-6 h-6" />
              </div>
            </div>
          )}
          {character.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm truncate">{character.name}</h3>
            <span className="text-xs">{styleConfig?.emoji}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {character.description}
          </p>
          {character.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {character.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const CharacterGrid = ({ characters }: { characters: LibraryCharacter[] }) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (characters.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No characters found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {characters.map(character => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Selected Characters Preview */}
      {selectedCharacters.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">
              Selected Characters ({selectedCharacters.length}/{maxCharacters})
            </h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            {selectedCharacters.map(character => (
              <div
                key={character.id}
                className="relative group"
                onClick={() => onDeselectCharacter(character.id)}
              >
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-16 h-16 rounded-lg object-cover cursor-pointer ring-2 ring-primary"
                />
                <div className="absolute inset-0 bg-red-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs font-medium">Remove</span>
                </div>
                <span className="text-xs text-center block mt-1 truncate max-w-16">
                  {character.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search characters..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>
        <Button onClick={onCreateNew} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Character Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="featured" className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Featured</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Community</span>
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">My Characters</span>
          </TabsTrigger>
          {searchResults.length > 0 && (
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="h-[400px] mt-4">
          <TabsContent value="featured" className="m-0">
            <CharacterGrid characters={featuredCharacters} />
          </TabsContent>

          <TabsContent value="community" className="m-0">
            <CharacterGrid characters={publicCharacters} />
          </TabsContent>

          <TabsContent value="mine" className="m-0">
            {myCharacters.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't created any characters yet
                </p>
                <Button onClick={onCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Character
                </Button>
              </div>
            ) : (
              <CharacterGrid characters={myCharacters} />
            )}
          </TabsContent>

          <TabsContent value="search" className="m-0">
            <CharacterGrid characters={searchResults} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
