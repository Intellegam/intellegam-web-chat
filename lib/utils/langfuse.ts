import { LangfuseWeb } from 'langfuse';
import infisicalClient from './infisical';
import env from '../env';

export async function initLangfuseWeb(projectId = 'test-project') {
  const langfusePublicKey = await infisicalClient.secrets().getSecret({
    environment: 'dev',
    projectId: env.INFISICAL_INTELLEGAM_PROJECT_ID,
    secretPath: `/Langfuse/${projectId}/`,
    secretName: 'PUBLIC_KEY',
  });

  return new LangfuseWeb({
    publicKey: langfusePublicKey.secretValue,
    baseUrl: 'https://cloud.langfuse.com',
  });
}
