
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
        
        // Validate the public URL before using it
        if (publicUrl && publicUrl.trim() !== '') {
          customImageUrl = publicUrl;
        } else {
          console.error('Invalid public URL generated:', publicUrl);
          return { error: new Error('Failed to generate valid image URL') };
        }
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
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }
      
      if (!targetUserId) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('profile_image_type, custom_profile_image_url')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching profile image:', error);
        return null;
      }

      // Validate the custom_profile_image_url if it exists
      if (data?.custom_profile_image_url) {
        try {
          new URL(data.custom_profile_image_url);
        } catch {
          console.warn('Invalid custom profile image URL found:', data.custom_profile_image_url);
          // Return data but with null URL so it falls back to default
          return {
            ...data,
            custom_profile_image_url: null
          };
        }
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile image:', error);
      return null;
    }
  }
};
