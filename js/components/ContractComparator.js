/**
 * LexiGuard AI - Side-by-Side Dual Document Comparator
 * @module ContractComparator
 */

import { aiService } from '../services/aiEngine.js';
import { escapeHtml, debounce, showToast } from '../utils.js';

export function renderContractComparator(container) {
  if (!container) return;

  let docA = `SECTION 1: TERM & RENT
Monthly rent shall be $3,000 payable on the 1st of each month. Notice for non-renewal must be provided 30 days prior in writing via email.

SECTION 2: LIABILITY & REPAIRS
Landlord shall be responsible for all structural, plumbing, and HVAC maintenance. Tenant is responsible for basic utility costs.`;

  let docB = `SECTION 1: TERM & RENT
Monthly rent shall be $3,400 payable on the 1st of each month. Notice for non-renewal must be provided 90 DAYS PRIOR VIA CERTIFIED MAIL ONLY.

SECTION 2: LIABILITY & REPAIRS
Tenant shall be responsible for the first $350 of all maintenance and repair costs per occurrence. Overnight guests remaining longer than 3 nights are strictly prohibited under penalty of $500 fine.`;

  function updateComparator() {
    const diffResult = aiService.compareDocuments(docA, docB);

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="glass-panel" style="padding:1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="git-compare" style="width:20px; height:20px; color:var(--accent-secondary);" aria-hidden="true"></i>
              Side-by-Side Contract Comparison Matrix
            </h3>
            <p style="font-size:0.86rem; color:var(--text-secondary);">${escapeHtml(diffResult.summary)}</p>
          </div>

          <div style="display:flex; gap:0.75rem;">
            <div class="stat-card" style="padding:0.5rem 1rem;">
              <span style="font-weight:800; color:var(--risk-high);">${diffResult.addedCount}</span>
              <span style="font-size:0.72rem; color:var(--text-muted);">New Restrictions</span>
            </div>
            <div class="stat-card" style="padding:0.5rem 1rem;">
              <span style="font-weight:800; color:var(--risk-medium);">${diffResult.removedCount}</span>
              <span style="font-size:0.72rem; color:var(--text-muted);">Omitted Protections</span>
            </div>
          </div>
        </div>

        <div class="comparator-grid">
          <!-- Document A Draft -->
          <div class="glass-panel" style="display:flex; flex-direction:column;">
            <div class="panel-header">
              <span class="panel-title">Original Draft (Version A)</span>
              <span class="risk-badge badge-low" style="font-size:0.7rem;">Baseline</span>
            </div>
            <textarea id="comp-doc-a" class="doc-textarea" style="border:none; border-radius:0; height:340px;" aria-label="Original Contract Text (Version A)">${escapeHtml(docA)}</textarea>
          </div>

          <!-- Document B Draft -->
          <div class="glass-panel" style="display:flex; flex-direction:column;">
            <div class="panel-header">
              <span class="panel-title">Proposed Counter-Offer (Version B)</span>
              <span class="risk-badge badge-high" style="font-size:0.7rem;">Modified Terms</span>
            </div>
            <textarea id="comp-doc-b" class="doc-textarea" style="border:none; border-radius:0; height:340px;" aria-label="Proposed Counter Contract Text (Version B)">${escapeHtml(docB)}</textarea>
          </div>
        </div>

        <!-- Detected Differential Matrix -->
        <div class="glass-panel" style="padding:1.35rem;">
          <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:0.85rem; display:flex; align-items:center; gap:0.4rem;">
            <i data-lucide="shield-alert" style="width:16px; height:16px; color:var(--risk-high);" aria-hidden="true"></i>
            Differential Risk Analysis Highlights (${diffResult.riskShift})
          </h4>
          
          <div style="display:flex; flex-direction:column; gap:0.6rem;">
            ${diffResult.added.map((item) => `
              <div style="padding:0.65rem 0.9rem; border-radius:6px; background:var(--risk-high-bg); border-left:3px solid var(--risk-high); font-size:0.85rem; font-family:var(--font-mono);">
                <strong style="color:var(--risk-high);">+ Added Restriction [Line ${item.index}]:</strong> ${escapeHtml(item.text)}
              </div>
            `).join('')}

            ${diffResult.removed.map((item) => `
              <div style="padding:0.65rem 0.9rem; border-radius:6px; background:var(--risk-medium-bg); border-left:3px solid var(--risk-medium); font-size:0.85rem; font-family:var(--font-mono);">
                <strong style="color:var(--risk-medium);">- Omitted Baseline Protection [Line ${item.index}]:</strong> ${escapeHtml(item.text)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }

    const debouncedRecompare = debounce(() => {
      updateComparator();
      showToast('Differential analysis updated', 'info', 2000);
    }, 450);

    const taA = container.querySelector('#comp-doc-a');
    const taB = container.querySelector('#comp-doc-b');

    taA?.addEventListener('input', (e) => {
      docA = e.target.value;
      debouncedRecompare();
    });

    taB?.addEventListener('input', (e) => {
      docB = e.target.value;
      debouncedRecompare();
    });
  }

  updateComparator();
}
