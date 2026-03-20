import { useEffect } from 'react';
import type { GlobeTheme } from '../theme/GlobeTheme';
import { useResolvedTheme } from '../GlobeRoot';
import { useResponsive } from '../hooks/useResponsive';
import { MobileSheet } from './MobileSheet';

// ---------------------------------------------------------------------------
// DetailDrawer — glass panel for selected item details.
// Desktop: right sidebar 400px. Mobile: MobileSheet.
// Uses .og-drawer-* classes from tokens.css.
// ---------------------------------------------------------------------------

export interface DetailData {
  id: string;
  name: string;
  nameZh?: string;
  scientificName?: string;
  description?: string;
  metadata?: Record<string, string>;
  images?: string[];
  links?: { label: string; url: string }[];
  attribution?: string;
}

interface DetailDrawerProps {
  theme?: GlobeTheme;
  data: DetailData | null;
  onClose: () => void;
}

export function DetailDrawer({ theme: themeProp, data, onClose }: DetailDrawerProps) {
  const theme = useResolvedTheme(themeProp);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!data) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [data, onClose]);

  if (!data) return null;

  const content = <DetailContent theme={theme} data={data} onClose={onClose} showClose={!isMobile} />;

  if (isMobile) {
    return (
      <MobileSheet
        snap="expanded"
        onSnapChange={(s) => { if (s === 'closed') onClose(); }}
        title={data.name}
      >
        {content}
      </MobileSheet>
    );
  }

  return (
    <aside className="og-drawer og-glass" data-og="detail-drawer">
      {content}
    </aside>
  );
}

function DetailContent({
  theme,
  data,
  onClose,
  showClose,
}: {
  theme: GlobeTheme;
  data: DetailData;
  onClose: () => void;
  showClose: boolean;
}) {
  const metadata = data.metadata ?? {};
  const links = data.links ?? [];
  const images = data.images ?? [];

  return (
    <div className="og-drawer-body">
      {images.length > 0 ? (
        <div className="og-drawer-image" data-og="detail-image">
          <img src={images[0]} alt={data.name} loading="lazy" />
        </div>
      ) : (
        <div className="og-drawer-image-empty" />
      )}

      <div className="og-drawer-header">
        <div style={{ flex: 1 }}>
          <h2 className="og-drawer-name" data-og="detail-name">{data.name}</h2>
          {data.nameZh && <div className="og-drawer-name-zh">{data.nameZh}</div>}
          {data.scientificName && (
            <div className="og-drawer-sci" data-og="detail-sci">{data.scientificName}</div>
          )}
        </div>
        {showClose && (
          <button
            type="button"
            className="og-close-btn"
            onClick={onClose}
            aria-label="Close"
            data-og="detail-close"
            style={{ width: 32, height: 32, flexShrink: 0 }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {data.description && (
        <p className="og-drawer-desc" data-og="detail-desc">{data.description}</p>
      )}

      {Object.keys(metadata).length > 0 && (
        <div className="og-metadata-grid" data-og="detail-metadata">
          {Object.entries(metadata).map(([key, val]) => {
            const fieldConfig = theme.detailFields.find((f) => f.key === key);
            return (
              <div key={key} className="og-metadata-item">
                <div className="og-metadata-label">{fieldConfig?.label ?? key}</div>
                <div className="og-metadata-value">{val}</div>
              </div>
            );
          })}
        </div>
      )}

      {links.length > 0 && (
        <div className="og-link-pills" data-og="detail-links">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="og-link-pill og-glass-inset"
              data-og="link-pill"
            >
              {link.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          ))}
        </div>
      )}

      {data.attribution && (
        <div className="og-attribution" data-og="detail-attribution">{data.attribution}</div>
      )}
    </div>
  );
}
