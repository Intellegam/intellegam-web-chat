import { AppEnvironment } from '../types/environment';
import env from '../env';

export const ENVIRONMENT = (() => {
  if (env.NEXT_PUBLIC_APP_ENV) {
    return env.NEXT_PUBLIC_APP_ENV;
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
