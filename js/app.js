/**
 * LexiGuard AI - Executive Clean State & UI Orchestrator
 * Features: Animated Hero Banner, Confetti Celebrations, Outfit Typography
 */

import { SAMPLE_DOCUMENTS } from './data/samples.js';
import { aiService } from './services/aiEngine.js';
import { createHeader } from './components/Header.js';
import { renderRiskOverview } from './components/RiskOverview.js';
import { renderClauseLens } from './components/ClauseLens.js';
import { renderContractComparator } from './components/ContractComparator.js';
import { renderQACopilot } from './components/QACopilot.js';
import { renderActionCenter } from './components/ActionCenter.js';
import { createPrivacyModal } from './components/PrivacyShield.js';
import { createApiKeyModal } from './components/ApiKeyModal.js';

class LexiGuardApp {
  constructor() {
    this.currentTheme = localStorage.getItem('lexiguard_theme') || 'dark';
    this.currentSampleId = 'lease';
    this.documentTitle = SAMPLE_DOCUMENTS.lease.title;
    this.documentText = SAMPLE_DOCUMENTS.lease.text;
    this.analysis = null;
    this.activeTab = 'analysis';
    
    this.initTheme();
    this.initApp();
  }

  initTheme() {
    document.body.setAttribute('data-theme', this.currentTheme);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('lexiguard_theme', this.currentTheme);
    this.initTheme();
    this.renderHeader();
  }

  async initApp() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <div id="header-container"></div>

      <!-- Modern Hero Banner with AI Generated 3D Legal Scales Image -->
      <div class="hero-banner">
        <img src="assets/hero_banner.jpg" alt="LexiGuard AI Scales of Justice" class="hero-banner-bg" />
        <div class="hero-banner-overlay">
          <div class="hero-content">
            <div class="hero-tag">
              <i data-lucide="sparkles" style="width:13px; height:13px;"></i>
              <span>Next-Gen Legal Intelligence</span>
            </div>
            <h1 class="hero-title">Demystify Complex Contracts with GenAI</h1>
            <p class="hero-desc">
              Understand obligations, compare versions side-by-side, spot critical red flags, and draft formal response letters — with client-side zero retention security.
            </p>
            <div class="hero-stats-row">
              <div class="hero-stat-item">
                <span class="hero-stat-dot" style="background:var(--risk-low);"></span>
                <span>Zero Server Retention</span>
              </div>
              <div class="hero-stat-item">
                <span class="hero-stat-dot" style="background:var(--accent-secondary);"></span>
                <span>Automated PII Masking</span>
              </div>
              <div class="hero-stat-item">
                <span class="hero-stat-dot" style="background:var(--accent-purple);"></span>
                <span>Grounded AI Legal Copilot</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Segmented Main Workspace Tabs -->
      <div class="nav-tabs">
        <button class="tab-btn active" data-tab="analysis">
          <i data-lucide="shield-alert" style="width:16px; height:16px;"></i>
          <span>Document Risk & Clause Lens</span>
        </button>
        <button class="tab-btn" data-tab="comparator">
          <i data-lucide="git-compare" style="width:16px; height:16px;"></i>
          <span>Contract Comparator</span>
        </button>
        <button class="tab-btn" data-tab="copilot">
          <i data-lucide="bot" style="width:16px; height:16px;"></i>
          <span>AI Legal Copilot</span>
        </button>
        <button class="tab-btn" data-tab="action">
          <i data-lucide="compass" style="width:16px; height:16px;"></i>
          <span>Action Center & Letters</span>
        </button>
      </div>

      <!-- Sample Selection & File Upload Toolbar -->
      <div class="glass-panel sample-bar">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <i data-lucide="folder-open" style="width:18px; height:18px; color:var(--accent-primary);"></i>
          <span style="font-size:0.85rem; font-weight:700;">Pre-loaded Sample Agreements:</span>
        </div>
        <div class="sample-chips">
          ${Object.keys(SAMPLE_DOCUMENTS).map(key => `
            <button class="sample-chip ${key === this.currentSampleId ? 'active' : ''}" data-sample-key="${key}">
              ${SAMPLE_DOCUMENTS[key].title.split(' (')[0]}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Main Tab Content Area -->
      <main style="flex:1;">
        <!-- TAB 1: Document Analysis & Split View Clause Lens -->
        <div id="tab-analysis" class="view-section active">
          <div class="doc-editor-grid">
            <!-- Left: Document Input Card -->
            <div class="glass-panel" style="display:flex; flex-direction:column; padding:1.25rem;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.85rem; flex-wrap:wrap; gap:0.5rem;">
                <input id="doc-title-input" type="text" class="chat-input" style="font-weight:700; font-size:0.98rem; flex:1;" value="${this.documentTitle}" />
                <div style="display:flex; gap:0.4rem;">
                  <label class="btn btn-secondary btn-sm" style="cursor:pointer;" title="Upload contract text file">
                    <i data-lucide="upload" style="width:14px; height:14px;"></i>
                    <span>Upload File</span>
                    <input id="file-upload-input" type="file" accept=".txt,.md,.doc,.docx" style="display:none;" />
                  </label>
                  <button id="btn-reanalyze" class="btn btn-primary btn-sm">
                    <i data-lucide="sparkles" style="width:14px; height:14px;"></i>
                    <span>Analyze with AI</span>
                  </button>
                </div>
              </div>

              <textarea id="main-doc-textarea" class="doc-textarea" placeholder="Paste or upload your contract/agreement text here...">${this.documentText}</textarea>
            </div>

            <!-- Right: Risk Meter Gauge & Breakdown Statistics -->
            <div id="risk-overview-container"></div>
          </div>

          <!-- Bottom: Split View Clause Lens -->
          <div id="clause-lens-container" style="margin-top:1.5rem;"></div>
        </div>

        <!-- TAB 2: Side-by-Side Comparator -->
        <div id="tab-comparator" class="view-section">
          <div id="comparator-container"></div>
        </div>

        <!-- TAB 3: Grounded AI Copilot Chat -->
        <div id="tab-copilot" class="view-section">
          <div id="copilot-container"></div>
        </div>

        <!-- TAB 4: Action Center & Letters Suite -->
        <div id="tab-action" class="view-section">
          <div id="action-container"></div>
        </div>
      </main>

      <!-- Clean Footer Disclaimer -->
      <footer class="footer-disclaimer">
        <div class="disclaimer-box">
          <i data-lucide="shield-alert" style="width:15px; height:15px; color:var(--risk-medium);"></i>
          <span><strong>Informational AI Guidance:</strong> LexiGuard AI provides plain-English summaries, risk indicators, and preparation tools for educational purposes. It is not formal legal advice.</span>
        </div>
        <div>LexiGuard AI &copy; 2026 | GenAI Legal Intelligence & Privacy Shield</div>
      </footer>

      <div id="modal-container"></div>
    `;

    this.renderHeader();
    this.bindGlobalEvents();
    await this.runAnalysis();
  }

  renderHeader() {
    const container = document.getElementById('header-container');
    container.innerHTML = '';
    const header = createHeader({
      onThemeToggle: () => this.toggleTheme(),
      onOpenPrivacy: () => this.openPrivacyModal(),
      onOpenApiKey: () => this.openApiKeyModal(),
      currentTheme: this.currentTheme
    });
    container.appendChild(header);

    const keyStatus = document.getElementById('api-key-status');
    if (keyStatus) {
      keyStatus.innerText = aiService.hasApiKey() ? 'API: Gemini Live' : 'API: Default';
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  bindGlobalEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Sample Selector Chips
    document.querySelectorAll('.sample-chip').forEach(chip => {
      chip.addEventListener('click', async (e) => {
        const key = e.currentTarget.getAttribute('data-sample-key');
        this.loadSample(key);
      });
    });

    // File Upload Handler
    const fileInp = document.getElementById('file-upload-input');
    if (fileInp) {
      fileInp.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (evt) => {
            this.documentTitle = file.name;
            this.documentText = evt.target.result;
            const titleInp = document.getElementById('doc-title-input');
            const textInp = document.getElementById('main-doc-textarea');
            if (titleInp) titleInp.value = this.documentTitle;
            if (textInp) textInp.value = this.documentText;
            await this.runAnalysis();
            this.triggerConfetti();
          };
          reader.readAsText(file);
        }
      });
    }

    // Re-analyze Button
    const reanalyzeBtn = document.getElementById('btn-reanalyze');
    if (reanalyzeBtn) {
      reanalyzeBtn.addEventListener('click', async () => {
        const titleInp = document.getElementById('doc-title-input');
        const textInp = document.getElementById('main-doc-textarea');
        if (titleInp) this.documentTitle = titleInp.value;
        if (textInp) this.documentText = textInp.value;
        await this.runAnalysis();
        this.triggerConfetti();
      });
    }

    // Document Textarea change
    const textInp = document.getElementById('main-doc-textarea');
    if (textInp) {
      textInp.addEventListener('change', (e) => {
        this.documentText = e.target.value;
      });
    }
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#8b5cf6']
      });
    }
  }

  async loadSample(key) {
    if (!SAMPLE_DOCUMENTS[key]) return;
    this.currentSampleId = key;
    const doc = SAMPLE_DOCUMENTS[key];
    this.documentTitle = doc.title;
    this.documentText = doc.text;

    document.querySelectorAll('.sample-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-sample-key') === key);
    });

    const titleInp = document.getElementById('doc-title-input');
    const textInp = document.getElementById('main-doc-textarea');
    if (titleInp) titleInp.value = this.documentTitle;
    if (textInp) textInp.value = this.documentText;

    await this.runAnalysis();
  }

  async runAnalysis() {
    this.analysis = await aiService.analyzeDocument(this.documentText);
    
    // Render components
    renderRiskOverview(document.getElementById('risk-overview-container'), this.analysis);
    renderClauseLens(document.getElementById('clause-lens-container'), this.documentText, this.analysis.clauses);
    renderContractComparator(document.getElementById('comparator-container'));
    renderQACopilot(document.getElementById('copilot-container'), this.documentText);
    renderActionCenter(document.getElementById('action-container'), this.documentTitle, this.analysis);
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `tab-${tabId}`);
    });
  }

  openPrivacyModal() {
    const container = document.getElementById('modal-container');
    container.innerHTML = '';
    const modal = createPrivacyModal({
      onClose: () => { container.innerHTML = ''; }
    });
    container.appendChild(modal);
  }

  openApiKeyModal() {
    const container = document.getElementById('modal-container');
    container.innerHTML = '';
    const modal = createApiKeyModal({
      onClose: () => { container.innerHTML = ''; },
      onKeyUpdated: () => this.renderHeader()
    });
    container.appendChild(modal);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LexiGuardApp();
});
