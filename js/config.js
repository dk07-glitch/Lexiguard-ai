/**
 * LexiGuard AI - Centralized Application Configuration & Constants
 * Decouples constants, risk thresholds, and model parameters for enterprise maintainability.
 * @module config
 */

export const APP_CONFIG = Object.freeze({
  APP_NAME: 'LexiGuard AI',
  VERSION: '2.4.0',
  
  // Storage Keys
  STORAGE_KEYS: Object.freeze({
    API_KEY: 'lexiguard_gemini_key',
    THEME: 'lexiguard_theme',
    SESSION_DATA: 'lexiguard_session'
  }),

  // AI Model Parameters
  AI: Object.freeze({
    DEFAULT_MODEL: 'gemini-1.5-flash',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    REQUEST_TIMEOUT_MS: 15000,
    MAX_PROMPT_CHARS: 12000
  }),

  // Risk Classification Thresholds
  RISK_THRESHOLDS: Object.freeze({
    HIGH: 70,
    MODERATE: 40,
    BASE_SCORE: 30
  }),

  // File Upload Constraints
  UPLOAD: Object.freeze({
    MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
    ALLOWED_EXTENSIONS: ['.txt', '.md', '.doc', '.docx']
  }),

  // Clause Severity Tiers
  SEVERITY: Object.freeze({
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info'
  }),

  // Pre-compiled PII Entity Regex Patterns
  PII_PATTERNS: Object.freeze({
    NATIONAL_ID: /\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/g,
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    PHONE: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    CURRENCY: /(?:\$|€|£|USD|EUR|GBP)\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/gi,
    STREET_ADDRESS: /\d{1,5}\s+[A-Za-z0-9\s.,]+(?:Apt|Suite|Unit|Building|Floor|Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Way|Lane|Ln|Court|Ct)\b[A-Za-z0-9\s.,\d]{0,50}/gi
  })
});
