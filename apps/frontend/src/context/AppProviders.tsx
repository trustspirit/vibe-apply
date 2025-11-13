/**
 * AppProviders - Combines all context providers in the correct order
 */

import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ApplicationsProvider } from './ApplicationsContext';
import { RecommendationsProvider } from './RecommendationsContext';
import { UsersProvider } from './UsersContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the app with all necessary context providers
 * Order matters: Auth must be first as others depend on it
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <UsersProvider>
        <ApplicationsProvider>
          <RecommendationsProvider>
            {children}
          </RecommendationsProvider>
        </ApplicationsProvider>
      </UsersProvider>
    </AuthProvider>
  );
};
