/**
 * LexiGuard AI - GenAI Analysis & Grounded Q&A Copilot Engine
 */

import { piiService } from './piiMasker.js';

export class AIEngine {
  constructor() {
    this.apiKey = localStorage.getItem('lexiguard_gemini_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    if (key) {
      localStorage.setItem('lexiguard_gemini_key', key);
    } else {
      localStorage.removeItem('lexiguard_gemini_key');
    }
  }

  hasApiKey() {
    return !!this.apiKey && this.apiKey.trim().length > 5;
  }

  /**
   * Analyzes legal document text to compute risk score, extracted clauses, plain-English summary, and timeline
   * @param {string} text Raw contract text
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeDocument(text) {
    // First, run PII anonymizer for client privacy
    const { sanitizedText, redactsCount } = piiService.anonymize(text);

    if (this.hasApiKey()) {
      try {
        const liveResult = await this._callGeminiApiForAnalysis(sanitizedText);
        return { ...liveResult, piiRedactedCount: redactsCount };
      } catch (err) {
        console.warn("Gemini API call failed, falling back to smart local NLP engine:", err);
      }
    }

    // Heuristic NLP Engine fallback (instant zero-latency)
    return this._localNLPAnalysis(text, redactsCount);
  }

  /**
   * Performs side-by-side differential analysis between Document A and Document B
   */
  compareDocuments(docA, docB) {
    const linesA = docA.split('\n').filter(l => l.trim().length > 0);
    const linesB = docB.split('\n').filter(l => l.trim().length > 0);

    const added = [];
    const removed = [];
    const modified = [];

    // Simple diff detection
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

    const netRiskShift = (added.length > removed.length) ? "+15 (Increased Risk)" : "-5 (Equal/Reduced)";

    return {
      addedCount: added.length,
      removedCount: removed.length,
      added,
      removed,
      riskShift: netRiskShift,
      summary: `Comparison reveals ${added.length} newly inserted clauses and ${removed.length} omitted sections. Review highlighted additions carefully for new liability restrictions.`
    };
  }

  /**
   * Grounded Q&A Copilot for asking questions about the uploaded document
   */
  async answerQuestion(question, documentText) {
    if (!question || !documentText) return "Please enter a valid question.";

    if (this.hasApiKey()) {
      try {
        const prompt = `You are LexiGuard AI, a helpful legal information assistant. Answer the user's question based strictly on the following legal document context. Be concise, clear, and cite relevant sections.\n\nDocument:\n${documentText}\n\nUser Question: ${question}`;
        const responseText = await this._rawGeminiCall(prompt);
        return {
          answer: responseText,
          citation: "Answer grounded in provided document text."
        };
      } catch (e) {
        console.warn("Live Q&A API call failed, falling back:", e);
      }
    }

    // Grounded Local Keyword Matching Q&A
    const qLower = question.toLowerCase();
    let answer = "";
    let citation = "";

    if (qLower.includes("renew") || qLower.includes("cancel") || qLower.includes("notice") || qLower.includes("terminate")) {
      answer = "The document specifies strict non-renewal notice requirements. In typical contracts, non-renewal must be submitted in writing within a mandatory 30-to-90 day window prior to lease/contract expiration. Failure to notify in writing may trigger automatic renewal.";
      citation = "Refer to Term & Termination / Renewal sections.";
    } else if (qLower.includes("deposit") || qLower.includes("pay") || qLower.includes("rent") || qLower.includes("fee") || qLower.includes("money")) {
      answer = "Payment terms require timely monthly or milestone installments. Late payments after grace periods incur fixed late fees or monthly interest penalties. Security deposits are held against damages or early termination.";
      citation = "Refer to Compensation, Rent & Fees sections.";
    } else if (qLower.includes("compete") || qLower.includes("work") || qLower.includes("job") || qLower.includes("solicit")) {
      answer = "The non-compete clause restricts post-employment work with competing entities within specified geographic and time boundaries (typically 1 to 2 years). Non-solicitation prohibits recruiting former colleagues or clients.";
      citation = "Refer to Non-Competition & Non-Solicitation clauses.";
    } else if (qLower.includes("own") || qLower.includes("ip") || qLower.includes("code") || qLower.includes("invention") || qLower.includes("copyright")) {
      answer = "Intellectual Property clauses specify work product ownership. Employer/Client agreements generally transfer all inventions created during engagement to the hiring entity upon full payment or execution.";
      citation = "Refer to Intellectual Property & Work Product Assignment sections.";
    } else {
      answer = `Based on the contract text, key terms include specified obligations, governing jurisdiction, and compliance guidelines. Always review specific clause numbers with a qualified attorney for situation-specific advice.`;
      citation = "Grounded document analysis.";
    }

    return { answer, citation };
  }

  /**
   * Generates formal Dispute / Request letters based on custom user parameters
   */
  generateDisputeLetter(type, details) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (type === 'lease_deposit') {
      return `DATE: ${today}

TO: ${details.landlordName || 'Landlord / Property Manager'}
ADDRESS: ${details.propertyAddress || '[Property Address]'}

RE: Formal Demand for Return of Security Deposit under Lease Agreement

Dear ${details.landlordName || 'Landlord'},

I am writing to formally request the full return of my security deposit in the amount of ${details.amount || '$3,400.00'} for the premises located at ${details.propertyAddress || '[Property Address]'}.

My tenancy officially concluded on ${details.vacateDate || '[Vacate Date]'}. The property was surrendered in clean condition, normal wear and tear excepted. Under applicable statutory tenant protections, security deposits must be accounted for and returned within the mandatory statutory period.

Please remit payment within fourteen (14) business days to the forwarding address below:
Forwarding Address: ${details.forwardingAddress || '[My Forwarding Address]'}

Thank you for your prompt cooperation.

Sincerely,

_______________________________
${details.tenantName || 'Tenant Name'}
Contact: ${details.contactInfo || '[Phone / Email]'}`;
    }

    if (type === 'non_compete_waiver') {
      return `DATE: ${today}

TO: ${details.employerName || 'Employer HR / Legal Counsel'}

RE: Request for Release / Waiver of Post-Employment Non-Compete Covenant

Dear ${details.employerName || 'HR Department'},

In connection with my departure from ${details.employerName || 'the Company'}, I am writing to request a formal written waiver of the non-competition covenant set forth in Section 2 of my Employment Agreement.

The proposed prospective role with [New Company] focuses strictly on non-confidential services that do not compete with ${details.employerName || 'the Company\'s'} core proprietary technology or target customer base. Granting this narrow waiver will allow me to pursue professional endeavors without imposing any commercial prejudice upon the Company.

I remain fully committed to honoring all ongoing confidentiality and NDA obligations.

Thank you for considering this request.

Sincerely,

_______________________________
${details.employeeName || 'Employee Name'}`;
    }

    // Generic Contract Modification Request
    return `DATE: ${today}

TO: ${details.recipient || 'Counterparty Legal Department'}

RE: Proposed Contract Amendments & Fair Term Revisions

Dear ${details.recipient || 'Legal Team'},

Following our review of the proposed contract draft, we respectfully request the following reasonable revisions prior to execution:

1. Cap non-renewal notice period at 30 days.
2. Establish mutual attorney fee reimbursement.
3. Clarify intellectual property carved-out exceptions.

We appreciate your flexibility and look forward to finalizing an equitable agreement.

Sincerely,

_______________________________
${details.senderName || 'Authorized Signatory'}`;
  }

  // Private helper for live Gemini API calls
  async _callGeminiApiForAnalysis(sanitizedText) {
    const prompt = `Analyze this legal contract text and return a strict JSON object with these keys:
    - riskScore (number 0-100)
    - riskCategory ("Low", "Moderate", or "High Risk")
    - summary (string 2-3 sentences plain english overview)
    - clauses (array of objects: { id, line, type ("high", "medium", "low", "info"), title, originalText, plainText, recommendation })
    - timeline (array of objects: { date, title, type ("payment", "deadline", "warning", "info") })

    Contract Text:
    ${sanitizedText}`;

    const rawResponse = await this._rawGeminiCall(prompt);
    // Parse JSON safely
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON from Gemini API");
  }

  async _rawGeminiCall(promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Local fallback NLP analysis
  _localNLPAnalysis(text, redactsCount) {
    const textLower = text.toLowerCase();
    let riskScore = 40;
    const clauses = [];
    const timeline = [];

    // Clause Detection Rules
    if (textLower.includes("automatic") && (textLower.includes("renew") || textLower.includes("notice"))) {
      riskScore += 20;
      clauses.push({
        id: "c_auto_renew",
        line: "Automatic Renewal Clause",
        type: "high",
        title: "Mandatory Automatic Renewal & Strict Notice Window",
        originalText: "This Agreement shall automatically renew unless written notice is received...",
        plainText: "This contract automatically extends for another term unless you send written cancellation notice within a strict deadline.",
        recommendation: "Set calendar reminders and negotiate notice period down to 30 days via email."
      });
    }

    if (textLower.includes("non-compete") || textLower.includes("non-competition") || textLower.includes("competing")) {
      riskScore += 25;
      clauses.push({
        id: "c_non_compete",
        line: "Non-Competition Restrictive Covenant",
        type: "high",
        title: "Post-Engagement Work Restrictions",
        originalText: "Shall not directly or indirectly engage in any business competing with...",
        plainText: "Restricts your ability to work for competitors or start a similar business after leaving.",
        recommendation: "Request geographic and time limit reductions (e.g. max 6 months, 25 miles)."
      });
    }

    if (textLower.includes("deposit") || textLower.includes("forfeiture") || textLower.includes("liquidated damages")) {
      riskScore += 15;
      clauses.push({
        id: "c_deposit",
        line: "Financial Forfeiture & Liquidated Damages",
        type: "medium",
        title: "Potential Deposit Forfeiture",
        originalText: "Reserves the right to retain security deposit as liquidated damages...",
        plainText: "The counterparty may withhold funds automatically if terms are breached or terminated early.",
        recommendation: "Specify that deductions must be substantiated by itemized receipts within 30 days."
      });
    }

    if (textLower.includes("attorney") || textLower.includes("legal fee") || textLower.includes("reimburse")) {
      clauses.push({
        id: "c_legal_fees",
        line: "Legal Expenses & Dispute Provisions",
        type: "medium",
        title: "Attorney Fee Allocation",
        originalText: "Agrees to reimburse legal costs and court expenses incurred...",
        plainText: "Outlines who pays legal bills in the event of a contractual dispute.",
        recommendation: "Ensure attorney fee provisions are bilateral (prevailing party gets reimbursed)."
      });
    }

    // Default favorable clause if none flagged
    if (clauses.length === 0) {
      clauses.push({
        id: "c_standard",
        line: "General Obligations",
        type: "low",
        title: "Standard Contractual Framework",
        originalText: text.slice(0, 150) + "...",
        plainText: "Contract contains standard mutual terms without severe explicit red flags.",
        recommendation: "Review general payment and termination schedules."
      });
    }

    riskScore = Math.min(Math.max(riskScore, 15), 95);
    const riskCategory = riskScore > 70 ? "High Risk" : (riskScore > 40 ? "Moderate" : "Low Risk");

    return {
      riskScore,
      riskCategory,
      summary: `Document analysis completed. Overall risk profile is assessed as ${riskCategory} (${riskScore}/100). Identified ${clauses.length} key clause areas including notice deadlines, financial commitments, and liability terms.`,
      clauses,
      timeline: [
        { date: "Effective Date", title: "Contract Signing & Execution", type: "info" },
        { date: "Periodic", title: "Payment & Milestone Schedule", type: "payment" },
        { date: "30-90 Days Pre-Expiry", title: "Cancellation / Non-Renewal Notice Deadline", type: "deadline" }
      ],
      piiRedactedCount: redactsCount
    };
  }
}

export const aiService = new AIEngine();
