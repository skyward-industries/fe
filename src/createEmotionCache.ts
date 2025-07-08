// src/createEmotionCache.ts
import createCache from '@emotion/cache';

// prepend: true moves MUI styles to the top of the <head> so they're loaded first.
// It can help with catching hydration mismatches.
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}