/**
 * LexiGuard AI - Top Navigation & Header Component
 */

export function createHeader({ onThemeToggle, onOpenPrivacy, onOpenApiKey, currentTheme }) {
  const header = document.createElement('header');
  header.className = 'header-nav';
  
  header.innerHTML = `
    <div class="brand-logo">
      <div class="brand-icon">
        <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
      </div>
      <div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="brand-title">LexiGuard</span>
          <span class="brand-badge">AI 2.0</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">GenAI Legal Intelligence & Privacy Shield</div>
      </div>
    </div>

    <div class="header-actions">
      <!-- Privacy Shield Button -->
      <button id="btn-privacy-shield" class="privacy-shield-pill" title="Client-Side Privacy & PII Protection Active">
        <span class="privacy-pulse"></span>
        <i data-lucide="lock" style="width:14px; height:14px;"></i>
        <span>Privacy Shield: ON</span>
      </button>

      <!-- Gemini API Key Button -->
      <button id="btn-api-key" class="btn btn-secondary btn-sm" title="Configure Google Gemini API Key">
        <i data-lucide="key" style="width:14px; height:14px;"></i>
        <span id="api-key-status">API: Default</span>
      </button>

      <!-- Theme Switcher Button -->
      <button id="btn-theme-toggle" class="btn btn-secondary btn-sm" title="Toggle Dark/Light Mode">
        <i data-lucide="${currentTheme === 'dark' ? 'sun' : 'moon'}" style="width:16px; height:16px;"></i>
      </button>
    </div>
  `;

  // Bind events
  setTimeout(() => {
    header.querySelector('#btn-privacy-shield').addEventListener('click', onOpenPrivacy);
    header.querySelector('#btn-api-key').addEventListener('click', onOpenApiKey);
    header.querySelector('#btn-theme-toggle').addEventListener('click', onThemeToggle);
  }, 0);

  return header;
}
