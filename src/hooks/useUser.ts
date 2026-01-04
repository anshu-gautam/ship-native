import { useUserStore } from '@/store';
import type { User } from '@/types';

export const useUser = () => {
  const { profile, setProfile, updateProfile } = useUserStore();

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      // Call your API to update the user profile
      // const response = await apiClient.patch('/users/me', updates);
      // updateProfile(response.data);

      // For now, just update the local store
      updateProfile(updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return {
    profile,
    setProfile,
    updateProfile: updateUserProfile,
  };
};
