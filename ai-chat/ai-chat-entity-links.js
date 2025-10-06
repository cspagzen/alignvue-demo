/**
 * VueSense AI - Clickable Entity Detection System
 * Makes initiative and team names in AI responses clickable to open their modals
 * 
 * Add this to your ai-chat-modal.js file
 */

// ====================================================================
// ENTITY DETECTION & LINKING SYSTEM
// ====================================================================

/**
 * Process AI response text to make entity names clickable
 * @param {string} text - The AI response text
 * @returns {string} HTML with clickable entity links
 */
function makeEntitiesClickable(text) {
  if (!window.boardData) return text;
  
  // Get all initiatives and teams from boardData
  const initiatives = window.boardData.initiatives || [];
  const teams = Object.keys(window.boardData.teams || {});
  
  // Create a map of entity names to their data for exact matching
  const entityMap = new Map();
  
  // Add initiatives
  initiatives.forEach(init => {
    entityMap.set(init.title, {
      type: 'initiative',
      data: init,
      displayName: init.title
    });
  });
  
  // Add teams
  teams.forEach(teamName => {
    entityMap.set(teamName, {
      type: 'team',
      data: window.boardData.teams[teamName],
      displayName: teamName
    });
  });
  
  // Sort entities by length (longest first) to match longer names first
  // This prevents "Platform" from matching when "Platform Core" exists
  const sortedEntities = Array.from(entityMap.keys())
    .sort((a, b) => b.length - a.length);
  
  // Process the text
  let processedText = text;
  const replacements = [];
  
  // Find all entity mentions and store their positions
  sortedEntities.forEach(entityName => {
    const entity = entityMap.get(entityName);
    
    // Create regex that matches the entity name as a whole word
    // Use word boundaries but handle special characters
    const escapedName = entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
    
    let match;
    while ((match = regex.exec(processedText)) !== null) {
      // Check if this position is already inside an HTML tag or link
      if (!isInsideTag(processedText, match.index)) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          original: match[0],
          entity: entity,
          entityName: entityName
        });
      }
    }
  });
  
  // Sort replacements by position (descending) to replace from end to start
  replacements.sort((a, b) => b.start - a.start);
  
  // Remove overlapping replacements (keep the first/longest match)
  const filteredReplacements = [];
  let lastEnd = Infinity;
  
  replacements.forEach(replacement => {
    if (replacement.end <= lastEnd) {
      filteredReplacements.push(replacement);
      lastEnd = replacement.start;
    }
  });
  
  // Apply replacements
  filteredReplacements.forEach(replacement => {
    const { start, end, original, entity, entityName } = replacement;
    
    let clickableLink;
    if (entity.type === 'initiative') {
      clickableLink = createInitiativeLink(original, entity.data);
    } else {
      clickableLink = createTeamLink(original, entity.displayName, entity.data);
    }
    
    processedText = processedText.substring(0, start) + 
                    clickableLink + 
                    processedText.substring(end);
  });
  
  return processedText;
}

/**
 * Check if a position in text is inside an HTML tag
 */
function isInsideTag(text, position) {
  let openTag = text.lastIndexOf('<', position);
  let closeTag = text.lastIndexOf('>', position);
  return openTag > closeTag;
}

/**
 * Create a clickable link for an initiative
 */
function createInitiativeLink(displayText, initiative) {
  const typeColors = {
    'strategic': 'var(--type-strategic, #3b82f6)',
    'ktlo': 'var(--type-ktlo, #f59e0b)',
    'emergent': 'var(--type-emergent, #8b5cf6)'
  };
  
  const color = typeColors[initiative.type] || '#3b82f6';
  
  return `<span class="ai-entity-link ai-entity-initiative" 
                data-initiative-id="${initiative.id}"
                onclick="openInitiativeFromAI('${initiative.id}')"
                style="color: ${color}; cursor: pointer; text-decoration: underline; text-decoration-style: dotted; font-weight: 500;"
                title="Click to view ${initiative.title} details">${displayText}</span>`;
}

/**
 * Create a clickable link for a team
 */
function createTeamLink(displayText, teamName, teamData) {
  // Determine team health color
  const healthLevel = getTeamHealthLevelForLink(teamData);
  const healthColors = {
    'healthy': '#10b981',
    'low-risk': '#3b82f6',
    'high-risk': '#f59e0b',
    'critical': '#ef4444'
  };
  
  const color = healthColors[healthLevel] || '#6b7280';
  
  return `<span class="ai-entity-link ai-entity-team" 
                data-team-name="${escapeHtml(teamName)}"
                onclick="openTeamFromAI('${escapeHtml(teamName)}')"
                style="color: ${color}; cursor: pointer; text-decoration: underline; text-decoration-style: dotted; font-weight: 500;"
                title="Click to view ${teamName} health details">${displayText}</span>`;
}

/**
 * Get team health level for color coding
 */
function getTeamHealthLevelForLink(teamData) {
  if (!teamData) return 'healthy';
  
  let atRiskCount = 0;
  const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
  
  dimensions.forEach(dim => {
    const value = teamData[dim];
    if (value === 'critical' || value === 'Critical') atRiskCount += 2;
    else if (value === 'at-risk' || value === 'At Risk') atRiskCount += 1;
  });
  
  if (atRiskCount === 0) return 'healthy';
  if (atRiskCount <= 2) return 'low-risk';
  if (atRiskCount <= 4) return 'high-risk';
  return 'critical';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ====================================================================
// MODAL OPENING FUNCTIONS (called from clickable links)
// ====================================================================

/**
 * Open initiative modal from AI chat link
 */
function openInitiativeFromAI(initiativeId) {
  const initiative = window.boardData.initiatives.find(i => i.id === initiativeId);
  
  if (!initiative) {
    console.error('Initiative not found:', initiativeId);
    return;
  }
  
  // Close the AI chat modal first
  if (window.vuesenseModal) {
    window.vuesenseModal.minimize();
  }
  
  // Small delay to allow modal to close smoothly
  setTimeout(() => {
    // Call your existing showInitiativeModal function
    if (typeof showInitiativeModal === 'function') {
      showInitiativeModal(initiative);
    } else {
      console.error('showInitiativeModal function not found');
    }
  }, 150);
}

/**
 * Open team modal from AI chat link
 */
function openTeamFromAI(teamName) {
  const teamData = window.boardData.teams[teamName];
  
  if (!teamData) {
    console.error('Team not found:', teamName);
    return;
  }
  
  // Close the AI chat modal first
  if (window.vuesenseModal) {
    window.vuesenseModal.minimize();
  }
  
  // Small delay to allow modal to close smoothly
  setTimeout(() => {
    // Call your existing showTeamModal function
    if (typeof showTeamModal === 'function') {
      showTeamModal(teamName, teamData);
    } else {
      console.error('showTeamModal function not found');
    }
  }, 150);
}

// ====================================================================
// INTEGRATION WITH EXISTING addMessage FUNCTION
// ====================================================================

/**
 * Modified addMessage function that processes AI responses for clickable entities
 * 
 * REPLACE your existing addMessage function with this version:
 */
function addMessageWithClickableEntities(text, type) {
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  const avatarIcon = type === 'user' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>`;
  
  // Process text for clickable entities ONLY for AI messages
  const processedText = type === 'ai' ? makeEntitiesClickable(text) : escapeHtml(text);
  
  const messageHTML = `
    <div class="vuesense-message ${type}">
      <div class="vuesense-message-avatar">
        ${avatarIcon}
      </div>
      <div class="vuesense-message-content">
        <div class="vuesense-message-bubble">
          ${processedText}
        </div>
        <div class="vuesense-message-time">${time}</div>
      </div>
    </div>
  `;
  
  // Store message
  this.messages.push({ text, type, time });
  
  // Append to container
  this.messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
  this.scrollToBottom();
}

// ====================================================================
// CSS STYLES FOR CLICKABLE ENTITIES
// ====================================================================

const CLICKABLE_ENTITY_STYLES = `
/* Clickable Entity Links in AI Responses */

.ai-entity-link {
  position: relative;
  transition: all 0.2s ease;
  border-radius: 2px;
  padding: 0 2px;
}

.ai-entity-link:hover {
  background: rgba(255, 255, 255, 0.1);
  text-decoration-style: solid !important;
}

.ai-entity-link:active {
  transform: translateY(1px);
}

/* Initiative Links */
.ai-entity-initiative:hover {
  background: rgba(59, 130, 246, 0.1);
}

/* Team Links - color coded by health */
.ai-entity-team:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Tooltip enhancement (optional) */
.ai-entity-link::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.ai-entity-link:hover::after {
  opacity: 1;
}
`;

// ====================================================================
// EXAMPLE USAGE
// ====================================================================

/**
 * Example: How to update your existing addMessage calls
 * 
 * OPTION 1: Update the addMessage method in VueSenseModal class
 * Replace the addMessage method with addMessageWithClickableEntities
 * 
 * OPTION 2: Wrap existing addMessage
 * Keep your existing addMessage and just process the text first:
 */

/*
// In your VueSenseModal class, modify the addMessage method:

addMessage(text, type) {
  // Process text for clickable entities if it's an AI message
  const processedText = type === 'ai' ? makeEntitiesClickable(text) : text;
  
  // Your existing addMessage code, but use processedText instead of text
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  const avatarIcon = type === 'user' 
    ? '...'
    : '...';
  
  const messageHTML = `
    <div class="vuesense-message ${type}">
      <div class="vuesense-message-avatar">${avatarIcon}</div>
      <div class="vuesense-message-content">
        <div class="vuesense-message-bubble">${processedText}</div>
        <div class="vuesense-message-time">${time}</div>
      </div>
    </div>
  `;
  
  this.messages.push({ text, type, time });
  this.messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
  this.scrollToBottom();
}
*/

// ====================================================================
// INITIALIZATION
// ====================================================================

console.log('✅ VueSense AI Clickable Entities System loaded');

// Make functions globally available
window.openInitiativeFromAI = openInitiativeFromAI;
window.openTeamFromAI = openTeamFromAI;
window.makeEntitiesClickable = makeEntitiesClickable;