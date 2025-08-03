export type PanelType = 'establishing_shot' | 'close_up' | 'medium_shot';
export type ComicStyle = 'cartoon' | 'ghibli' | 'superhero';

export interface ComicCharacter {
  name: string;
  description: string;
  visualDescription: string;
}

export interface ComicPanel {
  id: string;
  imageUrl: string;
  prompt: string;
  dialogue?: string;
  caption: string;
  panelType: PanelType;
  generationId?: string;
}

export interface Comic {
  id: string;
  userId: string;
  title: string;
  storyIdea: string;
  comicStyle: ComicStyle;
  panels: ComicPanel[];
  generationId?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

export interface StoryPlan {
  title: string;
  characters: ComicCharacter[];
  panels: {
    panel: number;
    image_prompt: string;
    dialogue?: string;
    caption: string;
    panel_type: PanelType;
  }[];
}

export interface ComicGenerationRequest {
  storyIdea: string;
  comicStyle: ComicStyle;
}

export interface PanelEditRequest {
  comicId: string;
  panelIndex: number;
  prompt?: string;
  caption?: string;
}