/**
 * LexiGuard AI - Grounded AI Legal Copilot Chat Component
 */

import { aiService } from '../services/aiEngine.js';

export function renderQACopilot(container, documentText) {
  const messages = [
    {
      sender: 'ai',
      text: 'Hello! I am your **LexiGuard AI Copilot**. Ask me any question regarding your uploaded document, such as notice deadlines, payment penalties, or early termination terms.',
      citation: 'Grounded in active document context.'
    }
  ];

  function updateChat() {
    container.innerHTML = `
      <div class="glass-panel chat-container">
        <div class="panel-header">
          <div class="panel-title">
            <i data-lucide="bot" style="width:20px; height:20px; color:var(--accent-primary);"></i>
            <span>Grounded AI Legal Copilot</span>
          </div>
          <span class="privacy-shield-pill" style="font-size:0.75rem; padding:0.25rem 0.65rem;">
            <i data-lucide="lock" style="width:12px; height:12px;"></i> Zero Retention Active
          </span>
        </div>

        <!-- Chat Messages Container -->
        <div id="chat-msg-list" class="chat-messages">
          ${messages.map(m => `
            <div class="chat-bubble ${m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}">
              <div>${m.text}</div>
              ${m.citation ? `<div class="chat-citation"><i data-lucide="bookmark" style="width:12px; height:12px; display:inline; margin-right:4px;"></i>${m.citation}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Preset Suggested Prompts Chips -->
        <div class="prompt-chips">
          <button class="prompt-chip" data-prompt="Is there an automatic renewal clause and what is the notice deadline?">
            🔄 Auto-renewal notice deadline?
          </button>
          <button class="prompt-chip" data-prompt="What are the penalties or deposit forfeiture rules for early cancellation?">
            ⚠️ Early termination penalties?
          </button>
          <button class="prompt-chip" data-prompt="Who owns the intellectual property, inventions, or code created?">
            💡 IP & Invention Ownership?
          </button>
          <button class="prompt-chip" data-prompt="What are the non-compete and non-solicitation restrictions?">
            🚫 Non-compete rules?
          </button>
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-input-bar">
          <input id="chat-input-field" type="text" class="chat-input" placeholder="Ask a question about this contract..." />
          <button id="chat-send-btn" class="btn btn-primary">
            <i data-lucide="send" style="width:16px; height:16px;"></i>
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    const inputField = container.querySelector('#chat-input-field');
    const sendBtn = container.querySelector('#chat-send-btn');
    const msgList = container.querySelector('#chat-msg-list');

    async function handleSend(promptQuery) {
      const q = promptQuery || inputField.value.trim();
      if (!q) return;

      messages.push({ sender: 'user', text: q });
      if (inputField) inputField.value = '';
      updateChat();

      // Scroll chat to bottom
      const listEl = container.querySelector('#chat-msg-list');
      if (listEl) listEl.scrollTop = listEl.scrollHeight;

      // Call AI Engine
      const res = await aiService.answerQuestion(q, documentText);

      messages.push({
        sender: 'ai',
        text: res.answer,
        citation: res.citation
      });

      updateChat();
      const updatedListEl = container.querySelector('#chat-msg-list');
      if (updatedListEl) updatedListEl.scrollTop = updatedListEl.scrollHeight;
    }

    sendBtn.addEventListener('click', () => handleSend());
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    container.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.getAttribute('data-prompt');
        handleSend(promptText);
      });
    });
  }

  updateChat();
}
