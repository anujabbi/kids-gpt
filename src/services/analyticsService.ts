
import { Conversation, Message } from '@/types/chat';
import { differenceInDays, format, startOfWeek, endOfWeek, subDays, isWithinInterval } from 'date-fns';

export interface DailyActivity {
  date: string;
  messages: number;
  conversations: number;
}

export interface SubjectInsight {
  subject: string;
  count: number;
  avgHomeworkScore?: number;
}

export interface UsageStats {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  avgHomeworkScore: number;
  mostActiveDay: string;
  dailyActivity: DailyActivity[];
  subjectInsights: SubjectInsight[];
  weeklyTrend: number; // percentage change from previous week
}

export class AnalyticsService {
  private readonly EDUCATION_KEYWORDS = [
    'math', 'science', 'history', 'english', 'literature', 'physics', 'chemistry', 'biology',
    'geography', 'art', 'music', 'learn', 'study', 'understand', 'explain', 'help me with',
    'what is', 'how does', 'why', 'define', 'meaning', 'example'
  ];

  generateUsageStats(conversations: Conversation[], days: number = 30): UsageStats {
    const cutoffDate = subDays(new Date(), days);
    const recentConversations = conversations.filter(conv => 
      conv.timestamp >= cutoffDate
    );

    const totalMessages = recentConversations.reduce(
      (sum, conv) => sum + conv.messages.length, 0
    );

    const homeworkScores = recentConversations
      .flatMap(conv => conv.messages)
      .filter(msg => msg.role === 'assistant' && msg.homeworkMisuseScore !== undefined)
      .map(msg => msg.homeworkMisuseScore!);

    const avgHomeworkScore = homeworkScores.length > 0 
      ? homeworkScores.reduce((sum, score) => sum + score, 0) / homeworkScores.length 
      : 0;

    const dailyActivity = this.generateDailyActivity(recentConversations, days);
    const subjectInsights = this.generateSubjectInsights(recentConversations);
    
    const mostActiveDay = dailyActivity.reduce((max, day) => 
      day.messages > max.messages ? day : max
    ).date;

    // Calculate weekly trend
    const thisWeekStart = startOfWeek(new Date());
    const lastWeekStart = startOfWeek(subDays(new Date(), 7));
    const lastWeekEnd = endOfWeek(subDays(new Date(), 7));

    const thisWeekMessages = recentConversations
      .filter(conv => conv.timestamp >= thisWeekStart)
      .reduce((sum, conv) => sum + conv.messages.length, 0);

    const lastWeekMessages = recentConversations
      .filter(conv => isWithinInterval(conv.timestamp, { start: lastWeekStart, end: lastWeekEnd }))
      .reduce((sum, conv) => sum + conv.messages.length, 0);

    const weeklyTrend = lastWeekMessages > 0 
      ? ((thisWeekMessages - lastWeekMessages) / lastWeekMessages) * 100 
      : 0;

    return {
      totalConversations: recentConversations.length,
      totalMessages,
      avgMessagesPerConversation: recentConversations.length > 0 
        ? totalMessages / recentConversations.length 
        : 0,
      avgHomeworkScore,
      mostActiveDay,
      dailyActivity,
      subjectInsights,
      weeklyTrend
    };
  }

  private generateDailyActivity(conversations: Conversation[], days: number): DailyActivity[] {
    const activity: { [key: string]: DailyActivity } = {};
    
    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      activity[date] = { date, messages: 0, conversations: 0 };
    }

    // Populate with actual data
    conversations.forEach(conv => {
      const date = format(conv.timestamp, 'yyyy-MM-dd');
      if (activity[date]) {
        activity[date].conversations++;
        activity[date].messages += conv.messages.length;
      }
    });

    return Object.values(activity).reverse();
  }

  private generateSubjectInsights(conversations: Conversation[]): SubjectInsight[] {
    const subjects: { [key: string]: { count: number; scores: number[] } } = {};

    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.role === 'user') {
          const content = msg.content.toLowerCase();
          const detectedSubjects = this.detectSubjects(content);
          
          detectedSubjects.forEach(subject => {
            if (!subjects[subject]) {
              subjects[subject] = { count: 0, scores: [] };
            }
            subjects[subject].count++;
          });
        } else if (msg.role === 'assistant' && msg.homeworkMisuseScore !== undefined) {
          // Associate homework scores with previously detected subjects
          const userMsg = conv.messages[conv.messages.indexOf(msg) - 1];
          if (userMsg && userMsg.role === 'user') {
            const detectedSubjects = this.detectSubjects(userMsg.content.toLowerCase());
            detectedSubjects.forEach(subject => {
              if (subjects[subject]) {
                subjects[subject].scores.push(msg.homeworkMisuseScore!);
              }
            });
          }
        }
      });
    });

    return Object.entries(subjects)
      .map(([subject, data]) => ({
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        count: data.count,
        avgHomeworkScore: data.scores.length > 0 
          ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length 
          : undefined
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private detectSubjects(content: string): string[] {
    const subjects: string[] = [];
    
    this.EDUCATION_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        // Map keywords to broader subjects
        if (['math', 'mathematics', 'algebra', 'geometry', 'calculus'].some(k => content.includes(k))) {
          if (!subjects.includes('mathematics')) subjects.push('mathematics');
        } else if (['science', 'physics', 'chemistry', 'biology'].some(k => content.includes(k))) {
          if (!subjects.includes('science')) subjects.push('science');
        } else if (['history', 'historical'].some(k => content.includes(k))) {
          if (!subjects.includes('history')) subjects.push('history');
        } else if (['english', 'literature', 'writing', 'essay'].some(k => content.includes(k))) {
          if (!subjects.includes('language arts')) subjects.push('language arts');
        } else if (['art', 'music', 'creative'].some(k => content.includes(k))) {
          if (!subjects.includes('arts')) subjects.push('arts');
        } else {
          if (!subjects.includes('general')) subjects.push('general');
        }
      }
    });

    return subjects.length > 0 ? subjects : ['general'];
  }

  generateConversationSummaries(conversations: Conversation[], limit: number = 5): Array<{
    id: string;
    title: string;
    date: string;
    messageCount: number;
    summary: string;
    avgHomeworkScore?: number;
  }> {
    return conversations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(conv => {
        const userMessages = conv.messages.filter(msg => msg.role === 'user');
        const assistantMessages = conv.messages.filter(msg => msg.role === 'assistant');
        
        const homeworkScores = assistantMessages
          .filter(msg => msg.homeworkMisuseScore !== undefined)
          .map(msg => msg.homeworkMisuseScore!);
        
        const avgHomeworkScore = homeworkScores.length > 0
          ? homeworkScores.reduce((sum, score) => sum + score, 0) / homeworkScores.length
          : undefined;

        const summary = userMessages.length > 0 
          ? userMessages[0].content.slice(0, 100) + (userMessages[0].content.length > 100 ? '...' : '')
          : 'No user messages';

        return {
          id: conv.id,
          title: conv.title,
          date: format(conv.timestamp, 'MMM dd, yyyy'),
          messageCount: conv.messages.length,
          summary,
          avgHomeworkScore
        };
      });
  }
}

export const analyticsService = new AnalyticsService();
