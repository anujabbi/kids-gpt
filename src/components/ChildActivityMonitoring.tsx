
import { useChildSummary } from "@/hooks/useChildSummary";
import { ChildSummaryCard } from "./ChildSummaryCard";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

export const ChildActivityMonitoring = () => {
  const { childSummaries, loading } = useChildSummary();
  const { currentTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8" />
          <div className="text-lg">Loading children's activity...</div>
        </div>
      </div>
    );
  }

  if (childSummaries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 
            className="text-lg font-medium mb-2"
            style={{ color: currentTheme.colors.text.primary }}
          >
            No Children Found
          </h3>
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            Add children to your family to monitor their activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: currentTheme.colors.text.primary }}
        >
          Children's Activity Overview
        </h2>
        <p 
          className="text-sm"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Monitor your children's conversations and activity. Click on conversation counts to view detailed chats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childSummaries.map((child) => (
          <ChildSummaryCard key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
};
