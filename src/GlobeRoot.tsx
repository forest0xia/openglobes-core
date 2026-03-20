import { createContext, useContext, type ReactNode } from 'react';
import type { GlobeTheme } from './theme/GlobeTheme';

// ---------------------------------------------------------------------------
// GlobeRoot — theme provider and CSS variable scope.
//
// Wraps your globe UI and sets `data-og-theme` on a root div so all
// --og-* CSS variables cascade correctly. Provides theme config to child
// components via React context.
//
// Switching theme = passing a different `theme` object. CSS variables
// update automatically via the `data-og-theme` attribute selector.
// ---------------------------------------------------------------------------

const GlobeThemeContext = createContext<GlobeTheme | null>(null);

interface GlobeRootProps {
  theme: GlobeTheme;
  children: ReactNode;
  /** Optional className added to the root div. */
  className?: string;
}

export function GlobeRoot({ theme, children, className }: GlobeRootProps) {
  const rootClass = className ? `og-root ${className}` : 'og-root';
  return (
    <GlobeThemeContext.Provider value={theme}>
      <div data-og-theme={theme.id} data-og="root" className={rootClass}>
        {children}
      </div>
    </GlobeThemeContext.Provider>
  );
}

/**
 * Get the current GlobeTheme from context. Throws if used outside <GlobeRoot>.
 */
export function useGlobeTheme(): GlobeTheme {
  const ctx = useContext(GlobeThemeContext);
  if (!ctx) {
    throw new Error(
      'useGlobeTheme() must be used within a <GlobeRoot> provider.',
    );
  }
  return ctx;
}

/**
 * Internal helper: returns theme from prop or context. Throws if neither.
 */
export function useResolvedTheme(propTheme?: GlobeTheme): GlobeTheme {
  const ctx = useContext(GlobeThemeContext);
  const theme = propTheme ?? ctx;
  if (!theme) {
    throw new Error(
      'Provide a theme prop or wrap in <GlobeRoot>.',
    );
  }
  return theme;
}
