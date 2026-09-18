/**
 * LexiGuard AI - Problem Statement & Mission Alignment Modal
 * Displays the core problem statement, impacted stakeholder groups, and the 6 engineering solution pillars.
 * @module ProblemAlignmentModal
 */

import { PROBLEM_STATEMENT } from '../data/problemStatement.js';
import { escapeHtml, trapFocus } from '../utils.js';

export function createProblemAlignmentModal({ onClose }) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'problem-modal-title');

  const { title, coreProblem, missionStatement, impactedStakeholders, solutionPillars, alignmentMetrics } = PROBLEM_STATEMENT;

  modal.innerHTML = `
    <div class="modal-content" style="max-width:740px; max-height:88vh; overflow-y:auto;">
      <div class="modal-header">
        <div class="modal-title" id="problem-modal-title">
          <div style="width:40px; height:40px; border-radius:var(--radius-sm); background:linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display:flex; align-items:center; justify-content:center; color:#fff;">
            <i data-lucide="target" style="width:22px; height:22px;" aria-hidden="true"></i>
          </div>
          <div>
            <div style="font-size:1.15rem; font-weight:800;">Problem Statement & Mission Alignment</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">LexiGuard AI Architectural Proof of Purpose</div>
          </div>
        </div>
        <button id="problem-modal-close-btn" type="button" class="close-btn" aria-label="Close dialog">&times;</button>
      </div>

      <!-- Core Problem Callout Box -->
      <div style="padding:1.15rem; border-radius:var(--radius-sm); background:rgba(99, 102, 241, 0.08); border:1px solid rgba(99, 102, 241, 0.25);">
        <div style="font-size:0.76rem; font-weight:700; color:var(--accent-primary); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.35rem;">
          The Systemic Legal Problem
        </div>
        <div style="font-size:0.9rem; line-height:1.55; color:var(--text-primary); font-weight:500;">
          ${escapeHtml(coreProblem)}
        </div>
      </div>

      <!-- Mission Statement -->
      <div style="font-size:0.86rem; line-height:1.6; color:var(--text-secondary);">
        <strong>LexiGuard AI Mission:</strong> ${escapeHtml(missionStatement)}
      </div>

      <!-- 4 Impacted Stakeholder Groups Grid -->
      <div>
        <div style="font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.65rem;">
          Impacted Stakeholder Groups & Real-World Safeguards
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          ${impactedStakeholders.map((s) => `
            <div style="padding:0.9rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); display:flex; flex-direction:column; gap:0.35rem;">
              <div style="font-weight:700; font-size:0.88rem; color:var(--accent-secondary); display:flex; align-items:center; gap:0.4rem;">
                <i data-lucide="user-check" style="width:14px; height:14px;" aria-hidden="true"></i>
                <span>${escapeHtml(s.role)}</span>
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
                ${escapeHtml(s.vulnerability)}
              </div>
              <div style="font-size:0.75rem; color:var(--text-primary); font-weight:600; margin-top:0.2rem;">
                <span style="color:var(--privacy-green);">Solution:</span> ${escapeHtml(s.mitigationFeature)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 6 Engineering Solution Pillars -->
      <div>
        <div style="font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.65rem;">
          The 6 Foundational Engineering Solution Pillars
        </div>
        <div style="display:flex; flex-direction:column; gap:0.6rem;">
          ${solutionPillars.map((p, idx) => `
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding:0.75rem 1rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.02); border:1px solid var(--border-color);">
              <div>
                <div style="font-weight:700; font-size:0.86rem; display:flex; align-items:center; gap:0.45rem;">
                  <span style="display:inline-block; width:18px; height:18px; border-radius:50%; background:var(--accent-primary); color:#fff; font-size:0.7rem; display:flex; align-items:center; justify-content:center; font-weight:800;">
                    ${idx + 1}
                  </span>
                  <span>${escapeHtml(p.title)}</span>
                </div>
                <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:0.2rem; line-height:1.4;">
                  ${escapeHtml(p.description)}
                </div>
              </div>
              <span class="risk-badge badge-low" style="font-size:0.68rem; white-space:nowrap;">
                ${escapeHtml(p.component)}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Alignment Metrics Banner -->
      <div style="display:flex; align-items:center; justify-content:space-around; padding:0.85rem; border-radius:var(--radius-sm); background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); text-align:center;">
        <div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--privacy-green);">${alignmentMetrics.stakeholderCoveragePercent}%</div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">Stakeholder Alignment</div>
        </div>
        <div style="width:1px; height:30px; background:var(--border-color);" aria-hidden="true"></div>
        <div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--accent-secondary);">${alignmentMetrics.solutionPillarsCount} / 6</div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">Solution Pillars</div>
        </div>
        <div style="width:1px; height:30px; background:var(--border-color);" aria-hidden="true"></div>
        <div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--accent-primary);">${alignmentMetrics.testVerificationPassRate}%</div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">Test Verification</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  if (window.lucide) {
    window.lucide.createIcons({ root: modal });
  }

  const cleanupFocus = trapFocus(modal, () => {
    closeModal();
  });

  function closeModal() {
    cleanupFocus();
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
      if (typeof onClose === 'function') onClose();
    }, 200);
  }

  modal.querySelector('#problem-modal-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  return modal;
}
