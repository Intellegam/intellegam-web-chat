import { convertToCamelCase } from "../utils/objectUtils";
import { queryStringToJSON } from "../utils/queryParamUtils";

export abstract class BaseConfig {
  static fromJSON<T extends BaseConfig>(
    this: new (data: Partial<T>) => T,
    jsonString: string
  ): T {
    const obj = JSON.parse(jsonString);
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this(obj);
  }

  toJSON(): string {
    const obj = {};
    const seen = new WeakSet();

    for (const [key, value] of Object.entries(this)) {
      // Skip non-serializable values
      if (typeof value === "function" || value === undefined) {
        continue;
      }
      if (typeof value === "object" && value !== null) {
        // Skip circular references
        if (seen.has(value)) {
          continue;
        }
        seen.add(value);
      }
      (obj as any)[key] = value;
    }
    return JSON.stringify(obj);
  }

  static fromURL<T extends BaseConfig>(
    this: new (data: Partial<T>) => T,
    url: URL | string
  ): T {
    const searchParams =
      url instanceof URL ? url.searchParams : new URLSearchParams(url);

    // @ts-ignore
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return this.fromSearchParams(searchParams);
  }

  static fromSearchParams<T extends BaseConfig>(
    this: new (data: Partial<T>) => T,
    searchParams: URLSearchParams
  ): T {
    let searchParamString = searchParams.toString();

    // Fix old URL decoding bug
    if (searchParams.has("start_message")) {
      searchParamString = decodeURIComponent(searchParamString);
    }

    const jsonString = queryStringToJSON(searchParamString);
    const obj = JSON.parse(jsonString);
    const camelCaseObj = convertToCamelCase(obj);

    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this(camelCaseObj as any);
  }

  toSearchParams(): URLSearchParams {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(this)) {
      if (value !== undefined) {
        params.append(key, JSON.stringify(value));
      }
    }
    return params;
  }

  toObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    const seen = new WeakSet();

    for (const [key, value] of Object.entries(this)) {
      // Skip functions and undefined values
      if (typeof value === "function" || value === undefined) {
        continue;
      }
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          continue;
        }
        seen.add(value);
        // If the value is another BaseConfig instance, convert it too
        if (value instanceof BaseConfig) {
          obj[key] = value.toObject();
          continue;
        }
      }
      obj[key] = value;
    }
    return obj;
  }
}
