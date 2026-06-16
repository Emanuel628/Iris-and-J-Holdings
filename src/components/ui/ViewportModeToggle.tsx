import { useEffect, useState } from 'react';

type ViewMode = 'mobile' | 'desktop';

const STORAGE_KEY = 'iris-view-mode';

function getInitialMode(): ViewMode {
  if (typeof window === 'undefined') {
    return 'mobile';
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'desktop' ? 'desktop' : 'mobile';
}

function ViewportModeToggle() {
  const [mode, setMode] = useState<ViewMode>(getInitialMode);

  useEffect(() => {
    const isDesktopMode = mode === 'desktop';

    document.documentElement.classList.toggle('desktop-view', isDesktopMode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const nextMode: ViewMode = mode === 'desktop' ? 'mobile' : 'desktop';

  return (
    <button
      className="viewport-toggle"
      type="button"
      aria-label={`Switch to ${nextMode} view`}
      onClick={() => setMode(nextMode)}
    >
      <span>{mode === 'desktop' ? 'Desktop view' : 'Mobile view'}</span>
      <strong>{mode === 'desktop' ? 'Switch to mobile' : 'Switch to desktop'}</strong>
    </button>
  );
}

export default ViewportModeToggle;
