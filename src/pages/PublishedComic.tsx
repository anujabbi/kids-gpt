import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Comic } from "@/types/comic";
import { comicService } from "@/services/comicService";
import { Loader2, Eye, ArrowLeft, Home } from "lucide-react";

export default function PublishedComic() {
  const { id } = useParams<{ id: string }>();
  const [comic, setComic] = useState<Comic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComic = async () => {
      if (!id) {
        setError("Comic ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedComic = await comicService.getComic(id);
        if (fetchedComic) {
          setComic(fetchedComic);
          // Increment view count
          await comicService.incrementViewCount(id);
        } else {
          setError("Comic not found");
        }
      } catch (err) {
        console.error('Failed to load comic:', err);
        setError("Failed to load comic");
      } finally {
        setIsLoading(false);
      }
    };

    loadComic();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading comic...</p>
        </div>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Oops!</h1>
            <p className="text-muted-foreground mb-4">{error || "Comic not found"}</p>
            <Button onClick={() => window.location.href = '/'}>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-background/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {comic.viewCount} views
            </div>
          </div>
        </div>
      </div>

      {/* Comic Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Comic Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {comic.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">"{comic.storyIdea}"</p>
            <p className="text-sm text-muted-foreground">
              Created on {comic.createdAt.toLocaleDateString()}
            </p>
          </div>

          {/* Comic Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {comic.panels.map((panel, index) => (
              <Card key={panel.id} className="overflow-hidden bg-background border-2 rounded-lg">
                <CardContent className="p-0">
                  {/* Panel Header */}
                  <div className="bg-muted/50 px-4 py-2">
                    <span className="font-semibold text-sm">Panel {index + 1}</span>
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-muted">
                    <img 
                      src={panel.imageUrl} 
                      alt={`Panel ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Dialogue */}
                  {panel.dialogue && (
                    <div className="p-4 bg-background">
                      <p className="text-sm text-center italic">{panel.dialogue}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comic Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Made with ❤️ using AI comic generation
            </p>
            <Button onClick={() => window.location.href = '/comic'}>
              Create Your Own Comic
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}