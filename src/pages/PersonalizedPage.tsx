
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedComponent } from '@/components/ThemedComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonalityProfile } from '@/types/chat';
import { personalityService } from '@/services/personalityService';
import { Heart, Star, Palette, BookOpen, Trophy, Sparkles, Target, Users, Lightbulb, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PersonalizedPage = () => {
  const { user, profile } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPersonalityProfile = async () => {
      if (user) {
        const profile = await personalityService.getPersonalityProfile(user.id);
        setPersonalityProfile(profile);
      }
      setLoading(false);
    };

    loadPersonalityProfile();
  }, [user]);

  const handleTakeQuiz = () => {
    navigate('/');
  };

  const getInterestActivities = (interests: string[]) => {
    const activities = [];
    if (interests.includes('science')) activities.push('🔬 Try virtual science experiments');
    if (interests.includes('art') || interests.includes('drawing')) activities.push('🎨 Create digital art projects');
    if (interests.includes('music')) activities.push('🎵 Learn about different musical instruments');
    if (interests.includes('animals')) activities.push('🐾 Explore animal facts and habitats');
    if (interests.includes('space')) activities.push('🚀 Discover the solar system');
    if (interests.includes('math')) activities.push('🔢 Play fun math puzzle games');
    return activities.length > 0 ? activities : ['🌟 Explore new learning adventures!'];
  };

  const getHobbyRecommendations = (hobbies: string[]) => {
    const recommendations = [];
    if (hobbies.includes('reading')) recommendations.push('📚 Ask me to create personalized stories');
    if (hobbies.includes('drawing') || hobbies.includes('painting')) recommendations.push('🖌️ Request step-by-step drawing tutorials');
    if (hobbies.includes('cooking') || hobbies.includes('baking')) recommendations.push('👨‍🍳 Get kid-friendly recipe ideas');
    if (hobbies.includes('games')) recommendations.push('🎲 Play word games and riddles with me');
    if (hobbies.includes('sports')) recommendations.push('⚽ Learn about different sports and athletes');
    return recommendations.length > 0 ? recommendations : ['🎯 Try new hobby ideas!'];
  };

  const getReadingRecommendations = (readingPreferences: string[]) => {
    const recommendations = [];
    if (readingPreferences.includes('adventure')) recommendations.push('🗺️ Adventure stories with brave heroes');
    if (readingPreferences.includes('mystery')) recommendations.push('🔍 Detective stories and puzzle books');
    if (readingPreferences.includes('fantasy')) recommendations.push('🧙‍♂️ Magical worlds and mythical creatures');
    if (readingPreferences.includes('animals')) recommendations.push('🐻 Animal stories and nature books');
    if (readingPreferences.includes('science')) recommendations.push('🔬 Science books and inventor biographies');
    if (readingPreferences.includes('humor')) recommendations.push('😄 Funny stories and joke books');
    return recommendations.length > 0 ? recommendations : ['📖 Explore different types of stories!'];
  };

  const getCareerActivities = (dreamJob: string) => {
    const job = dreamJob.toLowerCase();
    const activities = [];
    
    if (job.includes('doctor') || job.includes('nurse')) {
      activities.push('🏥 Learn about the human body', '🩺 Explore how medicine helps people');
    } else if (job.includes('teacher')) {
      activities.push('📚 Practice explaining things to others', '🎓 Learn about different subjects');
    } else if (job.includes('artist') || job.includes('painter')) {
      activities.push('🎨 Try different art techniques', '🖼️ Learn about famous artists');
    } else if (job.includes('scientist')) {
      activities.push('🔬 Conduct fun science experiments', '🧪 Learn about scientific discoveries');
    } else if (job.includes('astronaut')) {
      activities.push('🚀 Explore space facts', '🌙 Learn about planets and stars');
    } else if (job.includes('engineer')) {
      activities.push('🔧 Try building and construction projects', '⚙️ Learn how things work');
    } else if (job.includes('chef') || job.includes('cook')) {
      activities.push('👨‍🍳 Learn about cooking and nutrition', '🍎 Explore foods from different cultures');
    } else {
      activities.push('💼 Learn about different careers', '🌟 Explore skills for your dream job');
    }
    
    return activities;
  };

  if (loading) {
    return (
      <ThemedComponent variant="background" className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg">Loading your personal page...</div>
        </div>
      </ThemedComponent>
    );
  }

  if (!personalityProfile) {
    return (
      <ThemedComponent variant="background" className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Welcome to Your Personal Page!
            </h1>
            <p 
              className="text-lg mb-8"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Take our fun personality quiz to unlock your personalized experience!
            </p>
            <Button 
              onClick={handleTakeQuiz}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-full"
            >
              🌟 Take Personality Quiz
            </Button>
          </div>

          <Card className="mb-8" style={{ backgroundColor: currentTheme.colors.surface }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                What You'll Discover
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Your interests and passions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Your hobbies and activities</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>How people see you</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-green-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Your reading preferences</span>
                </div>
                <div className="flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-purple-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Your dream job</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-orange-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Personalized recommendations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ThemedComponent>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || 'Amazing Kid';
  const interestActivities = getInterestActivities(personalityProfile.interests);
  const hobbyRecommendations = getHobbyRecommendations(personalityProfile.hobbies);
  const readingRecommendations = getReadingRecommendations(personalityProfile.readingPreferences);
  const careerActivities = getCareerActivities(personalityProfile.dreamJob);

  return (
    <ThemedComponent variant="background" className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Star className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: currentTheme.colors.text.primary }}
          >
            {userName}'s Personal Page
          </h1>
          <p 
            className="text-lg"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            Here's what makes you special! ✨
          </p>
        </div>

        {personalityProfile.quizSummary && (
          <Card className="mb-8" style={{ backgroundColor: currentTheme.colors.surface }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                <Heart className="w-6 h-6 inline mr-2 text-red-500" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: currentTheme.colors.text.primary }} className="text-lg leading-relaxed">
                {personalityProfile.quizSummary}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {personalityProfile.interests.length > 0 && (
            <Card style={{ backgroundColor: currentTheme.colors.surface }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                  <Lightbulb className="w-5 h-5 inline mr-2" />
                  Your Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {personalityProfile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm" style={{ color: currentTheme.colors.text.primary }}>
                    Try These Activities:
                  </h4>
                  {interestActivities.map((activity, index) => (
                    <p key={index} className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                      {activity}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {personalityProfile.hobbies.length > 0 && (
            <Card style={{ backgroundColor: currentTheme.colors.surface }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                  <Star className="w-5 h-5 inline mr-2" />
                  Your Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {personalityProfile.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {hobby}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm" style={{ color: currentTheme.colors.text.primary }}>
                    Fun Ideas for You:
                  </h4>
                  {hobbyRecommendations.map((recommendation, index) => (
                    <p key={index} className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                      {recommendation}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {personalityProfile.personalityDescription && (
            <Card style={{ backgroundColor: currentTheme.colors.surface }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                  <Users className="w-5 h-5 inline mr-2" />
                  How People See You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: currentTheme.colors.text.primary }} className="italic">
                  "{personalityProfile.personalityDescription}"
                </p>
              </CardContent>
            </Card>
          )}

          {personalityProfile.dreamJob && (
            <Card style={{ backgroundColor: currentTheme.colors.surface }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                  <Rocket className="w-5 h-5 inline mr-2" />
                  Your Dream Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: currentTheme.colors.text.primary }} className="font-semibold mb-3">
                  {personalityProfile.dreamJob}
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm" style={{ color: currentTheme.colors.text.primary }}>
                    Career Preparation Activities:
                  </h4>
                  {careerActivities.map((activity, index) => (
                    <p key={index} className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                      {activity}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {personalityProfile.readingPreferences.length > 0 && (
          <Card className="mb-8" style={{ backgroundColor: currentTheme.colors.surface }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                <BookOpen className="w-5 h-5 inline mr-2" />
                What You Love to Read
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {personalityProfile.readingPreferences.map((preference, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {preference}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm" style={{ color: currentTheme.colors.text.primary }}>
                  Perfect Books for You:
                </h4>
                {readingRecommendations.map((recommendation, index) => (
                  <p key={index} className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    {recommendation}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card style={{ backgroundColor: currentTheme.colors.surface }}>
          <CardHeader>
            <CardTitle style={{ color: currentTheme.colors.text.primary }}>
              <Trophy className="w-5 h-5 inline mr-2" />
              Your Personalized Learning Journey
            </CardTitle>
            <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
              Based on everything I've learned about you, here are some amazing ways to keep growing!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  🎯 Perfect Challenges
                </h4>
                <p style={{ color: currentTheme.colors.text.secondary }}>
                  Ask me for quizzes and activities that match your interests and learning style!
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  📚 Story Time
                </h4>
                <p style={{ color: currentTheme.colors.text.secondary }}>
                  I can create personalized stories featuring your favorite topics and interests!
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  🎨 Creative Projects
                </h4>
                <p style={{ color: currentTheme.colors.text.secondary }}>
                  Let's work on art, writing, or building projects that match your personality!
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  🌟 Future Goals
                </h4>
                <p style={{ color: currentTheme.colors.text.secondary }}>
                  I'll help you explore your dream career and learn skills to reach your goals!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button 
            onClick={handleTakeQuiz}
            variant="outline"
          >
            🔄 Retake Personality Quiz
          </Button>
        </div>
      </div>
    </ThemedComponent>
  );
};

export default PersonalizedPage;
