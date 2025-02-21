import { snakeToCamel } from "./stringUtils";

/**
 * Converts snake case keys to camel case keys in an object.
 * @param obj The object to convert.
 * @returns The object with snake case keys converted to camel case keys.
 */
export function convertToCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
	return Object.keys(obj).reduce((acc, key) => {
		const camelKey = snakeToCamel(key);
		acc[camelKey] = obj[key];
		return acc;
	}, {} as Record<string, unknown>);
}

/**
 * Filters object properties based on a template object.
 * @param template The template object.
 * @param obj The object to filter.
 * @returns The filtered object.
 */
export function filterProperties<T extends Partial<T>>(
	template: T,
	obj: Record<string, unknown>
): Partial<T> {
	return Object.keys(template)
		.filter((key) => key in obj)
		.reduce((acc, key) => {
			(acc as Record<string, unknown>)[key] = obj[key];
			return acc;
		}, {} as Partial<T>);
}
