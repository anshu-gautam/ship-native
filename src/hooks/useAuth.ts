import { useAuthStore } from '@/store';
import type { User } from '@/types';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';

export const useAuth = () => {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { user, setUser, setIsAuthenticated, setIsLoading, signOut } = useAuthStore();

  useEffect(() => {
    setIsLoading(!isLoaded);
  }, [isLoaded, setIsLoading]);

  useEffect(() => {
    if (isLoaded) {
      setIsAuthenticated(!!isSignedIn);

      if (isSignedIn && clerkUser) {
        const userData: User = {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          fullName: clerkUser.fullName || undefined,
          imageUrl: clerkUser.imageUrl || undefined,
          createdAt: clerkUser.createdAt?.toString() || new Date().toISOString(),
          updatedAt: clerkUser.updatedAt?.toString() || new Date().toISOString(),
        };
        setUser(userData);
      } else {
        setUser(null);
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, setIsAuthenticated, setUser]);

  return {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    user,
    signOut,
  };
};
