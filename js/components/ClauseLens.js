/**
 * LexiGuard AI - Interactive Split-Screen Clause Lens & Document Reader
 * @module ClauseLens
 */

import { escapeHtml } from '../utils.js';

export function renderClauseLens(container, documentText, clauses = []) {
  if (!container) return;

  let activeFilter = 'all';
  let searchQuery = '';

  function updateView() {
    const filteredClauses = clauses.filter((c) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'high' && c.type === 'high') ||
        (activeFilter === 'medium' && c.type === 'medium') ||
        (activeFilter === 'low' && (c.type === 'low' || c.type === 'info'));

      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.plainText.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    container.innerHTML = `
      <div class="clause-split-container">
        <!-- Left Pane: Full Document Reader with Interactive Highlights -->
        <div class="glass-panel doc-viewer-panel">
          <div class="panel-header">
            <div class="panel-title">
              <i data-lucide="file-text" style="width:17px; height:17px; color:var(--accent-primary);" aria-hidden="true"></i>
              <span>Contract Source Text</span>
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Click any card to jump to line</span>
          </div>

          <div id="doc-text-scroll" class="doc-scroll-view" tabindex="0" aria-label="Contract Text Viewer">
            ${renderHighlightedText(documentText, clauses)}
          </div>
        </div>

        <!-- Right Pane: Filterable Risk Cards -->
        <div class="glass-panel doc-viewer-panel">
          <div class="panel-header" style="flex-wrap:wrap; gap:0.5rem;">
            <div class="panel-title">
              <i data-lucide="sparkles" style="width:17px; height:17px; color:var(--accent-secondary);" aria-hidden="true"></i>
              <span>Clause Intelligence (${filteredClauses.length})</span>
            </div>
            
            <!-- Category Filter Tabs -->
            <div style="display:flex; gap:0.3rem;" role="tablist" aria-label="Clause Filter Categories">
              <button type="button" class="btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" data-filter="all" role="tab" aria-selected="${activeFilter === 'all'}" tabindex="${activeFilter === 'all' ? '0' : '-1'}">All</button>
              <button type="button" class="btn btn-sm ${activeFilter === 'high' ? 'btn-primary' : 'btn-secondary'}" data-filter="high" role="tab" aria-selected="${activeFilter === 'high'}" tabindex="${activeFilter === 'high' ? '0' : '-1'}">Red Flags</button>
              <button type="button" class="btn btn-sm ${activeFilter === 'medium' ? 'btn-primary' : 'btn-secondary'}" data-filter="medium" role="tab" aria-selected="${activeFilter === 'medium'}" tabindex="${activeFilter === 'medium' ? '0' : '-1'}">Caution</button>
              <button type="button" class="btn btn-sm ${activeFilter === 'low' ? 'btn-primary' : 'btn-secondary'}" data-filter="low" role="tab" aria-selected="${activeFilter === 'low'}" tabindex="${activeFilter === 'low' ? '0' : '-1'}">Standard</button>
            </div>
          </div>

          <!-- Clause Cards Scroll View -->
          <div class="cards-scroll-view" role="list">
            ${filteredClauses.length === 0 ? `
              <div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.88rem;">
                No clauses matched the selected filter.
              </div>
            ` : filteredClauses.map((c) => `
              <div class="clause-card card-${c.type}" data-clause-id="${c.id}" role="listitem" tabindex="0" aria-label="${escapeHtml(c.title)}, ${c.type} risk">
                <div class="card-header">
                  <div class="card-title">
                    <i data-lucide="${c.type === 'high' ? 'alert-triangle' : (c.type === 'medium' ? 'alert-circle' : 'check-circle')}"
                       style="width:15px; height:15px; color:var(--risk-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')});" aria-hidden="true"></i>
                    <span>${escapeHtml(c.title)}</span>
                  </div>
                  <span class="risk-badge badge-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')}" style="font-size:0.68rem; padding:0.15rem 0.5rem;">
                    ${escapeHtml(c.line)}
                  </span>
                </div>

                <div class="card-original">
                  "${escapeHtml(c.originalText)}"
                </div>

                <div class="card-translation">
                  <strong>Plain English:</strong> ${escapeHtml(c.plainText)}
                </div>

                <div class="card-recommendation">
                  <i data-lucide="shield-alert" style="width:13px; height:13px;" aria-hidden="true"></i>
                  <span><strong>Action Step:</strong> ${escapeHtml(c.recommendation)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }

    // Filter Buttons
    container.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeFilter = e.currentTarget.getAttribute('data-filter');
        updateView();
      });
    });

    // Clause Jump to Line Handlers
    container.querySelectorAll('[data-clause-id]').forEach((card) => {
      const jumpAction = () => {
        const id = card.getAttribute('data-clause-id');
        const hlEl = container.querySelector(`#hl-${id}`);
        if (hlEl) {
          hlEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hlEl.classList.add('hl-active-pulse');
          setTimeout(() => hlEl.classList.remove('hl-active-pulse'), 2500);
        }
      };

      card.addEventListener('click', jumpAction);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          jumpAction();
        }
      });
    });
  }

  updateView();
}

function renderHighlightedText(text, clauses) {
  let html = escapeHtml(text || '');

  clauses.forEach((c) => {
    if (c.originalText && c.originalText.length > 10) {
      const snippet = escapeHtml(c.originalText.slice(0, 45));
      const hlClass = `hl-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')}`;
      const replacement = `<span id="hl-${c.id}" class="hl-clause ${hlClass}" title="${escapeHtml(c.title)}" role="mark">${snippet}...</span>`;
      html = html.replace(snippet, () => replacement);
    }
  });

  return html;
}
