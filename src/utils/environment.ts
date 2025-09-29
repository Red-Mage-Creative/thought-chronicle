// Environment configuration utilities

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV;

// Check if we're in production mode  
export const isProduction = import.meta.env.PROD;

// Get API base URL from environment or use default
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_BUILDSHIP_API_URL || 'https://xn93r8.buildship.run';
};

// Get environment-specific configuration
export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  apiBaseUrl: getApiBaseUrl(),
  enableLogging: isDevelopment,
  enableDebugMode: isDevelopment && import.meta.env.VITE_DEBUG === 'true',
});