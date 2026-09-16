/**
 * LexiGuard AI - SVG Animated Risk Gauge & Document Stats Matrix
 * @module RiskOverview
 */

import { escapeHtml, clamp } from '../utils.js';

export function renderRiskOverview(container, analysis) {
  if (!container) return;

  const score = clamp(analysis?.riskScore ?? 40, 0, 100);
  const category = analysis?.riskCategory || (score > 70 ? 'High Risk' : (score > 40 ? 'Moderate' : 'Low Risk'));
  
  // Arc length calculations for SVG Semi-Circle gauge (r=80, length ~ 251.3)
  const arcLength = 251.3;
  const offset = arcLength - (arcLength * (score / 100));
  
  let colorVar = 'var(--risk-low)';
  let badgeClass = 'badge-low';
  let iconName = 'check-circle-2';

  if (score > 70) {
    colorVar = 'var(--risk-high)';
    badgeClass = 'badge-high';
    iconName = 'alert-triangle';
  } else if (score > 40) {
    colorVar = 'var(--risk-medium)';
    badgeClass = 'badge-medium';
    iconName = 'shield-alert';
  }

  const clauses = Array.isArray(analysis?.clauses) ? analysis.clauses : [];
  const highCount = clauses.filter((c) => c.type === 'high').length;
  const mediumCount = clauses.filter((c) => c.type === 'medium').length;
  const standardCount = clauses.filter((c) => c.type === 'low' || c.type === 'info').length;
  const piiCount = analysis?.piiRedactedCount || 0;

  container.innerHTML = `
    <div class="glass-panel risk-meter-box" role="region" aria-label="Legal Risk Assessment Radar">
      <div style="font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.75rem;">
        Legal Risk Index
      </div>

      <!-- Accessible SVG Semi-Circle Meter -->
      <svg class="gauge-svg" viewBox="0 0 200 110" role="meter" aria-valuenow="${score}" aria-valuemin="0" aria-valuemax="100" aria-label="Risk score: ${score} out of 100">
        <path class="gauge-bg" d="M 20 100 A 80 80 0 0 1 180 100" />
        <path class="gauge-value" d="M 20 100 A 80 80 0 0 1 180 100"
              style="stroke: ${colorVar}; stroke-dasharray: ${arcLength}; stroke-dashoffset: ${offset};" />
      </svg>

      <div class="score-display">
        <div class="score-num" style="color: ${colorVar};">${score}</div>
        <div class="score-label">Risk Index / 100</div>
      </div>

      <div class="risk-badge ${badgeClass}">
        <i data-lucide="${iconName}" style="width:15px; height:15px;" aria-hidden="true"></i>
        <span>${escapeHtml(category)}</span>
      </div>

      <p style="font-size:0.86rem; color:var(--text-secondary); line-height:1.6; margin-top:1rem; text-align:center;">
        ${escapeHtml(analysis?.summary || 'Document analysis completed.')}
      </p>

      <!-- 4-Quadrant Stats Matrix -->
      <div class="stats-grid" role="list" aria-label="Risk Metrics Summary">
        <div class="stat-card" role="listitem">
          <div class="stat-val" style="color:var(--risk-high);">${highCount}</div>
          <div class="stat-desc">Red Flags</div>
        </div>
        <div class="stat-card" role="listitem">
          <div class="stat-val" style="color:var(--risk-medium);">${mediumCount}</div>
          <div class="stat-desc">Watchouts</div>
        </div>
        <div class="stat-card" role="listitem">
          <div class="stat-val" style="color:var(--risk-low);">${standardCount}</div>
          <div class="stat-desc">Standard Terms</div>
        </div>
        <div class="stat-card" role="listitem">
          <div class="stat-val" style="color:var(--privacy-green);">${piiCount}</div>
          <div class="stat-desc">PII Redacted</div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
