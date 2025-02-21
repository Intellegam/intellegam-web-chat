/**
 * Converts a snake_case string to camelCase, handling edge cases like leading, trailing, and multiple underscores.
 * @param s The string to convert
 * @returns The converted string
 * @example
 * snakeToCamel('hello_world') // 'helloWorld'
 */
export function snakeToCamel(s: string): string {
	return s
		.replace(/^_+|_+$/g, '') // Remove leading and trailing underscores
		.replace(/_+([a-z])/gi, (g, h) => h.toUpperCase()); // Convert snake_case to camelCase
}
