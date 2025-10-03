/**
 * VueSense AI Modal - Phase 2: Chat Interface
 * Complete chat functionality with messages, input, and suggestions
 */

class VueSenseModal {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'center',
      size: options.size || 'default',
      closeOnBackdrop: options.closeOnBackdrop !== false,
      maxCharacters: options.maxCharacters || 500,
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
      <!-- VueSense AI Trigger Button -->
      <button id="vuesense-trigger" class="vuesense-trigger" aria-label="Open VueSense AI">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
          <path d="M20 2v4"/>
          <path d="M22 4h-4"/>
          <circle cx="4" cy="20" r="2"/>
        </svg>
      </button>
      
      <!-- VueSense AI Modal -->
      <div id="vuesense-modal-overlay" class="vuesense-modal-overlay">
        <div id="vuesense-modal" class="vuesense-modal">
          <!-- Header -->
          <div class="vuesense-modal-header">
            <div class="vuesense-modal-branding">
              <div class="vuesense-modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
                  <path d="M20 2v4"/>
                  <path d="M22 4h-4"/>
                  <circle cx="4" cy="20" r="2"/>
                </svg>
              </div>
              <div class="vuesense-modal-title-group">
                <h2 class="vuesense-modal-title">VueSense AI</h2>
                <p class="vuesense-modal-subtitle">Your intelligent assistant</p>
              </div>
            </div>
            
            <div class="vuesense-modal-controls">
              <button id="vuesense-minimize-btn" class="vuesense-modal-btn" title="Minimize" aria-label="Minimize modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <button id="vuesense-expand-btn" class="vuesense-modal-btn" title="Expand" aria-label="Expand modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/>
                  <path d="M3 16.2V21m0 0h4.8M3 21l6-6"/>
                  <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/>
                  <path d="M3 7.8V3m0 0h4.8M3 3l6 6"/>
                </svg>
              </button>
              <button id="vuesense-close-btn" class="vuesense-modal-btn" title="Close" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Chat Body -->
          <div class="vuesense-modal-body" style="padding: 0;">
            <div class="vuesense-chat-container">
              <div id="vuesense-messages" class="vuesense-messages"></div>
              
              <!-- Input Area -->
              <div class="vuesense-input-area">
                <div class="vuesense-input-wrapper">
                  <textarea 
                    id="vuesense-input" 
                    class="vuesense-input-field" 
                    placeholder="Ask me anything about your portfolio..."
                    rows="1"
                    maxlength="${this.options.maxCharacters}"
                  ></textarea>
                  <button id="vuesense-send-btn" class="vuesense-send-btn" aria-label="Send message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z"/>
                      <path d="M22 2 11 13"/>
                    </svg>
                  </button>
                </div>
                <div id="vuesense-char-counter" class="vuesense-char-counter">0 / ${this.options.maxCharacters}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  attachEventListeners() {
    // Trigger button
    this.trigger?.addEventListener('click', () => this.open());
    
    // Control buttons
    document.getElementById('vuesense-close-btn')?.addEventListener('click', () => this.close());
    document.getElementById('vuesense-minimize-btn')?.addEventListener('click', () => this.minimize());
    document.getElementById('vuesense-expand-btn')?.addEventListener('click', () => this.toggleExpand());
    
    // Send button
    this.sendBtn?.addEventListener('click', () => this.sendMessage());
    
    // Input field
    this.inputField?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.inputField?.addEventListener('input', () => this.updateCharCounter());
    
    // Auto-resize textarea
    this.inputField?.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Backdrop click
    if (this.options.closeOnBackdrop) {
      this.overlay?.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  renderWelcome() {
    const welcomeHTML = `
      <div class="vuesense-welcome">
        <div class="vuesense-welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
            <path d="M20 2v4"/>
            <path d="M22 4h-4"/>
            <circle cx="4" cy="20" r="2"/>
          </svg>
        </div>
        <h3>Welcome to VueSense AI</h3>
        <p>Ask me anything about your portfolio, teams, or initiatives. I'm here to help you make data-driven decisions.</p>
        
        <div class="vuesense-suggestions">
          <div class="vuesense-suggestions-title">Try asking:</div>
          ${this.getSuggestedQuestions().map(q => `
            <button class="vuesense-suggestion-btn" onclick="window.vuesenseModal.askQuestion('${q.text}')">
              <svg class="vuesense-suggestion-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  
  sendMessage() {
    const message = this.inputField?.value.trim();
    
    if (!message || this.isTyping) return;
    
    // Clear welcome if first message
    if (this.messages.length === 0) {
      this.messagesContainer.innerHTML = '';
    }
    
    // Add user message
    this.addMessage(message, 'user');
    
    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';
    this.updateCharCounter();
    
    // Show typing indicator
    this.showTyping();
    
    // Simulate AI response (Phase 3 will connect to real AI)
    setTimeout(() => {
      this.hideTyping();
      this.addMessage(this.generateMockResponse(message), 'ai');
    }, 1500);
  }
  
  addMessage(text, type) {
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const avatarIcon = type === 'user' 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>';
    
    const messageHTML = `
      <div class="vuesense-message ${type}">
        <div class="vuesense-message-avatar">
          ${avatarIcon}
        </div>
        <div class="vuesense-message-content">
          <div class="vuesense-message-bubble">${this.escapeHtml(text)}</div>
          <div class="vuesense-message-time">${time}</div>
        </div>
      </div>
    `;
    
    this.messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.messages.push({ text, type, time });
    this.scrollToBottom();
  }
  
  showTyping() {
    this.isTyping = true;
    this.sendBtn.disabled = true;
    
    const typingHTML = `
      <div id="vuesense-typing-indicator" class="vuesense-message ai">
        <div class="vuesense-message-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
          </svg>
        </div>
        <div class="vuesense-typing">
          <div class="vuesense-typing-dots">
            <div class="vuesense-typing-dot"></div>
            <div class="vuesense-typing-dot"></div>
            <div class="vuesense-typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    
    this.messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
    this.scrollToBottom();
  }
  
  hideTyping() {
    this.isTyping = false;
    this.sendBtn.disabled = false;
    document.getElementById('vuesense-typing-indicator')?.remove();
  }
  
  generateMockResponse(question) {
    const responses = {
      'focus': "Based on current data, I recommend focusing on initiatives in critical status and teams with capacity issues. The top priority should be addressing blocked dependencies.",
      'support': "Teams with red capacity indicators need immediate support. Consider redistributing work or bringing in additional resources for high-priority initiatives.",
      'risk': "Yes, I've identified 3 initiatives at risk: those with critical health status and overloaded team assignments. We should review these in your next planning session.",
      'capacity': "Current capacity bottlenecks are in Development and Infrastructure teams. They're at 120% utilization with multiple critical initiatives."
    };
    
    const lowerQ = question.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQ.includes(key)) {
        return response;
      }
    }
    
    return "I can help you analyze your portfolio data. In Phase 3, I'll be connected to your actual portfolio data to provide specific insights. For now, try asking about focus areas, team support needs, or initiative risks.";
  }
  
  updateCharCounter() {
    const counter = document.getElementById('vuesense-char-counter');
    const length = this.inputField?.value.length || 0;
    const max = this.options.maxCharacters;
    
    if (counter) {
      counter.textContent = `${length} / ${max}`;
      counter.classList.toggle('warning', length > max * 0.8);
      counter.classList.toggle('error', length >= max);
    }
  }
  
  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  open() {
    this.isOpen = true;
    this.isMinimized = false;
    this.overlay?.classList.add('active');
    this.trigger?.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    
    if (this.wasExpanded) {
      this.setSize('fullscreen');
      this.isExpanded = true;
    }
    
    setTimeout(() => this.inputField?.focus(), 300);
  }
  
  close() {
    this.isOpen = false;
    this.overlay?.classList.remove('active');
    this.trigger?.classList.remove('hidden');
    document.body.style.overflow = '';
    this.wasExpanded = this.isExpanded;
  }
  
  minimize() {
    this.isMinimized = true;
    this.close();
    console.log('Minimize to bubble - will be enhanced in future phase');
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

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.vuesenseModal = new VueSenseModal({
      position: 'center',
      size: 'default',
      maxCharacters: 500
    });
  });
} else {
  window.vuesenseModal = new VueSenseModal({
    position: 'center',
    size: 'default',
    maxCharacters: 500
  });
}