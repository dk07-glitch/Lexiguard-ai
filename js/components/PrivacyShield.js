/**
 * LexiGuard AI - Client-Side Privacy Shield & Data Purge Modal
 * @module PrivacyShield
 */

import { piiService } from '../services/piiMasker.js';
import { showToast, trapFocus, announceA11y } from '../utils.js';

export function createPrivacyModal({ onClose }) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'privacy-modal-title');

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title" id="privacy-modal-title">
          <img src="assets/privacy_shield.jpg" alt="Cyber Legal Security Shield" class="modal-shield-graphic" />
          <div>
            <div style="font-size:1.15rem; font-weight:800;">Client-Side Privacy Shield</div>
            <div style="font-size:0.78rem; color:var(--text-muted); font-weight:500;">Zero Server Retention & PII Anonymizer</div>
          </div>
        </div>
        <button id="modal-close-btn" type="button" class="close-btn" aria-label="Close dialog">&times;</button>
      </div>

      <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6;">
        LexiGuard AI enforces a strict <strong>Zero Data Retention</strong> policy. Your documents remain client-side in browser session memory, and sensitive entities are automatically scrubbed prior to any AI processing.
      </div>

      <!-- PII Category Controls -->
      <div style="display:flex; flex-direction:column; gap:0.75rem; padding:1.1rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.03); border:1px solid var(--border-color);">
        <div style="font-weight:700; font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">
          Active PII Redaction Categories
        </div>

        <label style="display:flex; align-items:center; justify-content:space-between; font-size:0.88rem; cursor:default;">
          <span>Names & Entities (Parties, Signatures, Representatives)</span>
          <span class="risk-badge badge-low" style="font-size:0.7rem;">Active</span>
        </label>
        <label style="display:flex; align-items:center; justify-content:space-between; font-size:0.88rem; cursor:default;">
          <span>Financial Amounts, Rent & Liquidated Damages</span>
          <span class="risk-badge badge-low" style="font-size:0.7rem;">Active</span>
        </label>
        <label style="display:flex; align-items:center; justify-content:space-between; font-size:0.88rem; cursor:default;">
          <span>Physical Addresses, Unit & Suite Numbers</span>
          <span class="risk-badge badge-low" style="font-size:0.7rem;">Active</span>
        </label>
        <label style="display:flex; align-items:center; justify-content:space-between; font-size:0.88rem; cursor:default;">
          <span>Email Addresses, Phone Numbers & Identifiers</span>
          <span class="risk-badge badge-low" style="font-size:0.7rem;">Active</span>
        </label>
      </div>

      <!-- Session Data Purge Action -->
      <div style="display:flex; align-items:center; justify-content:space-between; padding:1.1rem; border-radius:var(--radius-sm); background:var(--risk-high-bg); border:1px solid var(--risk-high-border);">
        <div>
          <div style="font-weight:700; font-size:0.92rem; color:var(--risk-high);">Immediate Session Data Purge</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">Permanently wipes all loaded contracts and temporary memory.</div>
        </div>
        <button id="btn-purge-session" type="button" class="btn btn-outline-danger btn-sm">
          <i data-lucide="trash-2" style="width:14px; height:14px;" aria-hidden="true"></i>
          <span>Purge Session</span>
        </button>
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button id="btn-done-privacy" type="button" class="btn btn-primary">Done</button>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ root: modal });
  }

  announceA11y('Client-Side Privacy Shield settings dialog opened.');

  let untrap;

  const handleClose = () => {
    if (typeof untrap === 'function') untrap();
    announceA11y('Privacy Shield settings dialog closed.');
    onClose();
  };

  untrap = trapFocus(modal, handleClose);

  modal.querySelector('#modal-close-btn')?.addEventListener('click', handleClose);
  modal.querySelector('#btn-done-privacy')?.addEventListener('click', handleClose);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) handleClose();
  });

  modal.querySelector('#btn-purge-session')?.addEventListener('click', () => {
    piiService.purgeSession();
    if (window.confetti) {
      window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    showToast('Session memory purged successfully!', 'success', 2500);
    setTimeout(() => window.location.reload(), 1200);
  });

  return modal;
}
