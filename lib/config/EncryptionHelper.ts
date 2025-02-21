import EncryptionUtil from "../utils/encryptionUtils";

export const urlEncryptionKey = '00000000000000000000000000000000';

export class EncryptionHelper {
	static async encrypt(value: string): Promise<string> {
		return await EncryptionUtil.encryptWithAESGCM(urlEncryptionKey, value);
	}

	static async decrypt(value: string): Promise<string> {
		const decryptedValue = await EncryptionUtil.decryptWithAESGCM(urlEncryptionKey, value);
		return decryptedValue || '';
	}

	static async encryptObjectFields(
		obj: Record<string, any>,
		fields: string[]
	): Promise<Record<string, unknown>> {
		const encryptedObj = { ...obj };
		for (const field of fields) {
			if (encryptedObj[field]) {
				encryptedObj[field] = await EncryptionHelper.encrypt(encryptedObj[field]);
			}
		}
		return encryptedObj;
	}

	static async decryptObjectFields(
		obj: Record<string, any>,
		fields: string[]
	): Promise<Record<string, unknown>> {
		const decryptedObj = { ...obj };
		for (const field of fields) {
			if (decryptedObj[field]) {
				decryptedObj[field] = await EncryptionHelper.decrypt(decryptedObj[field]);
			}
		}
		return decryptedObj;
	}

	static async encryptURL(url: URL, fields: string[]): Promise<URL> {
		const encryptedParams = await EncryptionHelper.encryptURLSearchParams(url.searchParams, fields);
		const encryptedURL = new URL(`${url.origin + url.pathname}?${encryptedParams.toString()}`);
		return encryptedURL;
	}

	static async decryptURL(url: URL, fields: string[]): Promise<URL> {
		const decryptedParams = await EncryptionHelper.decryptURLSearchParams(url.searchParams, fields);
		const decryptedURL = new URL(`${url.origin + url.pathname}?${decryptedParams.toString()}`);
		return decryptedURL;
	}

	static async encryptURLSearchParams(
		params: URLSearchParams,
		fields: string[]
	): Promise<URLSearchParams> {
		const encryptedParams = new URLSearchParams();
		for (const key of params.keys()) {
			if (fields.includes(key)) {
				const value = await EncryptionHelper.encrypt(params.get(key) || '');
				encryptedParams.set(key, value);
			} else {
				encryptedParams.set(key, params.get(key) || '');
			}
		}
		return encryptedParams;
	}

	//TODO: fix this
	static async decryptURLSearchParams(
		params: Object,
		fields: string[]
	): Promise<Object> {
		const decryptedParams = new URLSearchParams();
		for (const key of Object.keys(params)) {
			// Fix old URL decoding bug
			if (key === 'subscription_key') {
				params[key]= decodeURIComponent(params[key] || '');
			}

			if (fields.includes(key)) {
				const value = await EncryptionHelper.decrypt(params.get(key) || '');
				decryptedParams.set(key, value);
			} else {
				decryptedParams.set(key, params.get(key) || '');
			}
		}
		return decryptedParams;
	}
}
