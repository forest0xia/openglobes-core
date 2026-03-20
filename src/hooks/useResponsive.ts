import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// useResponsive — mobile / tablet / desktop breakpoint hook.
// Breakpoints from ARCHITECTURE.md:
//   Mobile:  < 768px
//   Tablet:  768–1023px
//   Desktop: ≥ 1024px
// ---------------------------------------------------------------------------

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

const MOBILE_MAX = 768;
const TABLET_MAX = 1024;

function getSnapshot(): ResponsiveState {
  const w = window.innerWidth;
  if (w < MOBILE_MAX) {
    return { breakpoint: 'mobile', isMobile: true, isTablet: false, isDesktop: false, width: w };
  }
  if (w < TABLET_MAX) {
    return { breakpoint: 'tablet', isMobile: false, isTablet: true, isDesktop: false, width: w };
  }
  return { breakpoint: 'desktop', isMobile: false, isTablet: false, isDesktop: true, width: w };
}

// SSR fallback — assume mobile-first per CLAUDE.md
const SERVER_STATE: ResponsiveState = {
  breakpoint: 'mobile',
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  width: 375,
};

function getServerSnapshot(): ResponsiveState {
  return SERVER_STATE;
}

// Cache the last snapshot to avoid re-renders when breakpoint hasn't changed
let cached: ResponsiveState | null = null;

function getStableSnapshot(): ResponsiveState {
  const next = getSnapshot();
  if (cached && cached.breakpoint === next.breakpoint) {
    return cached;
  }
  cached = next;
  return cached;
}

function subscribe(callback: () => void): () => void {
  const handler = () => {
    // Only notify when the breakpoint bucket actually changes
    const prev = cached;
    const next = getSnapshot();
    if (!prev || prev.breakpoint !== next.breakpoint) {
      cached = next;
      callback();
    }
  };
  window.addEventListener('resize', handler, { passive: true });
  return () => window.removeEventListener('resize', handler);
}

export function useResponsive(): ResponsiveState {
  return useSyncExternalStore(subscribe, getStableSnapshot, getServerSnapshot);
}
