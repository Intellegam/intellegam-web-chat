import {
  AdminChatConfig,
  ChatConfig,
  type EndpointConfig,
} from "../config/ChatConfig";

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
    configUrl.pathname = `${configUrl.pathname}/config`.replace(/\/+/g, "/");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (endpointConfig.subscriptionKey) {
      headers["Subscription-Key"] = endpointConfig.subscriptionKey;
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
      ...data.interface,
    };

    return {
      endpointConfig: endpointConfig,
      chatConfig: new ChatConfig(configData),
      adminChatConfig: new AdminChatConfig(configData),
    };
  } catch {
    return null;
  }
}
