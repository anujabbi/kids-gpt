import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComicStyle, COMIC_STYLES } from "@/utils/comicPrompts";

interface ComicStyleCardProps {
  style: ComicStyle;
  selected: boolean;
  onSelect: (style: ComicStyle) => void;
}

export const ComicStyleCard = ({ style, selected, onSelect }: ComicStyleCardProps) => {
  const config = COMIC_STYLES[style];

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : 'hover:bg-muted/50'
      }`}
      onClick={() => onSelect(style)}
    >
      <CardContent className="p-4 text-center">
        <div className="text-4xl mb-2">{config.emoji}</div>
        <h3 className="font-semibold text-lg mb-1">{config.name}</h3>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardContent>
    </Card>
  );
};