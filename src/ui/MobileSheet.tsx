import {
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// MobileSheet — draggable bottom sheet with velocity-based snapping.
// Uses .og-sheet-* classes from tokens.css. Dynamic height via --og-sheet-h.
// ---------------------------------------------------------------------------

export interface MobileSheetProps {
  children: ReactNode;
  snap: 'closed' | 'peek' | 'expanded';
  onSnapChange: (snap: 'closed' | 'peek' | 'expanded') => void;
  title?: string;
}

const HANDLE_HEIGHT = 48;
const VELOCITY_THRESHOLD = 0.5;

function snapHeight(snap: 'closed' | 'peek' | 'expanded', vh: number): number {
  switch (snap) {
    case 'closed': return HANDLE_HEIGHT;
    case 'peek': return vh * 0.5;
    case 'expanded': return vh * 0.85;
  }
}

export function MobileSheet({ children, snap, onSnapChange, title }: MobileSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startY: number;
    startHeight: number;
    lastY: number;
    lastTime: number;
  } | null>(null);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const height = snapHeight(snap, vh);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      dragState.current = {
        startY: touch.clientY,
        startHeight: snapHeight(snap, window.innerHeight),
        lastY: touch.clientY,
        lastTime: Date.now(),
      };
    },
    [snap],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const state = dragState.current;
    const touch = e.touches[0];
    if (!state || !touch || !sheetRef.current) return;

    const deltaY = state.startY - touch.clientY;
    const newHeight = Math.max(HANDLE_HEIGHT, state.startHeight + deltaY);
    const clamped = Math.min(newHeight, window.innerHeight * 0.92);

    state.lastY = touch.clientY;
    state.lastTime = Date.now();

    sheetRef.current.style.transition = 'none';
    sheetRef.current.style.height = `${clamped}px`;
  }, []);

  const onTouchEnd = useCallback(() => {
    const state = dragState.current;
    if (!state || !sheetRef.current) return;
    dragState.current = null;

    const currentHeight = sheetRef.current.getBoundingClientRect().height;
    const currentVh = window.innerHeight;
    const elapsed = Date.now() - state.lastTime;
    const velocity = elapsed > 0 ? (state.startY - state.lastY) / elapsed : 0;

    sheetRef.current.style.transition = '';
    sheetRef.current.style.height = '';

    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      onSnapChange(velocity > 0 ? 'expanded' : 'closed');
      return;
    }

    const snaps: Array<'closed' | 'peek' | 'expanded'> = ['closed', 'peek', 'expanded'];
    let nearest = snaps[0]!;
    let minDist = Infinity;
    for (const s of snaps) {
      const dist = Math.abs(currentHeight - snapHeight(s, currentVh));
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    }
    onSnapChange(nearest);
  }, [onSnapChange]);

  const onBackdropClick = useCallback(() => {
    onSnapChange('peek');
  }, [onSnapChange]);

  useEffect(() => {
    if (snap !== 'expanded') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSnapChange('peek');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [snap, onSnapChange]);

  const sheetVars = { '--og-sheet-h': `${height}px` } as CSSProperties;

  return (
    <>
      <div
        className="og-sheet-backdrop"
        data-expanded={snap === 'expanded' ? 'true' : undefined}
        onClick={onBackdropClick}
        data-og="sheet-backdrop"
      />
      <div
        ref={sheetRef}
        className="og-sheet og-glass-heavy"
        style={sheetVars}
        role="dialog"
        aria-label={title ?? 'Bottom sheet'}
        data-og="mobile-sheet"
      >
        <div
          className="og-sheet-handle"
          data-og="sheet-handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {title && <span className="og-sheet-title">{title}</span>}
          <div className="og-sheet-pill" />
        </div>
        <div className="og-sheet-content">{children}</div>
      </div>
    </>
  );
}
