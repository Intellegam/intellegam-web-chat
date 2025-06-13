import { LangfuseWeb } from 'langfuse';
import { LANGFUSE_WEB_DEFAULT_PROJECT_ID } from '../constants';
import serverEnv from '../env.server';
import infisicalClient from './infisical';

export async function initLangfuseWeb(
  projectId = LANGFUSE_WEB_DEFAULT_PROJECT_ID,
) {
  const langfusePublicKey = await infisicalClient.secrets().getSecret({
    environment: 'dev',
    projectId: serverEnv.INFISICAL_INTELLEGAM_PROJECT_ID,
    secretPath: `/Langfuse/${projectId}/`,
    secretName: 'PUBLIC_KEY',
  });

  return new LangfuseWeb({
    publicKey: langfusePublicKey.secretValue,
    baseUrl: 'https://cloud.langfuse.com',
  });
}
