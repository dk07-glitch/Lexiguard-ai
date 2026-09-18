/**
 * LexiGuard AI - Action Center & Practical Next Steps Suite
 * @module ActionCenter
 */

import { aiService } from '../services/aiEngine.js';
import { exporter } from '../services/exporter.js';
import { escapeHtml, showToast, announceA11y } from '../utils.js';

export function renderActionCenter(container, documentTitle, analysis) {
  if (!container) return;

  let activeTab = 'timeline';
  let generatedLetter = '';

  function updateView() {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Header Controls & Tool Tabs -->
        <div class="glass-panel" style="padding:1.35rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="compass" style="width:22px; height:22px; color:var(--accent-primary);" aria-hidden="true"></i>
              Practical Next Steps & Action Tools
            </h3>
            <p style="font-size:0.86rem; color:var(--text-secondary);">
              Transform contract analysis into actionable outcomes: deadlines, formal dispute letters, and lawyer prep packs.
            </p>
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button id="btn-print-lawyer" type="button" class="btn btn-secondary btn-sm" title="Print or save as PDF" aria-label="Print lawyer briefing pack">
              <i data-lucide="printer" style="width:14px; height:14px;" aria-hidden="true"></i>
              <span>Print Briefing</span>
            </button>
            <button id="btn-export-lawyer" type="button" class="btn btn-primary btn-sm" title="Download text consultation pack" aria-label="Download lawyer consultation pack">
              <i data-lucide="download" style="width:14px; height:14px;" aria-hidden="true"></i>
              <span>Download Lawyer Pack</span>
            </button>
          </div>
        </div>

        <!-- Action Sub-Tabs Navigation -->
        <div class="nav-tabs" style="margin-bottom:0;" role="tablist" aria-label="Action Center Modules">
          <button type="button" class="tab-btn ${activeTab === 'timeline' ? 'active' : ''}" data-act-tab="timeline" role="tab" aria-selected="${activeTab === 'timeline'}" tabindex="${activeTab === 'timeline' ? '0' : '-1'}">
            <i data-lucide="calendar" style="width:15px; height:15px;" aria-hidden="true"></i>
            <span>Obligations Timeline</span>
          </button>
          <button type="button" class="tab-btn ${activeTab === 'letter' ? 'active' : ''}" data-act-tab="letter" role="tab" aria-selected="${activeTab === 'letter'}" tabindex="${activeTab === 'letter' ? '0' : '-1'}">
            <i data-lucide="file-signature" style="width:15px; height:15px;" aria-hidden="true"></i>
            <span>Formal Letter Generator</span>
          </button>
          <button type="button" class="tab-btn ${activeTab === 'negotiation' ? 'active' : ''}" data-act-tab="negotiation" role="tab" aria-selected="${activeTab === 'negotiation'}" tabindex="${activeTab === 'negotiation' ? '0' : '-1'}">
            <i data-lucide="handshake" style="width:15px; height:15px;" aria-hidden="true"></i>
            <span>Negotiation Counter-Script</span>
          </button>
        </div>

        <!-- Sub-Tab Content View -->
        <div class="glass-panel" style="padding:1.5rem;">
          ${activeTab === 'timeline' ? renderTimelineView(analysis?.timeline || []) : ''}
          ${activeTab === 'letter' ? renderLetterGeneratorView() : ''}
          ${activeTab === 'negotiation' ? renderNegotiationScriptView(analysis?.clauses || []) : ''}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }

    // Sub-Tab Switcher
    container.querySelectorAll('[data-act-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-act-tab');
        updateView();
      });
    });

    // Lawyer Pack Download Action
    container.querySelector('#btn-export-lawyer')?.addEventListener('click', () => {
      const packContent = exporter.generateLawyerConsultPack(documentTitle, analysis);
      exporter.downloadFile('Lawyer_Consultation_Prep_Pack.txt', packContent);
      showToast('Lawyer Consultation Pack downloaded!', 'success', 3000);
    });

    // Lawyer Pack Print Action
    container.querySelector('#btn-print-lawyer')?.addEventListener('click', () => {
      exporter.printConsultPack(documentTitle, analysis);
    });

    // Letter Generator Actions
    if (activeTab === 'letter') {
      const generateBtn = container.querySelector('#btn-generate-letter');
      generateBtn?.addEventListener('click', () => {
        const type = container.querySelector('#letter-type-select')?.value || 'lease_deposit';
        const details = {
          landlordName: container.querySelector('#inp-landlord')?.value,
          propertyAddress: container.querySelector('#inp-address')?.value,
          amount: container.querySelector('#inp-amount')?.value,
          vacateDate: container.querySelector('#inp-date')?.value,
          forwardingAddress: container.querySelector('#inp-forwarding')?.value,
          tenantName: container.querySelector('#inp-tenant')?.value
        };

        generatedLetter = aiService.generateDisputeLetter(type, details);
        const outputBox = container.querySelector('#letter-output-box');
        if (outputBox) {
          outputBox.value = generatedLetter;
        }
        showToast('Formal letter generated successfully!', 'success', 2500);
        announceA11y('Formal letter generated successfully.');
      });

      const copyBtn = container.querySelector('#btn-copy-letter');
      copyBtn?.addEventListener('click', () => {
        const text = container.querySelector('#letter-output-box')?.value;
        if (text) {
          navigator.clipboard.writeText(text);
          showToast('Letter copied to clipboard!', 'success', 2500);
          announceA11y('Letter text copied to clipboard.');
        } else {
          showToast('Generate a letter first to copy.', 'warning', 2500);
        }
      });
    }
  }

  updateView();
}

export function renderTimelineView(timelineItems = []) {
  const safeItems = Array.isArray(timelineItems) ? timelineItems : [];
  return `
    <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:1.1rem; display:flex; align-items:center; gap:0.5rem;">
      <i data-lucide="clock" style="width:18px; height:18px; color:var(--accent-secondary);" aria-hidden="true"></i>
      Key Dates, Notice Deadlines & Financial Milestones
    </h4>

    <div style="display:flex; flex-direction:column; gap:0.85rem;" role="list">
      ${safeItems.length === 0 ? `
        <div style="color:var(--text-muted); font-size:0.88rem;">No timeline events detected.</div>
      ` : safeItems.map((item) => {
        const type = item?.type || 'info';
        return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1.15rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.03); border:1px solid var(--border-color);" role="listitem">
          <div style="display:flex; align-items:center; gap:0.85rem;">
            <div style="width:38px; height:38px; border-radius:50%; background:var(--risk-${type === 'deadline' ? 'high' : (type === 'payment' ? 'info' : 'low')}-bg); border:1px solid var(--risk-${type === 'deadline' ? 'high' : (type === 'payment' ? 'info' : 'low')}-border); display:flex; align-items:center; justify-content:center; color:var(--risk-${type === 'deadline' ? 'high' : (type === 'payment' ? 'info' : 'low')}); font-weight:700;">
              <i data-lucide="${type === 'deadline' ? 'alert-triangle' : (type === 'payment' ? 'credit-card' : 'calendar')}" style="width:16px; height:16px;" aria-hidden="true"></i>
            </div>
            <div>
              <div style="font-weight:700; font-size:0.92rem;">${escapeHtml(item?.title || 'Milestone')}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">Action required on schedule</div>
            </div>
          </div>
          <span class="risk-badge badge-${type === 'deadline' ? 'high' : (type === 'payment' ? 'medium' : 'low')}">
            ${escapeHtml(item?.date || 'Scheduled')}
          </span>
        </div>
      `;}).join('')}
    </div>
  `;
}

export function renderLetterGeneratorView() {
  return `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
      <!-- Inputs Form -->
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <h4 style="font-size:1.05rem; font-weight:800; display:flex; align-items:center; gap:0.5rem;">
          <i data-lucide="edit-3" style="width:18px; height:18px; color:var(--accent-primary);" aria-hidden="true"></i>
          Customize Formal Notice Parameters
        </h4>

        <div>
          <label for="letter-type-select" style="font-size:0.8rem; color:var(--text-muted); font-weight:600; display:block; margin-bottom:0.35rem;">Select Letter Template</label>
          <select id="letter-type-select" class="chat-input" style="width:100%;" aria-label="Select letter type">
            <option value="lease_deposit">Security Deposit Demand Notice (Tenant Dispute)</option>
            <option value="non_compete_waiver">Non-Compete Waiver Request (Employee Departure)</option>
            <option value="contract_mod">General Contract Revision Proposal</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div>
            <label for="inp-landlord" style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Recipient / Entity</label>
            <input id="inp-landlord" type="text" class="chat-input" style="width:100%;" placeholder="Apex Properties LLC" />
          </div>
          <div>
            <label for="inp-tenant" style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Your Full Name</label>
            <input id="inp-tenant" type="text" class="chat-input" style="width:100%;" placeholder="John Doe" />
          </div>
        </div>

        <div>
          <label for="inp-address" style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Address / Contract Ref</label>
          <input id="inp-address" type="text" class="chat-input" style="width:100%;" placeholder="452 Skyline Blvd, Apt 4B" />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div>
            <label for="inp-amount" style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Disputed / Claim Amount</label>
            <input id="inp-amount" type="text" class="chat-input" style="width:100%;" placeholder="$3,400.00" />
          </div>
          <div>
            <label for="inp-date" style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Effective / Vacate Date</label>
            <input id="inp-date" type="text" class="chat-input" style="width:100%;" placeholder="September 30, 2026" />
          </div>
        </div>

        <div>
          <label for="inp-forwarding" style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Forwarding Address</label>
          <input id="inp-forwarding" type="text" class="chat-input" style="width:100%;" placeholder="123 New Hope St, New York, NY" />
        </div>

        <button id="btn-generate-letter" type="button" class="btn btn-primary" style="margin-top:0.4rem;" aria-label="Generate formal legal notice letter">
          <i data-lucide="sparkles" style="width:15px; height:15px;" aria-hidden="true"></i>
          <span>Generate Formal Letter</span>
        </button>
      </div>

      <!-- Letter Output Box -->
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <label for="letter-output-box" style="font-size:1rem; font-weight:700;">Generated Notice Preview</label>
          <button id="btn-copy-letter" type="button" class="btn btn-secondary btn-sm" title="Copy letter text" aria-label="Copy generated letter text to clipboard">
            <i data-lucide="copy" style="width:13px; height:13px;" aria-hidden="true"></i>
            <span>Copy Text</span>
          </button>
        </div>

        <textarea id="letter-output-box" class="doc-textarea" style="height:360px;" placeholder="Click 'Generate Formal Letter' to preview letter draft here..." aria-label="Generated letter draft text"></textarea>
      </div>
    </div>
  `;
}

export function renderNegotiationScriptView(clauses = []) {
  const safeClauses = Array.isArray(clauses) ? clauses : [];
  const flagged = safeClauses.filter((c) => c && (c.type === 'high' || c.type === 'medium'));

  return `
    <h4 style="font-size:1.05rem; font-weight:800; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
      <i data-lucide="message-square" style="width:18px; height:18px; color:var(--accent-secondary);" aria-hidden="true"></i>
      Counter-Proposal Negotiation Scripts
    </h4>

    <p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:1.25rem;">
      Pre-written negotiation responses to counter unfair terms and propose reasonable bilateral alternatives:
    </p>

    <div style="display:flex; flex-direction:column; gap:1rem;" role="list">
      ${flagged.length === 0 ? `
        <div style="color:var(--text-muted); font-size:0.88rem;">No high or medium risk clauses flagged for negotiation.</div>
      ` : flagged.map((c) => {
        const type = c?.type === 'high' ? 'high' : 'medium';
        return `
        <div style="padding:1.15rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.03); border:1px solid var(--border-color);" role="listitem">
          <div style="font-weight:700; font-size:0.92rem; color:var(--risk-${type}); margin-bottom:0.4rem;">
            Issue: ${escapeHtml(c?.title || 'Contractual Term')} (${escapeHtml(c?.line || 'Section')})
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Original Clause: "${escapeHtml(c?.originalText || '')}"
          </div>
          <div style="padding:0.75rem 1rem; border-radius:6px; background:rgba(0,0,0,0.3); border-left:3px solid var(--accent-primary); font-size:0.86rem; line-height:1.6;">
            <strong>Suggested Email Counter-Offer Script:</strong><br/>
            "Regarding Section '${escapeHtml(c?.line || 'Term')}', we respectfully request modifying the current terms to: '${escapeHtml(c?.recommendation || 'Standard bilateral provisions')}'. This aligns with standard industry practice and ensures an equitable agreement for both parties."
          </div>
        </div>
      `;}).join('')}
    </div>
  `;
}
