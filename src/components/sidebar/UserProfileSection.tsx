
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { ProfileImageDisplay } from "@/components/ProfileImageDisplay";

interface UserProfileSectionProps {
  isCollapsed: boolean;
}

export function UserProfileSection({ isCollapsed }: UserProfileSectionProps) {
  const { profile, loading } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
    }
    return 'User';
  };

  const getUserSubtitle = () => {
    if (profile?.role === 'parent') {
      return 'Parent';
    }
    if (profile?.role === 'child') {
      return 'Child';
    }
    return '';
  };

  const getUserAge = () => {
    if (profile?.role === 'child' && profile?.age !== null && profile?.age !== undefined) {
      return `Age ${profile.age}`;
    }
    return null;
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center mb-4">
        <ProfileImageDisplay 
          isUser={true} 
          size="md" 
        />
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center text-center mb-6 p-4 rounded-lg border-2" 
      style={{ 
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.primary
      }}
    >
      <ProfileImageDisplay 
        isUser={true} 
        size="lg" 
        className="mb-3"
      />
      <div className="space-y-1">
        <h3 
          className="font-semibold text-base"
          style={{ color: currentTheme.colors.text.primary }}
        >
          {loading ? 'Loading...' : getUserDisplayName()}
        </h3>
        {!loading && getUserSubtitle() && (
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            {getUserSubtitle()}
          </p>
        )}
        {!loading && getUserAge() && (
          <p 
            className="text-xs"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            {getUserAge()}
          </p>
        )}
        {!loading && (
          <button
            onClick={() => navigate('/settings')}
            className="text-xs hover:underline mt-2"
            style={{ color: currentTheme.colors.primary }}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
