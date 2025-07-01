
import { supabase } from "@/integrations/supabase/client";

export interface ProfileImageData {
  profile_image_type: string;
  custom_profile_image_url?: string;
}

export const profileImageService = {
  async saveProfileImage(imageType: string, customImageFile?: File): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      let customImageUrl = null;

      // If it's a custom image, upload it to storage
      if (imageType === 'custom' && customImageFile) {
        const fileExt = customImageFile.name.split('.').pop();
        const fileName = `${user.id}/profile-image.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, customImageFile, {
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          return { error: uploadError };
        }

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        customImageUrl = publicUrl;
      }

      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_image_type: imageType,
          custom_profile_image_url: customImageUrl
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return { error: updateError };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error saving profile image:', error);
      return { error };
    }
  },

  async getProfileImage(userId?: string): Promise<ProfileImageData | null> {
    try {
      console.log('profileImageService.getProfileImage called with userId:', userId);
      
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }
      
      if (!targetUserId) {
        console.log('profileImageService.getProfileImage - No user ID available');
        return null;
      }

      console.log('profileImageService.getProfileImage - Fetching for user:', targetUserId);

      const { data, error } = await supabase
        .from('profiles')
        .select('profile_image_type, custom_profile_image_url')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching profile image:', error);
        return null;
      }

      console.log('profileImageService.getProfileImage - Retrieved data:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile image:', error);
      return null;
    }
  }
};
