/**
 * VueSense AI Modal - Phase 1
 * UI Controller for modal interactions
 */

class VueSenseModal {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'center',
      size: options.size || 'default',
      closeOnBackdrop: options.closeOnBackdrop !== false,
      ...options
    };
    
    this.isOpen = false;
    this.isMinimized = false;
    this.isExpanded = false;
    
    this.init();
  }
  
  init() {
    // Create modal structure if it doesn't exist
    if (!document.getElementById('vuesense-modal-overlay')) {
      this.createModal();
    }
    
    // Cache DOM elements
    this.overlay = document.getElementById('vuesense-modal-overlay');
    this.modal = document.getElementById('vuesense-modal');
    this.trigger = document.getElementById('vuesense-trigger');
    
    // Attach event listeners
    this.attachEventListeners();
    
    // Apply initial position and size
    this.setPosition(this.options.position);
    this.setSize(this.options.size);
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
          
          <!-- Body -->
          <div id="vuesense-modal-body" class="vuesense-modal-body">
            <div style="color: var(--text-primary, #ffffff);">
              <h3 style="margin-top: 0;">Welcome to VueSense AI</h3>
              <p style="color: var(--text-secondary, rgba(255, 255, 255, 0.6));">
                This is the Phase 1 modal foundation. The chat interface will be added in the next phase.
              </p>
              <ul style="color: var(--text-secondary, rgba(255, 255, 255, 0.6));">
                <li>✓ Modal positioning system</li>
                <li>✓ Responsive sizing (optimized for 1600×900)</li>
                <li>✓ Smooth animations</li>
                <li>✓ Control buttons (minimize, expand, close)</li>
                <li>✓ VueSense AI branding</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="vuesense-modal-footer">
            <button onclick="window.vuesenseModal.close()" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; transition: all 150ms;">
              Close
            </button>
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
  
  open() {
    this.isOpen = true;
    this.isMinimized = false;
    this.overlay?.classList.add('active');
    this.trigger?.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    
    // Restore previous size if was expanded
    if (this.wasExpanded) {
      this.setSize('fullscreen');
      this.isExpanded = true;
    }
  }
  
  close() {
    this.isOpen = false;
    this.overlay?.classList.remove('active');
    this.trigger?.classList.remove('hidden');
    document.body.style.overflow = '';
    
    // Remember expanded state
    this.wasExpanded = this.isExpanded;
  }
  
  minimize() {
    this.isMinimized = true;
    this.close();
    // In Phase 2, this will minimize to a bubble
    console.log('Minimize functionality will be enhanced in Phase 2');
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
    
    // Remove all position classes
    const positions = ['center', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
    positions.forEach(pos => {
      this.overlay?.classList.remove(`position-${pos}`);
    });
    
    // Add new position class
    if (position !== 'center') {
      this.overlay?.classList.add(`position-${position}`);
    }
  }
  
  setSize(size) {
    this.options.size = size;
    
    // Remove all size classes
    const sizes = ['small', 'default', 'large', 'fullscreen'];
    sizes.forEach(sz => {
      this.modal?.classList.remove(`size-${sz}`);
    });
    
    // Add new size class
    this.modal?.classList.add(`size-${size}`);
  }
  
  setContent(content) {
    const body = document.getElementById('vuesense-modal-body');
    if (body) {
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else {
        body.innerHTML = '';
        body.appendChild(content);
      }
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.vuesenseModal = new VueSenseModal({
      position: 'center',
      size: 'default'
    });
  });
} else {
  window.vuesenseModal = new VueSenseModal({
    position: 'center',
    size: 'default'
  });
}