
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye, Shield, TrendingUp } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const ChildActivityMonitoring = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
          Child Activity Monitoring
        </h2>
        <p style={{ color: currentTheme.colors.text.secondary }}>
          Monitor your children's AI conversations and ensure safe, educational usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            This feature is currently under development and will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">View Conversations</h3>
                <p className="text-sm text-muted-foreground">
                  See your children's AI chat history
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Safety Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Track homework misuse and safety scores
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Usage Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View activity trends and insights
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">What you'll be able to do:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• View all conversations from your children</li>
              <li>• Monitor homework misuse detection scores</li>
              <li>• Get alerts for concerning content</li>
              <li>• See usage statistics and trends</li>
              <li>• Export conversation logs when needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
