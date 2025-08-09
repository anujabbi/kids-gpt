import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COMIC_STYLES } from "@/utils/comicPrompts";
import { ComicStyle } from "@/types/comic";

interface ComicStyleCardProps {
  style: ComicStyle;
  selected: boolean;
  onSelect: (style: ComicStyle) => void;
}

export const ComicStyleCard = ({ style, selected, onSelect }: ComicStyleCardProps) => {
  const config = COMIC_STYLES[style];

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 w-16 ${
        selected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : 'hover:bg-muted/50'
      }`}
      onClick={() => onSelect(style)}
    >
      <CardContent className="p-1.5 text-center">
        <div className="text-lg mb-0.5">{config.emoji}</div>
        <h3 className="font-medium text-[10px] leading-tight">{config.name}</h3>
      </CardContent>
    </Card>
  );
};