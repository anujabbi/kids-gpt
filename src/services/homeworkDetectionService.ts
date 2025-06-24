
const HOMEWORK_DETECTION_SYSTEM_PROMPT = `You are a homework misuse detection AI. Your job is to analyze a conversation between a child and an AI assistant to determine if the child is trying to get direct answers to homework questions without learning.

Analyze both the user's question and the AI's response. Return ONLY a number from 0-100 representing the "Homework Misuse Score":

0-20: Clearly educational interaction, encourages critical thinking and learning
21-40: Mostly educational with some direct information provided
41-60: Mixed interaction - some direct answers but with educational context
61-80: Likely homework help with minimal learning encouragement
81-100: Almost certainly homework copying - direct answers without educational value

Look for these patterns:

HIGH MISUSE INDICATORS (80-100):
- Direct answers to math problems without explanation
- Copy-paste style definitions or facts
- Step-by-step solutions without encouraging understanding
- Questions that seem beyond the child's developmental level
- Urgent language like "I need this now" or "it's due tomorrow"

MEDIUM MISUSE INDICATORS (40-79):
- Some educational content but also direct answers
- Homework-related keywords with mixed educational approach
- Partial explanations but still giving away key answers

LOW MISUSE INDICATORS (0-39):
- Encourages the child to think and explore
- Asks guiding questions back to the child
- Explains concepts rather than giving direct answers
- Uses analogies, stories, or interactive elements
- Promotes curiosity and further learning

Return ONLY the number, nothing else.`;

export const analyzeHomeworkMisuse = async (userQuestion: string, aiResponse: string): Promise<number> => {
  const apiKey = localStorage.getItem("openai_api_key");
  
  if (!apiKey) {
    console.warn("No OpenAI API key found for homework detection");
    return 0; // Default to no misuse if we can't analyze
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: HOMEWORK_DETECTION_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `User Question: "${userQuestion}"\n\nAI Response: "${aiResponse}"\n\nHomework Misuse Score:`
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error("Homework detection API error:", response.status);
      return 0;
    }

    const data = await response.json();
    const scoreText = data.choices[0]?.message?.content?.trim();
    const score = parseInt(scoreText);
    
    // Validate the score is within expected range
    if (isNaN(score) || score < 0 || score > 100) {
      console.warn("Invalid homework detection score:", scoreText);
      return 0;
    }

    return score;
  } catch (error) {
    console.error("Error analyzing homework misuse:", error);
    return 0; // Default to no misuse if analysis fails
  }
};
