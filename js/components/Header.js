/**
 * LexiGuard AI - Executive Top Navigation Header Component
 * Fully accessible with theme toggle, privacy shield indicator, and API key management.
 * @module Header
 */

export function createHeader({ onThemeToggle, onOpenPrivacy, onOpenApiKey, onOpenProblemAlignment, currentTheme }) {
  const header = document.createElement('header');
  header.className = 'header-nav';
  header.setAttribute('role', 'banner');
  
  header.innerHTML = `
    <a href="#" class="brand-logo" aria-label="LexiGuard AI Homepage">
      <div class="brand-icon" aria-hidden="true">
        <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
      </div>
      <div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="brand-title">LexiGuard</span>
          <span class="brand-badge">AI 2.0</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">
          Legal Document Intelligence & Privacy Shield
        </div>
      </div>
    </a>

    <div class="header-actions" role="toolbar" aria-label="Quick Actions">
      <!-- Mission & Problem Statement Alignment Button -->
      <button id="btn-problem-alignment" type="button" class="btn btn-secondary btn-sm" title="View Problem Statement & Architecture Alignment" aria-label="Open Problem Statement Alignment">
        <i data-lucide="target" style="width:14px; height:14px; color:var(--accent-secondary);" aria-hidden="true"></i>
        <span>Mission Alignment</span>
      </button>

      <!-- Client-Side Privacy Shield Button -->
      <button id="btn-privacy-shield" type="button" class="privacy-shield-pill" title="Client-Side Privacy & PII Protection Active" aria-label="Open Privacy Shield Settings">
        <span class="privacy-pulse" aria-hidden="true"></span>
        <i data-lucide="lock" style="width:14px; height:14px;" aria-hidden="true"></i>
        <span>Privacy Shield: ON</span>
      </button>

      <!-- Gemini API Key Configuration Button -->
      <button id="btn-api-key" type="button" class="btn btn-secondary btn-sm" title="Configure Google Gemini API Key" aria-label="Configure Gemini API Key">
        <i data-lucide="key" style="width:14px; height:14px;" aria-hidden="true"></i>
        <span id="api-key-status">API: Default</span>
      </button>

      <!-- Dark / Light Theme Switcher Button -->
      <button id="btn-theme-toggle" type="button" class="btn btn-secondary btn-sm" title="Toggle Dark/Light Theme" aria-label="Toggle Color Theme">
        <i data-lucide="${currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:15px; height:15px;" aria-hidden="true"></i>
      </button>
    </div>
  `;

  // Bind event listeners asynchronously to guarantee DOM attachment
  requestAnimationFrame(() => {
    header.querySelector('#btn-problem-alignment')?.addEventListener('click', onOpenProblemAlignment);
    header.querySelector('#btn-privacy-shield')?.addEventListener('click', onOpenPrivacy);
    header.querySelector('#btn-api-key')?.addEventListener('click', onOpenApiKey);
    header.querySelector('#btn-theme-toggle')?.addEventListener('click', onThemeToggle);
  });

  return header;
}
