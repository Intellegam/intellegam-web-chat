import { SearchParams } from "next/dist/server/request/search-params";
import { EndpointConfig } from "../config/ChatConfig";
import { isDevelopment, isPreview } from "./environmentUtils";

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
 * @param {URL} queryParamsUrl - The URL containing the query parameters to determine the endpoint.
 * @returns {Promise<EndpointConfig>} - A promise that resolves to the selected EndpointConfig.
 */
export async function determineBackendEndpoint(searchParams?: Object): Promise<EndpointConfig> {
	// Use the local endpoint
	if (isDevelopment && (await isBackendReachable(LOCAL_BACKEND_URL))) {
		return new EndpointConfig({ endpoint: `${LOCAL_BACKEND_URL}/chat` });
	}
	// Use the deployed intellegam sample app
	else if ((isDevelopment || isPreview) && searchParams) {
		return new EndpointConfig({ endpoint: SAMPLE_APP_URL });
	}

	if (searchParams) {
		return EndpointConfig.fromSearchParams(searchParams);
	} else {
		throw new Error("searchParams is undefined");
	}
}
