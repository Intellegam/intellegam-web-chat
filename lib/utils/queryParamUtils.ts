/**
 * Parses a query string back into JSON string.
 *
 * @param queryString The query string to be parsed.
 * @returns A JSON string representation of the query string.
 */
export function queryStringToJSON(queryString: string): string {
	const params = new URLSearchParams(queryString);
	const obj: Record<string, unknown> = {};
	for (const [key, value] of params) {
		try {
			obj[key] = JSON.parse(value);
		} catch (e) {
			obj[key] = value;
		}
	}
	return JSON.stringify(obj);
}

/**
 * Combines multiple URLSearchParams into one.
 *
 * @param paramsArray An array of URLSearchParams objects.
 * @returns A single URLSearchParams object containing all parameters.
 */
export function combineSearchParams(...paramsArray: URLSearchParams[]): URLSearchParams {
	const combinedParams = new URLSearchParams();

	paramsArray.forEach((params) => {
		for (const [key, value] of params) {
			if (combinedParams.has(key)) {
				combinedParams.append(key, value);
			} else {
				combinedParams.set(key, value);
			}
		}
	});

	return combinedParams;
}

/**
 * Converts an object to a URLSearchParams object.
 *
 * @param obj The object to be converted.
 * @returns A URLSearchParams object containing all parameters.
 */
export function objectToURLSearchParams(obj: Record<string, any>): URLSearchParams {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(obj)) {
		if (value == null || value === undefined) {
			continue;
		}

		if (Array.isArray(value)) {
			value.forEach((item) => params.append(key, String(item)));
		} else if (typeof value === 'object') {
			params.append(key, JSON.stringify(value));
		} else {
			params.append(key, String(value));
		}
	}

	return params;
}
