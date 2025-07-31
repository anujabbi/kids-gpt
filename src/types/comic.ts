export interface ComicPanel {
  id: string;
  imageUrl: string;
  prompt: string;
  caption: string;
  generationId?: string;
}

export interface Comic {
  id: string;
  userId: string;
  title: string;
  storyIdea: string;
  comicStyle: 'cartoon' | 'ghibli' | 'superhero';
  panels: ComicPanel[];
  generationId?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

export interface ComicGenerationRequest {
  storyIdea: string;
  comicStyle: 'cartoon' | 'ghibli' | 'superhero';
}

export interface PanelEditRequest {
  comicId: string;
  panelIndex: number;
  prompt?: string;
  caption?: string;
}