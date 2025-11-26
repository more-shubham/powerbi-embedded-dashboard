export const POWERBI_EMBED_CONFIG = {
  minPageIndexForVisualCreation: 8,
  tokenLifetimeMinutes: 60,
  libraryLoadTimeout: 5000,
  libraryCheckInterval: 100,
} as const;

export const VISUAL_DEFAULTS = {
  position: {
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  },
  minDimensions: {
    width: 100,
    height: 100,
  },
  maxDimensions: {
    width: 1920,
    height: 1080,
  },
} as const;

export const PAGE_CONFIG = {
  minDeletablePageIndex: 8,
} as const;

export const API_CONFIG = {
  endpoint: "/api/powerbi",
  timeout: 30000,
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  },
} as const;

export const UI_CONFIG = {
  toastDuration: 3000,
  animations: {
    drawerSlide: 300,
    modalFade: 200,
    tooltipDelay: 500,
  },
  zIndex: {
    dropdown: 50,
    modal: 100,
    drawer: 101,
    toast: 200,
  },
} as const;

export type PowerBIEmbedConfig = typeof POWERBI_EMBED_CONFIG;
export type VisualDefaults = typeof VISUAL_DEFAULTS;
export type PageConfig = typeof PAGE_CONFIG;
export type APIConfig = typeof API_CONFIG;
export type UIConfig = typeof UI_CONFIG;
