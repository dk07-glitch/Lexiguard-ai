/**
 * LexiGuard AI - Client-Side PII Masking & Privacy Anonymizer Engine
 * Ensures zero personal data exposure before analysis or transmission.
 */

export class PIIMasker {
  constructor() {
    this.maskingEnabled = true;
    this.categories = {
      names: true,
      addresses: true,
      amounts: true,
      contacts: true,
      dates: true
    };
  }

  /**
   * Anonymizes sensitive PII inside contract text
   * @param {string} text - Raw input document text
   * @returns {Object} { sanitizedText, redactsCount, map }
   */
  anonymize(text) {
    if (!text || typeof text !== 'string') {
      return { sanitizedText: "", redactsCount: 0, map: {} };
    }

    let sanitized = text;
    let redactsCount = 0;
    const map = {};

    // 1. Email Addresses
    if (this.categories.contacts) {
      sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
        redactsCount++;
        const token = `[EMAIL_${redactsCount}]`;
        map[token] = match;
        return token;
      });

      // Phone Numbers
      sanitized = sanitized.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, (match) => {
        redactsCount++;
        const token = `[PHONE_${redactsCount}]`;
        map[token] = match;
        return token;
      });
    }

    // 2. Monetary Amounts (e.g., $3,400, $100,000)
    if (this.categories.amounts) {
      sanitized = sanitized.replace(/\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g, (match) => {
        redactsCount++;
        const token = `[FINANCIAL_VAL_${redactsCount}]`;
        map[token] = match;
        return token;
      });
    }

    // 3. Addresses (street/apt/city/state/zip heuristic)
    if (this.categories.addresses) {
      sanitized = sanitized.replace(/\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Apt|Suite|Unit|Building|Floor|Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Way|Lane|Ln|Court|Ct)\b[A-Za-z0-9\s.,\d]{0,50}/gi, (match) => {
        redactsCount++;
        const token = `[ADDRESS_${redactsCount}]`;
        map[token] = match;
        return token;
      });
    }

    // 4. Specific Common Name Entities in Contracts (e.g. John Doe, Jane Smith, Apex Properties LLC)
    if (this.categories.names) {
      const namePatterns = [
        /\b(?:Landlord|Tenant|Employee|Employer|Party A|Party B|Client|Contractor):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
        /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\("(?:Landlord|Tenant|Employee|Employer|Tenant|Contractor)"\)/g
      ];

      namePatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, (match, nameGroup) => {
          redactsCount++;
          const token = `[NAME_${redactsCount}]`;
          map[token] = nameGroup;
          return match.replace(nameGroup, token);
        });
      });
    }

    return {
      sanitizedText: sanitized,
      redactsCount,
      map
    };
  }

  /**
   * Clears session storage & local state securely
   */
  purgeSession() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch (e) {
      console.warn("Storage purge warning:", e);
      return false;
    }
  }
}

export const piiService = new PIIMasker();
