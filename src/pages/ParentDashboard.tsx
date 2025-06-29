
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyManagement } from "@/components/FamilyManagement";
import { FamilyApiKeyManagement } from "@/components/FamilyApiKeyManagement";
import { ThemedComponent } from "@/components/ThemedComponent";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const ParentDashboard = () => {
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
    <ThemedComponent variant="surface" className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/chat")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                Parent Dashboard
              </h1>
              <p style={{ color: currentTheme.colors.text.secondary }}>
                Manage your family and settings
              </p>
            </div>
          </div>
          
          {/* Sign Out Button */}
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

        <Tabs defaultValue="family" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="family">Family Management</TabsTrigger>
            <TabsTrigger value="settings">Family Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="family" className="space-y-6">
            <FamilyManagement />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <FamilyApiKeyManagement />
          </TabsContent>
        </Tabs>
      </div>
    </ThemedComponent>
  );
};

export default ParentDashboard;
