import { BaseConfig } from "./BaseConfig";

export class EndpointConfig extends BaseConfig {
	endpoint?: string;
	subscriptionKey?: string;

	constructor(data: Record<string, any> = {}) {
		super();
		this.endpoint = data.endpoint ?? this.endpoint;
		this.subscriptionKey = data.subscriptionKey ?? this.subscriptionKey;
	}
}

export class ChatConfig extends BaseConfig {
	title?: string;
	startMessage?: string = 'Hello, how can I help you today?\n\nYou can ask me in **any language**.';
	startPrompts: string[] = [];
	titleLogo?: string;
	chatLogo?: string;
	backgroundImg?: string;
	inputPlaceholder?: string;
	disclaimerMessage?: string;

	constructor(data: Record<string, any> = {}) {
		super();
		this.title = data.title ?? this.title;
		this.startMessage = data.startMessage ?? this.startMessage;
		this.startPrompts = data.startPrompts ?? this.startPrompts;
		this.titleLogo = data.titleLogo ?? this.titleLogo;
		this.chatLogo = data.chatLogo ?? this.chatLogo;
		this.backgroundImg = data.backgroundImg ?? this.backgroundImg;
		this.inputPlaceholder = data.inputPlaceholder ?? this.inputPlaceholder;
		this.disclaimerMessage = data.disclaimerMessage ?? this.disclaimerMessage;
	}
}

export class AdminChatConfig extends BaseConfig {
	followUpPrompts: string[] = [];
	poweredBy?: string;
	showSources = false;
	enableFeedback = true;
	showFileUpload = false;
	showWebSearch = false;
	showTiles = false;
	tilesHeader?: string;
	endpointSchema?: string;

	constructor(data: Partial<AdminChatConfig> = {}) {
		super();
		this.followUpPrompts = data.followUpPrompts ?? this.followUpPrompts;
		this.poweredBy = data.poweredBy ?? this.poweredBy;
		this.showSources = data.showSources ?? this.showSources;
		this.enableFeedback = data.enableFeedback ?? this.enableFeedback;
		this.showFileUpload = data.showFileUpload ?? this.showFileUpload;
		this.showWebSearch = data.showWebSearch ?? this.showWebSearch;
		this.showTiles = data.showTiles ?? this.showTiles;
		this.tilesHeader = data.tilesHeader ?? this.tilesHeader;
		this.endpointSchema = data.endpointSchema ?? this.endpointSchema;
	}
}
