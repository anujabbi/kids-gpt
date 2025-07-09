
import { PersonalityProfile } from '@/types/chat';

export const generatePersonalizedSuggestions = (profile: PersonalityProfile): string[] => {
  const suggestions: string[] = [];
  
  // Interest-based suggestions
  if (profile.interests.includes('science')) {
    suggestions.push('🔬 Explain a cool science experiment I can try');
  }
  if (profile.interests.includes('art') || profile.interests.includes('drawing')) {
    suggestions.push('🎨 Teach me how to draw my favorite animal');
  }
  if (profile.interests.includes('music')) {
    suggestions.push('🎵 Tell me about different musical instruments');
  }
  if (profile.interests.includes('space')) {
    suggestions.push('🚀 Tell me amazing facts about planets and stars');
  }
  if (profile.interests.includes('animals')) {
    suggestions.push('🐾 Share cool facts about my favorite animals');
  }
  if (profile.interests.includes('math')) {
    suggestions.push('🔢 Create fun math puzzles for me');
  }

  // Hobby-based suggestions
  if (profile.hobbies.includes('reading')) {
    suggestions.push('📚 Recommend books I would love to read');
  }
  if (profile.hobbies.includes('drawing') || profile.hobbies.includes('painting')) {
    suggestions.push('🖌️ Give me step-by-step drawing instructions');
  }
  if (profile.hobbies.includes('cooking') || profile.hobbies.includes('baking')) {
    suggestions.push('👨‍🍳 Share kid-friendly recipes I can try');
  }
  if (profile.hobbies.includes('games')) {
    suggestions.push('🎲 Play word games and riddles with me');
  }
  if (profile.hobbies.includes('sports')) {
    suggestions.push('⚽ Tell me about my favorite sport and athletes');
  }

  // Reading preference-based suggestions
  if (profile.readingPreferences.includes('adventure')) {
    suggestions.push('🗺️ Create an exciting adventure story with me as the hero');
  }
  if (profile.readingPreferences.includes('mystery')) {
    suggestions.push('🔍 Tell me a mystery story I can help solve');
  }
  if (profile.readingPreferences.includes('fantasy')) {
    suggestions.push('🧙‍♂️ Create a magical adventure story for me');
  }
  if (profile.readingPreferences.includes('humor')) {
    suggestions.push('😄 Tell me funny jokes and riddles');
  }

  // Dream job-based suggestions
  if (profile.dreamJob) {
    const job = profile.dreamJob.toLowerCase();
    if (job.includes('doctor') || job.includes('nurse')) {
      suggestions.push('🩺 Teach me how doctors help people feel better');
    } else if (job.includes('teacher')) {
      suggestions.push('🎓 Help me learn something new and exciting');
    } else if (job.includes('artist') || job.includes('painter')) {
      suggestions.push('🎨 Show me different art techniques I can try');
    } else if (job.includes('scientist')) {
      suggestions.push('🔬 Tell me about amazing scientific discoveries');
    } else if (job.includes('astronaut')) {
      suggestions.push('🚀 Explore space facts and space travel with me');
    } else if (job.includes('chef') || job.includes('cook')) {
      suggestions.push('👨‍🍳 Teach me about cooking and different foods');
    }
  }

  // Always include the popular coloring page option
  suggestions.push('🎨 Create coloring page');

  // Remove duplicates and shuffle
  const uniqueSuggestions = [...new Set(suggestions)];
  
  // If we have fewer than 6 suggestions, add some general ones
  const generalSuggestions = [
    '🌟 Tell me something amazing I\'ve never heard before',
    '🎯 Create a fun challenge for me',
    '📖 Make up a story just for me',
    '🧠 Ask me trivia questions',
    '🎪 Plan a fun activity I can do today',
    '🌈 Teach me about colors and creativity'
  ];

  // Fill up to 6 suggestions
  while (uniqueSuggestions.length < 6) {
    const randomGeneral = generalSuggestions[Math.floor(Math.random() * generalSuggestions.length)];
    if (!uniqueSuggestions.includes(randomGeneral)) {
      uniqueSuggestions.push(randomGeneral);
    }
  }

  // Return exactly 6 suggestions
  return uniqueSuggestions.slice(0, 6);
};

export const getDefaultSuggestions = (): string[] => [
  "🦕 Cool dinosaur facts",
  "🎨 Draw a magical castle",
  "🧮 Fun math games",
  "🧠 Fun quiz",
  "🌍 Learn about countries",
  "🎨 Create coloring page"
];
