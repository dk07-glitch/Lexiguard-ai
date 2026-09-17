/**
 * LexiGuard AI - Executive Clean State & UI Orchestrator
 * High-performance, modular state management with XSS-safety, keyboard shortcuts, and toasts.
 * @module app
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
import { escapeHtml, showToast, debounce, announceA11y } from './utils.js';

class LexiGuardApp {
  constructor() {
    this.currentTheme = localStorage.getItem('lexiguard_theme') || 'dark';
    this.currentSampleId = 'lease';
    this.documentTitle = SAMPLE_DOCUMENTS.lease.title;
    this.documentText = SAMPLE_DOCUMENTS.lease.text;
    this.analysis = null;
    this.activeTab = 'analysis';
    this.isAnalyzing = false;
    
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
    showToast(`Switched to ${this.currentTheme} mode`, 'info', 1500);
    announceA11y(`Theme switched to ${this.currentTheme} mode`);
  }

  async initApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
      <div id="header-container"></div>

      <!-- Hero Banner with Generated 3D Legal Scales Image -->
      <section class="hero-banner" aria-label="Welcome Banner">
        <img src="assets/hero_banner.jpg" alt="LexiGuard AI Scales of Justice" class="hero-banner-bg" loading="lazy" />
        <div class="hero-banner-overlay">
          <div class="hero-content">
            <div class="hero-tag">
              <i data-lucide="sparkles" style="width:13px; height:13px;" aria-hidden="true"></i>
              <span>Next-Gen Legal Intelligence</span>
            </div>
            <h1 class="hero-title">Demystify Complex Contracts with GenAI</h1>
            <p class="hero-desc">
              Understand obligations, compare versions side-by-side, spot critical red flags, and draft formal response letters — with client-side zero retention security.
            </p>
            <div class="hero-stats-row">
              <div class="hero-stat-item">
                <span class="hero-stat-dot" style="background:var(--risk-low);" aria-hidden="true"></span>
                <span>Zero Server Retention</span>
              </div>
              <div class="hero-stat-item">
                <span class="hero-stat-dot" style="background:var(--accent-secondary);" aria-hidden="true"></span>
                <span>Automated PII Masking</span>
              </div>
              <div class="hero-stat-item">
                <span class="hero-stat-dot" style="background:var(--accent-purple);" aria-hidden="true"></span>
                <span>Grounded AI Legal Copilot</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Segmented Main Workspace Tabs with Roving Tabindex & ARIA -->
      <nav class="nav-tabs" role="tablist" aria-label="Main Application Views">
        <button id="tab-btn-analysis" type="button" class="tab-btn active" data-tab="analysis" role="tab" aria-selected="true" aria-controls="tab-analysis" tabindex="0">
          <i data-lucide="shield-alert" style="width:16px; height:16px;" aria-hidden="true"></i>
          <span>Document Risk & Clause Lens</span>
        </button>
        <button id="tab-btn-comparator" type="button" class="tab-btn" data-tab="comparator" role="tab" aria-selected="false" aria-controls="tab-comparator" tabindex="-1">
          <i data-lucide="git-compare" style="width:16px; height:16px;" aria-hidden="true"></i>
          <span>Contract Comparator</span>
        </button>
        <button id="tab-btn-copilot" type="button" class="tab-btn" data-tab="copilot" role="tab" aria-selected="false" aria-controls="tab-copilot" tabindex="-1">
          <i data-lucide="bot" style="width:16px; height:16px;" aria-hidden="true"></i>
          <span>AI Legal Copilot</span>
        </button>
        <button id="tab-btn-action" type="button" class="tab-btn" data-tab="action" role="tab" aria-selected="false" aria-controls="tab-action" tabindex="-1">
          <i data-lucide="compass" style="width:16px; height:16px;" aria-hidden="true"></i>
          <span>Action Center & Letters</span>
        </button>
      </nav>

      <!-- Sample Selection & File Upload Toolbar -->
      <section class="glass-panel sample-bar" aria-label="Sample Contract Selector">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <i data-lucide="folder-open" style="width:18px; height:18px; color:var(--accent-primary);" aria-hidden="true"></i>
          <span style="font-size:0.85rem; font-weight:700;">Pre-loaded Sample Agreements:</span>
        </div>
        <div class="sample-chips" role="toolbar" aria-label="Sample contract options">
          ${Object.keys(SAMPLE_DOCUMENTS).map((key) => `
            <button type="button" class="sample-chip ${key === this.currentSampleId ? 'active' : ''}" data-sample-key="${key}" aria-pressed="${key === this.currentSampleId}">
              ${SAMPLE_DOCUMENTS[key].title.split(' (')[0]}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Main Tab Content Views with Focusable Landmark for Skip-Link -->
      <main id="main-content" tabindex="-1" style="flex:1;" aria-label="LexiGuard Legal Intelligence Workspace">
        <!-- TAB 1: Document Analysis & Split View Clause Lens -->
        <section id="tab-analysis" class="view-section active" role="tabpanel" aria-labelledby="tab-btn-analysis" tabindex="0">
          <div class="doc-editor-grid">
            <!-- Left: Document Input Card -->
            <div class="glass-panel" style="display:flex; flex-direction:column; padding:1.25rem;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.85rem; flex-wrap:wrap; gap:0.5rem;">
                <label for="doc-title-input" class="sr-only">Contract Title</label>
                <input id="doc-title-input" type="text" class="chat-input" style="font-weight:700; font-size:0.98rem; flex:1;" value="${escapeHtml(this.documentTitle)}" placeholder="Contract Title..." aria-label="Contract Title" />
                <div style="display:flex; gap:0.4rem;">
                  <label for="file-upload-input" class="btn btn-secondary btn-sm" style="cursor:pointer;" title="Upload contract file (.txt, .md, .doc)" tabindex="0" role="button" aria-label="Upload contract file">
                    <i data-lucide="upload" style="width:14px; height:14px;" aria-hidden="true"></i>
                    <span>Upload File</span>
                    <input id="file-upload-input" type="file" accept=".txt,.md,.doc,.docx" style="display:none;" aria-label="Upload contract file dialog" />
                  </label>
                  <button id="btn-reanalyze" type="button" class="btn btn-primary btn-sm" title="Re-evaluate with AI (Ctrl+Enter)" aria-label="Re-analyze contract with AI">
                    <i data-lucide="sparkles" style="width:14px; height:14px;" aria-hidden="true"></i>
                    <span>Analyze AI</span>
                  </button>
                </div>
              </div>

              <label for="main-doc-textarea" class="sr-only">Contract Raw Text Input</label>
              <textarea id="main-doc-textarea" class="doc-textarea" placeholder="Paste or upload your contract text here for instant AI breakdown..." aria-label="Contract raw text input">${escapeHtml(this.documentText)}</textarea>
            </div>

            <!-- Right: Risk Meter Gauge & Breakdown Statistics -->
            <div id="risk-overview-container"></div>
          </div>

          <!-- Bottom: Split View Clause Lens -->
          <div id="clause-lens-container" style="margin-top:1.5rem;"></div>
        </section>

        <!-- TAB 2: Side-by-Side Comparator -->
        <section id="tab-comparator" class="view-section" role="tabpanel" aria-labelledby="tab-btn-comparator" tabindex="0">
          <div id="comparator-container"></div>
        </section>

        <!-- TAB 3: Grounded AI Copilot Chat -->
        <section id="tab-copilot" class="view-section" role="tabpanel" aria-labelledby="tab-btn-copilot" tabindex="0">
          <div id="copilot-container"></div>
        </section>

        <!-- TAB 4: Action Center & Letters Suite -->
        <section id="tab-action" class="view-section" role="tabpanel" aria-labelledby="tab-btn-action" tabindex="0">
          <div id="action-container"></div>
        </section>
      </main>

      <!-- Clean Footer Disclaimer -->
      <footer class="footer-disclaimer" role="contentinfo">
        <div class="disclaimer-box">
          <i data-lucide="shield-alert" style="width:15px; height:15px; color:var(--risk-medium);" aria-hidden="true"></i>
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
    if (!container) return;

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
      window.lucide.createIcons({ root: container });
    }
  }

  bindGlobalEvents() {
    // Navigation Tabs with Arrow Key Roving Focus
    const tabButtons = Array.from(document.querySelectorAll('.nav-tabs .tab-btn'));
    tabButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });

      btn.addEventListener('keydown', (e) => {
        let targetIndex = -1;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabButtons.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabButtons.length - 1;
        }

        if (targetIndex !== -1) {
          e.preventDefault();
          const targetBtn = tabButtons[targetIndex];
          targetBtn.focus();
          const tab = targetBtn.getAttribute('data-tab');
          if (tab) this.switchTab(tab);
        }
      });
    });

    // Sample Selector Chips
    document.querySelectorAll('.sample-chip').forEach((chip) => {
      chip.addEventListener('click', async (e) => {
        const key = e.currentTarget.getAttribute('data-sample-key');
        if (key) this.loadSample(key);
      });
    });

    // Accessible File Upload Keyboard Trigger
    const fileUploadLabel = document.querySelector('label[for="file-upload-input"]');
    fileUploadLabel?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('file-upload-input')?.click();
      }
    });

    // File Upload Handler
    const fileInp = document.getElementById('file-upload-input');
    fileInp?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('File is too large. Please upload files under 2MB.', 'error', 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (evt) => {
        this.documentTitle = file.name;
        this.documentText = typeof evt.target?.result === 'string' ? evt.target.result : '';
        const titleInp = document.getElementById('doc-title-input');
        const textInp = document.getElementById('main-doc-textarea');
        if (titleInp) titleInp.value = this.documentTitle;
        if (textInp) textInp.value = this.documentText;
        await this.runAnalysis();
        this.triggerConfetti();
        showToast(`Loaded ${file.name}`, 'success', 2500);
        announceA11y(`Uploaded and analyzed file: ${file.name}`);
      };
      reader.onerror = () => {
        showToast('Failed to read file. Please try again.', 'error', 3000);
      };
      reader.readAsText(file);
    });

    // Re-analyze Button
    const reanalyzeBtn = document.getElementById('btn-reanalyze');
    reanalyzeBtn?.addEventListener('click', async () => {
      await this.triggerReanalysis();
    });

    // Keyboard shortcut: Ctrl + Enter to re-analyze
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.triggerReanalysis();
      }
    });

    // Textarea live sync
    const textInp = document.getElementById('main-doc-textarea');
    textInp?.addEventListener('input', (e) => {
      this.documentText = e.target.value;
    });
  }

  async triggerReanalysis() {
    if (this.isAnalyzing) return;
    announceA11y('Re-evaluating contract with AI analysis...');
    const titleInp = document.getElementById('doc-title-input');
    const textInp = document.getElementById('main-doc-textarea');
    if (titleInp) this.documentTitle = titleInp.value;
    if (textInp) this.documentText = textInp.value;
    await this.runAnalysis();
    this.triggerConfetti();
    showToast('Contract analysis complete!', 'success', 2500);
  }

  triggerConfetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Respect user preference for reduced vestibular motion
    }
    if (typeof window.confetti === 'function') {
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

    document.querySelectorAll('.sample-chip').forEach((c) => {
      const isSelected = c.getAttribute('data-sample-key') === key;
      c.classList.toggle('active', isSelected);
      c.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const titleInp = document.getElementById('doc-title-input');
    const textInp = document.getElementById('main-doc-textarea');
    if (titleInp) titleInp.value = this.documentTitle;
    if (textInp) textInp.value = this.documentText;

    await this.runAnalysis();
    const shortTitle = doc.title.split(' (')[0];
    showToast(`Loaded sample: ${shortTitle}`, 'info', 2000);
    announceA11y(`Loaded sample: ${shortTitle}`);
  }

  async runAnalysis() {
    this.isAnalyzing = true;
    try {
      this.analysis = await aiService.analyzeDocument(this.documentText);
      
      renderRiskOverview(document.getElementById('risk-overview-container'), this.analysis);
      renderClauseLens(document.getElementById('clause-lens-container'), this.documentText, this.analysis.clauses);
      renderContractComparator(document.getElementById('comparator-container'));
      renderQACopilot(document.getElementById('copilot-container'), this.documentText);
      renderActionCenter(document.getElementById('action-container'), this.documentTitle, this.analysis);

      announceA11y(`Contract analysis complete. Risk score: ${this.analysis.riskScore} out of 100, ${this.analysis.riskCategory}.`);
    } catch (err) {
      console.error('[LexiGuardApp] Error during analysis pipeline:', err);
      showToast('Error analyzing document. Check console for details.', 'error', 3500);
    } finally {
      this.isAnalyzing = false;
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    let activeLabel = tabId;

    document.querySelectorAll('.nav-tabs .tab-btn').forEach((btn) => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) {
        activeLabel = btn.querySelector('span')?.textContent || tabId;
      }
    });

    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.toggle('active', sec.id === `tab-${tabId}`);
    });

    announceA11y(`Switched to ${activeLabel} view`);
  }

  openPrivacyModal() {
    const container = document.getElementById('modal-container');
    if (!container) return;
    const triggerEl = document.activeElement;
    container.innerHTML = '';
    const modal = createPrivacyModal({
      onClose: () => {
        container.innerHTML = '';
        triggerEl?.focus?.();
      }
    });
    container.appendChild(modal);
  }

  openApiKeyModal() {
    const container = document.getElementById('modal-container');
    if (!container) return;
    const triggerEl = document.activeElement;
    container.innerHTML = '';
    const modal = createApiKeyModal({
      onClose: () => {
        container.innerHTML = '';
        triggerEl?.focus?.();
      },
      onKeyUpdated: () => this.renderHeader()
    });
    container.appendChild(modal);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LexiGuardApp();
});
