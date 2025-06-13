import { InfisicalSDK } from '@infisical/sdk';
import env from '../env';

const infisicalClient = new InfisicalSDK();
await infisicalClient.auth().universalAuth.login({
  clientId: env.INFISICAL_MACHINE_IDENTITY_CLIENT_ID,
  clientSecret: env.INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET,
});

export default infisicalClient;
