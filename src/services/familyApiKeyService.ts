
import { supabase } from '@/integrations/supabase/client';

export class FamilyApiKeyService {
  
  async getFamilyApiKey(familyId: string): Promise<string | null> {
    console.log('Fetching family API key for family:', familyId);
    try {
      const { data, error } = await supabase
        .from('families')
        .select('openai_api_key')
        .eq('id', familyId)
        .single();

      if (error) {
        console.error('Error fetching family API key:', error);
        return null;
      }

      return data?.openai_api_key || null;
    } catch (error) {
      console.error('Error fetching family API key:', error);
      return null;
    }
  }

  async updateFamilyApiKey(familyId: string, apiKey: string): Promise<{ error: any }> {
    console.log('Updating family API key for family:', familyId);
    try {
      const { error } = await supabase
        .from('families')
        .update({ openai_api_key: apiKey })
        .eq('id', familyId);

      if (error) {
        console.error('Error updating family API key:', error);
        return { error };
      }

      console.log('Family API key updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating family API key:', error);
      return { error };
    }
  }

  async removeFamilyApiKey(familyId: string): Promise<{ error: any }> {
    console.log('Removing family API key for family:', familyId);
    try {
      const { error } = await supabase
        .from('families')
        .update({ openai_api_key: null })
        .eq('id', familyId);

      if (error) {
        console.error('Error removing family API key:', error);
        return { error };
      }

      console.log('Family API key removed successfully');
      return { error: null };
    } catch (error) {
      console.error('Error removing family API key:', error);
      return { error };
    }
  }
}

export const familyApiKeyService = new FamilyApiKeyService();
