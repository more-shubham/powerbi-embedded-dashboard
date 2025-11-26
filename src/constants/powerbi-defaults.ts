import type { VisualLayout } from "@/types";
import {
  VISUAL_DEFAULTS as CONFIG_VISUAL_DEFAULTS,
  POWERBI_EMBED_CONFIG,
} from "@/config/powerbi.config";

export const VISUAL_DEFAULTS = CONFIG_VISUAL_DEFAULTS;

export const EMBED_CONFIG = {
  minPageIndexForVisualCreation: POWERBI_EMBED_CONFIG.minPageIndexForVisualCreation,
  tokenLifetimeMinutes: POWERBI_EMBED_CONFIG.tokenLifetimeMinutes,
} as const;

export function normalizeVisualPosition(position?: Partial<VisualLayout>): VisualLayout {
  return {
    x: position?.x ?? VISUAL_DEFAULTS.position.x,
    y: position?.y ?? VISUAL_DEFAULTS.position.y,
    width: position?.width ?? VISUAL_DEFAULTS.position.width,
    height: position?.height ?? VISUAL_DEFAULTS.position.height,
  };
}
