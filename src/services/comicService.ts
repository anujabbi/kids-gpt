import { supabase } from '@/integrations/supabase/client';
import { Comic, ComicPanel, ComicGenerationRequest, PanelEditRequest } from '@/types/comic';
import { generateComicPrompts, enhancePromptWithCharacterConsistency, extractCharacterDescription, ComicStyle } from '@/utils/comicPrompts';
import { imageGenerationService } from './imageGenerationService';

export class ComicService {
  async generateComic(request: ComicGenerationRequest): Promise<Comic> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is a child
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'child') {
      throw new Error('Only children can create comics');
    }

    // Generate panel prompts
    const panelPrompts = generateComicPrompts(request.storyIdea, request.comicStyle);
    const panels: ComicPanel[] = [];
    let characterDescription = '';
    let mainGenerationId = '';

    // Generate images for each panel
    for (let i = 0; i < panelPrompts.length; i++) {
      const panelPrompt = panelPrompts[i];
      let enhancedPrompt = panelPrompt.prompt;

      // For panels 2 and 3, use character consistency
      if (i > 0 && characterDescription) {
        enhancedPrompt = enhancePromptWithCharacterConsistency(
          panelPrompt.prompt,
          characterDescription,
          mainGenerationId
        );
      }

      try {
        const generatedImage = await imageGenerationService.generateImage(
          {
            prompt: enhancedPrompt,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
          },
          profile.family_id
        );

        // Extract character description from first panel
        if (i === 0) {
          characterDescription = extractCharacterDescription(enhancedPrompt);
          // Note: OpenAI's actual generation ID would be extracted from the response
          // For now, we'll use a placeholder
          mainGenerationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Upload image to Supabase storage
        const imageUrl = await this.uploadComicImage(generatedImage.url, user.id, i);

        panels.push({
          id: `panel_${i}_${Date.now()}`,
          imageUrl,
          prompt: enhancedPrompt,
          caption: panelPrompt.caption,
          generationId: i === 0 ? mainGenerationId : undefined
        });
      } catch (error) {
        console.error(`Failed to generate panel ${i + 1}:`, error);
        throw new Error(`Failed to generate panel ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Save comic to database
    const title = `${request.storyIdea.slice(0, 50)}${request.storyIdea.length > 50 ? '...' : ''}`;
    
    const { data: comic, error } = await supabase
      .from('comics')
      .insert({
        user_id: user.id,
        title,
        story_idea: request.storyIdea,
        comic_style: request.comicStyle,
        panels: panels as any,
        generation_id: mainGenerationId,
        is_public: true
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save comic:', error);
      throw new Error('Failed to save comic');
    }

    return this.mapDbComicToComic(comic);
  }

  async regeneratePanel(request: PanelEditRequest): Promise<ComicPanel> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the comic
    const { data: comic, error: fetchError } = await supabase
      .from('comics')
      .select('*')
      .eq('id', request.comicId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !comic) {
      throw new Error('Comic not found or access denied');
    }

    const panels = comic.panels as any as ComicPanel[];
    if (request.panelIndex >= panels.length) {
      throw new Error('Panel index out of range');
    }

    const currentPanel = panels[request.panelIndex];
    const updatedPrompt = request.prompt || currentPanel.prompt;
    const updatedCaption = request.caption || currentPanel.caption;

    // Get user profile for family_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', user.id)
      .single();

    // Generate new image
    const generatedImage = await imageGenerationService.generateImage(
      {
        prompt: updatedPrompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      },
      profile?.family_id
    );

    // Upload new image
    const imageUrl = await this.uploadComicImage(generatedImage.url, user.id, request.panelIndex);

    // Update panel
    const updatedPanel: ComicPanel = {
      ...currentPanel,
      imageUrl,
      prompt: updatedPrompt,
      caption: updatedCaption
    };

    // Update panels array
    panels[request.panelIndex] = updatedPanel;

    // Save updated comic
    const { error: updateError } = await supabase
      .from('comics')
      .update({ panels: panels as any })
      .eq('id', request.comicId);

    if (updateError) {
      console.error('Failed to update comic:', updateError);
      throw new Error('Failed to update comic');
    }

    return updatedPanel;
  }

  async getComic(id: string): Promise<Comic | null> {
    const { data: comic, error } = await supabase
      .from('comics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !comic) {
      return null;
    }

    return this.mapDbComicToComic(comic);
  }

  async getUserComics(userId: string): Promise<Comic[]> {
    const { data: comics, error } = await supabase
      .from('comics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user comics:', error);
      return [];
    }

    return comics.map(comic => this.mapDbComicToComic(comic));
  }

  async incrementViewCount(id: string): Promise<void> {
    // Simple increment by fetching current count and updating
    const { data: comic, error: fetchError } = await supabase
      .from('comics')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError || !comic) {
      console.error('Failed to fetch comic for view count:', fetchError);
      return;
    }

    const { error } = await supabase
      .from('comics')
      .update({ view_count: comic.view_count + 1 })
      .eq('id', id);

    if (error) {
      console.error('Failed to increment view count:', error);
    }
  }

  private async uploadComicImage(imageUrl: string, userId: string, panelIndex: number): Promise<string> {
    // Download the image from the URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Create a unique filename
    const filename = `${userId}/comic_${Date.now()}_panel_${panelIndex}.png`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('comic-images')
      .upload(filename, blob);

    if (error) {
      console.error('Failed to upload comic image:', error);
      throw new Error('Failed to upload comic image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('comic-images')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  private mapDbComicToComic(dbComic: any): Comic {
    return {
      id: dbComic.id,
      userId: dbComic.user_id,
      title: dbComic.title,
      storyIdea: dbComic.story_idea,
      comicStyle: dbComic.comic_style as ComicStyle,
      panels: dbComic.panels as any as ComicPanel[],
      generationId: dbComic.generation_id,
      isPublic: dbComic.is_public,
      createdAt: new Date(dbComic.created_at),
      updatedAt: new Date(dbComic.updated_at),
      viewCount: dbComic.view_count || 0
    };
  }
}

export const comicService = new ComicService();