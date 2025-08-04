import { supabase } from '@/integrations/supabase/client';
import { Comic, ComicPanel, ComicGenerationRequest, PanelEditRequest, ComicStyle, PanelType } from '@/types/comic';
import { generateProfessionalImagePrompt, enhancePromptWithCharacterConsistency, extractCharacterDescription } from '@/utils/comicPrompts';
import { storyPlanningService } from './storyPlanningService';
import { imageGenerationService } from './imageGenerationService';

// Comic Service - Professional comic generation with story planning
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

    // Generate story plan using AI
    const storyPlan = await storyPlanningService.generateStoryPlan(request.storyIdea, request.comicStyle);
    if (!storyPlan) {
      throw new Error('Failed to generate story plan');
    }

    const panels: ComicPanel[] = [];
    let characterDescription = '';
    let mainGenerationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate images for each panel using the story plan
    for (let i = 0; i < storyPlan.panels.length; i++) {
      const panelPlan = storyPlan.panels[i];
      
      // Generate professional image prompt
      const enhancedPrompt = generateProfessionalImagePrompt(
        panelPlan.image_prompt,
        panelPlan.panel_type,
        request.comicStyle,
        panelPlan.panel,
        i > 0 ? characterDescription : undefined
      );

      try {
        const generatedImage = await imageGenerationService.generateImage(
          {
            prompt: enhancedPrompt,
            size: '1024x1024',
            quality: 'standard'
          },
          profile.family_id
        );

        // Extract character description from first panel
        if (i === 0) {
          characterDescription = extractCharacterDescription(panelPlan.image_prompt);
        }

        // Upload image to Supabase storage
        const imageUrl = await this.handleImageStorage(generatedImage.url, user.id, i);

        panels.push({
          id: `panel_${i}_${Date.now()}`,
          imageUrl,
          prompt: enhancedPrompt,
          caption: panelPlan.caption,
          panelType: panelPlan.panel_type,
          generationId: i === 0 ? mainGenerationId : undefined
        });
      } catch (error) {
        console.error(`Failed to generate panel ${i + 1}:`, error);
        throw new Error(`Failed to generate panel ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Save comic to database
    const title = storyPlan.title || `${request.storyIdea.slice(0, 50)}${request.storyIdea.length > 50 ? '...' : ''}`;
    
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
        quality: 'standard'
      },
      profile?.family_id
    );

    // Upload new image
    const imageUrl = await this.handleImageStorage(generatedImage.url, user.id, request.panelIndex);

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

  private async handleImageStorage(imageUrl: string, userId: string, panelIndex: number): Promise<string> {
    // For now, return the OpenAI URL directly since they're temporary but work for immediate display
    // In production, you'd want to implement an edge function to proxy the image download
    console.log('Using OpenAI image URL directly:', imageUrl);
    return imageUrl;
  }

  private async uploadComicImage(imageUrl: string, userId: string, panelIndex: number): Promise<string> {
    try {
      // Try to upload to Supabase storage
      // Note: This may fail due to CORS restrictions on OpenAI URLs
      const response = await fetch(imageUrl, { 
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

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
    } catch (error) {
      console.error('Upload failed, using original URL:', error);
      // Fallback to original URL if upload fails
      return imageUrl;
    }
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