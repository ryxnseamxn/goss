// Example: Add this to your Login component or after Auth0 authentication

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

const backendBase = import.meta.env.VITE_LOCAL_IP;

export function useUserSync() {
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user?.email) {
        try {
          const response = await fetch(`${backendBase}:5248/api/user/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              username: user.name || user.nickname,
            }),
          });

          if (response.ok) {
            const localUser = await response.json();
            console.log('User synced:', localUser);
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, user]);
}

// Usage in your App or Profile component:
// useUserSync();
