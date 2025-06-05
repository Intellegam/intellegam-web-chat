import { z } from 'zod';
import { AppEnvironment } from './types/environment';

const environmentVariables = z.object({
  WORKOS_CLIENT_ID: z.string(),
  WORKOS_API_KEY: z.string(),
  WORKOS_COOKIE_PASSWORD: z.string(),
  POSTGRES_URL: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z.nativeEnum(AppEnvironment).optional(),
});

type EnvironmentVariables = z.infer<typeof environmentVariables>;

const parsed = environmentVariables.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 4),
  );
  process.exit(1);
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export default parsed.data;
