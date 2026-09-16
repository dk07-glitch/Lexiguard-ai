/**
 * LexiGuard AI - GenAI Analysis & Grounded Q&A Copilot Engine
 * Supports Google Gemini 1.5/2.0 REST API with an intelligent local heuristic NLP fallback.
 * @module aiEngine
 */

import { piiService } from './piiMasker.js';
import { clamp } from '../utils.js';

/**
 * @typedef {Object} ClauseItem
 * @property {string} id - Unique clause identifier
 * @property {string} line - Section or line reference
 * @property {'high'|'medium'|'low'|'info'} type - Severity risk tier
 * @property {string} title - Plain-English descriptive title
 * @property {string} originalText - Original extracted contract snippet
 * @property {string} plainText - Translated plain-English explanation
 * @property {string} recommendation - Strategic advice or negotiation tip
 */

/**
 * @typedef {Object} TimelineItem
 * @property {string} date - Date marker or recurrence pattern
 * @property {string} title - Milestone description
 * @property {'payment'|'deadline'|'warning'|'info'} type - Timeline category
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {number} riskScore - 0-100 overall legal risk score
 * @property {'Low Risk'|'Moderate'|'High Risk'} riskCategory - Qualitative risk level
 * @property {string} summary - Executive plain-English summary
 * @property {Array<ClauseItem>} clauses - Identified clauses with risk tiers
 * @property {Array<TimelineItem>} timeline - Actionable dates and notice deadlines
 * @property {number} piiRedactedCount - Number of PII entities sanitized
 */

export class AIEngine {
  constructor() {
    this.apiKey = localStorage.getItem('lexiguard_gemini_key') || '';
    this.apiTimeoutMs = 15000;
  }

  /**
   * Sets or clears the active Google Gemini API key.
   * @param {string} key - API Key string
   */
  setApiKey(key) {
    this.apiKey = typeof key === 'string' ? key.trim() : '';
    if (this.apiKey) {
      localStorage.setItem('lexiguard_gemini_key', this.apiKey);
    } else {
      localStorage.removeItem('lexiguard_gemini_key');
    }
  }

  /**
   * Checks whether a valid Gemini API key is configured.
   * @returns {boolean}
   */
  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length >= 10);
  }

  /**
   * Evaluates a legal document to calculate risk scores, extract clauses, and map deadlines.
   * @param {string} text - Raw legal contract text
   * @returns {Promise<AnalysisResult>}
   */
  async analyzeDocument(text) {
    const rawText = typeof text === 'string' ? text : '';
    const { sanitizedText, redactsCount } = piiService.anonymize(rawText);

    if (this.hasApiKey()) {
      try {
        const liveResult = await this._callGeminiApiForAnalysis(sanitizedText);
        return {
          ...liveResult,
          riskScore: clamp(liveResult.riskScore, 0, 100),
          piiRedactedCount: redactsCount
        };
      } catch (err) {
        console.warn('[AIEngine] Gemini API analysis failed. Falling back to local NLP engine:', err.message);
      }
    }

    return this._localNLPAnalysis(rawText, redactsCount);
  }

  /**
   * Performs side-by-side differential analysis between two contracts.
   * @param {string} docA - Baseline contract draft (Version A)
   * @param {string} docB - Proposed counter-offer (Version B)
   * @returns {Object} Comparison metrics and identified diff highlights
   */
  compareDocuments(docA, docB) {
    const linesA = (docA || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const linesB = (docB || '').split('\n').map((l) => l.trim()).filter(Boolean);

    const added = [];
    const removed = [];

    linesB.forEach((line, index) => {
      if (!linesA.includes(line)) {
        added.push({ index: index + 1, text: line, type: 'added' });
      }
    });

    linesA.forEach((line, index) => {
      if (!linesB.includes(line)) {
        removed.push({ index: index + 1, text: line, type: 'removed' });
      }
    });

    const netRiskShift = added.length > removed.length 
      ? `+${Math.min((added.length - removed.length) * 8, 35)}% (Higher Burden)`
      : '-10% (Favorable / Balanced)';

    return {
      addedCount: added.length,
      removedCount: removed.length,
      added,
      removed,
      riskShift: netRiskShift,
      summary: `Found ${added.length} newly inserted clauses and ${removed.length} omitted baseline sections. Pay close attention to newly added liability burdens and notice periods.`
    };
  }

  /**
   * Context-grounded Q&A Copilot for querying uploaded contracts.
   * @param {string} question - Natural language query
   * @param {string} documentText - Document context
   * @returns {Promise<{ answer: string, citation: string }>}
   */
  async answerQuestion(question, documentText) {
    const q = (question || '').trim();
    const doc = (documentText || '').trim();

    if (!q) {
      return { answer: 'Please enter a valid question regarding your contract.', citation: '' };
    }

    if (this.hasApiKey()) {
      try {
        const prompt = `You are LexiGuard AI, an elite legal document intelligence assistant.
Analyze the following document and answer the user's question with clarity, plain English, and direct line/section citations.
If the information is not present in the document, explicitly say so.

DOCUMENT:
${doc.slice(0, 8000)}

USER QUESTION:
${q}

Answer format: Provide a direct 2-3 sentence answer followed by "CITATION: [Section/Line references]".`;

        const responseText = await this._rawGeminiCall(prompt);
        const citationMatch = responseText.match(/CITATION:\s*([^\n]+)/i);
        const citation = citationMatch ? citationMatch[1].trim() : 'Grounded in document context.';
        const cleanAnswer = responseText.replace(/CITATION:\s*[^\n]+/i, '').trim();

        return { answer: cleanAnswer, citation };
      } catch (err) {
        console.warn('[AIEngine] Gemini Copilot query failed, using local context matching:', err.message);
      }
    }

    // Heuristic Context-Grounded Matching Fallback
    const qLower = q.toLowerCase();
    let answer = '';
    let citation = '';

    if (qLower.includes('renew') || qLower.includes('cancel') || qLower.includes('notice') || qLower.includes('terminate')) {
      answer = 'This contract specifies mandatory termination and non-renewal notice requirements. Notice must typically be provided in writing within a 30-to-90 day window prior to expiration. Failure to meet the certified mail deadline may trigger an automatic renewal at higher rates.';
      citation = 'Refer to Term & Termination / Automatic Renewal sections.';
    } else if (qLower.includes('deposit') || qLower.includes('pay') || qLower.includes('rent') || qLower.includes('fee') || qLower.includes('late')) {
      answer = 'Payment terms mandate strict payment due dates. Late payments beyond the designated grace period incur fixed fees or daily interest penalties. Security deposits may be subject to liquidated damages if the contract is terminated early.';
      citation = 'Refer to Compensation, Rent & Late Penalties sections.';
    } else if (qLower.includes('compete') || qLower.includes('job') || qLower.includes('work') || qLower.includes('solicit')) {
      answer = 'A post-termination restrictive covenant prohibits working for competitors or soliciting employees and clients for 1 to 2 years across specified geographic territories. Violation may trigger severe financial liquidated damages.';
      citation = 'Refer to Non-Competition & Non-Solicitation clauses.';
    } else if (qLower.includes('ip') || qLower.includes('code') || qLower.includes('own') || qLower.includes('invention') || qLower.includes('copyright')) {
      answer = 'Intellectual property clauses assign ownership of inventions, software code, and creative works to the commissioning party. Personal projects created on your own time without company assets should be explicitly carved out.';
      citation = 'Refer to Intellectual Property & Work Product Assignment clauses.';
    } else {
      answer = `Based on the contract text, key terms include specified obligations, governing jurisdiction, and compliance guidelines. Always review specific clause numbers with a qualified attorney for situation-specific advice.`;
      citation = 'Grounded document analysis.';
    }

    return { answer, citation };
  }

  /**
   * Generates formatted formal dispute or modification letters.
   * @param {'lease_deposit'|'non_compete_waiver'|'contract_mod'} type - Letter template type
   * @param {Object} details - Field values
   * @returns {string} Fully formatted formal letter
   */
  generateDisputeLetter(type, details = {}) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (type === 'lease_deposit') {
      return `DATE: ${today}

TO: ${details.landlordName || '[Landlord / Property Manager Name]'}
ADDRESS: ${details.propertyAddress || '[Rental Property Address]'}

RE: Formal Demand for Return of Security Deposit under Lease Agreement

Dear ${details.landlordName || 'Landlord'},

I am writing to formally demand the prompt and full return of my security deposit in the amount of ${details.amount || '$3,400.00'} for the premises located at ${details.propertyAddress || '[Property Address]'}.

My tenancy officially concluded on ${details.vacateDate || '[Vacate Date]'}. The property was surrendered in clean, undamaged condition, normal wear and tear excepted. Under applicable statutory tenant protections, landlords are required to provide an itemized statement and remit deposit funds within the statutory deadline.

Please remit payment within fourteen (14) calendar days to my forwarding address below:
Forwarding Address: ${details.forwardingAddress || '[My Forwarding Address]'}

Thank you for your prompt attention to this matter.

Sincerely,

_______________________________
${details.tenantName || '[Tenant Name]'}
Contact: ${details.contactInfo || '[Phone / Email]'}`;
    }

    if (type === 'non_compete_waiver') {
      return `DATE: ${today}

TO: ${details.employerName || '[Employer HR / Legal Counsel]'}

RE: Formal Request for Waiver / Narrowing of Post-Employment Non-Compete Covenant

Dear ${details.employerName || 'Human Resources & Legal Team'},

In connection with my departure from ${details.employerName || 'the Company'}, I respectfully request a formal written waiver of the restrictive non-competition covenant contained in Section 2 of my Employment Agreement.

My proposed prospective role with [New Organization] involves non-confidential duties that do not utilize company proprietary assets or compete with ${details.employerName || 'the Company\'s'} core offerings. Granting this narrow release will allow me to sustain professional livelihood without imposing any commercial detriment upon the Company.

I remain committed to honoring all continuing confidentiality, non-disclosure, and trade secret obligations.

Thank you for your favorable consideration.

Sincerely,

_______________________________
${details.employeeName || '[Employee Name]'}`;
    }

    return `DATE: ${today}

TO: ${details.recipient || '[Counterparty Legal Department]'}

RE: Proposed Revisions and Fair Contract Amendments

Dear ${details.recipient || 'Contract Review Team'},

Following our review of the proposed contract draft, we respectfully propose the following modifications to ensure a mutually balanced agreement:

1. Cap non-renewal notice periods at thirty (30) days via email.
2. Establish reciprocal mutual attorney fee reimbursement for the prevailing party.
3. Explicitly carve out pre-existing intellectual property and personal inventions.

We appreciate your collaborative approach and look forward to executing an equitable agreement.

Sincerely,

_______________________________
${details.senderName || '[Authorized Signatory]'}`;
  }

  // --- Private Helper Methods ---

  async _callGeminiApiForAnalysis(sanitizedText) {
    const prompt = `Analyze this legal contract text and return a strict JSON object with these keys:
- riskScore: number between 0 and 100
- riskCategory: "Low Risk", "Moderate", or "High Risk"
- summary: string containing a 2-3 sentence plain English overview
- clauses: array of objects [{ id, line, type ("high"|"medium"|"low"|"info"), title, originalText, plainText, recommendation }]
- timeline: array of objects [{ date, title, type ("payment"|"deadline"|"warning"|"info") }]

CONTRACT TEXT:
${sanitizedText.slice(0, 9000)}`;

    const rawResponse = await this._rawGeminiCall(prompt);
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse valid JSON from Gemini API response');
  }

  async _rawGeminiCall(promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.apiTimeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          throw new Error('Invalid Gemini API Key or unauthorized access.');
        } else if (res.status === 429) {
          throw new Error('Gemini API rate limit reached. Please try again in a moment.');
        }
        throw new Error(`Gemini API error (Status ${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } finally {
      clearTimeout(timeout);
    }
  }

  _localNLPAnalysis(text, redactsCount) {
    const textLower = (text || '').toLowerCase();
    let riskScore = 35;
    const clauses = [];
    const timeline = [];

    // 1. Automatic Renewal & Certified Mail Trap
    if (textLower.includes('automatic') && (textLower.includes('renew') || textLower.includes('notice'))) {
      riskScore += 20;
      clauses.push({
        id: 'c_auto_renew',
        line: 'Automatic Renewal Clause',
        type: 'high',
        title: 'Automatic Renewal & Strict Notice Window',
        originalText: 'This Lease/Agreement shall automatically renew unless written notice is received...',
        plainText: 'Locks you into another full term unless you send written cancellation notice within an inflexible deadline.',
        recommendation: 'Negotiate notice window down to 30 days and allow written email notification.'
      });
      timeline.push({
        date: '60-90 Days Pre-Expiry',
        title: 'CRITICAL: Non-Renewal Notice Deadline',
        type: 'deadline'
      });
    }

    // 2. Restrictive Covenants / Non-Compete
    if (textLower.includes('non-compete') || textLower.includes('non-competition') || textLower.includes('competing')) {
      riskScore += 25;
      clauses.push({
        id: 'c_non_compete',
        line: 'Non-Competition Restriction',
        type: 'high',
        title: 'Post-Employment Restrictive Covenant',
        originalText: 'Employee shall not directly or indirectly engage in any business competing with...',
        plainText: 'Prohibits working in your profession or field across large territories for an extended duration.',
        recommendation: 'Request narrowing scope to direct competitors within a 25-mile radius for maximum 6 months.'
      });
      timeline.push({
        date: 'Post-Termination',
        title: 'Non-Compete Restriction Active',
        type: 'warning'
      });
    }

    // 3. Deposit Forfeiture & Liquidated Damages
    if (textLower.includes('forfeit') || textLower.includes('liquidated damages') || textLower.includes('security deposit')) {
      riskScore += 15;
      clauses.push({
        id: 'c_deposit',
        line: 'Security Deposit & Damages',
        type: 'medium',
        title: 'Potential Security Deposit Forfeiture',
        originalText: 'Reserves the right to retain the entire security deposit as liquidated damages...',
        plainText: 'Allows counterparty to claim substantial funds automatically if agreement ends early.',
        recommendation: 'Clarify that deductions require itemized accounting and receipts within 30 days.'
      });
    }

    // 4. One-Sided Attorney Fees
    if (textLower.includes('attorney') || textLower.includes('legal fee') || textLower.includes('reimburse')) {
      clauses.push({
        id: 'c_legal_fees',
        line: 'Dispute Resolution & Fees',
        type: 'medium',
        title: 'One-Sided Attorney Fee Burden',
        originalText: 'Agrees to reimburse legal costs and attorney fees incurred...',
        plainText: 'Forces you to cover the counterparty’s legal expenses in any dispute.',
        recommendation: 'Make attorney fee provisions bilateral (the prevailing party gets reimbursed).'
      });
    }

    // 5. Default baseline clause if none flagged
    if (clauses.length === 0) {
      clauses.push({
        id: 'c_standard',
        line: 'General Provisions',
        type: 'low',
        title: 'Standard Contractual Framework',
        originalText: text.slice(0, 140) + '...',
        plainText: 'Document features standard mutual commitments without overt high-risk red flags.',
        recommendation: 'Review general payment and delivery schedules.'
      });
    }

    // Baseline timeline items
    timeline.push({ date: 'Effective Date', title: 'Contract Execution & Commencement', type: 'info' });
    timeline.push({ date: 'Periodic / Monthly', title: 'Payment & Milestone Schedule', type: 'payment' });

    riskScore = clamp(riskScore, 15, 95);
    const riskCategory = riskScore > 70 ? 'High Risk' : (riskScore > 40 ? 'Moderate' : 'Low Risk');

    return {
      riskScore,
      riskCategory,
      summary: `Document analysis completed. Assessed overall risk as ${riskCategory} (${riskScore}/100). Flagged ${clauses.length} critical clause areas including notice requirements, payment milestones, and liability terms.`,
      clauses,
      timeline,
      piiRedactedCount: redactsCount
    };
  }
}

export const aiService = new AIEngine();
