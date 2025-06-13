import { z } from 'zod';
import { AppEnvironment } from './types/environment';

const environmentVariables = z.object({
  WORKOS_CLIENT_ID: z.string(),
  WORKOS_API_KEY: z.string(),
  WORKOS_COOKIE_PASSWORD: z.string(),
  POSTGRES_URL: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z.nativeEnum(AppEnvironment).optional(),
  INFISICAL_MACHINE_IDENTITY_CLIENT_ID: z.string(),
  INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET: z.string(),
  INFISICAL_INTELLEGAM_PROJECT_ID: z.string(),
});

type EnvironmentVariables = z.infer<typeof environmentVariables>;

const parsed = environmentVariables.safeParse(process.env);

if (!parsed.success) {
  const errorMessage = `Invalid environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const env = parsed.data;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export default env;
