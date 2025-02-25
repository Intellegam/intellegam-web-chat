/**
 * Utility functions for parsing query strings with support for arrays and objects.
 */

/**
 * Parses a query string back into JSON string with support for arrays and objects.
 * @param queryString The query string to be parsed.
 * @returns A JSON string representation of the query string.
 */
export function queryStringToJSON(queryString: string): string {
  const params = new URLSearchParams(queryString);
  const obj: Record<string, unknown> = {};

  for (const [key, value] of params.entries()) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    obj[key] = parseQueryParamValue(value);
  }

  return JSON.stringify(obj);
}

/**
 * Parses a single query parameter value with smart type detection.
 * @param value The parameter value to parse
 * @returns The parsed value with appropriate type
 */
function parseQueryParamValue(value: string): unknown {
  // First try standard JSON parse
  try {
    return JSON.parse(value);
  } catch (e) {
    // Continue with special handling for arrays and objects
  }

  // Handle arrays
  if (value.startsWith("[") && value.endsWith("]")) {
    return parseArrayString(value);
  }

  // Handle objects
  if (value.startsWith("{") && value.endsWith("}")) {
    return parseObjectString(value);
  }

  // For other values, try to convert to appropriate type
  return convertToAppropriateType(value);
}

/**
 * Parses a string that looks like an array but failed standard JSON parsing.
 * @param value String representing an array
 * @returns Parsed array
 */
function parseArrayString(value: string): unknown[] {
  // Extract content between brackets
  const content = value.substring(1, value.length - 1).trim();

  if (!content) {
    return []; // Empty array
  }

  // Split by comma and parse each item
  const items = content.split(",").map((item) => item.trim());
  return items.map((item) => parseQueryParamValue(item));
}

/**
 * Tries to clean a string that represents an object for parsing.
 * @param value String to clean
 * @returns Cleaned string
 */
function cleanObjectString(value: string): string {
  return value.replace(/\\"/g, '"').replace(/\\'/g, "'");
}

/**
 * Parses a string that looks like an object but failed standard JSON parsing.
 * @param value String representing an object
 * @returns Parsed object
 */
function parseObjectString(value: string): Record<string, unknown> {
  // Try with cleaning first
  try {
    const cleanedValue = cleanObjectString(value);
    return JSON.parse(cleanedValue);
  } catch (e) {
    // If cleaning doesn't help, do manual parsing
  }

  const result: Record<string, unknown> = {};
  const content = value.substring(1, value.length - 1).trim();

  if (!content) {
    return result; // Empty object
  }

  // Split by comma to get key-value pairs
  const pairs = content.split(",");

  for (const pair of pairs) {
    const colonIndex = pair.indexOf(":");
    if (colonIndex !== -1) {
      let key = pair.substring(0, colonIndex).trim();
      const val = pair.substring(colonIndex + 1).trim();

      // Clean up key if it's a quoted string
      key = removeQuotes(key);

      // Parse the value
      result[key] = parseQueryParamValue(val);
    }
  }

  return result;
}

/**
 * Removes surrounding quotes from a string if present.
 * @param value String to process
 * @returns String without surrounding quotes
 */
function removeQuotes(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.substring(1, value.length - 1);
  }
  return value;
}

/**
 * Converts a string value to the most appropriate JavaScript type.
 * @param value String to convert
 * @returns Converted value
 */
function convertToAppropriateType(value: string): unknown {
  // Check for quoted strings
  if (value.startsWith('"') && value.endsWith('"')) {
    return removeQuotes(value);
  }

  // Check for boolean values
  if (value === "true") return true;
  if (value === "false") return false;

  // Check for null
  if (value === "null") return null;

  // Check for numbers
  // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
  if (!isNaN(Number(value))) return Number(value);

  // Default to original string
  return value;
}
/**
 * Combines multiple URLSearchParams into one.
 *
 * @param paramsArray An array of URLSearchParams objects.
 * @returns A single URLSearchParams object containing all parameters.
 */
export function combineSearchParams(
  ...paramsArray: URLSearchParams[]
): URLSearchParams {
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
export function objectToURLSearchParams(
  obj: Record<string, any>
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value == null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else if (typeof value === "object") {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }

  return params;
}
