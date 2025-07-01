
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

export const SettingsHeader = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  return (
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
  );
};
