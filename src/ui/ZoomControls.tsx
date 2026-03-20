// ---------------------------------------------------------------------------
// ZoomControls — stacked glass [+][−] buttons, bottom-right.
// Uses .og-zoom-* classes from tokens.css.
// ---------------------------------------------------------------------------

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="og-zoom" data-og="zoom-controls">
      <button
        type="button"
        className="og-zoom-btn"
        onClick={onZoomIn}
        aria-label="Zoom in"
        data-og="zoom-in"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        className="og-zoom-btn"
        onClick={onZoomOut}
        aria-label="Zoom out"
        data-og="zoom-out"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
