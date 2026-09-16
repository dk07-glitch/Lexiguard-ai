/**
 * LexiGuard AI - Reactive State Store & Pub/Sub Event Bus
 * Implements predictable unidirectional data flow and clean subscription lifecycles.
 * @module store
 */

import { APP_CONFIG } from './config.js';
import { safeStorage } from './utils.js';

/**
 * @typedef {Object} AppState
 * @property {string} currentTheme
 * @property {string} currentSampleId
 * @property {string} documentTitle
 * @property {string} documentText
 * @property {Object|null} analysis
 * @property {string} activeTab
 * @property {boolean} isAnalyzing
 */

class Store {
  constructor() {
    this._state = {
      currentTheme: safeStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME) || 'dark',
      currentSampleId: 'lease',
      documentTitle: '',
      documentText: '',
      analysis: null,
      activeTab: 'analysis',
      isAnalyzing: false
    };

    /** @type {Set<Function>} */
    this._listeners = new Set();
  }

  /**
   * Returns a read-only snapshot of current application state.
   * @returns {Readonly<AppState>}
   */
  getState() {
    return Object.freeze({ ...this._state });
  }

  /**
   * Dispatches an action to mutate state predictably.
   * @param {string} action - Action identifier
   * @param {*} [payload] - Action payload
   */
  dispatch(action, payload) {
    const prevState = { ...this._state };

    switch (action) {
      case 'SET_THEME':
        this._state.currentTheme = payload;
        safeStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, payload);
        break;

      case 'SET_DOCUMENT':
        this._state.documentTitle = payload.title || this._state.documentTitle;
        this._state.documentText = payload.text !== undefined ? payload.text : this._state.documentText;
        if (payload.sampleId) {
          this._state.currentSampleId = payload.sampleId;
        }
        break;

      case 'SET_ANALYSIS':
        this._state.analysis = payload;
        this._state.isAnalyzing = false;
        break;

      case 'SET_ANALYZING':
        this._state.isAnalyzing = Boolean(payload);
        break;

      case 'SET_ACTIVE_TAB':
        this._state.activeTab = payload;
        break;

      case 'PURGE_STATE':
        this._state.documentText = '';
        this._state.documentTitle = '';
        this._state.analysis = null;
        this._state.isAnalyzing = false;
        break;

      default:
        console.warn(`[Store] Unknown action: ${action}`);
        return;
    }

    this._notify(prevState);
  }

  /**
   * Subscribes a listener to state changes.
   * @param {Function} listener - Callback receiving (newState, prevState)
   * @returns {Function} Unsubscribe teardown function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  _notify(prevState) {
    const currentState = this.getState();
    for (const listener of this._listeners) {
      try {
        listener(currentState, prevState);
      } catch (err) {
        console.error('[Store] Error in subscriber callback:', err);
      }
    }
  }
}

export const appStore = new Store();
