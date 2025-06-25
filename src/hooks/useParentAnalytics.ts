
import { useState, useEffect, useMemo } from 'react';
import { analyticsService, UsageStats } from '@/services/analyticsService';
import { Conversation } from '@/types/chat';

export const useParentAnalytics = (conversations: Conversation[]) => {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [isLoading, setIsLoading] = useState(false);

  const usageStats = useMemo(() => {
    setIsLoading(true);
    try {
      const stats = analyticsService.generateUsageStats(conversations, timeRange);
      return stats;
    } finally {
      setIsLoading(false);
    }
  }, [conversations, timeRange]);

  const conversationSummaries = useMemo(() => {
    return analyticsService.generateConversationSummaries(conversations, 5);
  }, [conversations]);

  const insights = useMemo(() => {
    const stats = usageStats;
    const insights: string[] = [];

    if (stats.weeklyTrend > 20) {
      insights.push("📈 Usage has increased significantly this week");
    } else if (stats.weeklyTrend < -20) {
      insights.push("📉 Usage has decreased this week");
    }

    if (stats.avgHomeworkScore > 70) {
      insights.push("⚠️ High homework misuse scores detected");
    } else if (stats.avgHomeworkScore < 30) {
      insights.push("✅ Great! Mostly educational conversations");
    }

    if (stats.avgMessagesPerConversation > 10) {
      insights.push("💬 Long, engaging conversations are happening");
    }

    if (stats.subjectInsights.length > 5) {
      insights.push("🎓 Exploring diverse subjects and topics");
    }

    return insights;
  }, [usageStats]);

  return {
    usageStats,
    conversationSummaries,
    insights,
    timeRange,
    setTimeRange,
    isLoading
  };
};
