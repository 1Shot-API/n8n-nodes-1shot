import { IDataObject } from 'n8n-workflow';

/**
 * These are methods copied from https://github.com/n8n-io/n8n/blob/master/packages/workflow/src/utils.ts that
 * are not exported in n8n-workflow
 */
const unsafeObjectProperties = new Set(['__proto__', 'prototype', 'constructor', 'getPrototypeOf']);

/**
 * Checks if a property key is safe to use on an object, preventing prototype pollution.
 * setting untrusted properties can alter the object's prototype chain and introduce vulnerabilities.
 *
 * @see setSafeObjectProperty
 */
export function isSafeObjectProperty(property: string) {
	return !unsafeObjectProperties.has(property);
}

/**
 * Safely sets a property on an object, preventing prototype pollution.
 *
 * @see isSafeObjectProperty
 */
export function setSafeObjectProperty(
	target: Record<string, unknown>,
	property: string,
	value: unknown,
) {
	if (isSafeObjectProperty(property)) {
		target[property] = value;
	}
}

export function isDomainAllowed(
	urlString: string,
	options: {
		allowedDomains: string;
	},
): boolean {
	if (!options.allowedDomains || options.allowedDomains.trim() === '') {
		return true; // If no restrictions are set, allow all domains
	}

	try {
		const url = new URL(urlString);
		const hostname = url.hostname;

		const allowedDomainsList = options.allowedDomains
			.split(',')
			.map((domain) => domain.trim())
			.filter(Boolean);

		for (const allowedDomain of allowedDomainsList) {
			// Handle wildcard domains (*.example.com)
			if (allowedDomain.startsWith('*.')) {
				const domainSuffix = allowedDomain.substring(2); // Remove the *. part
				if (hostname.endsWith(domainSuffix)) {
					return true;
				}
			}
			// Exact match
			else if (hostname === allowedDomain) {
				return true;
			}
		}

		return false;
	} catch (error) {
		// If URL parsing fails, deny access to be safe
		return false;
	}
}

/**
 * This one is from https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/utils/utilities.ts
 * @param headers
 * @return
 */
export const keysToLowercase = <T>(headers: T) => {
	if (typeof headers !== 'object' || Array.isArray(headers) || headers === null) return headers;
	return Object.entries(headers).reduce((acc, [key, value]) => {
		acc[key.toLowerCase()] = value as IDataObject;
		return acc;
	}, {} as IDataObject);
};
