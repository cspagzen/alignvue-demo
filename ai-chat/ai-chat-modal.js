/**
 * VueSense AI Modal - Complete Working Version
 */

class VueSenseModal {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'center',
      size: options.size || 'default',
      closeOnBackdrop: options.closeOnBackdrop !== false,
      maxCharacters: options.maxCharacters || 2000,
      ...options
    };
    
    this.isOpen = false;
    this.isMinimized = false;
    this.isExpanded = false;
    this.isTyping = false;
    this.messages = [];
    
    
    
    this.init();
  }
  
  init() {
    if (!document.getElementById('vuesense-modal-overlay')) {
      this.createModal();
    }
    
    this.overlay = document.getElementById('vuesense-modal-overlay');
    this.modal = document.getElementById('vuesense-modal');
    this.trigger = document.getElementById('vuesense-trigger');
    this.messagesContainer = document.getElementById('vuesense-messages');
    this.inputField = document.getElementById('vuesense-input');
    this.sendBtn = document.getElementById('vuesense-send-btn');
    
    this.attachEventListeners();
    this.setPosition(this.options.position);
    this.setSize(this.options.size);
    this.renderWelcome();
  }
  
  createModal() {
    const modalHTML = `
      <button id="vuesense-trigger" class="vuesense-trigger" aria-label="Open VueSense AI">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
          <path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>
        </svg>
      </button>
      
      <div id="vuesense-modal-overlay" class="vuesense-modal-overlay">
        <div id="vuesense-modal" class="vuesense-modal">
          <div class="vuesense-modal-header">
            <div class="vuesense-modal-branding">
              <div class="vuesense-modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
                </svg>
              </div>
              <div class="vuesense-modal-title-group">
                <h2 class="vuesense-modal-title">VueSense AI</h2>
                <p class="vuesense-modal-subtitle">Your intelligent assistant</p>
              </div>
            </div>
            <div class="vuesense-modal-controls">
              <button onclick="openSettingsModal()" class="vuesense-modal-btn" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button id="vuesense-minimize-btn" class="vuesense-modal-btn" title="Minimize">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <button id="vuesense-expand-btn" class="vuesense-modal-btn" title="Expand">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/>
                </svg>
              </button>
              <button id="vuesense-close-btn" class="vuesense-modal-btn" title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="vuesense-modal-body" style="padding: 0;">
            <div class="vuesense-chat-container">
              <div id="vuesense-messages" class="vuesense-messages"></div>
              
              <div class="vuesense-input-area">
                <div class="vuesense-input-wrapper">
                  <textarea 
                    id="vuesense-input" 
                    class="vuesense-input-field" 
                    placeholder="Ask me anything about your portfolio..."
                    rows="1"
                    maxlength="2000"
                  ></textarea>
                  <button id="vuesense-send-btn" class="vuesense-send-btn" aria-label="Send message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                    </svg>
                  </button>
                </div>
                <div id="vuesense-char-counter" class="vuesense-char-counter">0 / 2000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  attachEventListeners() {
    this.trigger?.addEventListener('click', () => this.open());
    document.getElementById('vuesense-close-btn')?.addEventListener('click', () => this.close());
    document.getElementById('vuesense-minimize-btn')?.addEventListener('click', () => this.minimize());
    document.getElementById('vuesense-expand-btn')?.addEventListener('click', () => this.toggleExpand());
    
    this.sendBtn?.addEventListener('click', () => this.sendMessage());
    
    this.inputField?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.inputField?.addEventListener('input', () => this.updateCharCounter());
    
    this.inputField?.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    if (this.options.closeOnBackdrop) {
      this.overlay?.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }
  
  renderWelcome() {
  const welcomeHTML = `
    <div class="vuesense-welcome">
      <div class="vuesense-welcome-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
        </svg>
      </div>
      <h3>Welcome to VueSense AI</h3>
      <p>Strategic portfolio insights powered by your data</p>
      
      <div class="vuesense-suggestions">
        <div class="vuesense-suggestions-title">Try asking:</div>
        <div class="ai-prompt-grid">
          ${this.getSuggestedQuestions().map(q => `
            <button class="ai-prompt-card" onclick="window.vuesenseModal.askSuggestion('${q.text.replace(/'/g, "\\'")}')" data-category="${q.category}">
              <div class="ai-prompt-icon">${q.icon}</div>
              <div class="ai-prompt-content">
                <div class="ai-prompt-text">${q.text}</div>
                <div class="ai-prompt-description">${q.description}</div>
              </div>
            </button>
          `).join('')}
        </div>
        
        <div class="ai-welcome-tips">
          <div class="ai-tip">
            <span class="ai-tip-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            </span>
            <span class="ai-tip-text">Ask about specific initiatives or teams by name</span>
          </div>
          <div class="ai-tip">
            <span class="ai-tip-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>
            </span>
            <span class="ai-tip-text">Try "what if" scenarios to explore portfolio changes</span>
          </div>
          <div class="ai-tip">
            <span class="ai-tip-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16v5"/><path d="M16 14v7"/><path d="M20 10v11"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/><path d="M4 18v3"/><path d="M8 14v7"/></svg>
            </span>
            <span class="ai-tip-text">Request analysis on capacity, risk, or validation</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  this.messagesContainer.innerHTML = welcomeHTML;
}
  
  getSuggestedQuestions() {
  return [
    { 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
      text: "How balanced is my portfolio right now?",
      description: "Analyzes Strategic/KTLO/Emergent distribution and resource allocation",
      category: "strategic"
    },
    { 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>`,
      text: "Which teams are overloaded and need help?",
      description: "Identifies capacity bottlenecks and health risks across teams",
      category: "tactical"
    },
    { 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>`,
      text: "What if we shelve Integration Hub to free up capacity?",
      description: "Simulates removing an initiative and shows capacity/impact",
      category: "scenario"
    },
    { 
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/></svg>`,
      text: "What's blocking our delivery confidence?",
      description: "Pinpoints risk factors, validation gaps, and capacity issues",
      category: "analysis"
    }
  ];
}
  
  askSuggestion(question) {
  this.inputField.value = question;
  this.sendMessage();
}
  
  async sendMessage() {
    const message = this.inputField?.value.trim();
    
    if (!message || this.isTyping) return;
    
    if (this.messages.length === 0) {
      this.messagesContainer.innerHTML = '';
    }
    
    this.addMessage(message, 'user');
    this.inputField.value = '';
    this.inputField.style.height = 'auto';
    this.updateCharCounter();
    
    this.showTyping();
    
    try {
      
      
      const boardData = window.boardData || null;
      const response = await aiEngine.sendMessage(message, boardData);
      
      this.hideTyping();
      this.addMessage(response.response, 'ai');
      
      if (response.cost && AI_CHAT_CONFIG.costTrackingVisible) {
        this.updateCostDisplay(response);
      }
      
    } catch (error) {
      this.hideTyping();
      console.error('VueSense AI Error:', error);
      this.addMessage('Sorry, I encountered an error. Please check your API key in settings and try again.', 'ai');
    }
  }
    
  updateCostDisplay(response) {
    const stats = costTracker.getStats();
    const costText = response.cached ? '(cached)' : `$${response.cost.toFixed(4)}`;
    console.log(`💰 Cost: ${costText} | Total: $${stats.totalCost.toFixed(4)} | Questions: ${stats.questionCount}`);
  }
  
  addMessage(text, type) {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    const avatarIcon = type === 'user' 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>';
    
    const formattedText = type === 'ai' ? this.formatMarkdown(text) : this.escapeHtml(text);
    
    const messageHTML = `
      <div class="vuesense-message ${type}">
        <div class="vuesense-message-avatar">${avatarIcon}</div>
        <div class="vuesense-message-content">
          <div class="vuesense-message-bubble">${formattedText}</div>
          <div class="vuesense-message-time">${time}</div>
        </div>
      </div>
    `;
    
    this.messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.messages.push({ type, text, time });
    this.scrollToBottom();
  }
  
  formatMarkdown(text) {
  // Escape HTML first
  const div = document.createElement('div');
  div.textContent = text;
  let safe = div.innerHTML;
  
  // 1. Extract and protect code blocks
  const codeBlocks = [];
  safe = safe.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang: lang || 'text', code: code.trim() });
    return `__CODE_BLOCK_${index}__`;
  });
  
  // 2. Inline code (before other formatting)
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 3. Headers (before bold/italic)
  safe = safe.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  safe = safe.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  safe = safe.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  
  // 4. Bold (before italic)
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 5. Italic
  safe = safe.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  
  // 6. Process lists properly
  const lines = safe.split('\n');
  const processed = [];
  let inBulletList = false;
  let inNumberedList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)$/);
    const numberedMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    
    if (bulletMatch) {
      if (inNumberedList) {
        processed.push('</ol>');
        inNumberedList = false;
      }
      if (!inBulletList) {
        processed.push('<ul>');
        inBulletList = true;
      }
      processed.push(`<li>${bulletMatch[1]}</li>`);
    } else if (numberedMatch) {
      if (inBulletList) {
        processed.push('</ul>');
        inBulletList = false;
      }
      if (!inNumberedList) {
        processed.push('<ol>');
        inNumberedList = true;
      }
      processed.push(`<li>${numberedMatch[1]}</li>`);
    } else {
      if (inBulletList) {
        processed.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        processed.push('</ol>');
        inNumberedList = false;
      }
      processed.push(line);
    }
  }
  
  // Close any open lists
  if (inBulletList) processed.push('</ul>');
  if (inNumberedList) processed.push('</ol>');
  
  safe = processed.join('\n');
  
  // 7. Paragraphs - handle double line breaks
  const chunks = safe.split(/\n\n+/);
  safe = chunks.map(chunk => {
    chunk = chunk.trim();
    // Don't wrap if already has block-level tags
    if (chunk.match(/^<(h[2-4]|ul|ol|pre|div)/)) {
      return chunk;
    }
    // Wrap in paragraph
    return chunk ? `<p>${chunk.replace(/\n/g, '<br>')}</p>` : '';
  }).filter(c => c).join('\n');
  
  // 8. Restore code blocks
  safe = safe.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    const block = codeBlocks[index];
    return `<pre><code class="language-${block.lang}">${block.code}</code></pre>`;
  });
  
  // 9. Clean up empty paragraphs
  safe = safe.replace(/<p><\/p>/g, '');
  safe = safe.replace(/<p>\s*<\/p>/g, '');
  
  return safe;
}
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showTyping() {
  this.isTyping = true;
  const typingHTML = `
    <div class="vuesense-message ai" id="vuesense-typing">
      <div class="vuesense-message-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
        </svg>
      </div>
      <div class="vuesense-message-content">
        <div class="vuesense-typing">
          <div class="vuesense-typing-dots">
            <div class="vuesense-typing-dot"></div>
            <div class="vuesense-typing-dot"></div>
            <div class="vuesense-typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  this.messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
  this.scrollToBottom();
}
  
  hideTyping() {
    this.isTyping = false;
    document.getElementById('vuesense-typing')?.remove();
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  updateCharCounter() {
    const count = this.inputField?.value.length || 0;
    const counter = document.getElementById('vuesense-char-counter');
    if (counter) {
      counter.textContent = `${count} / ${this.options.maxCharacters}`;
      counter.classList.toggle('warning', count > this.options.maxCharacters * 0.8);
      counter.classList.toggle('error', count >= this.options.maxCharacters);
    }
  }
  
  open() {
    this.isOpen = true;
    this.overlay?.classList.add('active');
    this.trigger?.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.inputField?.focus(), 300);
  }
  
  close() {
    this.isOpen = false;
    this.overlay?.classList.remove('active');
    this.trigger?.classList.remove('hidden');
    document.body.style.overflow = '';
  }
  
  minimize() {
    this.isMinimized = true;
    this.close();
  }
  
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.previousSize = this.options.size;
      this.setSize('fullscreen');
    } else {
      this.setSize(this.previousSize || 'default');
    }
  }
  
  setPosition(position) {
    this.options.position = position;
    const positions = ['center', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
    positions.forEach(pos => this.overlay?.classList.remove(`position-${pos}`));
    if (position !== 'center') {
      this.overlay?.classList.add(`position-${position}`);
    }
  }
  
  setSize(size) {
    this.options.size = size;
    const sizes = ['small', 'default', 'large', 'fullscreen'];
    sizes.forEach(sz => this.modal?.classList.remove(`size-${sz}`));
    this.modal?.classList.add(`size-${size}`);
  }
  
  clearConversation() {
    this.messages = [];
    this.renderWelcome();
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVueSense);
} else {
  initVueSense();
}

function initVueSense() {
  try {
    window.vuesenseModal = new VueSenseModal({
      position: 'center',
      size: 'default',
      closeOnBackdrop: true
    });
    console.log('✅ VueSense AI initialized');
  } catch (error) {
    console.error('❌ VueSense AI init failed:', error);
  }
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (window.vuesenseModal) {
      if (window.vuesenseModal.isOpen) {
        window.vuesenseModal.close();
      } else {
        window.vuesenseModal.open();
      }
    }
  }
});