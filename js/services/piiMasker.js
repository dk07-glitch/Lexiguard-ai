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

// Precomputed lookup table for Luhn algorithm: (digit * 2 > 9 ? digit * 2 - 9 : digit * 2)
const LUHN_DOUBLE = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

/**
 * Validates a credit/debit card number using the ISO/IEC 7812 Luhn checksum algorithm.
 * High-performance implementation using precomputed double table and char code arithmetic.
 * @param {string} numberStr - Numeric string or hyphen/space separated digits
 * @returns {boolean} True if passes Luhn validation
 */
export function isValidLuhn(numberStr) {
  if (typeof numberStr !== 'string') return false;
  const digits = numberStr.replace(/\D/g, '');
  const len = digits.length;
  if (len < 13 || len > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = len - 1; i >= 0; i--) {
    const digit = digits.charCodeAt(i) - 48;
    if (digit < 0 || digit > 9) return false;
    sum += shouldDouble ? LUHN_DOUBLE[digit] : digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// Pre-compiled static regular expressions to eliminate re-compilation in hot paths
const REGEX_JWT = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
const REGEX_BEARER = /Bearer\s+([A-Za-z0-9_\-\.]{20,})/gi;
const REGEX_AWS = /\bAKIA[0-9A-Z]{16}\b/g;
const REGEX_GITHUB = /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g;
const REGEX_GOOGLE_KEY = /\bAIzaSy[A-Za-z0-9_-]{33}\b/g;
const REGEX_GENERIC_KEY = /(?:api[_-]?key|secret|token)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{16,})['"]?/gi;
const REGEX_IBAN = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g;
const REGEX_CARDS = /\b(?:\d{4}[-\s]?){3}\d{1,7}\b|\b\d{13,19}\b/g;
const REGEX_SSN = /\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/g;
const REGEX_PASSPORT = /(?:Passport\s*(?:No|Number|#)?[:\s]*)([A-Z0-9]{7,10})\b/gi;
const REGEX_DOB = /(?:DOB|Date of Birth|Birth Date)[:\s]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/gi;
const REGEX_IPV4 = /\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const REGEX_PHONE = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const REGEX_MONETARY = /(?:\$|€|£|USD|EUR|GBP)\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/gi;
const REGEX_ADDRESS = /\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Apt|Suite|Unit|Building|Floor|Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Way|Lane|Ln|Court|Ct)\b[A-Za-z0-9\s.,\d]{0,50}/gi;
const REGEX_NAME_1 = /\b(?:Landlord|Tenant|Employee|Employer|Party A|Party B|Client|Contractor):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
const REGEX_NAME_2 = /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\("(?:Landlord|Tenant|Employee|Employer|Contractor)"\)/g;

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
   * Alias for anonymize to provide semantic convenience.
   * @param {string} text
   * @returns {AnonymizeResult}
   */
  mask(text) {
    return this.anonymize(text);
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
        sanitized = sanitized.replace(REGEX_JWT, (match) =>
          registerToken('SECRET_KEY', match)
        );

        sanitized = sanitized.replace(REGEX_BEARER, (match, tokenVal) => {
          const token = registerToken('SECRET_KEY', tokenVal);
          return `Bearer ${token}`;
        });

        sanitized = sanitized.replace(REGEX_AWS, (match) =>
          registerToken('SECRET_KEY', match)
        );

        sanitized = sanitized.replace(REGEX_GITHUB, (match) =>
          registerToken('SECRET_KEY', match)
        );

        sanitized = sanitized.replace(REGEX_GOOGLE_KEY, (match) =>
          registerToken('SECRET_KEY', match)
        );

        sanitized = sanitized.replace(REGEX_GENERIC_KEY, (match, secretVal) => {
          const token = registerToken('SECRET_KEY', secretVal);
          return match.replace(secretVal, token);
        });
      }

      // 2. Financial Accounts: Credit/Debit Cards (with Luhn check) & IBANs
      if (this.categories.financial) {
        sanitized = sanitized.replace(REGEX_IBAN, (match) =>
          registerToken('BANK_ACCOUNT', match)
        );

        sanitized = sanitized.replace(REGEX_CARDS, (match) => {
          if (isValidLuhn(match)) {
            return registerToken('PAYMENT_CARD', match);
          }
          return match;
        });
      }

      // 3. Social Security & National Tax Identifiers (SSN: XXX-XX-XXXX)
      if (this.categories.identifiers) {
        sanitized = sanitized.replace(REGEX_SSN, (match) => 
          registerToken('NATIONAL_ID', match)
        );

        sanitized = sanitized.replace(REGEX_PASSPORT, (match, passVal) => {
          const token = registerToken('PASSPORT', passVal);
          return match.replace(passVal, token);
        });

        sanitized = sanitized.replace(REGEX_DOB, (match, dobVal) => {
          const token = registerToken('DOB', dobVal);
          return match.replace(dobVal, token);
        });
      }

      // 4. IP Addresses (IPv4 and IPv6)
      if (this.categories.identifiers) {
        sanitized = sanitized.replace(REGEX_IPV4, (match) =>
          registerToken('IP_ADDRESS', match)
        );
      }

      // 5. Email Addresses & Phone Numbers
      if (this.categories.contacts) {
        sanitized = sanitized.replace(REGEX_EMAIL, (match) =>
          registerToken('EMAIL', match)
        );

        sanitized = sanitized.replace(REGEX_PHONE, (match) =>
          registerToken('PHONE', match)
        );
      }

      // 6. Monetary Amounts ($3,400.00, €50,000, £100,000, USD 20,000)
      if (this.categories.amounts) {
        sanitized = sanitized.replace(REGEX_MONETARY, (match) =>
          registerToken('FINANCIAL_VAL', match)
        );
      }

      // 7. Physical Street Addresses & Suite/Apt Identifiers
      if (this.categories.addresses) {
        sanitized = sanitized.replace(REGEX_ADDRESS, (match) =>
          registerToken('ADDRESS', match)
        );
      }

      // 8. Named Parties & Entities (Common Contract Signature Header Patterns)
      if (this.categories.names) {
        sanitized = sanitized.replace(REGEX_NAME_1, (match, nameGroup) => {
          const token = registerToken('PARTY_NAME', nameGroup);
          return match.replace(nameGroup, token);
        });

        sanitized = sanitized.replace(REGEX_NAME_2, (match, nameGroup) => {
          const token = registerToken('PARTY_NAME', nameGroup);
          return match.replace(nameGroup, token);
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
   * Reconstructs sanitized text using the token map in a single high-performance O(N) pass.
   * Compiles alternating token patterns to prevent multi-pass string reallocation.
   * @param {string} sanitizedText - Text containing anonymized tokens
   * @param {Object.<string, string>} map - Token to original value dictionary
   * @returns {string} Restored text
   */
  unmask(sanitizedText, map) {
    if (!sanitizedText || !map) return sanitizedText || '';
    const isMap = map instanceof Map;
    const tokens = isMap ? Array.from(map.keys()) : Object.keys(map);
    if (tokens.length === 0) return sanitizedText;

    // Fast single-pass regex compilation with escaped brackets
    const pattern = new RegExp(tokens.map((t) => t.replace(/[[\]]/g, '\\$&')).join('|'), 'g');
    return sanitizedText.replace(pattern, (matchedToken) => (isMap ? map.get(matchedToken) : map[matchedToken]) ?? matchedToken);
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
