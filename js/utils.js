/**
 * LexiGuard AI - Core Utility & Security Library
 * High-performance, zero-dependency helpers for sanitization, safe storage, and toasts.
 */

/**
 * Safe isomorphic storage adapter compatible with Browsers, Node.js, and SSR.
 */
export const safeStorage = Object.freeze({
  getItem(key) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('[safeStorage] setItem failed:', e);
    }
  },
  removeItem(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[safeStorage] removeItem failed:', e);
    }
  },
  clear() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('[safeStorage] clear failed:', e);
    }
  }
});

/**
 * Escapes unsafe HTML characters to prevent XSS attacks.
 * @param {string} str - Raw string
 * @returns {string} Sanitized string safe for DOM insertion
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounces a function call by a given delay in milliseconds.
 * @param {Function} func - Function to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delayMs = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delayMs);
  };
}

/**
 * Clamps a number between minimum and maximum bounds.
 * @param {number} val - Input value
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} Clamped value
 */
export function clamp(val, min = 0, max = 100) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Displays a toast notification in the bottom right corner.
 * @param {string} message - Notification text
 * @param {'success'|'info'|'warning'|'error'} [type='info'] - Notification type
 * @param {number} [durationMs=3500] - Duration before auto-dismiss
 */
export function showToast(message, type = 'info', durationMs = 3500) {
  if (typeof document === 'undefined') return;

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'check-circle-2',
    warning: 'alert-triangle',
    error: 'x-circle',
    info: 'info'
  };

  const iconName = iconMap[type] || 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width:16px; height:16px;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 300);
  }, durationMs);

  // Also announce to screen readers via ARIA live region
  announceA11y(message);
}

/**
 * Announces dynamic status updates to screen readers via the global ARIA live region.
 * @param {string} message - Message text to announce
 */
export function announceA11y(message) {
  if (typeof document === 'undefined') return;
  const announcer = document.getElementById('a11y-announcer');
  if (announcer && message) {
    // Clear first to guarantee announcement if message repeats
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  }
}

/**
 * Traps keyboard focus within an accessible modal container and handles Escape key.
 * @param {HTMLElement} containerEl - Modal container element
 * @param {Function} [onEscape] - Optional callback when Escape key is pressed
 * @returns {Function} Cleanup function to remove event listeners
 */
export function trapFocus(containerEl, onEscape) {
  if (!containerEl) return () => {};

  const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = () => {
    return Array.from(containerEl.querySelectorAll(focusableSelector))
      .filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && typeof onEscape === 'function') {
      e.preventDefault();
      onEscape();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !containerEl.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !containerEl.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  containerEl.addEventListener('keydown', handleKeyDown);

  // Automatically focus first focusable element
  requestAnimationFrame(() => {
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  });

  return () => {
    containerEl.removeEventListener('keydown', handleKeyDown);
  };
}
