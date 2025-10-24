/**
 * VueSense AI - Message Processing with Formatting and Clickable Entities
 * FIXED: Removed inline color styles, let CSS handle colors
 */

// ====================================================================
// STEP 1: FORMAT MARKDOWN TO HTML
// ====================================================================

function formatMarkdown(text) {
  if (!text) return '';
  
  let formatted = text;
  
  // Headers - NO INLINE COLORS, just structure
  formatted = formatted.replace(/^### (.*$)/gim, '<h4>$1</h4>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h3>$1</h3>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h2>$1</h2>');
  
  // Bold text - NO COLOR FORCING
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic text
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bullet lists
  const bulletPattern = /^[\-\*] (.+)$/gim;
  formatted = formatted.replace(bulletPattern, '<li>$1</li>');
  
  // Wrap list items in ul
  const ulPattern = /(<li[^>]*>.*?<\/li>\s*)+/g;
  formatted = formatted.replace(ulPattern, '<ul>$&</ul>');
  
  // Numbered lists
  const numberedPattern = /^(\d+)\. (.+)$/gim;
  formatted = formatted.replace(numberedPattern, '<li>$2</li>');
  
  // Wrap numbered items in ol
  const olPattern = /(<li[^>]*>.*?<\/li>\s*)+/g;
  formatted = formatted.replace(olPattern, (match) => {
    if (!match.includes('value=')) {
      return '<ol>' + match + '</ol>';
    }
    return match;
  });
  
  // Paragraphs
  formatted = formatted.split('\n\n').map(para => {
    para = para.trim();
    if (para && !para.startsWith('<h') && !para.startsWith('<ul') && !para.startsWith('<ol')) {
      return '<p>' + para + '</p>';
    }
    return para;
  }).join('\n');
  
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

// ====================================================================
// STEP 2: MAKE ENTITIES CLICKABLE
// ====================================================================

function makeEntitiesClickableInHTML(html) {
  if (!window.boardData || !html) return html;
  
  const initiatives = window.boardData.initiatives || [];
  const teams = Object.keys(window.boardData.teams || {});
  
  const entityMap = new Map();
  
  // Add initiatives
  initiatives.forEach(init => {
    entityMap.set(init.title, {
      type: 'initiative',
      data: init
    });
  });
  
  // Add teams
  teams.forEach(teamName => {
    entityMap.set(teamName, {
      type: 'team',
      data: window.boardData.teams[teamName],
      name: teamName
    });
  });
  
  // Sort by length (longest first)
  const sortedEntities = Array.from(entityMap.keys()).sort((a, b) => b.length - a.length);
  
  let processedHTML = html;
  
  sortedEntities.forEach(entityName => {
    const entity = entityMap.get(entityName);
    const escapedName = entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match whole words only, not inside tags
    const parts = processedHTML.split(new RegExp('(<[^>]+>)', 'gi'));
    
    processedHTML = parts.map((part, index) => {
      // Even indices are text, odd indices are tags
      if (index % 2 === 0) {
        const wordBoundary = new RegExp('\\b' + escapedName + '\\b', 'gi');
        return part.replace(wordBoundary, (match) => {
          if (entity.type === 'initiative') {
            return createInitiativeLink(match, entity.data);
          } else {
            return createTeamLink(match, entity.name, entity.data);
          }
        });
      }
      return part;
    }).join('');
  });
  
  return processedHTML;
}

function createInitiativeLink(displayText, initiative) {
  const typeColors = {
    'strategic': '#3b82f6',
    'ktlo': '#f59e0b',
    'emergent': '#8b5cf6'
  };
  
  const color = typeColors[initiative.type] || '#3b82f6';
  const escapedTitle = escapeHtml(initiative.title);
  
  return '<span class="ai-entity-link ai-entity-initiative" ' +
         'data-initiative-id="' + initiative.id + '" ' +
         'onclick="openInitiativeFromAI(\'' + initiative.id + '\'); event.stopPropagation();" ' +
         'style="color: ' + color + '; cursor: pointer; text-decoration: underline; text-decoration-style: dotted; font-weight: 500;" ' +
         'title="Click to view ' + escapedTitle + ' details">' + displayText + '</span>';
}

function createTeamLink(displayText, teamName, teamData) {
  const healthLevel = getTeamHealthLevelForLink(teamData);
  const healthColors = {
    'healthy': '#10b981',
    'low-risk': '#3b82f6',
    'high-risk': '#f59e0b',
    'critical': '#ef4444'
  };
  
  const color = healthColors[healthLevel] || '#6b7280';
  const escapedName = escapeHtml(teamName);
  
  return '<span class="ai-entity-link ai-entity-team" ' +
         'data-team-name="' + escapedName + '" ' +
         'onclick="openTeamFromAI(\'' + escapedName + '\'); event.stopPropagation();" ' +
         'style="color: ' + color + '; cursor: pointer; text-decoration: underline; text-decoration-style: dotted; font-weight: 500;" ' +
         'title="Click to view ' + escapedName + ' health details">' + displayText + '</span>';
}

function getTeamHealthLevelForLink(teamData) {
  if (!teamData) return 'healthy';
  
  let atRiskCount = 0;
  const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
  
  dimensions.forEach(function(dim) {
    const value = teamData[dim];
    if (value === 'critical' || value === 'Critical') {
      atRiskCount += 2;
    } else if (value === 'at-risk' || value === 'At Risk') {
      atRiskCount += 1;
    }
  });
  
  if (atRiskCount === 0) return 'healthy';
  if (atRiskCount <= 2) return 'low-risk';
  if (atRiskCount <= 4) return 'high-risk';
  return 'critical';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ====================================================================
// STEP 3: COMBINED PROCESSING
// ====================================================================

function processAIResponse(text) {
  if (!text) return '';
  
  // Step 1: Format markdown
  let formatted = formatMarkdown(text);
  
  // Step 2: Make entities clickable
  formatted = makeEntitiesClickableInHTML(formatted);
  
  return formatted;
}

// ====================================================================
// MODAL OPENING FUNCTIONS
// ====================================================================

function openInitiativeFromAI(initiativeId) {
  const initiative = window.boardData.initiatives.find(function(i) {
    return i.id === initiativeId;
  });
  
  if (!initiative) {
    console.error('Initiative not found:', initiativeId);
    return;
  }
  
  if (window.vuesenseModal) {
    window.vuesenseModal.minimize();
  }
  
  setTimeout(function() {
    if (typeof showInitiativeModal === 'function') {
      showInitiativeModal(initiative);
    }
  }, 150);
}

function openTeamFromAI(teamName) {
  const teamData = window.boardData.teams[teamName];
  
  if (!teamData) {
    console.error('Team not found:', teamName);
    return;
  }
  
  if (window.vuesenseModal) {
    window.vuesenseModal.minimize();
  }
  
  setTimeout(function() {
    if (typeof showTeamModal === 'function') {
      showTeamModal(teamName, teamData);
    }
  }, 150);
}

// ====================================================================
// MAKE FUNCTIONS GLOBAL
// ====================================================================

window.processAIResponse = processAIResponse;
window.formatMarkdown = formatMarkdown;
window.makeEntitiesClickableInHTML = makeEntitiesClickableInHTML;
window.openInitiativeFromAI = openInitiativeFromAI;
window.openTeamFromAI = openTeamFromAI;

console.log('✅ VueSense AI Entity Links loaded');
