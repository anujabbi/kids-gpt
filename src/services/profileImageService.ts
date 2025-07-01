
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
        console.error('No authenticated user found');
        return { error: new Error('User not authenticated') };
      }

      console.log('Starting profile image save process:', { imageType, hasFile: !!customImageFile, userId: user.id });

      let customImageUrl = null;

      // If it's a custom image, upload it to storage
      if (imageType === 'custom' && customImageFile) {
        const fileExt = customImageFile.name.split('.').pop();
        const fileName = `${user.id}/profile-image.${fileExt}`;
        
        console.log('Uploading custom image:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, customImageFile, {
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          console.error('Upload error details:', {
            message: uploadError.message,
            statusCode: uploadError.statusCode,
          });
          return { error: uploadError };
        }

        console.log('Upload successful:', uploadData);

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        console.log('Generated public URL:', publicUrl);
        
        customImageUrl = publicUrl;
      }

      console.log('About to update profile with:', { 
        imageType, 
        customImageUrl,
        userId: user.id 
      });

      // Update the user's profile
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_image_type: imageType,
          custom_profile_image_url: customImageUrl
        })
        .eq('id', user.id)
        .select(); // Add select to see what was actually updated

      if (updateError) {
        console.error('Error updating profile:', updateError);
        console.error('Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        return { error: updateError };
      }

      console.log('Profile update successful:', updateData);
      console.log('Updated profile data:', updateData?.[0]);
      
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

      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile image:', error);
      return null;
    }
  }
};
