/**
 * LexiGuard AI - Action Center & Practical Next Steps Suite
 */

import { aiService } from '../services/aiEngine.js';
import { exporter } from '../services/exporter.js';

export function renderActionCenter(container, documentTitle, analysis) {
  let activeTab = 'timeline';
  let generatedLetter = '';

  function updateView() {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Header Controls & Tool Tabs -->
        <div class="glass-panel" style="padding:1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="compass" style="width:22px; height:22px; color:var(--accent-primary);"></i>
              Practical Next Steps & Action Tools
            </h3>
            <p style="font-size:0.85rem; color:var(--text-secondary);">
              Transform document analysis into actionable outcomes: deadlines, formal dispute letters, and lawyer prep packs.
            </p>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button id="btn-export-lawyer" class="btn btn-primary">
              <i data-lucide="download" style="width:16px; height:16px;"></i>
              <span>Export Lawyer Consult Pack</span>
            </button>
          </div>
        </div>

        <!-- Action Sub-Tabs -->
        <div class="nav-tabs" style="margin-bottom:0;">
          <button class="tab-btn ${activeTab === 'timeline' ? 'active' : ''}" data-act-tab="timeline">
            <i data-lucide="calendar" style="width:16px; height:16px;"></i>
            <span>Obligations Timeline</span>
          </button>
          <button class="tab-btn ${activeTab === 'letter' ? 'active' : ''}" data-act-tab="letter">
            <i data-lucide="file-signature" style="width:16px; height:16px;"></i>
            <span>Formal Letter Generator</span>
          </button>
          <button class="tab-btn ${activeTab === 'negotiation' ? 'active' : ''}" data-act-tab="negotiation">
            <i data-lucide="handshake" style="width:16px; height:16px;"></i>
            <span>Negotiation Counter-Script</span>
          </button>
        </div>

        <!-- Sub-Tab Content -->
        <div class="glass-panel" style="padding:1.5rem;">
          ${activeTab === 'timeline' ? renderTimelineView(analysis.timeline || []) : ''}
          ${activeTab === 'letter' ? renderLetterGeneratorView() : ''}
          ${activeTab === 'negotiation' ? renderNegotiationScriptView(analysis.clauses || []) : ''}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Bind Sub-Tab Navigation
    container.querySelectorAll('[data-act-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-act-tab');
        updateView();
      });
    });

    // Bind Lawyer Consult Export Button
    const exportBtn = container.querySelector('#btn-export-lawyer');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const packContent = exporter.generateLawyerConsultPack(documentTitle, analysis);
        exporter.downloadFile('Lawyer_Consultation_Prep_Pack.txt', packContent);
      });
    }

    // Bind Letter Generator Actions if in letter view
    if (activeTab === 'letter') {
      const generateBtn = container.querySelector('#btn-generate-letter');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => {
          const type = container.querySelector('#letter-type-select').value;
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
          if (outputBox) outputBox.value = generatedLetter;
        });
      }

      const copyBtn = container.querySelector('#btn-copy-letter');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const text = container.querySelector('#letter-output-box')?.value;
          if (text) {
            navigator.clipboard.writeText(text);
            alert("Letter copied to clipboard!");
          }
        });
      }
    }
  }

  updateView();
}

function renderTimelineView(timelineItems) {
  return `
    <h4 style="font-size:1rem; font-weight:700; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
      <i data-lucide="clock" style="width:18px; height:18px; color:var(--accent-secondary);"></i>
      Key Dates, Notice Deadlines & Financial Commitments
    </h4>

    <div style="display:flex; flex-direction:column; gap:0.85rem;">
      ${timelineItems.map(item => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1.1rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.03); border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--risk-${item.type === 'deadline' ? 'high' : (item.type === 'payment' ? 'info' : 'low')}-bg); border:1px solid var(--risk-${item.type === 'deadline' ? 'high' : (item.type === 'payment' ? 'info' : 'low')}-border); display:flex; align-items:center; justify-content:center; color:var(--risk-${item.type === 'deadline' ? 'high' : (item.type === 'payment' ? 'info' : 'low')}); font-weight:700;">
              <i data-lucide="${item.type === 'deadline' ? 'alert-triangle' : (item.type === 'payment' ? 'credit-card' : 'calendar')}" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <div style="font-weight:700; font-size:0.92rem;">${item.title}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);">Action required on schedule</div>
            </div>
          </div>
          <span class="risk-badge badge-${item.type === 'deadline' ? 'high' : (item.type === 'payment' ? 'medium' : 'low')}">
            ${item.date}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLetterGeneratorView() {
  return `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
      <!-- Inputs Form -->
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <h4 style="font-size:1rem; font-weight:700; display:flex; align-items:center; gap:0.5rem;">
          <i data-lucide="edit-3" style="width:18px; height:18px; color:var(--accent-primary);"></i>
          Customize Formal Letter Details
        </h4>

        <div>
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600; display:block; margin-bottom:0.3rem;">Select Letter Type</label>
          <select id="letter-type-select" class="chat-input" style="width:100%;">
            <option value="lease_deposit">Security Deposit Demand Letter (Lease Dispute)</option>
            <option value="non_compete_waiver">Non-Compete Waiver Request (Employment)</option>
            <option value="contract_mod">General Contract Amendment Request</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted);">Recipient Name / Entity</label>
            <input id="inp-landlord" type="text" class="chat-input" style="width:100%;" placeholder="Apex Properties LLC" />
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted);">Your Name</label>
            <input id="inp-tenant" type="text" class="chat-input" style="width:100%;" placeholder="John Doe" />
          </div>
        </div>

        <div>
          <label style="font-size:0.75rem; color:var(--text-muted);">Property Address / Contract Ref</label>
          <input id="inp-address" type="text" class="chat-input" style="width:100%;" placeholder="452 Skyline Blvd, Apt 4B" />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted);">Deposit / Claim Amount</label>
            <input id="inp-amount" type="text" class="chat-input" style="width:100%;" placeholder="$3,400.00" />
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted);">Vacate / Effective Date</label>
            <input id="inp-date" type="text" class="chat-input" style="width:100%;" placeholder="September 30, 2026" />
          </div>
        </div>

        <div>
          <label style="font-size:0.75rem; color:var(--text-muted);">Forwarding Address</label>
          <input id="inp-forwarding" type="text" class="chat-input" style="width:100%;" placeholder="123 New Hope St, New York, NY" />
        </div>

        <button id="btn-generate-letter" class="btn btn-primary" style="margin-top:0.5rem;">
          <i data-lucide="sparkles" style="width:16px; height:16px;"></i>
          <span>Generate Formal Letter</span>
        </button>
      </div>

      <!-- Letter Output Box -->
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <h4 style="font-size:1rem; font-weight:700;">Generated Letter Preview</h4>
          <button id="btn-copy-letter" class="btn btn-secondary btn-sm">
            <i data-lucide="copy" style="width:14px; height:14px;"></i>
            <span>Copy Text</span>
          </button>
        </div>

        <textarea id="letter-output-box" class="doc-textarea" style="height:360px;" placeholder="Click 'Generate Formal Letter' to preview letter draft here..."></textarea>
      </div>
    </div>
  `;
}

function renderNegotiationScriptView(clauses) {
  return `
    <h4 style="font-size:1rem; font-weight:700; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
      <i data-lucide="message-square" style="width:18px; height:18px; color:var(--accent-secondary);"></i>
      Counter-Proposal Negotiation Script
    </h4>

    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.25rem;">
      Use these pre-written response emails and counter-proposals to request fair revisions for identified red flags.
    </p>

    <div style="display:flex; flex-direction:column; gap:1rem;">
      ${clauses.filter(c => c.type === 'high' || c.type === 'medium').map(c => `
        <div style="padding:1.1rem; border-radius:var(--radius-sm); background:rgba(255,255,255,0.03); border:1px solid var(--border-color);">
          <div style="font-weight:700; font-size:0.92rem; color:var(--risk-${c.type === 'high' ? 'high' : 'medium'}); margin-bottom:0.4rem;">
            Issue: ${c.title} (${c.line})
          </div>
          <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.6rem;">
            Original Clause: "${c.originalText}"
          </div>
          <div style="padding:0.75rem; border-radius:6px; background:rgba(0,0,0,0.3); border-left:3px solid var(--accent-primary); font-size:0.85rem;">
            <strong>Suggested Email Counter-Offer Script:</strong><br/>
            "Regarding Section '${c.line}', we respectfully request modifying the current terms to: '${c.recommendation}'. This aligns with standard industry practice and ensures a fair, balanced agreement for both parties."
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
