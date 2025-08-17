
import { Settings, UserCog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function AppHeader() {
  const { currentTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <Button
        onClick={handleSignOut}
        size="icon"
        variant="ghost"
        className="h-10 w-10"
        style={{
          color: currentTheme.colors.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
