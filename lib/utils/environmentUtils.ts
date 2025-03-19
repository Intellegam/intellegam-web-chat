import { type Environment, AppEnvironment } from '../types/environment';

function validateEnvironment(env: string): env is Environment {
  return Object.values(AppEnvironment).includes(env as AppEnvironment);
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const ENVIRONMENT = validateEnvironment(process.env.NEXT_PUBLIC_APP_ENV!)
  ? (process.env.NEXT_PUBLIC_APP_ENV as AppEnvironment)
  : AppEnvironment.PRODUCTION;

export const isDevelopment = ENVIRONMENT === AppEnvironment.DEVELOPMENT;
export const isPreview = ENVIRONMENT === AppEnvironment.PREVIEW;
export const isProduction = ENVIRONMENT === AppEnvironment.PRODUCTION;
