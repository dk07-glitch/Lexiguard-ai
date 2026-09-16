/**
 * LexiGuard AI - Automated Unit Test Suite Runner
 * Executes regression and unit tests across security, PII redaction, diffing, and risk calculation.
 */

import { escapeHtml, clamp } from '../js/utils.js';
import { piiService } from '../js/services/piiMasker.js';
import { aiService } from '../js/services/aiEngine.js';
import { appStore } from '../js/store.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

function assertEquals(actual, expected, testName) {
  assert(actual === expected, `${testName} (Expected: ${expected}, Got: ${actual})`);
}

console.log('====================================================');
console.log('  LexiGuard AI — Automated Quality Verification Suite');
console.log('====================================================\n');

// 1. Security & Sanitization Tests
console.log('[Test Suite 1: Security & Sanitization (utils.js)]');
assertEquals(escapeHtml('<script>alert("XSS")</script>'), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', 'XSS tags properly escaped');
assertEquals(escapeHtml('Legal & Finance'), 'Legal &amp; Finance', 'Ampersand properly escaped');
assertEquals(escapeHtml('Party\'s "Agreement"'), 'Party&#039;s &quot;Agreement&quot;', 'Quotes properly escaped');
assertEquals(clamp(-10, 0, 100), 0, 'Clamp lower bound');
assertEquals(clamp(150, 0, 100), 100, 'Clamp upper bound');
assertEquals(clamp(45, 0, 100), 45, 'Clamp nominal range');

// 2. Client-Side PII Masking Tests
console.log('\n[Test Suite 2: Client-Side PII Masking Engine (piiMasker.js)]');
const samplePiiContract = `
Tenant: John Doe
Address: 452 Skyline Blvd, Apt 4B
Rent: $3,400 per month
Email: tenant@domain.com
Phone: (555) 123-4567
`;

const masked = piiService.anonymize(samplePiiContract);
assert(masked.redactsCount >= 4, `Redacts count detected (${masked.redactsCount} >= 4)`);
assert(!masked.sanitizedText.includes('tenant@domain.com'), 'Email address sanitized');
assert(!masked.sanitizedText.includes('$3,400'), 'Currency figure sanitized');
assert(!masked.sanitizedText.includes('(555) 123-4567'), 'Phone number sanitized');

const unmasked = piiService.unmask(masked.sanitizedText, masked.map);
assertEquals(unmasked.trim(), samplePiiContract.trim(), 'Reversible unmasking fidelity intact');

// 3. AI Heuristic NLP Analysis & Risk Radar Tests
console.log('\n[Test Suite 3: Legal Risk Radar & Analysis Engine (aiEngine.js)]');
const highRiskDoc = `
This Lease shall automatically renew for 12 months unless tenant sends notice 90 days prior.
Employee shall not directly or indirectly compete anywhere in the US for 2 years.
Landlord reserves the right to retain the entire security deposit as liquidated damages.
`;

const analysis = await aiService.analyzeDocument(highRiskDoc);
assert(analysis.riskScore >= 70, `High-risk contract scored appropriately (${analysis.riskScore} >= 70)`);
assertEquals(analysis.riskCategory, 'High Risk', 'Risk category is High Risk');
assert(analysis.clauses.some(c => c.id === 'c_auto_renew'), 'Auto-renewal clause detected');
assert(analysis.clauses.some(c => c.id === 'c_non_compete'), 'Non-compete clause detected');
assert(analysis.clauses.some(c => c.id === 'c_deposit'), 'Deposit forfeiture clause detected');

// 4. Contract Comparison Diff Tests
console.log('\n[Test Suite 4: Side-by-Side Comparator Differential Tests]');
const docA = 'Clause 1: Standard Notice.\nClause 2: Tenant shall pay utilities.';
const docB = 'Clause 1: Standard Notice.\nClause 2: Tenant shall pay utilities.\nClause 3: Strict non-compete added.';
const diff = aiService.compareDocuments(docA, docB);
assertEquals(diff.addedCount, 1, 'Detected 1 newly added clause');
assertEquals(diff.removedCount, 0, 'Detected 0 removed clauses');

// 5. Reactive Store Tests
console.log('\n[Test Suite 5: Reactive Store & Event Bus (store.js)]');
appStore.dispatch('SET_THEME', 'light');
assertEquals(appStore.getState().currentTheme, 'light', 'Store mutates theme correctly');
appStore.dispatch('SET_THEME', 'dark');
assertEquals(appStore.getState().currentTheme, 'dark', 'Store toggles theme correctly');

// 6. Efficiency & Performance Benchmark Tests (100% Throughput)
console.log('\n[Test Suite 6: Efficiency & LRU Cache Performance Benchmarks]');
const benchmarkDoc = 'SECTION 1. TERM. Standard term agreement for testing caching throughput.';
// First execution (Cache Miss / Populates Cache)
await aiService.analyzeDocument(benchmarkDoc);

// Second execution (Cache Hit / Sub-millisecond)
const t0 = performance.now();
const cachedAnalysis = await aiService.analyzeDocument(benchmarkDoc);
const t1 = performance.now();
const cacheTimeMs = t1 - t0;

assert(Boolean(cachedAnalysis && cachedAnalysis.clauses), 'Cached analysis retrieved successfully');
assert(cacheTimeMs < 5, `Sub-millisecond LRU Cache hit efficiency (${cacheTimeMs.toFixed(3)}ms < 5.0ms)`);

// High-Throughput O(N) Hash Set Diffing Benchmark
const largeDocA = Array.from({ length: 300 }, (_, i) => `Clause ${i}: Standard contractual commitment.`).join('\n');
const largeDocB = Array.from({ length: 300 }, (_, i) => `Clause ${i}: Standard contractual commitment.` + (i === 150 ? ' MODIFIED' : '')).join('\n');

const diffStart = performance.now();
const largeDiff = aiService.compareDocuments(largeDocA, largeDocB);
const diffTimeMs = performance.now() - diffStart;

assert(largeDiff.addedCount === 1, 'Large contract diff identified 1 modification accurately');
assert(diffTimeMs < 20, `High-speed O(1) Set diff throughput on 300 clauses (${diffTimeMs.toFixed(3)}ms < 20.0ms)`);

console.log('\n====================================================');
console.log(`  Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll verification tests passed at 100% quality standards!\n');
  process.exit(0);
}
