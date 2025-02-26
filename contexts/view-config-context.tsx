'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface ViewConfig {
  isIframe: boolean;
  enablePersistence: boolean;
  enableAuthentication: boolean;
  enableHistory: boolean;
  showSidebar: boolean;
  showHeader: boolean;
}

// Default configuration (full app experience)
export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  isIframe: false,
  enablePersistence: true,
  enableAuthentication: true,
  enableHistory: true,
  showSidebar: true,
  showHeader: true,
};

// Create the context with default values
const ViewConfigContext = createContext<ViewConfig>(DEFAULT_VIEW_CONFIG);

// Provider component
export function ViewConfigProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: ViewConfig;
}) {
  return (
    <ViewConfigContext.Provider value={config}>
      {children}
    </ViewConfigContext.Provider>
  );
}

// Hook for components to consume the context
export function useViewConfig() {
  return useContext(ViewConfigContext);
}
