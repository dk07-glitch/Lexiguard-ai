/**
 * LexiGuard AI - Interactive Split-Screen Clause Lens & Document Reader
 * @module ClauseLens
 */

import { escapeHtml } from '../utils.js';

export function renderClauseLens(container, documentText, clauses = []) {
  if (!container) return;

  let activeFilter = 'all';
  let searchQuery = '';

  container.innerHTML = `
    <div class="clause-split-container">
      <!-- Left Pane: Full Document Reader with Interactive Highlights (Mounted Once) -->
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
            <span id="clause-intel-count">Clause Intelligence (${clauses.length})</span>
          </div>
          
          <!-- Category Filter Tabs -->
          <div id="clause-filter-tabs" style="display:flex; gap:0.3rem;" role="tablist" aria-label="Clause Filter Categories">
            <button type="button" class="btn btn-sm btn-primary" data-filter="all" role="tab" aria-selected="true" tabindex="0">All</button>
            <button type="button" class="btn btn-sm btn-secondary" data-filter="high" role="tab" aria-selected="false" tabindex="-1">Red Flags</button>
            <button type="button" class="btn btn-sm btn-secondary" data-filter="medium" role="tab" aria-selected="false" tabindex="-1">Caution</button>
            <button type="button" class="btn btn-sm btn-secondary" data-filter="low" role="tab" aria-selected="false" tabindex="-1">Standard</button>
          </div>
        </div>

        <!-- Clause Cards Scroll View -->
        <div id="clause-cards-list" class="cards-scroll-view" role="list"></div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }

  const cardsContainer = container.querySelector('#clause-cards-list');
  const countEl = container.querySelector('#clause-intel-count');
  const filterBtns = container.querySelectorAll('#clause-filter-tabs [data-filter]');

  function updateCardsOnly() {
    const safeClauses = Array.isArray(clauses) ? clauses : [];
    const filteredClauses = safeClauses.filter((c) => {
      if (!c) return false;
      const type = c.type || 'info';
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'high' && type === 'high') ||
        (activeFilter === 'medium' && type === 'medium') ||
        (activeFilter === 'low' && (type === 'low' || type === 'info'));

      const title = (c.title || '').toLowerCase();
      const plainText = (c.plainText || '').toLowerCase();
      const query = (searchQuery || '').toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        plainText.includes(query);

      return matchesFilter && matchesSearch;
    });

    if (countEl) {
      countEl.textContent = `Clause Intelligence (${filteredClauses.length})`;
    }

    filterBtns.forEach((btn) => {
      const isSelected = btn.getAttribute('data-filter') === activeFilter;
      btn.className = `btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    if (!cardsContainer) return;

    if (filteredClauses.length === 0) {
      cardsContainer.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.88rem;">
          No clauses matched the selected filter.
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = filteredClauses.map((c) => `
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
    `).join('');

    if (window.lucide) {
      window.lucide.createIcons({ root: cardsContainer });
    }

    // Clause Jump to Line Handlers
    cardsContainer.querySelectorAll('[data-clause-id]').forEach((card) => {
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

  // Filter Buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      activeFilter = e.currentTarget.getAttribute('data-filter') || 'all';
      updateCardsOnly();
    });
  });

  updateCardsOnly();
}

function renderHighlightedText(text, clauses) {
  let html = escapeHtml(text || '');
  const safeClauses = Array.isArray(clauses) ? clauses : [];

  safeClauses.forEach((c) => {
    if (c && c.originalText && c.originalText.length > 10) {
      const snippet = escapeHtml(c.originalText.slice(0, 45));
      const hlClass = `hl-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')}`;
      const replacement = `<span id="hl-${c.id || 'clause'}" class="hl-clause ${hlClass}" title="${escapeHtml(c.title || 'Clause')}" role="mark">${snippet}...</span>`;
      html = html.replace(snippet, () => replacement);
    }
  });

  return html;
}
