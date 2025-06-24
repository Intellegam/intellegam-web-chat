import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const LANGFUSE_WEB_DEFAULT_PROJECT_ID = 'test-project';
export const SAMPLE_APP_PROJECT_ID = 'customer-project-app';

export const WORKOS_REDIRECT_PATHNAME = '/api/auth/callback';
export const WORKOS_LOGOUT_REDIRECT_PATHNAME = '/start';
export const WORKOS_REDIRECT_ORIGIN =
  process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_ENV === 'preview'
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
export const WORKOS_REDIRECT_URI = new URL(
  WORKOS_REDIRECT_PATHNAME,
  WORKOS_REDIRECT_ORIGIN,
);

export const WORKOS_LOGOUT_REDIRECT_URI = new URL(
  WORKOS_LOGOUT_REDIRECT_PATHNAME,
  WORKOS_REDIRECT_ORIGIN,
);
