import type { CSSProperties } from 'react';
import type { FilterConfig, GlobeTheme } from '../theme/GlobeTheme';
import { useResolvedTheme } from '../GlobeRoot';
import { useResponsive } from '../hooks/useResponsive';
import { MobileSheet } from './MobileSheet';

// ---------------------------------------------------------------------------
// FilterPanel — glass sidebar (desktop) / bottom sheet (mobile).
// Uses .og-sidebar-*, .og-chip, .og-range, .og-toggle-* classes.
// Theme resolved from prop or <GlobeRoot> context.
// ---------------------------------------------------------------------------

interface FilterPanelProps {
  theme?: GlobeTheme;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  resultCount?: number;
  sheetSnap?: 'closed' | 'peek' | 'expanded';
  onSheetSnapChange?: (snap: 'closed' | 'peek' | 'expanded') => void;
  onClose?: () => void;
}

export function FilterPanel({
  theme: themeProp,
  values,
  onChange,
  resultCount,
  sheetSnap,
  onSheetSnapChange,
  onClose,
}: FilterPanelProps) {
  const theme = useResolvedTheme(themeProp);
  const { isMobile } = useResponsive();

  const content = (
    <div className="og-sidebar-content" role="search" aria-label="Filters" data-og="filter-content">
      {theme.filters.map((filter, i) => (
        <div key={filter.key}>
          {i > 0 && <div className="og-divider" />}
          <FilterControl
            filter={filter}
            value={values[filter.key]}
            onChange={(val) => onChange(filter.key, val)}
          />
        </div>
      ))}
      {resultCount !== undefined && (
        <>
          <div className="og-divider" />
          <div className="og-result-count" data-og="result-count">
            {resultCount.toLocaleString()} species found
          </div>
        </>
      )}
    </div>
  );

  if (isMobile && sheetSnap && onSheetSnapChange) {
    return (
      <MobileSheet snap={sheetSnap} onSnapChange={onSheetSnapChange} title="Filters">
        {content}
      </MobileSheet>
    );
  }

  if (!isMobile) {
    return (
      <aside className="og-sidebar og-glass" data-og="filter-panel">
        <div className="og-sidebar-header">
          <span className="og-section-label">Filters</span>
          {onClose && (
            <button
              type="button"
              className="og-close-btn"
              onClick={onClose}
              aria-label="Close filters"
              data-og="filter-close"
              style={{ width: 28, height: 28 }}
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        {content}
      </aside>
    );
  }

  return content;
}

// ---------------------------------------------------------------------------
// Filter controls
// ---------------------------------------------------------------------------

function FilterControl({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (filter.type) {
    case 'chips':
      return <ChipsFilter filter={filter} selected={value as string[] | undefined} onChange={onChange} />;
    case 'range':
      return <RangeFilter filter={filter} value={value as number | undefined} onChange={onChange} />;
    case 'toggle':
      return <ToggleFilter filter={filter} checked={value as boolean | undefined} onChange={onChange} />;
  }
}

function ChipsFilter({
  filter,
  selected = [],
  onChange,
}: {
  filter: FilterConfig;
  selected?: string[];
  onChange: (value: string[]) => void;
}) {
  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(next);
  };

  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
      <legend className="og-section-label">{filter.label}</legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--og-space-2)' }}>
        {filter.options?.map((option) => (
          <button
            key={option}
            type="button"
            className="og-chip"
            onClick={() => toggle(option)}
            aria-pressed={selected.includes(option)}
            data-og="chip"
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RangeFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value?: number;
  onChange: (value: number) => void;
}) {
  const min = filter.min ?? 0;
  const max = filter.max ?? 100;
  const current = value ?? max;
  const pct = ((current - min) / (max - min)) * 100;

  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
      <legend className="og-section-label">{filter.label}</legend>
      <input
        type="range"
        className="og-range"
        min={min}
        max={max}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--og-range-pct': `${pct}%` } as CSSProperties}
        data-og="range"
      />
      <div className="og-range-labels">
        <span>{min}{filter.unit ?? ''}</span>
        <span className="og-range-value">{current}{filter.unit ? ` ${filter.unit}` : ''}</span>
        <span>{max}{filter.unit ?? ''}</span>
      </div>
    </fieldset>
  );
}

function ToggleFilter({
  filter,
  checked = false,
  onChange,
}: {
  filter: FilterConfig;
  checked?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="og-toggle" data-og="toggle">
      <span className="og-toggle-label">{filter.label}</span>
      <span
        className="og-toggle-track"
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      >
        <span className="og-toggle-thumb" />
      </span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Shared icon
// ---------------------------------------------------------------------------

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
