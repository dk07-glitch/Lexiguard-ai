/**
 * LexiGuard AI - Gemini API Key Setup Modal
 */

import { aiService } from '../services/aiEngine.js';

export function createApiKeyModal({ onClose, onKeyUpdated }) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';

  const currentKey = aiService.apiKey || '';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">
          <i data-lucide="key" style="width:22px; height:22px; color:var(--accent-primary);"></i>
          <span>Configure Gemini AI API Key</span>
        </div>
        <button id="modal-key-close" class="close-btn">&times;</button>
      </div>

      <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">
        By default, LexiGuard AI runs using a high-speed built-in zero-latency NLP extraction engine. Optionally enter your <strong>Google Gemini API Key</strong> to activate live LLM model processing.
      </div>

      <div>
        <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.4rem;">Google Gemini API Key</label>
        <input id="inp-api-key" type="password" class="chat-input" style="width:100%;" value="${currentKey}" placeholder="AIzaSy..." />
      </div>

      <div style="font-size:0.75rem; color:var(--text-muted);">
        <i data-lucide="lock" style="width:12px; height:12px; display:inline;"></i> Keys are stored in session memory only and are never transmitted to third parties.
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
        <button id="btn-clear-key" class="btn btn-secondary btn-sm">Clear Key (Use Default)</button>
        <div style="display:flex; gap:0.5rem;">
          <button id="btn-save-key" class="btn btn-primary">Save Key</button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  modal.querySelector('#modal-key-close').addEventListener('click', onClose);
  
  modal.querySelector('#btn-save-key').addEventListener('click', () => {
    const val = modal.querySelector('#inp-api-key').value.trim();
    aiService.setApiKey(val);
    onKeyUpdated();
    onClose();
  });

  modal.querySelector('#btn-clear-key').addEventListener('click', () => {
    aiService.setApiKey('');
    onKeyUpdated();
    onClose();
  });

  return modal;
}
