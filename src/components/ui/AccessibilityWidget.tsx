import { useEffect, useState } from 'react';
import { Accessibility, Minus, Plus, RotateCcw, X } from 'lucide-react';

type Prefs = {
  textScale: number; // 0..3 steps
  contrast: boolean;
  underline: boolean;
};

const STORAGE_KEY = 'iris-a11y';
const DEFAULTS: Prefs = { textScale: 0, contrast: false, underline: false };

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.classList.toggle('a11y-contrast', prefs.contrast);
  root.classList.toggle('a11y-underline', prefs.underline);
  root.style.fontSize = prefs.textScale ? `${100 + prefs.textScale * 12.5}%` : '';
}

function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    applyPrefs(prefs);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const update = (patch: Partial<Prefs>) => setPrefs((current) => ({ ...current, ...patch }));
  const stepScale = (delta: number) =>
    update({ textScale: Math.max(0, Math.min(3, prefs.textScale + delta)) });

  return (
    <>
      <button
        className="a11y-toggle"
        type="button"
        aria-label="Accessibility options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Accessibility size={24} aria-hidden="true" />
      </button>

      {open && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility options">
          <div className="a11y-panel-head">
            <strong>Accessibility</strong>
            <button type="button" aria-label="Close accessibility options" onClick={() => setOpen(false)}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="a11y-row">
            <span>Text size {prefs.textScale > 0 ? `+${prefs.textScale}` : ''}</span>
            <div className="a11y-stepper">
              <button type="button" aria-label="Decrease text size" onClick={() => stepScale(-1)} disabled={prefs.textScale === 0}>
                <Minus size={16} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Increase text size" onClick={() => stepScale(1)} disabled={prefs.textScale === 3}>
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`a11y-option ${prefs.contrast ? 'is-on' : ''}`}
            aria-pressed={prefs.contrast}
            onClick={() => update({ contrast: !prefs.contrast })}
          >
            High contrast
          </button>
          <button
            type="button"
            className={`a11y-option ${prefs.underline ? 'is-on' : ''}`}
            aria-pressed={prefs.underline}
            onClick={() => update({ underline: !prefs.underline })}
          >
            Underline links
          </button>

          <button type="button" className="a11y-reset" onClick={() => setPrefs(DEFAULTS)}>
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
          <a className="a11y-statement-link" href="/accessibility">Read our accessibility statement</a>
        </div>
      )}
    </>
  );
}

export default AccessibilityWidget;
