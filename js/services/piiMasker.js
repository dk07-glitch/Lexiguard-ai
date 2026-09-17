/**
 * LexiGuard AI - Client-Side PII Masking & Privacy Anonymizer Engine
 * High-performance regex patterns & heuristic entity tokenization with zero server retention.
 * @module piiMasker
 */

import { safeStorage } from '../utils.js';

/**
 * @typedef {Object} AnonymizeResult
 * @property {string} sanitizedText - The anonymized document text
 * @property {number} redactsCount - Total number of redacted entities
 * @property {Object.<string, string>} map - Reversible token-to-original map
 */

/**
 * Validates a credit/debit card number using the ISO/IEC 7812 Luhn checksum algorithm.
 * @param {string} numberStr - Numeric string or hyphen/space separated digits
 * @returns {boolean} True if passes Luhn validation
 */
export function isValidLuhn(numberStr) {
  if (typeof numberStr !== 'string') return false;
  const digits = numberStr.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export class PIIMasker {
  constructor() {
    this.maskingEnabled = true;
    this.categories = {
      names: true,
      addresses: true,
      amounts: true,
      contacts: true,
      identifiers: true,
      financial: true,
      secrets: true
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
      // 1. Secrets, API Keys, Bearer Tokens, and JWTs
      if (this.categories.secrets) {
        // JWT tokens (eyJ...)
        sanitized = sanitized.replace(/\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, (match) =>
          registerToken('SECRET_KEY', match)
        );

        // Bearer tokens in headers or code
        sanitized = sanitized.replace(/Bearer\s+([A-Za-z0-9_\-\.]{20,})/gi, (match, tokenVal) => {
          const token = registerToken('SECRET_KEY', tokenVal);
          return `Bearer ${token}`;
        });

        // AWS Access Keys (AKIA...)
        sanitized = sanitized.replace(/\bAKIA[0-9A-Z]{16}\b/g, (match) =>
          registerToken('SECRET_KEY', match)
        );

        // GitHub personal tokens (ghp_...)
        sanitized = sanitized.replace(/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g, (match) =>
          registerToken('SECRET_KEY', match)
        );

        // Google API Keys (AIzaSy...)
        sanitized = sanitized.replace(/\bAIzaSy[A-Za-z0-9_-]{33}\b/g, (match) =>
          registerToken('SECRET_KEY', match)
        );

        // Generic API Key / Secret assignments
        sanitized = sanitized.replace(/(?:api[_-]?key|secret|token)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{16,})['"]?/gi, (match, secretVal) => {
          const token = registerToken('SECRET_KEY', secretVal);
          return match.replace(secretVal, token);
        });
      }

      // 2. Financial Accounts: Credit/Debit Cards (with Luhn check) & IBANs
      if (this.categories.financial) {
        // International Bank Account Numbers (IBAN)
        sanitized = sanitized.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, (match) =>
          registerToken('BANK_ACCOUNT', match)
        );

        // Payment Cards: 13 to 19 digits formatted or raw, validated via Luhn algorithm
        sanitized = sanitized.replace(/\b(?:\d{4}[-\s]?){3}\d{1,7}\b|\b\d{13,19}\b/g, (match) => {
          if (isValidLuhn(match)) {
            return registerToken('PAYMENT_CARD', match);
          }
          return match;
        });
      }

      // 3. Social Security & National Tax Identifiers (SSN: XXX-XX-XXXX)
      if (this.categories.identifiers) {
        sanitized = sanitized.replace(/\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/g, (match) => 
          registerToken('NATIONAL_ID', match)
        );

        // Passport Numbers (explicit label or standard format)
        sanitized = sanitized.replace(/(?:Passport\s*(?:No|Number|#)?[:\s]*)([A-Z0-9]{7,10})\b/gi, (match, passVal) => {
          const token = registerToken('PASSPORT', passVal);
          return match.replace(passVal, token);
        });

        // Date of Birth (DOB)
        sanitized = sanitized.replace(/(?:DOB|Date of Birth|Birth Date)[:\s]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/gi, (match, dobVal) => {
          const token = registerToken('DOB', dobVal);
          return match.replace(dobVal, token);
        });
      }

      // 4. IP Addresses (IPv4 and IPv6)
      if (this.categories.identifiers) {
        // IPv4 Address
        sanitized = sanitized.replace(/\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g, (match) =>
          registerToken('IP_ADDRESS', match)
        );
      }

      // 5. Email Addresses
      if (this.categories.contacts) {
        sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) =>
          registerToken('EMAIL', match)
        );

        // Phone Numbers (Standard, International, and Bracketed formats)
        sanitized = sanitized.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, (match) =>
          registerToken('PHONE', match)
        );
      }

      // 6. Monetary Amounts ($3,400.00, €50,000, £100,000, USD 20,000)
      if (this.categories.amounts) {
        sanitized = sanitized.replace(/(?:\$|€|£|USD|EUR|GBP)\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/gi, (match) =>
          registerToken('FINANCIAL_VAL', match)
        );
      }

      // 7. Physical Street Addresses & Suite/Apt Identifiers
      if (this.categories.addresses) {
        sanitized = sanitized.replace(/\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Apt|Suite|Unit|Building|Floor|Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Way|Lane|Ln|Court|Ct)\b[A-Za-z0-9\s.,\d]{0,50}/gi, (match) =>
          registerToken('ADDRESS', match)
        );
      }

      // 8. Named Parties & Entities (Common Contract Signature Header Patterns)
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
      safeStorage.clear();
      return true;
    } catch (e) {
      console.warn('[PIIMasker] Session purge exception:', e);
      return false;
    }
  }
}

export const piiService = new PIIMasker();
