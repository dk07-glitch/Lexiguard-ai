/**
 * LexiGuard AI - Grounded AI Legal Copilot Chat Component
 * @module QACopilot
 */

import { aiService } from '../services/aiEngine.js';
import { escapeHtml, showToast } from '../utils.js';

export function renderQACopilot(container, documentText) {
  if (!container) return;

  const messages = [
    {
      sender: 'ai',
      text: 'Hello! I am your **LexiGuard AI Copilot**. Ask me any question regarding your active contract, such as notice deadlines, liability caps, or termination penalties.',
      citation: 'Grounded strictly in active document context.'
    }
  ];

  let isThinking = false;

  function formatMessageText(text) {
    let clean = escapeHtml(text || '');
    // Convert **bold** to <strong>bold</strong>
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return clean;
  }

  function updateChat() {
    container.innerHTML = `
      <div class="glass-panel chat-container" role="region" aria-label="Legal AI Copilot Chat">
        <div class="panel-header">
          <div class="panel-title">
            <i data-lucide="bot" style="width:20px; height:20px; color:var(--accent-primary);" aria-hidden="true"></i>
            <span>Grounded AI Legal Copilot</span>
          </div>
          <span class="privacy-shield-pill" style="font-size:0.75rem; padding:0.25rem 0.65rem;">
            <i data-lucide="lock" style="width:12px; height:12px;" aria-hidden="true"></i> Zero Retention Active
          </span>
        </div>

        <!-- Chat Messages Container -->
        <div id="chat-msg-list" class="chat-messages" role="log" aria-live="polite">
          ${messages.map((m, idx) => `
            <div class="chat-bubble ${m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}" id="msg-${idx}">
              <div>${formatMessageText(m.text)}</div>
              ${m.citation ? `
                <div class="chat-citation">
                  <i data-lucide="bookmark" style="width:12px; height:12px; display:inline; margin-right:4px;" aria-hidden="true"></i>
                  ${escapeHtml(m.citation)}
                </div>
              ` : ''}
              ${m.sender === 'ai' ? `
                <button type="button" class="btn btn-secondary btn-sm copy-msg-btn" data-copy-idx="${idx}" style="margin-top:0.4rem; padding:0.2rem 0.5rem; font-size:0.7rem;" title="Copy response to clipboard">
                  <i data-lucide="copy" style="width:11px; height:11px;" aria-hidden="true"></i> Copy
                </button>
              ` : ''}
            </div>
          `).join('')}

          ${isThinking ? `
            <div class="chat-bubble chat-bubble-ai" style="display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1.1rem;">
              <i data-lucide="loader-2" style="width:16px; height:16px; animation:spin 1s linear infinite;" aria-hidden="true"></i>
              <span>Analyzing contract clauses...</span>
            </div>
          ` : ''}
        </div>

        <!-- Suggested Prompt Chips -->
        <div class="prompt-chips" role="toolbar" aria-label="Suggested Prompt Questions">
          <button type="button" class="prompt-chip" data-prompt="Is there an automatic renewal clause and what is the notice deadline?">
            🔄 Auto-renewal notice deadline?
          </button>
          <button type="button" class="prompt-chip" data-prompt="What are the penalties or deposit forfeiture rules for early cancellation?">
            ⚠️ Early termination penalties?
          </button>
          <button type="button" class="prompt-chip" data-prompt="Who owns the intellectual property, inventions, or code created?">
            💡 IP & Invention Ownership?
          </button>
          <button type="button" class="prompt-chip" data-prompt="What are the non-compete and non-solicitation restrictions?">
            🚫 Non-compete rules?
          </button>
        </div>

        <!-- Chat Input Form -->
        <form id="chat-form" class="chat-input-bar">
          <input id="chat-input-field" type="text" class="chat-input" placeholder="Ask a question about this contract..." aria-label="Legal question input" autocomplete="off" />
          <button id="chat-send-btn" type="submit" class="btn btn-primary" aria-label="Send query">
            <i data-lucide="send" style="width:15px; height:15px;" aria-hidden="true"></i>
            <span>Ask AI</span>
          </button>
        </form>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }

    const form = container.querySelector('#chat-form');
    const inputField = container.querySelector('#chat-input-field');
    const msgList = container.querySelector('#chat-msg-list');

    if (msgList) {
      msgList.scrollTop = msgList.scrollHeight;
    }

    async function handleSend(query) {
      const q = (query || inputField?.value || '').trim();
      if (!q || isThinking) return;

      messages.push({ sender: 'user', text: q });
      if (inputField) inputField.value = '';
      isThinking = true;
      updateChat();

      try {
        const res = await aiService.answerQuestion(q, documentText);
        messages.push({
          sender: 'ai',
          text: res.answer,
          citation: res.citation
        });
      } catch (err) {
        messages.push({
          sender: 'ai',
          text: 'Encountered an issue analyzing your document. Please try again.',
          citation: 'System Notice'
        });
      } finally {
        isThinking = false;
        updateChat();
      }
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSend();
    });

    container.querySelectorAll('.prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const promptText = chip.getAttribute('data-prompt');
        handleSend(promptText);
      });
    });

    container.querySelectorAll('.copy-msg-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-copy-idx'));
        if (messages[idx]?.text) {
          navigator.clipboard.writeText(messages[idx].text);
          showToast('Answer copied to clipboard!', 'success', 2500);
        }
      });
    });
  }

  updateChat();
}
