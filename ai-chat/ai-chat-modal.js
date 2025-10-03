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
        <p>Ask me anything about your portfolio, teams, or initiatives. I'm here to help you make data-driven decisions.</p>
        
        <div class="vuesense-suggestions">
          <div class="vuesense-suggestions-title">Try asking:</div>
          ${this.getSuggestedQuestions().map(q => `
            <button class="vuesense-suggestion-btn" onclick="window.vuesenseModal.askQuestion('${q.text}')">
              <svg class="vuesense-suggestion-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
              </svg>
              <span>${q.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    this.messagesContainer.innerHTML = welcomeHTML;
  }
  
  getSuggestedQuestions() {
    return [
      { text: "What should I focus on this week?" },
      { text: "Which teams need the most support?" },
      { text: "Are any initiatives at risk?" },
      { text: "Show me capacity bottlenecks" }
    ];
  }
  
  askQuestion(question) {
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
    const div = document.createElement('div');
    div.textContent = text;
    let safe = div.innerHTML;
    
    safe = safe.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });
    
    safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
    safe = safe.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    safe = safe.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    safe = safe.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    
    const lines = safe.split('\n');
    const processed = [];
    let inList = false;
    
    for (const line of lines) {
      const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)$/);
      if (bulletMatch) {
        if (!inList) {
          processed.push('<ul>');
          inList = true;
        }
        processed.push(`<li>${bulletMatch[1]}</li>`);
      } else {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        processed.push(line);
      }
    }
    
    if (inList) processed.push('</ul>');
    
    safe = processed.join('\n');
    safe = safe.replace(/\n\n+/g, '</p><p>');
    safe = safe.replace(/\n(?!<)/g, '<br>');
    
    if (!safe.match(/^</)) {
      safe = '<p>' + safe + '</p>';
    }
    
    safe = safe.replace(/<p><\/p>/g, '');
    
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
          <div class="vuesense-typing-indicator">
            <span></span><span></span><span></span>
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