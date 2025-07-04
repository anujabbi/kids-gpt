
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImageDisplay } from "./ProfileImageDisplay";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ChildSummary {
  id: string;
  full_name: string;
  profile_image_type: string;
  custom_profile_image_url?: string;
  conversationCount: number;
  lastInteraction: Date | null;
}

interface ChildSummaryCardProps {
  child: ChildSummary;
}

export function ChildSummaryCard({ child }: ChildSummaryCardProps) {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const handleConversationClick = () => {
    navigate(`/child-chat/${child.id}`);
  };

  const formatLastInteraction = (date: Date | null) => {
    if (!date) return "No conversations yet";
    return `Last active ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border 
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <ProfileImageDisplay 
            userId={child.id}
            size="lg"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <CardTitle 
              className="text-lg truncate"
              style={{ color: currentTheme.colors.text.primary }}
            >
              {child.full_name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div 
            className="text-sm cursor-pointer hover:underline font-medium"
            style={{ color: currentTheme.colors.primary }}
            onClick={handleConversationClick}
          >
            {child.conversationCount} conversation{child.conversationCount !== 1 ? 's' : ''}
          </div>
          
          <div 
            className="text-xs"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            {formatLastInteraction(child.lastInteraction)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
