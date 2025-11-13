/**
 * Context barrel exports
 */

// New modular contexts
export { AuthProvider, useAuth } from './AuthContext';
export { ApplicationsProvider, useApplications } from './ApplicationsContext';
export { RecommendationsProvider, useRecommendations } from './RecommendationsContext';
export { UsersProvider, useUsers } from './UsersContext';

// Combined providers
export { AppProviders } from './AppProviders';

// Legacy AppContext (for backward compatibility during migration)
export { AppProvider, useApp } from './AppContext';
