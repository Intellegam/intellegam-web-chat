'use client';

import {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { createContext, useContext, type ReactNode } from 'react';

export interface ChatSettings {
  endpointConfig: EndpointConfig;
  chatConfig: ChatConfig;
  adminChatConfig: AdminChatConfig;
}

export const DEFAULT_SETTINGS_CONFIG: ChatSettings = {
  endpointConfig: new EndpointConfig(),
  chatConfig: new ChatConfig(),
  adminChatConfig: new AdminChatConfig(),
};

const ChatSettingsContext = createContext<ChatSettings>(
  DEFAULT_SETTINGS_CONFIG,
);

export function ChatSettingsProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: ChatSettings;
}) {
  return (
    <ChatSettingsContext.Provider value={config}>
      {children}
    </ChatSettingsContext.Provider>
  );
}

export function useChatSettingsContext() {
  return useContext(ChatSettingsContext);
}
