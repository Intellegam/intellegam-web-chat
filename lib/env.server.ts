import 'server-only';
import { z } from 'zod';

const serverEnvironmentVariables = z.object({
  // WorkOS Authentication
  WORKOS_CLIENT_ID: z.string(),
  WORKOS_API_KEY: z.string(),
  WORKOS_COOKIE_PASSWORD: z.string(),
  WORKOS_WEBHOOK_SECRET: z.string().optional(),

  // Database
  POSTGRES_URL: z.string(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Infisical Secret Management
  INFISICAL_MACHINE_IDENTITY_CLIENT_ID: z.string(),
  INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET: z.string(),
  INFISICAL_INTELLEGAM_PROJECT_ID: z.string(),
});

type ServerEnvironmentVariables = z.infer<typeof serverEnvironmentVariables>;

const parsed = serverEnvironmentVariables.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid server environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`- ${issue.path[0]}: ${issue.message}`);
  });
  throw new Error('Server environment validation failed');
}

const serverEnv = parsed.data;

export default serverEnv;
