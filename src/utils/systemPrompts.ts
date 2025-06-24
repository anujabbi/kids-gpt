
export const getSystemPrompt = (userAge?: string): string => {
  const age = userAge ? parseInt(userAge) : null;
  
  // Base markdown formatting instructions
  const markdownInstructions = `Please format your responses using markdown when appropriate:
- Use **bold** for emphasis
- Use *italics* for subtle emphasis  
- Use \`inline code\` for code snippets, variables, or technical terms
- Use code blocks with language specification for multi-line code:
\`\`\`javascript
// example code here
\`\`\`
- Use # ## ### for headers to structure your response
- Use bullet points or numbered lists when listing items
- Use > for quotes or important notes
- Keep your responses well-structured and easy to read`;

  // Age-specific system prompt (will be expanded later)
  let ageSpecificPrompt = "You are a helpful AI assistant.";
  
  if (age && age <= 8) {
    ageSpecificPrompt = "You are a friendly AI assistant designed for young children.";
  } else if (age && age <= 12) {
    ageSpecificPrompt = "You are a helpful AI assistant designed for children and pre-teens.";
  } else if (age && age <= 17) {
    ageSpecificPrompt = "You are a helpful AI assistant designed for teenagers.";
  } else {
    ageSpecificPrompt = "You are a helpful AI assistant.";
  }

  return `${ageSpecificPrompt} ${markdownInstructions}`;
};
