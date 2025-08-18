import { ComicStyle } from '@/types/comic';

export interface CharacterPromptVariables {
  style: string;
  characterName: string;
  characterDescription: string;
}

export const CHARACTER_GENERATION_PROMPT = `{{style}} Character portrait: {{characterName}} - {{characterDescription}}. High quality character design, clear features, consistent style for comic book. Full body shot showing distinctive features, clothing, and personality traits.`;

export const CHARACTER_VISUAL_DESCRIPTION_TEMPLATE = `{{style}} Detailed physical appearance for consistency: body type, height, facial features, hair, clothing, distinctive features (4-5 sentences)`;

export function buildCharacterPrompt(variables: CharacterPromptVariables): string {
  return CHARACTER_GENERATION_PROMPT
    .replace(/{{style}}/g, variables.style)
    .replace(/{{characterName}}/g, variables.characterName)
    .replace(/{{characterDescription}}/g, variables.characterDescription);
}

export function buildCharacterVisualDescription(style: string): string {
  return CHARACTER_VISUAL_DESCRIPTION_TEMPLATE.replace(/{{style}}/g, style);
}