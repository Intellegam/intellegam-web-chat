import { z } from 'zod';
import { AppEnvironment } from './types/environment';

const clientEnvironmentVariables = z.object({
  // All client-accessible env vars must start with NEXT_PUBLIC_
  NEXT_PUBLIC_APP_ENV: z.nativeEnum(AppEnvironment).optional(),
});

type ClientEnvironmentVariables = z.infer<typeof clientEnvironmentVariables>;

const parsed = clientEnvironmentVariables.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid client environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`- ${issue.path[0]}: ${issue.message}`);
  });
  throw new Error('Client environment validation failed');
}

const clientEnv = parsed.data;

export default clientEnv;
