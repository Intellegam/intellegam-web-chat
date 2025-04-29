import { type Environment, AppEnvironment } from '../types/environment';

function validateEnvironment(env: string | undefined): env is Environment {
  if (!env) return false;
  return Object.values(AppEnvironment).includes(env as AppEnvironment);
}

export const ENVIRONMENT = (() => {
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  if (validateEnvironment(env)) {
    return env as AppEnvironment;
  }

  // In development, default to DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    return AppEnvironment.DEVELOPMENT;
  }

  // Otherwise default to PRODUCTION
  return AppEnvironment.PRODUCTION;
})();

export const isDevelopment = ENVIRONMENT === AppEnvironment.DEVELOPMENT;
export const isPreview = ENVIRONMENT === AppEnvironment.PREVIEW;
export const isProduction = ENVIRONMENT === AppEnvironment.PRODUCTION;
