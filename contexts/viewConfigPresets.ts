// contexts/ViewConfigPresets.ts

import type { ViewConfig } from "./view-config-context";

// Full app experience
export const STANDARD_CONFIG: ViewConfig = {
  isIframe: false,
  enablePersistence: true,
  enableAuthentication: true,
  enableHistory: true,
  showSidebar: true,
  showHeader: true,
};

// Iframe lightweight experience
export const IFRAME_CONFIG: ViewConfig = {
  isIframe: true,
  enablePersistence: false,
  enableAuthentication: false,
  enableHistory: false,
  showSidebar: false,
  showHeader: true,
};
