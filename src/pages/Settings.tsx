
import { ThemedComponent } from "@/components/ThemedComponent";
import { SettingsHeader } from "@/components/SettingsHeader";
import { ProfileImageSelector } from "@/components/ProfileImageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";

const Settings = () => {
  return (
    <ThemedComponent variant="surface" className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <SettingsHeader />
        
        {/* Settings Cards */}
        <div className="space-y-6">
          <ProfileImageSelector />
          <ThemeSelector />
        </div>
      </div>
    </ThemedComponent>
  );
};

export default Settings;
