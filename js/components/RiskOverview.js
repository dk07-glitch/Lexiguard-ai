/**
 * LexiGuard AI - SVG Animated Risk Gauge & Document Stats Matrix
 */

export function renderRiskOverview(container, analysis) {
  const score = analysis.riskScore || 0;
  const category = analysis.riskCategory || (score > 70 ? "High Risk" : (score > 40 ? "Moderate" : "Low Risk"));
  
  // Calculate SVG Gauge Dashoffset (Arc circumference ~314)
  const arcLength = 314;
  const offset = arcLength - (arcLength * (score / 100));
  
  let colorVar = "var(--risk-low)";
  let badgeClass = "badge-low";
  if (score > 70) {
    colorVar = "var(--risk-high)";
    badgeClass = "badge-high";
  } else if (score > 40) {
    colorVar = "var(--risk-medium)";
    badgeClass = "badge-medium";
  }

  const highCount = analysis.clauses.filter(c => c.type === 'high').length;
  const mediumCount = analysis.clauses.filter(c => c.type === 'medium').length;
  const infoCount = analysis.clauses.filter(c => c.type === 'low' || c.type === 'info').length;

  container.innerHTML = `
    <div class="glass-panel risk-meter-box">
      <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">
        Legal Risk Score Radar
      </div>

      <!-- SVG Semi-Circle Gauge -->
      <svg class="gauge-svg" viewBox="0 0 200 110">
        <path class="gauge-bg" d="M 20 100 A 80 80 0 0 1 180 100" />
        <path class="gauge-value" d="M 20 100 A 80 80 0 0 1 180 100"
              style="stroke: ${colorVar}; stroke-dasharray: ${arcLength}; stroke-dashoffset: ${offset};" />
      </svg>

      <div class="score-display">
        <div class="score-num" style="color: ${colorVar};">${score}</div>
        <div class="score-label">Risk Index / 100</div>
      </div>

      <div class="risk-badge ${badgeClass}">
        <i data-lucide="${score > 70 ? 'alert-triangle' : (score > 40 ? 'shield-alert' : 'check-circle-2')}" style="width:16px; height:16px;"></i>
        <span>${category}</span>
      </div>

      <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5; margin-top:1rem; text-align:center;">
        ${analysis.summary}
      </p>

      <!-- Risk Breakdown Matrix -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val" style="color:var(--risk-high);">${highCount}</div>
          <div class="stat-desc">Red Flags</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--risk-medium);">${mediumCount}</div>
          <div class="stat-desc">Watchouts</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--risk-low);">${infoCount}</div>
          <div class="stat-desc">Standard Terms</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--privacy-green);">${analysis.piiRedactedCount || 0}</div>
          <div class="stat-desc">PII Redacted</div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
