/**
 * LexiGuard AI - Gemini API Key Setup Modal
 * @module ApiKeyModal
 */

import { aiService } from '../services/aiEngine.js';
import { escapeHtml, showToast, trapFocus, announceA11y } from '../utils.js';

export function createApiKeyModal({ onClose, onKeyUpdated }) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'api-modal-title');

  const currentKey = aiService.apiKey || '';

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

      <div>
        <label for="inp-api-key" style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.4rem;">Google Gemini API Key</label>
        <input id="inp-api-key" type="password" class="chat-input" style="width:100%;" value="${escapeHtml(currentKey)}" placeholder="AIzaSy..." autocomplete="off" />
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

  modal.querySelector('#modal-key-close')?.addEventListener('click', handleClose);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) handleClose();
  });
  
  modal.querySelector('#btn-save-key')?.addEventListener('click', () => {
    const val = (modal.querySelector('#inp-api-key')?.value || '').trim();
    aiService.setApiKey(val);
    onKeyUpdated();
    showToast(val ? 'Gemini API Key activated!' : 'Using default local NLP engine', 'success', 2500);
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
