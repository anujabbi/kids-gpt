
import { useState, useEffect } from "react";
import { User, Rocket } from "lucide-react";
import { profileImageService, ProfileImageData } from "@/services/profileImageService";

interface ProfileImageDisplayProps {
  userId?: string;
  isUser?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-12 w-12 text-base'
};

const emojiSizes = {
  sm: 'text-xs',
  md: 'text-sm', 
  lg: 'text-xl'
};

export const ProfileImageDisplay = ({ 
  userId, 
  isUser = false, 
  className = "", 
  size = 'md' 
}: ProfileImageDisplayProps) => {
  const [profileImage, setProfileImage] = useState<ProfileImageData | null>(null);
  const [loading, setLoading] = useState(true);

  const imageOptions = [
    { id: "alien1", emoji: "👽" },
    { id: "alien2", emoji: "🛸" },
    { id: "alien3", emoji: "🌌" },
    { id: "alien4", emoji: "🚀" },
    { id: "alien5", emoji: "⭐" }
  ];

  useEffect(() => {
    const fetchProfileImage = async () => {
      setLoading(true);
      const data = await profileImageService.getProfileImage(userId);
      setProfileImage(data);
      setLoading(false);
    };

    fetchProfileImage();
  }, [userId]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  // If custom image, show it
  if (profileImage?.profile_image_type === 'custom' && profileImage.custom_profile_image_url) {
    return (
      <img
        src={profileImage.custom_profile_image_url}
        alt="Profile"
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  // If preset emoji, show it
  if (profileImage?.profile_image_type) {
    const selectedOption = imageOptions.find(option => option.id === profileImage.profile_image_type);
    if (selectedOption) {
      return (
        <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-blue-100 ${className}`}>
          <span className={emojiSizes[size]}>{selectedOption.emoji}</span>
        </div>
      );
    }
  }

  // Fallback to default icons
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-blue-500 text-white ${className}`}>
      {isUser ? (
        <User className="h-4 w-4" />
      ) : (
        <Rocket className="h-4 w-4" />
      )}
    </div>
  );
};
