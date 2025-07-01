
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
import { useAuth } from "@/contexts/AuthContext";
import { ThemedComponent } from "@/components/ThemedComponent";

const Settings = () => {
  const navigate = useNavigate();
  const { currentTheme, themes, setTheme } = useTheme();
  const { profile } = useAuth();

  const isChild = profile?.role === 'child';

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
