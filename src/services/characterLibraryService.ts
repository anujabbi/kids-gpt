import { supabase } from '@/integrations/supabase/client';
import { LibraryCharacter, CreateCharacterInput, ComicStyle } from '@/types/comic';
import { geminiImageService } from './geminiImageService';

/**
 * Database row type for character_library table
 */
interface CharacterRow {
  id: string;
  name: string;
  description: string;
  visual_description: string;
  image_url: string;
  art_style: string;
  created_by: string | null;
  is_public: boolean;
  is_featured: boolean;
  use_count: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database row to LibraryCharacter type
 */
function rowToCharacter(row: CharacterRow): LibraryCharacter {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visualDescription: row.visual_description,
    imageUrl: row.image_url,
    artStyle: row.art_style as ComicStyle,
    createdBy: row.created_by,
    isPublic: row.is_public,
    isFeatured: row.is_featured,
    useCount: row.use_count,
    tags: row.tags || [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

class CharacterLibraryService {
  private readonly bucketName = 'character-library';

  /**
   * Get featured characters (pre-made library characters)
   */
  async getFeaturedCharacters(): Promise<LibraryCharacter[]> {
    const { data, error } = await supabase
      .from('character_library')
      .select('*')
      .eq('is_featured', true)
      .order('use_count', { ascending: false });

    if (error) {
      console.error('Error fetching featured characters:', error);
      return [];
    }

    return (data as CharacterRow[]).map(rowToCharacter);
  }

  /**
   * Get public characters (shared by other users)
   */
  async getPublicCharacters(
    artStyle?: ComicStyle,
    limit = 20
  ): Promise<LibraryCharacter[]> {
    let query = supabase
      .from('character_library')
      .select('*')
      .eq('is_public', true)
      .eq('is_featured', false)
      .order('use_count', { ascending: false })
      .limit(limit);

    if (artStyle) {
      query = query.eq('art_style', artStyle);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching public characters:', error);
      return [];
    }

    return (data as CharacterRow[]).map(rowToCharacter);
  }

  /**
   * Get characters created by the current user
   */
  async getMyCharacters(): Promise<LibraryCharacter[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('character_library')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user characters:', error);
      return [];
    }

    return (data as CharacterRow[]).map(rowToCharacter);
  }

  /**
   * Search characters by name or tags
   */
  async searchCharacters(
    query: string,
    artStyle?: ComicStyle
  ): Promise<LibraryCharacter[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    let dbQuery = supabase
      .from('character_library')
      .select('*')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .or('is_public.eq.true,is_featured.eq.true')
      .order('use_count', { ascending: false })
      .limit(20);

    if (artStyle) {
      dbQuery = dbQuery.eq('art_style', artStyle);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching characters:', error);
      return [];
    }

    return (data as CharacterRow[]).map(rowToCharacter);
  }

  /**
   * Get a single character by ID
   */
  async getCharacter(id: string): Promise<LibraryCharacter | null> {
    const { data, error } = await supabase
      .from('character_library')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
      return null;
    }

    return rowToCharacter(data as CharacterRow);
  }

  /**
   * Create a new character with AI-generated image
   */
  async createCharacter(input: CreateCharacterInput): Promise<LibraryCharacter> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to create a character');
    }

    // Generate character image using Gemini
    console.log('Generating character image with Gemini...');
    const imageDataUrl = await geminiImageService.generateCharacter(
      input.name,
      input.visualDescription,
      input.artStyle
    );

    // Convert to blob and upload to Supabase Storage
    const imageBlob = geminiImageService.dataUrlToBlob(imageDataUrl);
    const imageUrl = await this.uploadCharacterImage(imageBlob, user.id);

    // Insert into database
    const { data, error } = await supabase
      .from('character_library')
      .insert({
        name: input.name,
        description: input.description,
        visual_description: input.visualDescription,
        image_url: imageUrl,
        art_style: input.artStyle,
        created_by: user.id,
        is_public: input.isPublic ?? false,
        is_featured: false,
        tags: input.tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to save character to library');
    }

    return rowToCharacter(data as CharacterRow);
  }

  /**
   * Upload a character image to Supabase Storage
   */
  async uploadCharacterImage(imageBlob: Blob, userId: string): Promise<string> {
    const fileName = `${userId}/${crypto.randomUUID()}.png`;

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error('Error uploading character image:', error);
      throw new Error('Failed to upload character image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Upload an image from a data URL
   */
  async uploadImageFromDataUrl(dataUrl: string, userId: string): Promise<string> {
    const blob = geminiImageService.dataUrlToBlob(dataUrl);
    return this.uploadCharacterImage(blob, userId);
  }

  /**
   * Update a character's details
   */
  async updateCharacter(
    id: string,
    updates: Partial<Pick<CreateCharacterInput, 'name' | 'description' | 'tags' | 'isPublic'>>
  ): Promise<LibraryCharacter> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to update a character');
    }

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('character_library')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id) // Ensure user owns the character
      .select()
      .single();

    if (error) {
      console.error('Error updating character:', error);
      throw new Error('Failed to update character');
    }

    return rowToCharacter(data as CharacterRow);
  }

  /**
   * Delete a character
   */
  async deleteCharacter(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to delete a character');
    }

    // Get character to find image path
    const character = await this.getCharacter(id);
    if (!character) {
      throw new Error('Character not found');
    }

    // Delete from database
    const { error } = await supabase
      .from('character_library')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error('Error deleting character:', error);
      throw new Error('Failed to delete character');
    }

    // Try to delete the image from storage (don't fail if this doesn't work)
    try {
      const urlParts = character.imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // userId/filename.png
      await supabase.storage.from(this.bucketName).remove([filePath]);
    } catch (e) {
      console.warn('Failed to delete character image from storage:', e);
    }
  }

  /**
   * Increment the use count for a character (called when used in a comic)
   */
  async incrementUseCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_character_use_count', {
      character_id: id
    });

    if (error) {
      console.warn('Failed to increment character use count:', error);
    }
  }

  /**
   * Save a comic character to the library
   * Used when a user wants to save a character they created during comic creation
   */
  async saveComicCharacterToLibrary(
    name: string,
    description: string,
    visualDescription: string,
    imageDataUrl: string,
    artStyle: ComicStyle,
    isPublic = false
  ): Promise<LibraryCharacter> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to save a character');
    }

    // Upload image to storage
    const imageUrl = await this.uploadImageFromDataUrl(imageDataUrl, user.id);

    // Insert into database
    const { data, error } = await supabase
      .from('character_library')
      .insert({
        name,
        description,
        visual_description: visualDescription,
        image_url: imageUrl,
        art_style: artStyle,
        created_by: user.id,
        is_public: isPublic,
        is_featured: false,
        tags: []
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving character to library:', error);
      throw new Error('Failed to save character to library');
    }

    return rowToCharacter(data as CharacterRow);
  }
}

export const characterLibraryService = new CharacterLibraryService();
