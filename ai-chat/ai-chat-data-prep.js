/**
 * VueSense AI Data Preparation - COMPLETE FIX
 * Extracts and formats portfolio data for AI context
 * NOW WITH JIRA COMMENT EXTRACTION!
 */

/**
 * Extract text from Jira's Atlassian Document Format
 * Handles the nested JSON structure used for rich text comments
 */
function extractTextFromJiraDoc(comment) {
  // Handle null/undefined
  if (!comment) return '';
  
  // If it's already a plain string, return it
  if (typeof comment === 'string') return comment;
  
  // If it's a simple object with a .text property
  if (comment.text && typeof comment.text === 'string') {
    return comment.text;
  }
  
  // Handle Jira Document Format (ADF)
  if (comment.type === 'doc' && Array.isArray(comment.content)) {
    return extractTextFromContent(comment.content);
  }
  
  // If it's an object with content array
  if (Array.isArray(comment.content)) {
    return extractTextFromContent(comment.content);
  }
  
  // Handle numbers or other types
  if (typeof comment === 'number' || typeof comment === 'boolean') {
    return String(comment);
  }
  
  // Last resort: stringify and log warning
  console.warn('⚠️ Unexpected comment format:', typeof comment, comment);
  return JSON.stringify(comment);
}

/**
 * Recursively extract text from Jira document content array
 */
function extractTextFromContent(contentArray) {
  if (!Array.isArray(contentArray)) return '';
  
  let text = '';
  
  for (const node of contentArray) {
    if (!node || typeof node !== 'object') continue;
    
    // Text nodes have a .text property
    if (node.text && typeof node.text === 'string') {
      text += node.text;
    }
    
    // Paragraphs, headings, etc have nested content
    if (Array.isArray(node.content)) {
      const nestedText = extractTextFromContent(node.content);
      text += nestedText;
      
      // Add space/newline after block elements
      if (['paragraph', 'heading'].includes(node.type)) {
        text += ' ';
      }
    }
    
    // Handle list items
    if (node.type === 'listItem' && Array.isArray(node.content)) {
      text += '• ' + extractTextFromContent(node.content) + ' ';
    }
  }
  
  return text.trim();
}

function preparePortfolioContext(boardData) {
  if (!boardData || typeof boardData !== 'object') {
    console.warn('Invalid boardData provided');
    return null;
  }
  
  try {
    const context = {
      summary: generateSummary(boardData),
      teams: extractTeamData(boardData),
      initiatives: extractInitiativeData(boardData),
      patterns: detectPatterns(boardData),
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Portfolio context prepared:', context);
    return context;
  } catch (error) {
    console.error('Error preparing portfolio context:', error);
    return null;
  }
}

function generateSummary(boardData) {
  const teams = boardData.teams || {};
  const teamCount = Object.keys(teams).length;
  const initiatives = boardData.initiatives || [];
  
  return {
    totalTeams: teamCount,
    totalInitiatives: initiatives.length,
    pipelineInitiatives: (boardData.bullpen || []).filter(x => x).length
  };
}

function extractTeamData(boardData) {
  const teams = boardData.teams || {};
  const initiatives = boardData.initiatives || [];
  
  console.log('📊 Extracting data for', Object.keys(teams).length, 'teams...');
  
  return Object.entries(teams).map(([name, data]) => {
    // Find initiatives this team is working on
    const teamInitiatives = initiatives.filter(init => 
      init.teams && init.teams.includes(name)
    );
    
    // Extract comment text from Jira doc format
    const rawComment = data.comments || '';
    const commentText = extractTextFromJiraDoc(rawComment);
    
    // Debug logging to see what we're extracting
    if (rawComment) {
      console.log(`\n🔍 Team: ${name}`);
      console.log('  Raw comment type:', typeof rawComment);
      if (typeof rawComment === 'object') {
        console.log('  Raw comment structure:', rawComment.type || 'no type', 
                    Array.isArray(rawComment.content) ? `${rawComment.content.length} content items` : 'no content');
      }
      console.log('  ✅ Extracted text:', commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''));
    }
    
    return {
      name,
      capacity: data.capacity || 'unknown',
      skillset: data.skillset || 'unknown',
      vision: data.vision || 'unknown',
      support: data.support || 'unknown',
      teamwork: data.teamwork || 'unknown',
      autonomy: data.autonomy || 'unknown',
      initiativeCount: teamInitiatives.length,
      utilization: data.jira?.utilization || 0,
      comments: commentText, // ✅ NOW PROPERLY EXTRACTED!
      currentWork: teamInitiatives.map(i => i.title || i.name).slice(0, 5)
    };
  });
}

function extractInitiativeData(boardData) {
  const initiatives = boardData.initiatives || [];
  
  return initiatives.map(init => ({
    title: init.title || init.name || 'Untitled',
    teams: init.teams || [],
    priority: init.priority,
    type: init.type || 'unknown',
    validation: init.validation || 'unknown',
    progress: init.progress || 0,
    stories: init.jira?.stories || 0,
    flagged: init.jira?.flagged || 0
  }));
}

function detectPatterns(boardData) {
  const teams = extractTeamData(boardData);
  const initiatives = extractInitiativeData(boardData);
  
  // Teams with capacity issues
  const capacityIssues = teams.filter(t => 
    t.capacity === 'Critical' || t.capacity === 'At Risk'
  );
  
  // Teams with high utilization
  const overloaded = teams.filter(t => t.utilization > 90);
  
  // Initiatives with issues
  const flaggedInits = initiatives.filter(i => i.flagged > 0);
  
  return {
    capacityIssues: capacityIssues.map(t => t.name),
    overloadedTeams: overloaded.map(t => t.name),
    flaggedInitiatives: flaggedInits.map(i => i.title),
    totalIssues: capacityIssues.length + overloaded.length + flaggedInits.length
  };
}

function formatContextForAI(context) {
  if (!context) return 'No portfolio data available.';
  
  let formatted = `PORTFOLIO OVERVIEW:
- Total Teams: ${context.summary.totalTeams}
- Total Initiatives: ${context.summary.totalInitiatives}
- Pipeline Initiatives: ${context.summary.pipelineInitiatives || 0}

`;

  // Teams with issues
  if (context.patterns.capacityIssues.length > 0) {
    formatted += `CAPACITY CONCERNS:
- Teams with capacity issues: ${context.patterns.capacityIssues.join(', ')}

`;
  }
  
  if (context.patterns.overloadedTeams.length > 0) {
    formatted += `OVERLOADED TEAMS (>90% utilization):
- ${context.patterns.overloadedTeams.join(', ')}

`;
  }
  
  if (context.patterns.flaggedInitiatives.length > 0) {
    formatted += `FLAGGED INITIATIVES:
- ${context.patterns.flaggedInitiatives.join(', ')}

`;
  }
  
  // Top teams summary WITH FULL COMMENTS
  const topTeams = context.teams.slice(0, 15); // Include more teams
  formatted += `KEY TEAMS:\n`;
  topTeams.forEach(t => {
    formatted += `\n- ${t.name}:\n`;
    formatted += `  Initiatives: ${t.initiativeCount}\n`;
    formatted += `  Capacity: ${t.capacity}\n`;
    formatted += `  Utilization: ${t.utilization}%\n`;
    
    // Include FULL comment text now that we're extracting it properly
    if (t.comments && t.comments.length > 0) {
      formatted += `  Team Comments: "${t.comments}"\n`;
    }
    
    if (t.currentWork && t.currentWork.length > 0) {
      formatted += `  Current Work: ${t.currentWork.join(', ')}\n`;
    }
  });
  
  console.log('📄 Formatted context length:', formatted.length, 'characters');
  
  return formatted;
}

console.log('✅ VueSense AI Data Prep with Jira Comment Extraction loaded');
