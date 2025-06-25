
import { Settings, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-2 p-4">
      <Button
        onClick={() => navigate('/parents')}
        size="icon"
        variant="ghost"
        className="h-10 w-10"
        style={{
          color: currentTheme.colors.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Parent Dashboard"
      >
        <UserCog className="h-5 w-5" />
      </Button>
      <Button
        onClick={() => navigate('/settings')}
        size="icon"
        variant="ghost"
        className="h-10 w-10"
        style={{
          color: currentTheme.colors.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
}
