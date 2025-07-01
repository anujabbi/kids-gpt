
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const ProfileImageSelector = () => {
  const { currentTheme } = useTheme();
  const [selectedImage, setSelectedImage] = useState("alien1");
  const [customImage, setCustomImage] = useState<string | null>(null);

  const imageOptions = [
    { id: "alien1", emoji: "👽" },
    { id: "alien2", emoji: "🛸" },
    { id: "alien3", emoji: "🌌" },
    { id: "alien4", emoji: "🚀" },
    { id: "alien5", emoji: "⭐" }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomImage(result);
        setSelectedImage("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would typically save the profile image selection to the user's profile
    console.log("Selected profile image:", selectedImage);
    if (customImage) {
      console.log("Custom image:", customImage);
    }
  };

  return (
    <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle style={{ color: currentTheme.colors.text.primary }}>Profile Image</CardTitle>
        <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
          Choose your profile image or upload a custom image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedImage} onValueChange={setSelectedImage} className="grid grid-cols-3 gap-6">
          {imageOptions.map((image) => (
            <div key={image.id} className="flex flex-col items-center space-y-2">
              <RadioGroupItem value={image.id} id={image.id} className="sr-only" />
              <Label
                htmlFor={image.id}
                className="cursor-pointer flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:scale-105"
                style={{
                  borderColor: selectedImage === image.id ? currentTheme.colors.primary : currentTheme.colors.border,
                  backgroundColor: selectedImage === image.id ? currentTheme.colors.primary + '20' : 'transparent',
                }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse"
                  style={{ backgroundColor: currentTheme.colors.surface }}
                >
                  {image.emoji}
                </div>
              </Label>
            </div>
          ))}
          
          {/* Custom Image Upload Option */}
          <div className="flex flex-col items-center space-y-2">
            <RadioGroupItem value="custom" id="custom" className="sr-only" />
            <Label
              htmlFor="custom"
              className="cursor-pointer flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: selectedImage === "custom" ? currentTheme.colors.primary : currentTheme.colors.border,
                backgroundColor: selectedImage === "custom" ? currentTheme.colors.primary + '20' : 'transparent',
              }}
            >
              {customImage ? (
                <img 
                  src={customImage} 
                  alt="Custom profile image" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed"
                  style={{ 
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <Upload className="h-8 w-8" style={{ color: currentTheme.colors.text.secondary }} />
                </div>
              )}
            </Label>
          </div>
        </RadioGroup>
        
        {/* File Upload Input */}
        <div className="flex justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="profile-image-upload"
          />
          <Label
            htmlFor="profile-image-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-colors hover:bg-opacity-80"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text.primary
            }}
          >
            <Upload className="h-4 w-4" />
            Upload Custom Image
          </Label>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.text.primary
            }}
          >
            Save Profile Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
