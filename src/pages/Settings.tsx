
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedComponent } from "@/components/ThemedComponent";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, themes, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("openai_api_key", value);
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
          {/* API Key */}
          <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>API Key</CardTitle>
              <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
                Enter your OpenAI API key to enable chat functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" style={{ color: currentTheme.colors.text.primary }}>
                  OpenAI API Key
                </Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text.primary
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" style={{ color: currentTheme.colors.text.secondary }} />
                    ) : (
                      <Eye className="h-4 w-4" style={{ color: currentTheme.colors.text.secondary }} />
                    )}
                  </Button>
                </div>
                <p className="text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                  Your API key is stored locally and never shared
                </p>
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

          {/* Notifications */}
          <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>Notifications</CardTitle>
              <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
                Control how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" style={{ color: currentTheme.colors.text.primary }}>
                    Enable Notifications
                  </Label>
                  <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Get notified about important updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio */}
          <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>Audio & Sound</CardTitle>
              <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
                Configure audio settings and sound effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-effects" style={{ color: currentTheme.colors.text.primary }}>
                    Sound Effects
                  </Label>
                  <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Play sounds for interactions and notifications
                  </p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>About KidsGPT</CardTitle>
              <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
                Information about this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Built with:</strong> React, TypeScript, Tailwind CSS</p>
                <p><strong>Created by:</strong> Lovable</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemedComponent>
  );
};

export default Settings;
