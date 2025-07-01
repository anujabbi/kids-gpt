
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedComponent } from "@/components/ThemedComponent";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, themes, setTheme } = useTheme();
  const { profile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState("alien1");
  const [customImage, setCustomImage] = useState<string | null>(null);

  const isChild = profile?.role === 'child';

  const avatarOptions = [
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
        setSelectedAvatar("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ThemedComponent variant="surface" className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
              Settings
            </h1>
            <p style={{ color: currentTheme.colors.text.secondary }}>
              Customize your KidsGPT experience
            </p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Profile Image Selection */}
          <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>Profile Avatar</CardTitle>
              <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
                Choose your avatar or upload a custom image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={selectedAvatar} onValueChange={setSelectedAvatar} className="grid grid-cols-3 gap-6">
                {avatarOptions.map((avatar) => (
                  <div key={avatar.id} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem value={avatar.id} id={avatar.id} className="sr-only" />
                    <Label
                      htmlFor={avatar.id}
                      className="cursor-pointer flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:scale-105"
                      style={{
                        borderColor: selectedAvatar === avatar.id ? currentTheme.colors.primary : currentTheme.colors.border,
                        backgroundColor: selectedAvatar === avatar.id ? currentTheme.colors.primary + '20' : 'transparent',
                      }}
                    >
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse"
                        style={{ backgroundColor: currentTheme.colors.surface }}
                      >
                        {avatar.emoji}
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
                      borderColor: selectedAvatar === "custom" ? currentTheme.colors.primary : currentTheme.colors.border,
                      backgroundColor: selectedAvatar === "custom" ? currentTheme.colors.primary + '20' : 'transparent',
                    }}
                  >
                    {customImage ? (
                      <img 
                        src={customImage} 
                        alt="Custom avatar" 
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
                  id="avatar-upload"
                />
                <Label
                  htmlFor="avatar-upload"
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
                  onClick={() => {
                    // Here you would typically save the avatar selection to the user's profile
                    console.log("Selected avatar:", selectedAvatar);
                    if (customImage) {
                      console.log("Custom image:", customImage);
                    }
                  }}
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.text.primary
                  }}
                >
                  Save Avatar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>Theme</CardTitle>
              <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
                Choose your preferred color scheme and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-select" style={{ color: currentTheme.colors.text.primary }}>
                    Color Theme
                  </Label>
                  <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Select from predefined color schemes
                  </p>
                </div>
                <Select value={currentTheme.id} onValueChange={setTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          {theme.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemedComponent>
  );
};

export default Settings;
