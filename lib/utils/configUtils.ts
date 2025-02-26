import {
  AdminChatConfig,
  ChatConfig,
  type EndpointConfig,
} from "../config/ChatConfig";
import { determineBackendEndpoint } from "./endpointUtils";

/**
 * Retrieves chat configurations based on the provided URL search parameters.
 *
 * This function determines the backend endpoint using the provided parameters,
 * fetches the configuration from the backend, and constructs the chat and admin
 * chat configurations. If the backend configuration is not available, it falls
 * back to creating configurations from the search parameters.
 *
 * @param {URLSearchParams} params - The URL search parameters used to determine
 * the backend endpoint and to create chat configurations if necessary.
 * @returns {Promise<{ endpointConfig: EndpointConfig, chatConfig: ChatConfig, adminChatConfig: AdminChatConfig }>}
 * An object containing the endpoint configuration, chat configuration, and admin chat configuration.
 */
export async function getChatConfigs(params: URLSearchParams) {
  const endpointConfig = await determineBackendEndpoint(params);
  const backendConfig = await fetchConfig(endpointConfig);
  const chatConfig =
    backendConfig?.chatConfig || ChatConfig.fromSearchParams(params);
  const adminChatConfig =
    backendConfig?.adminChatConfig || AdminChatConfig.fromSearchParams(params);

  return { endpointConfig, chatConfig, adminChatConfig };
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
