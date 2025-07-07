
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedComponent } from '@/components/ThemedComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonalityProfile } from '@/types/chat';
import { personalityService } from '@/services/personalityService';
import { Heart, Star, Palette, BookOpen, Trophy, Sparkles } from 'lucide-react';
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
    // The main page will show the personality quiz button
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
                  <span style={{ color: currentTheme.colors.text.primary }}>Your favorite things</span>
                </div>
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-blue-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Your favorite colors</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-green-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>How you like to learn</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span style={{ color: currentTheme.colors.text.primary }}>Your special talents</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ThemedComponent>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || 'Amazing Kid';

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
          {personalityProfile.favoriteColors.length > 0 && (
            <Card style={{ backgroundColor: currentTheme.colors.surface }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                  <Palette className="w-5 h-5 inline mr-2" />
                  Favorite Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {personalityProfile.favoriteColors.map((color, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {color}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {personalityProfile.interests.length > 0 && (
            <Card style={{ backgroundColor: currentTheme.colors.surface }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                  <Star className="w-5 h-5 inline mr-2" />
                  Interests & Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {personalityProfile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {personalityProfile.learningStyle && (
          <Card className="mb-8" style={{ backgroundColor: currentTheme.colors.surface }}>
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text.primary }}>
                <BookOpen className="w-5 h-5 inline mr-2" />
                Learning Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: currentTheme.colors.text.primary }}>
                {personalityProfile.learningStyle}
              </p>
            </CardContent>
          </Card>
        )}

        <Card style={{ backgroundColor: currentTheme.colors.surface }}>
          <CardHeader>
            <CardTitle style={{ color: currentTheme.colors.text.primary }}>
              <Trophy className="w-5 h-5 inline mr-2" />
              Recommended Just for You
            </CardTitle>
            <CardDescription style={{ color: currentTheme.colors.text.secondary }}>
              Based on your personality, here are some activities you might love!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalityProfile.interests.includes('art') || personalityProfile.interests.includes('drawing') ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                  <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    🎨 Creative Activities
                  </h4>
                  <p style={{ color: currentTheme.colors.text.secondary }}>
                    Try digital art, crafting projects, or design challenges!
                  </p>
                </div>
              ) : null}
              
              {personalityProfile.interests.includes('science') ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                  <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    🔬 Science Fun
                  </h4>
                  <p style={{ color: currentTheme.colors.text.secondary }}>
                    Explore experiments, space facts, or nature discoveries!
                  </p>
                </div>
              ) : null}

              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  📚 Learning Adventures
                </h4>
                <p style={{ color: currentTheme.colors.text.secondary }}>
                  Ask me to create personalized stories or learning games!
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  🎮 Fun Challenges
                </h4>
                <p style={{ color: currentTheme.colors.text.secondary }}>
                  Request riddles, puzzles, or trivia made just for you!
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
