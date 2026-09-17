/**
 * LexiGuard AI - Gemini API Key Setup Modal
 * @module ApiKeyModal
 */

import { aiService } from '../services/aiEngine.js';
import { escapeHtml, showToast, trapFocus, announceA11y, maskApiKey } from '../utils.js';

export function createApiKeyModal({ onClose, onKeyUpdated }) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'api-modal-title');

  const currentKey = aiService.apiKey || '';
  const maskedDisplay = currentKey ? maskApiKey(currentKey) : '';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title" id="api-modal-title">
          <i data-lucide="key" style="width:22px; height:22px; color:var(--accent-primary);" aria-hidden="true"></i>
          <span>Configure Gemini AI API Key</span>
        </div>
        <button id="modal-key-close" type="button" class="close-btn" aria-label="Close API Key dialog">&times;</button>
      </div>

      <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6;">
        LexiGuard AI includes a high-speed built-in zero-latency local NLP engine. Optionally provide your personal <strong>Google Gemini API Key</strong> to activate live LLM model inference.
      </div>

      ${maskedDisplay ? `
        <div style="font-size:0.8rem; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.25); border-radius:6px; padding:0.5rem 0.75rem; color:var(--accent-cyan);">
          <i data-lucide="shield-check" style="width:14px; height:14px; display:inline;" aria-hidden="true"></i>
          <span>Active Key: <code>${escapeHtml(maskedDisplay)}</code></span>
        </div>
      ` : ''}

      <div>
        <label for="inp-api-key" style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.4rem;">Google Gemini API Key</label>
        <div style="display:flex; gap:0.4rem;">
          <input id="inp-api-key" type="password" class="chat-input" style="flex:1;" value="${escapeHtml(currentKey)}" placeholder="AIzaSy..." autocomplete="off" spellcheck="false" maxlength="128" />
          <button id="btn-toggle-visibility" type="button" class="btn btn-secondary btn-sm" aria-label="Toggle key visibility" title="Toggle visibility">
            <i id="icon-visibility" data-lucide="eye" style="width:16px; height:16px;" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div style="font-size:0.75rem; color:var(--text-muted);">
        <i data-lucide="lock" style="width:12px; height:12px; display:inline;" aria-hidden="true"></i> Keys are stored in local session memory only and are never transmitted to third parties.
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; flex-wrap:wrap; gap:0.5rem;">
        <button id="btn-clear-key" type="button" class="btn btn-secondary btn-sm">Clear Key (Use Default)</button>
        <div style="display:flex; gap:0.5rem;">
          <button id="btn-save-key" type="button" class="btn btn-primary">Save Key</button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ root: modal });
  }

  announceA11y('Configure Gemini AI API Key dialog opened.');

  let untrap;

  const handleClose = () => {
    if (typeof untrap === 'function') untrap();
    announceA11y('API Key dialog closed.');
    onClose();
  };

  untrap = trapFocus(modal, handleClose);

  // Toggle Key Visibility
  const toggleBtn = modal.querySelector('#btn-toggle-visibility');
  const keyInp = modal.querySelector('#inp-api-key');
  toggleBtn?.addEventListener('click', () => {
    if (!keyInp) return;
    const isPass = keyInp.getAttribute('type') === 'password';
    keyInp.setAttribute('type', isPass ? 'text' : 'password');
    const icon = modal.querySelector('#icon-visibility');
    if (icon) {
      icon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
      if (window.lucide) {
        window.lucide.createIcons({ root: toggleBtn });
      }
    }
  });

  modal.querySelector('#modal-key-close')?.addEventListener('click', handleClose);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) handleClose();
  });
  
  modal.querySelector('#btn-save-key')?.addEventListener('click', () => {
    const rawVal = (modal.querySelector('#inp-api-key')?.value || '').trim();
    // Validate: strip control chars, ensure no newlines
    const sanitizedVal = rawVal.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 128);
    aiService.setApiKey(sanitizedVal);
    onKeyUpdated();
    showToast(sanitizedVal ? 'Gemini API Key activated!' : 'Using default local NLP engine', 'success', 2500);
    handleClose();
  });

  modal.querySelector('#btn-clear-key')?.addEventListener('click', () => {
    aiService.setApiKey('');
    onKeyUpdated();
    showToast('API Key cleared. Switched to local NLP engine.', 'info', 2500);
    handleClose();
  });

  return modal;
}
