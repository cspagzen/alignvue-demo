/**
 * VueSense AI Modal - Complete Working Version with Conversation Management
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
    
    // Conversation management
    this.conversations = this.loadConversations();
    this.currentConversationId = null;
    
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
    this.renderConversationControls();
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
                </svg>
              </div>
              <div class="vuesense-modal-title-group">
                <h2 class="vuesense-modal-title">VueSense AI</h2>
                <p class="vuesense-modal-subtitle">Your intelligent assistant</p>
              </div>
            </div>
            
            <div class="vuesense-modal-actions">
              <button class="vuesense-modal-btn vuesense-settings-btn" onclick="window.vuesenseSettings?.open()" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/>
                </svg>
              </button>
              <button class="vuesense-modal-btn vuesense-expand-btn" onclick="window.vuesenseModal.toggleExpand()" title="Expand">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </button>
              <button class="vuesense-modal-btn vuesense-close-btn" onclick="window.vuesenseModal.close()" title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="vuesense-modal-body">
            <div id="vuesense-messages" class="vuesense-messages"></div>
          </div>
          
          <div class="vuesense-modal-footer">
            <div class="vuesense-input-container">
              <textarea 
                id="vuesense-input" 
                class="vuesense-input" 
                placeholder="Ask me anything about your portfolio..." 
                rows="1"
              ></textarea>
              <button id="vuesense-send-btn" class="vuesense-send-btn" title="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div class="vuesense-footer-info">
              <span id="vuesense-char-counter" class="vuesense-char-counter">0 / 2000</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  attachEventListeners() {
    this.trigger?.addEventListener('click', () => this.open());
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay && this.options.closeOnBackdrop) {
        this.close();
      }
    });
    
    this.sendBtn?.addEventListener('click', () => this.sendMessage());
    this.inputField?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.inputField?.addEventListener('input', () => {
      this.updateCharCounter();
      this.inputField.style.height = 'auto';
      this.inputField.style.height = Math.min(this.inputField.scrollHeight, 120) + 'px';
    });
  }
  
  renderWelcome() {
    const welcomeHTML = `
      <div class="vuesense-welcome">
        <div class="vuesense-welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
          </svg>
        </div>
        <h3 class="vuesense-welcome-title">Welcome to VueSense AI</h3>
        <p class="vuesense-welcome-text">I'm here to help you make data-driven decisions.</p>
        
        <div class="vuesense-suggestions">
          <div class="vuesense-suggestions-title">Try asking:</div>
          ${this.getSuggestedQuestions().map(q => `
            <button class="vuesense-suggestion-btn" onclick="window.vuesenseModal.askSuggestion('${q.text}')">
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
    const div = document.createElement('div');
    div.textContent = text;
    let safe = div.innerHTML;
    
    const codeBlocks = [];
    safe = safe.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const index = codeBlocks.length;
      codeBlocks.push({ lang: lang || 'text', code: code.trim() });
      return `__CODE_BLOCK_${index}__`;
    });
    
    safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
    safe = safe.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    safe = safe.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    safe = safe.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    
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
    
    if (inBulletList) processed.push('</ul>');
    if (inNumberedList) processed.push('</ol>');
    
    safe = processed.join('\n');
    
    const chunks = safe.split(/\n\n+/);
    safe = chunks.map(chunk => {
      chunk = chunk.trim();
      if (chunk.match(/^<(h[2-4]|ul|ol|pre|div)/)) {
        return chunk;
      }
      return chunk ? `<p>${chunk.replace(/\n/g, '<br>')}</p>` : '';
    }).filter(c => c).join('\n');
    
    safe = safe.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
      const block = codeBlocks[index];
      return `<pre><code class="language-${block.lang}">${block.code}</code></pre>`;
    });
    
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
  
  // Conversation Management Methods
  
  loadConversations() {
    const saved = localStorage.getItem('vuesense_conversations');
    return saved ? JSON.parse(saved) : [];
  }
  
  saveConversations() {
    localStorage.setItem('vuesense_conversations', JSON.stringify(this.conversations));
  }
  
  saveCurrentConversation(title = null) {
    if (this.messages.length === 0) {
      alert('No conversation to save');
      return;
    }
    
    const conversationTitle = title || prompt('Enter a name for this conversation:', 
      `Conversation ${new Date().toLocaleDateString()}`);
    
    if (!conversationTitle) return;
    
    const conversation = {
      id: Date.now(),
      title: conversationTitle,
      messages: [...this.messages],
      history: [...(window.aiEngine?.conversationHistory || [])],
      timestamp: new Date().toISOString(),
      messageCount: this.messages.length,
      cost: window.aiEngine?.costTracker?.getStats().totalCost || 0
    };
    
    this.conversations.unshift(conversation);
    if (this.conversations.length > 20) {
      this.conversations = this.conversations.slice(0, 20);
    }
    
    this.saveConversations();
    this.currentConversationId = conversation.id;
    
    this.showNotification('✅ Conversation saved successfully!');
  }
  
  loadConversation(conversationId) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    this.messages = [...conversation.messages];
    this.currentConversationId = conversationId;
    
    if (window.aiEngine && conversation.history) {
      window.aiEngine.conversationHistory = [...conversation.history];
    }
    
    this.messagesContainer.innerHTML = '';
    this.messages.forEach(msg => {
      this.addMessage(msg.text, msg.type);
    });
    
    this.showNotification(`📂 Loaded: ${conversation.title}`);
    this.toggleConversationMenu(); // Close menu after loading
  }
  
  newConversation() {
    if (this.messages.length > 0) {
      const shouldSave = confirm('Save current conversation before starting a new one?');
      if (shouldSave) {
        this.saveCurrentConversation();
      }
    }
    
    this.clearConversationData();
    this.currentConversationId = null;
    this.showNotification('🆕 Started new conversation');
    this.toggleConversationMenu(); // Close menu
  }
  
  clearConversationData() {
    if (this.messages.length > 0) {
      const confirmed = confirm('Clear current conversation? This cannot be undone.');
      if (!confirmed) return;
    }
    
    this.messages = [];
    this.messagesContainer.innerHTML = '';
    
    if (window.aiEngine) {
      window.aiEngine.clearHistory();
    }
    
    this.renderWelcome();
    this.currentConversationId = null;
    
    this.showNotification('🗑️ Conversation cleared');
    this.toggleConversationMenu(); // Close menu
  }
  
  deleteConversation(conversationId) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    const confirmed = confirm(`Delete "${conversation.title}"? This cannot be undone.`);
    if (!confirmed) return;
    
    this.conversations = this.conversations.filter(c => c.id !== conversationId);
    this.saveConversations();
    
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
    
    this.showNotification('🗑️ Conversation deleted');
    this.toggleConversationMenu(); // Refresh menu
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'vuesense-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 100000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  renderConversationControls() {
    const headerActions = document.querySelector('.vuesense-modal-actions');
    if (!headerActions) return;
    
    const menuBtn = document.createElement('button');
    menuBtn.className = 'vuesense-modal-btn vuesense-conversation-menu-btn';
    menuBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
      </svg>
    `;
    menuBtn.title = 'Conversation Options';
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleConversationMenu();
    };
    
    const settingsBtn = headerActions.querySelector('.vuesense-settings-btn');
    if (settingsBtn) {
      headerActions.insertBefore(menuBtn, settingsBtn);
    }
  }
  
  toggleConversationMenu() {
    let menu = document.getElementById('vuesense-conversation-menu');
    
    if (menu) {
      menu.remove();
      return;
    }
    
    menu = document.createElement('div');
    menu.id = 'vuesense-conversation-menu';
    menu.className = 'vuesense-dropdown-menu';
    menu.innerHTML = `
      <div class="vuesense-menu-section">
        <button class="vuesense-menu-item" onclick="window.vuesenseModal.saveCurrentConversation()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Save Conversation</span>
        </button>
        
        <button class="vuesense-menu-item" onclick="window.vuesenseModal.newConversation()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>New Conversation</span>
        </button>
        
        <button class="vuesense-menu-item danger" onclick="window.vuesenseModal.clearConversationData()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>Clear Conversation</span>
        </button>
      </div>
      
      ${this.conversations.length > 0 ? `
        <div class="vuesense-menu-divider"></div>
        <div class="vuesense-menu-section">
          <div class="vuesense-menu-label">Recent Conversations</div>
          ${this.conversations.slice(0, 5).map(conv => `
            <div class="vuesense-conversation-item ${conv.id === this.currentConversationId ? 'active' : ''}">
              <button class="vuesense-conversation-load" onclick="window.vuesenseModal.loadConversation(${conv.id})">
                <div class="vuesense-conversation-title">${this.escapeHtml(conv.title)}</div>
                <div class="vuesense-conversation-meta">${new Date(conv.timestamp).toLocaleString()} • ${conv.messageCount} msgs</div>
              </button>
              <button class="vuesense-conversation-delete" onclick="event.stopPropagation(); window.vuesenseModal.deleteConversation(${conv.id})" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
    
    const menuBtn = document.querySelector('.vuesense-conversation-menu-btn');
    if (menuBtn) {
      menuBtn.parentElement.appendChild(menu);
    }
    
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !e.target.closest('.vuesense-conversation-menu-btn')) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
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