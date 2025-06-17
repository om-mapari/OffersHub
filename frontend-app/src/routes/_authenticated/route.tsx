import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // This function runs before the route is loaded
    // We need to ensure auth state is initialized before checking
    const auth = useAuthStore.getState().auth;

    // If auth is not initialized, initialize it
    if (!auth.isInitialized) {
      await auth.initializeAuth();
    }

    // After initialization, check if user is authenticated
    if (!auth.accessToken) {
      // If not authenticated, redirect to sign-in
      // Use string conversion for the redirect path to avoid [object Object]
      const redirectPath = String(location.pathname || '/');
      
      // For the root path, simply redirect to sign-in without query parameters
      if (redirectPath === '/' || redirectPath === '') {
        throw redirect({
          to: '/sign-in',
          replace: true,
        });
      }
      
      // For other paths, include the redirect parameter
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: redirectPath,
        },
        replace: true,
      });
    }
  },
  component: AuthenticatedLayout,
})
