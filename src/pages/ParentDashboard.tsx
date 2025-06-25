import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, TrendingUp, TrendingDown, Brain, Shield, Calendar, Clock, BookOpen, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { useParentAnalytics } from '@/hooks/useParentAnalytics';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const { currentTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(true);
  
  const {
    usageStats,
    conversationSummaries,
    insights,
    timeRange,
    setTimeRange,
    isLoading
  } = useParentAnalytics(conversations);

  const handlePinSubmit = () => {
    // Simple PIN protection - in a real app, this would be more secure
    const savedPin = localStorage.getItem('parentDashboard_pin') || '1234';
    if (pin === savedPin) {
      setIsAuthenticated(true);
      setShowPinDialog(false);
      toast({
        title: "Access granted",
        description: "Welcome to the Parent Dashboard",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect PIN. Default PIN is 1234",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setShowPinDialog(false);
    // Navigate back to main page when dialog is closed
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 30) return 'Educational';
    if (score <= 60) return 'Mixed';
    return 'Homework Help';
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showPinDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Parent Dashboard Access
            </DialogTitle>
            <DialogDescription>
              Please enter your PIN to access the parent dashboard. Default PIN is 1234.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handlePinSubmit}>Access Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" style={{ color: currentTheme.colors.text.primary }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            size="icon"
            variant="ghost"
            className="h-10 w-10"
            style={{
              color: currentTheme.colors.text.secondary,
              backgroundColor: 'transparent'
            }}
            title="Back to KidsGPT"
          >
            <Home className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
            <p className="text-muted-foreground">Monitor your child's KidsGPT usage and learning progress</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value) as 7 | 30 | 90)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalConversations}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {usageStats.weeklyTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              {Math.abs(usageStats.weeklyTrend).toFixed(1)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              {usageStats.avgMessagesPerConversation.toFixed(1)} avg per conversation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Quality</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(usageStats.avgHomeworkScore)}`}>
              {getScoreLabel(usageStats.avgHomeworkScore)}
            </div>
            <p className="text-xs text-muted-foreground">
              Score: {usageStats.avgHomeworkScore.toFixed(1)}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.mostActiveDay}</div>
            <p className="text-xs text-muted-foreground">Peak usage day</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="conversations">Recent Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Messages and conversations per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageStats.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill={currentTheme.colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Subjects</CardTitle>
                <CardDescription>Most discussed topics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageStats.subjectInsights}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({subject, percent}) => `${subject} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {usageStats.subjectInsights.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Analysis</CardTitle>
                <CardDescription>Discussion frequency and homework scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageStats.subjectInsights.slice(0, 6).map((subject, index) => (
                    <div key={subject.subject} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{subject.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{subject.count} discussions</Badge>
                        {subject.avgHomeworkScore !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={getScoreColor(subject.avgHomeworkScore)}
                          >
                            {subject.avgHomeworkScore.toFixed(0)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Latest chat sessions and their analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversationSummaries.map((conv) => (
                  <div key={conv.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{conv.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{conv.messageCount} messages</Badge>
                        {conv.avgHomeworkScore !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={getScoreColor(conv.avgHomeworkScore)}
                          >
                            {getScoreLabel(conv.avgHomeworkScore)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{conv.summary}</p>
                    <p className="text-xs text-muted-foreground">{conv.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
