/**
 * LexiGuard AI - Client-Side PII Masking & Privacy Anonymizer Engine
 * High-performance regex patterns & heuristic entity tokenization with zero server retention.
 * @module piiMasker
 */

/**
 * @typedef {Object} AnonymizeResult
 * @property {string} sanitizedText - The anonymized document text
 * @property {number} redactsCount - Total number of redacted entities
 * @property {Object.<string, string>} map - Reversible token-to-original map
 */

export class PIIMasker {
  constructor() {
    this.maskingEnabled = true;
    this.categories = {
      names: true,
      addresses: true,
      amounts: true,
      contacts: true,
      identifiers: true
    };
  }

  /**
   * Anonymizes sensitive PII inside contract text using compliant regex tokens.
   * @param {string} text - Raw input document text
   * @returns {AnonymizeResult} Anonymized payload and metadata
   */
  anonymize(text) {
    if (typeof text !== 'string' || !text.trim()) {
      return { sanitizedText: '', redactsCount: 0, map: {} };
    }

    let sanitized = text;
    let redactsCount = 0;
    const map = {};

    const registerToken = (prefix, original) => {
      redactsCount++;
      const token = `[${prefix}_${redactsCount}]`;
      map[token] = original;
      return token;
    };

    try {
      // 1. Social Security & National Tax Identifiers (SSN: XXX-XX-XXXX)
      if (this.categories.identifiers) {
        sanitized = sanitized.replace(/\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/g, (match) => 
          registerToken('NATIONAL_ID', match)
        );
      }

      // 2. Email Addresses
      if (this.categories.contacts) {
        sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) =>
          registerToken('EMAIL', match)
        );

        // Phone Numbers (Standard, International, and Bracketed formats)
        sanitized = sanitized.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, (match) =>
          registerToken('PHONE', match)
        );
      }

      // 3. Monetary Amounts ($3,400.00, €50,000, £100,000, USD 20,000)
      if (this.categories.amounts) {
        sanitized = sanitized.replace(/(?:\$|€|£|USD|EUR|GBP)\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/gi, (match) =>
          registerToken('FINANCIAL_VAL', match)
        );
      }

      // 4. Physical Street Addresses & Suite/Apt Identifiers
      if (this.categories.addresses) {
        sanitized = sanitized.replace(/\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Apt|Suite|Unit|Building|Floor|Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Way|Lane|Ln|Court|Ct)\b[A-Za-z0-9\s.,\d]{0,50}/gi, (match) =>
          registerToken('ADDRESS', match)
        );
      }

      // 5. Named Parties & Entities (Common Contract Signature Header Patterns)
      if (this.categories.names) {
        const namePatterns = [
          /\b(?:Landlord|Tenant|Employee|Employer|Party A|Party B|Client|Contractor):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
          /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\("(?:Landlord|Tenant|Employee|Employer|Contractor)"\)/g
        ];

        namePatterns.forEach((pattern) => {
          sanitized = sanitized.replace(pattern, (match, nameGroup) => {
            const token = registerToken('PARTY_NAME', nameGroup);
            return match.replace(nameGroup, token);
          });
        });
      }
    } catch (err) {
      console.error('[PIIMasker] Error during entity anonymization:', err);
    }

    return {
      sanitizedText: sanitized,
      redactsCount,
      map
    };
  }

  /**
   * Reconstructs sanitized text using the token map.
   * @param {string} sanitizedText - Text containing anonymized tokens
   * @param {Object.<string, string>} map - Token to original value dictionary
   * @returns {string} Restored text
   */
  unmask(sanitizedText, map) {
    if (!sanitizedText || !map) return sanitizedText || '';
    let restored = sanitizedText;
    for (const [token, original] of Object.entries(map)) {
      restored = restored.replaceAll(token, original);
    }
    return restored;
  }

  /**
   * Permanently wipes all browser storage & memory session data.
   * @returns {boolean} True if successfully purged
   */
  purgeSession() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch (e) {
      console.warn('[PIIMasker] Session purge exception:', e);
      return false;
    }
  }
}

export const piiService = new PIIMasker();
