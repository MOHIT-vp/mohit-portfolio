type LiquidGlassHandle = { supported: boolean; refresh: () => void; destroy: () => void };
type LiquidGlassOptions = Partial<{ scale: number; chroma: number; border: number; mapBlur: number; blur: number; saturate: number; radius: number; fallbackBlur: number }>;

declare global {
  interface Window {
    liquidGlass?: (el: Element, opts?: LiquidGlassOptions) => LiquidGlassHandle;
  }
}

export {};
