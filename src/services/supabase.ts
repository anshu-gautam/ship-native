import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase credentials. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Upload file to storage
  uploadFile: async (bucket: string, path: string, file: File | Blob) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data;
  },

  // Get public URL for file
  getPublicUrl: (bucket: string, path: string) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },

  // Delete file from storage
  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
