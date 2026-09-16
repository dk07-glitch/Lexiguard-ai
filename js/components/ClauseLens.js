/**
 * LexiGuard AI - Interactive Split View Clause Lens & Document Reader
 */

export function renderClauseLens(container, documentText, clauses) {
  let activeFilter = 'all';
  let searchQuery = '';

  function updateView() {
    const filteredClauses = clauses.filter(c => {
      const matchesFilter = activeFilter === 'all' || 
                            (activeFilter === 'high' && c.type === 'high') ||
                            (activeFilter === 'medium' && c.type === 'medium') ||
                            (activeFilter === 'low' && (c.type === 'low' || c.type === 'info'));
      
      const matchesSearch = !searchQuery || 
                            c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.plainText.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    container.innerHTML = `
      <div class="clause-split-container">
        <!-- Left Pane: Full Document Reader with Highlights -->
        <div class="glass-panel doc-viewer-panel">
          <div class="panel-header">
            <div class="panel-title">
              <i data-lucide="file-text" style="width:18px; height:18px; color:var(--accent-primary);"></i>
              <span>Contract Source Text</span>
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Click clause card to jump to line</span>
          </div>

          <div id="doc-text-scroll" class="doc-scroll-view">
            ${renderHighlightedText(documentText, clauses)}
          </div>
        </div>

        <!-- Right Pane: Filterable Clause Cards -->
        <div class="glass-panel doc-viewer-panel">
          <div class="panel-header" style="flex-wrap:wrap; gap:0.5rem;">
            <div class="panel-title">
              <i data-lucide="sparkles" style="width:18px; height:18px; color:var(--accent-secondary);"></i>
              <span>AI Clause Lens (${filteredClauses.length})</span>
            </div>
            
            <!-- Category Filter Tabs -->
            <div style="display:flex; gap:0.3rem;">
              <button class="btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" data-filter="all">All</button>
              <button class="btn btn-sm ${activeFilter === 'high' ? 'btn-primary' : 'btn-secondary'}" data-filter="high">Red Flags</button>
              <button class="btn btn-sm ${activeFilter === 'medium' ? 'btn-primary' : 'btn-secondary'}" data-filter="medium">Caution</button>
              <button class="btn btn-sm ${activeFilter === 'low' ? 'btn-primary' : 'btn-secondary'}" data-filter="low">Standard</button>
            </div>
          </div>

          <!-- Clause Cards List -->
          <div class="cards-scroll-view">
            ${filteredClauses.map(c => `
              <div class="clause-card card-${c.type}" data-clause-id="${c.id}">
                <div class="card-header">
                  <div class="card-title">
                    <i data-lucide="${c.type === 'high' ? 'alert-triangle' : (c.type === 'medium' ? 'alert-circle' : 'check-circle')}"
                       style="width:16px; height:16px; color:var(--risk-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')});"></i>
                    <span>${c.title}</span>
                  </div>
                  <span class="risk-badge badge-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')}" style="font-size:0.7rem; padding:0.15rem 0.5rem;">
                    ${c.line}
                  </span>
                </div>

                <div class="card-original">
                  "${c.originalText}"
                </div>

                <div class="card-translation">
                  <strong>Plain English:</strong> ${c.plainText}
                </div>

                <div class="card-recommendation">
                  <i data-lucide="shield-alert" style="width:14px; height:14px;"></i>
                  <span><strong>Next Step:</strong> ${c.recommendation}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Bind Filter Click Events
    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeFilter = e.currentTarget.getAttribute('data-filter');
        updateView();
      });
    });

    // Bind Clause Card Jump to Line Events
    container.querySelectorAll('[data-clause-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-clause-id');
        const hlEl = container.querySelector(`#hl-${id}`);
        if (hlEl) {
          hlEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hlEl.classList.add('hl-active-pulse');
          setTimeout(() => hlEl.classList.remove('hl-active-pulse'), 2500);
        }
      });
    });
  }

  updateView();
}

function renderHighlightedText(text, clauses) {
  let html = text;

  clauses.forEach(c => {
    if (c.originalText && c.originalText.length > 10) {
      const snippet = c.originalText.slice(0, 40);
      const hlClass = `hl-${c.type === 'high' ? 'high' : (c.type === 'medium' ? 'medium' : 'low')}`;
      const replacement = `<span id="hl-${c.id}" class="hl-clause ${hlClass}" title="${c.title}">${snippet}...</span>`;
      html = html.replace(snippet, replacement);
    }
  });

  return html;
}
