// services/storageService.js
import { supabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  static PROFILE_BUCKET = 'profile-photos';

  /**
   * Upload profile photo to Supabase Storage
   */
  static async uploadProfilePhoto(userId, file) {
    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.PROFILE_BUCKET)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.PROFILE_BUCKET)
        .getPublicUrl(fileName);

      return {
        fileName: fileName,
        publicUrl: urlData.publicUrl
      };

    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload profile photo');
    }
  }

  /**
   * Delete profile photo from Supabase Storage
   */
  static async deleteProfilePhoto(fileName) {
    try {
      const { error } = await supabase.storage
        .from(this.PROFILE_BUCKET)
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        // Don't throw error - deletion failure shouldn't break the flow
      }
    } catch (error) {
      console.error('Delete profile photo error:', error);
    }
  }

  /**
   * Extract filename from Supabase URL
   */
  static extractFileNameFromUrl(url) {
    if (!url) return null;
    
    try {
      // Supabase storage URLs have this format:
      // https://[project].supabase.co/storage/v1/object/public/profile-photos/[filename]
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === this.PROFILE_BUCKET);
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        // Return everything after the bucket name
        return urlParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch (error) {
      console.error('Error extracting filename:', error);
      return null;
    }
  }

  /**
   * Initialize storage bucket (run once during setup)
   */
  static async initializeBucket() {
    try {
      // Create bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(this.PROFILE_BUCKET, {
        public: true, // Make files publicly accessible
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 5MB limit
      });

      if (error && error.message !== 'Bucket already exists') {
        console.error('Bucket creation error:', error);
        throw error;
      }

      console.log('Storage bucket initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage bucket:', error);
    }
  }
}

export default StorageService;