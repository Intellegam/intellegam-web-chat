export enum AppEnvironment {
	DEVELOPMENT = 'DEVELOPMENT',
	PREVIEW = 'PREVIEW',
	PRODUCTION = 'PRODUCTION'
}

export type Environment = keyof typeof AppEnvironment;
