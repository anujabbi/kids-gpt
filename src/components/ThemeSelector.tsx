
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeSelector = () => {
  const { currentTheme, themes, setTheme } = useTheme();

  return (
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
  );
};
