/**
 * This is a set of methods included in Lodash. We can't import that directly so these are the methods that are used.
 */

/**
 * Gets a nested property from an object using a dot-notation path.
 * Returns undefined if the path doesn't exist.
 * @param obj - The object to get the property from
 * @param path - The dot-notation path (e.g., 'oauthTokenData.access_token')
 * @param defaultValue - Optional default value to return if the path doesn't exist
 * @returns The value at the path, or the default value if provided and path doesn't exist
 */
export function getNestedProperty(obj: any, path: string, defaultValue?: any): any {
	const keys = path.split('.');
	let current = obj;
	for (const key of keys) {
		if (current === null || current === undefined || typeof current !== 'object') {
			return defaultValue;
		}
		if (!(key in current)) {
			return defaultValue;
		}
		current = current[key];
	}
	return current !== undefined ? current : defaultValue;
}

/**
 * Sets a nested property on an object using a dot-notation path.
 * Creates intermediate objects if they don't exist.
 * @param obj - The object to set the property on
 * @param path - The dot-notation path (e.g., 'context.itemIndex')
 * @param value - The value to set
 */
export function setNestedProperty(obj: any, path: string, value: any): void {
	const keys = path.split('.');
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
			current[key] = {};
		}
		current = current[key];
	}
	current[keys[keys.length - 1]] = value;
}
