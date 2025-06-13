import { InfisicalSDK } from '@infisical/sdk';
import serverEnv from '../env.server';

const infisicalClient = new InfisicalSDK();
await infisicalClient.auth().universalAuth.login({
  clientId: serverEnv.INFISICAL_MACHINE_IDENTITY_CLIENT_ID,
  clientSecret: serverEnv.INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET,
});

export default infisicalClient;
