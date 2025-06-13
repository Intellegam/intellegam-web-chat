import { EndpointConfig } from '../config/ChatConfig';
import { isDevelopment, isPreview } from './environmentUtils';

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000';
const SAMPLE_APP_URL = 'https://api.intellegam.com/customer/project/app/chat';

/**
 * Checks if the backend is reachable by making a fetch request to the given URL.
 *
 * @param {string} url - The URL of the backend to check.
 * @returns {Promise<boolean>} - A promise that resolves to true if the backend is reachable, otherwise false.
 */
export async function isBackendReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Determines the appropriate backend endpoint based on the provided URL and the current environment.
 *
 * This function checks if the application is running in a development environment and whether
 * the local backend is reachable. If so, it returns the local backend endpoint. If the application
 * is in development or preview mode and no query parameters are present, it returns the sample app
 * endpoint. Otherwise, it extracts the endpoint from the provided URL.
 *
 * @param {URL} queryParams - The URL containing the query parameters to determine the endpoint.
 * @returns {Promise<EndpointConfig>} - A promise that resolves to the selected EndpointConfig.
 */
export async function determineBackendEndpoint(
  queryParams: URLSearchParams,
): Promise<EndpointConfig> {
  // Use the local endpoint
  if (isDevelopment && (await isBackendReachable(LOCAL_BACKEND_URL))) {
    return new EndpointConfig({ endpoint: `${LOCAL_BACKEND_URL}/chat` });
  }
  // Use the deployed intellegam sample app
  else if ((isDevelopment || isPreview) && !queryParams.toString()) {
    return new EndpointConfig({ endpoint: SAMPLE_APP_URL });
  }

  // Use the endpoint from the URL
  return EndpointConfig.fromSearchParams(queryParams);
}

function parseGcpCloudRunUrl(
  hostname: string,
): { customerId: string; projectId: string; appId: string } | null {
  const regex =
    /^([a-z0-9-]+)--([a-z0-9-]+)--([a-z0-9-]+)-[a-z0-9]+-ey\.a\.run\.app$/i;
  const match = hostname.match(regex);
  if (match) {
    return {
      customerId: match[1],
      projectId: match[2],
      appId: match[3],
    };
  }
  return null;
}

function parseAzureApiManagementUrl(
  pathSegments: string[],
): { customerId: string; projectId: string; appId: string } | null {
  if (pathSegments.length >= 3) {
    return {
      customerId: pathSegments[0],
      projectId: pathSegments[1],
      appId: pathSegments[2],
    };
  }
  return null;
}

//TODO: just get the id from the backend via the config instead of parsing -meris
export function parseEndpointIds(
  url: string,
): { customerId: string; projectId: string; appId: string } | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathSegments = urlObj.pathname
      .split('/')
      .filter((segment) => segment);

    if (hostname.includes('a.run.app')) {
      return parseGcpCloudRunUrl(hostname);
    } else if (hostname.includes('api.intellegam.com')) {
      return parseAzureApiManagementUrl(pathSegments);
    }
  } catch (error) {
    console.error('Failed to parse URL:', error);
  }
  return null;
}
