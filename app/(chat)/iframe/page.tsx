import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { AdminChatConfig, ChatConfig, EndpointConfig } from '@/lib/config/ChatConfig';
import { EncryptionHelper } from '@/lib/config/EncryptionHelper';
import { generateUUID } from '@/lib/utils';
import { determineBackendEndpoint } from '@/lib/utils/endpointUtils';

const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

//TODO search Params entweder EncryptionHelper oder hier bessere Types
export default async function Page({searchParams} : {searchParams: {endpoint: string}}) {
  const id = generateUUID();
//   const decryptedUrl = await EncryptionHelper.decryptURLSearchParams(searchParams, ENCRYPTED_PARAMS);
  const endpointConfig = await determineBackendEndpoint(await searchParams);
  const backendConfig = await fetchConfig(endpointConfig);
  const chatConfig = backendConfig?.chatConfig || ChatConfig.fromSearchParams(searchParams);
  const adminChatConfig = backendConfig?.adminChatConfig || AdminChatConfig.fromSearchParams(searchParams);

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedVisibilityType="private"
        isReadonly={false}
        isIframe={true}
        config={{
          adminChatConfig: adminChatConfig.toObject() as AdminChatConfig,
          endpointConfig: endpointConfig.toObject() as EndpointConfig,
          chatConfig: chatConfig.toObject() as ChatConfig
        }}
      />
      <DataStreamHandler id={id} />
    </>
  );
}

/**
 * Attempts to fetch configuration from backend /config endpoint.
 * Returns null if fetch fails or response is invalid.
 *
 * @param endpointConfig - The endpoint configuration to use for fetching the config.
 */
export async function fetchConfig(endpointConfig: EndpointConfig): Promise<{
	endpointConfig: EndpointConfig;
	chatConfig: ChatConfig;
	adminChatConfig: AdminChatConfig;
} | null> {
	if (!endpointConfig.endpoint) {
		return null;
	}

	try {
		// Construct config endpoint URL
		const configUrl = new URL(endpointConfig.endpoint);
		configUrl.pathname = `${configUrl.pathname}/config`.replace(/\/+/g, '/');

		const headers: HeadersInit = {
			'Content-Type': 'application/json'
		};
		if (endpointConfig.subscriptionKey) {
			headers['Subscription-Key'] = endpointConfig.subscriptionKey;
		}

		const response = await fetch(configUrl.toString(), { headers });
		if (!response?.ok) {
			return null;
		}

		const data = await response.json();
		if (!data.interface) {
			return null;
		}

		// Create config instances with backend data and include endpoint/subscription key
		const configData = {
			endpoint: endpointConfig.endpoint,
			subscriptionKey: endpointConfig.subscriptionKey,
			...data.interface
		};

		return {
			endpointConfig: endpointConfig,
			chatConfig: new ChatConfig(configData),
			adminChatConfig: new AdminChatConfig(configData)
		};
	} catch {
		return null;
	}
}