// Safe in-app Toast Notification replacing window.alert to comply with iframe constraints

type ToastType = 'info' | 'success' | 'warning' | 'error';

export function showSafeToast(message: string, type: ToastType = 'info', durationMs: number = 3500) {
  if (typeof document === 'undefined') return;

  let container = document.getElementById('safe-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'safe-toast-container';
    container.style.cssText =
      'position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 99999999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; width: max-content; max-width: 90vw;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText =
    'pointer-events: auto; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border-radius: 12px; padding: 10px 16px; color: #f8fafc; font-size: 12px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-weight: 700; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6); display: flex; align-items: center; gap: 10px; animation: toast-slide-down 0.25s ease-out; transition: all 0.3s ease;';

  const borderColor =
    type === 'error'
      ? '#f43f5e'
      : type === 'warning'
      ? '#f59e0b'
      : type === 'success'
      ? '#10b981'
      : '#38bdf8';
  toast.style.border = `1.5px solid ${borderColor}`;

  const iconSpan = document.createElement('span');
  iconSpan.textContent =
    type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '⚡';
  toast.appendChild(iconSpan);

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, durationMs);
}

// Safely patch window.alert in browser environment to avoid iframe DOMException
if (typeof window !== 'undefined') {
  try {
    window.alert = (msg?: any) => {
      showSafeToast(String(msg || ''), 'info');
    };
  } catch (e) {
    // Ignore if window is frozen
  }
}
