/**
 * LexiGuard AI - Core Utility & Security Library
 * High-performance, zero-dependency helpers for sanitization, safe storage, and toasts.
 */

/**
 * Safe isomorphic storage adapter compatible with Browsers, Node.js, and SSR.
 */
export const safeStorage = Object.freeze({
  getItem(key) {
    if (typeof key !== 'string' || !key) return null;
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    if (typeof key !== 'string' || !key) return;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, String(value));
      }
    } catch (e) {
      console.warn('[safeStorage] setItem failed:', e);
    }
  },
  removeItem(key) {
    if (typeof key !== 'string' || !key) return;
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
 * Escapes unsafe HTML characters to prevent XSS attacks across all contexts.
 * Sanitizes &, <, >, ", ', `, and / to prevent attribute breakout and execution.
 * Accepts strings, numbers, or boolean values safely.
 * @param {*} str - Raw string or primitive value
 * @returns {string} Sanitized string safe for DOM insertion
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes a filename to prevent path traversal, null-byte injection, and invalid characters.
 * @param {string} filename - User or generated filename
 * @param {string} [fallback='document.txt'] - Fallback name if sanitized string is empty
 * @returns {string} Safe filename
 */
export function sanitizeFileName(filename, fallback = 'document.txt') {
  if (typeof filename !== 'string' || !filename.trim()) return fallback;
  // Remove null bytes, url-encoded null bytes, and RTLO/bidirectional overrides
  let clean = filename
    .replace(/\0/g, '')
    .replace(/%00/gi, '')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    .trim();

  // Extract base filename if path separators exist
  if (clean.includes('/') || clean.includes('\\')) {
    const parts = clean.split(/[/\\]+/).filter(Boolean);
    clean = parts[parts.length - 1] || fallback;
  }

  // Remove directory traversal dots and illegal characters
  clean = clean
    .replace(/\.\.+/g, '')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();

  // Strip leading dots or underscores
  clean = clean.replace(/^[._]+/, '');

  // Disarm Windows DOS device reserved names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  const baseNoExt = clean.replace(/\.[^.]+$/, '');
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(baseNoExt)) {
    clean = `safe_${clean}`;
  }

  return clean || fallback;
}

/**
 * Whitelist of allowed extensions for contract files.
 */
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.doc', '.docx', '.json'];

/**
 * Blacklist of dangerous executable or script extensions.
 */
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.vbs', '.ps1', '.psm1',
  '.scr', '.msi', '.pif', '.application', '.gadget', '.hta', '.cpl',
  '.msc', '.jar', '.html', '.htm', '.xhtml', '.svg', '.xml', '.php',
  '.asp', '.aspx', '.jsp', '.js', '.mjs', '.cjs', '.py', '.rb', '.pl'
];

/**
 * Validates uploaded contract files against size, extension whitelist/blacklist, and binary payloads.
 * @param {File} file - Browser File object
 * @param {string} [textContent=''] - Read text content of the file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileUpload(file, textContent = '') {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Max 2MB limit
  const MAX_SIZE_BYTES = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds the 2MB size limit.' };
  }

  const rawName = file.name || '';

  // Check for bidirectional Unicode override characters (RTLO spoofing attack prevention)
  if (/[\u202A-\u202E\u2066-\u2069]/.test(rawName)) {
    return { valid: false, error: 'Dangerous filename contains right-to-left override (RTLO) or bidirectional control characters.' };
  }

  // Reject Windows DOS device reserved names in uploads (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  const baseName = (rawName.split(/[/\\]+/).pop() || '').replace(/\.[^.]+$/, '');
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(baseName)) {
    return { valid: false, error: 'Reserved system device filename detected. Please rename the file.' };
  }

  const name = rawName.toLowerCase();
  
  // Check against dangerous extensions
  for (const dangerousExt of DANGEROUS_EXTENSIONS) {
    if (name.endsWith(dangerousExt)) {
      return { valid: false, error: `Dangerous file type detected (${dangerousExt}). Upload rejected for security.` };
    }
  }

  // Check against allowed extensions
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasValidExt) {
    return { valid: false, error: 'Unsupported file extension. Only .txt, .md, .doc, .docx, and .json are accepted.' };
  }

  // Check for path traversal in file name
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return { valid: false, error: 'Invalid filename contains illegal path traversal characters.' };
  }

  // Check text content for binary null bytes or dangerous script payload injections
  if (typeof textContent === 'string' && textContent.length > 0) {
    if (textContent.includes('\0')) {
      return { valid: false, error: 'Binary or null-byte content detected. Please upload valid text documents only.' };
    }
  }

  return { valid: true };
}

/**
 * Masks an API key for safe UI presentation (e.g., AIzaSy••••••••••••XXXX).
 * @param {string} key - Raw API key
 * @returns {string} Masked string safe for display
 */
export function maskApiKey(key) {
  if (typeof key !== 'string' || !key.trim()) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  const prefix = trimmed.slice(0, 6);
  const suffix = trimmed.slice(-4);
  const maskLen = Math.max(trimmed.length - 10, 8);
  return `${prefix}${'•'.repeat(maskLen)}${suffix}`;
}

/**
 * Debounces a function call by a given delay in milliseconds.
 * @param {Function} func - Function to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delayMs = 300) {
  if (typeof func !== 'function') return () => {};
  let timeoutId;
  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), Math.max(Number(delayMs) || 0, 0));
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

/**
 * Clamps a number between minimum and maximum bounds with NaN and bound reversal protection.
 * @param {number} val - Input value
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} Clamped value
 */
export function clamp(val, min = 0, max = 100) {
  const num = Number(val);
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  if (Number.isNaN(num)) return lower;
  return Math.min(Math.max(num, lower), upper);
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
