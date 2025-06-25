
export const detectImageRequest = (message: string): { isImageRequest: boolean; extractedPrompt: string } => {
  const imageKeywords = [
    'draw', 'create image', 'generate image', 'make image', 'picture of', 'image of',
    'draw me', 'create a picture', 'generate a picture', 'make a picture',
    'illustrate', 'sketch', 'paint', 'artwork of', 'illustration of'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check if message contains image generation keywords
  const hasImageKeyword = imageKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (!hasImageKeyword) {
    return { isImageRequest: false, extractedPrompt: '' };
  }
  
  // Extract the prompt by removing common prefixes
  let extractedPrompt = message;
  const prefixesToRemove = [
    /^(can you |could you |please )?draw (me )?/i,
    /^(can you |could you |please )?create (an? )?(image|picture) (of )?/i,
    /^(can you |could you |please )?generate (an? )?(image|picture) (of )?/i,
    /^(can you |could you |please )?make (an? )?(image|picture) (of )?/i,
    /^(can you |could you |please )?illustrate /i,
    /^(can you |could you |please )?sketch /i,
    /^(can you |could you |please )?paint /i,
  ];
  
  prefixesToRemove.forEach(prefix => {
    extractedPrompt = extractedPrompt.replace(prefix, '');
  });
  
  return { 
    isImageRequest: true, 
    extractedPrompt: extractedPrompt.trim() || message 
  };
};
