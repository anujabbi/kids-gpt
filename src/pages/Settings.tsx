
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedComponent } from "@/components/ThemedComponent";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, themes, setTheme } = useTheme();
  const { profile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState("alien1");

  const isChild = profile?.role === 'child';

  const avatarOptions = [
    { id: "alien1", name: "Friendly Green Alien", emoji: "👽" },
    { id: "alien2", name: "Purple Space Explorer", emoji: "🛸" },
    { id: "alien3", name: "Blue Cosmic Wanderer", emoji: "🌌" },
    { id: "alien4", name: "Orange Galaxy Traveler", emoji: "🚀" },
    { id: "alien5", name: "Pink Stardust Alien", emoji: "⭐" }
  ];

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
                Choose your favorite alien avatar for your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedAvatar} onValueChange={setSelectedAvatar} className="grid grid-cols-2 gap-4">
                {avatarOptions.map((avatar) => (
                  <div key={avatar.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={avatar.id} id={avatar.id} />
                    <Label
                      htmlFor={avatar.id}
                      className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border transition-colors hover:bg-opacity-50"
                      style={{
                        borderColor: selectedAvatar === avatar.id ? currentTheme.colors.primary : currentTheme.colors.border,
                        backgroundColor: selectedAvatar === avatar.id ? currentTheme.colors.primary + '10' : 'transparent',
                        color: currentTheme.colors.text.primary
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-pulse"
                        style={{ backgroundColor: currentTheme.colors.surface }}
                      >
                        {avatar.emoji}
                      </div>
                      <div className="text-sm font-medium">{avatar.name}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    // Here you would typically save the avatar selection to the user's profile
                    console.log("Selected avatar:", selectedAvatar);
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
