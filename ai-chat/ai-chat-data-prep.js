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
  console.warn('Ã¢Å¡Â Ã¯Â¸Â Unexpected comment format:', typeof comment, comment);
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
      text += 'Ã¢â‚¬Â¢ ' + extractTextFromContent(node.content) + ' ';
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
      deliveryConfidence: calculateDeliveryConfidence(boardData),
      teams: extractTeamData(boardData),
      initiatives: extractInitiativeData(boardData),
      patterns: detectPatterns(boardData),
      timestamp: new Date().toISOString()
    };
    
    console.log('Ã¢Å“â€¦ Portfolio context prepared:', context);
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

/**
 * Calculate Portfolio Delivery Confidence
 * EXACT COPY from script.js - must stay in sync!
 */
function calculateDeliveryConfidence(boardData) {
  let confidence = 90; // Start at 90%
  
  // Get row/col helper function
  function getRowColFromSlot(slotNumber) {
    const row = Math.ceil(slotNumber / 5);
    const col = ((slotNumber - 1) % 5) + 1;
    return { row, col };
  }
  
  // Define "above the line" and "below the line" 
  // Rows 1-5 are above the line (NOW and NEXT timeframes)
  // Rows 6-8 are below the line (LATER timeframe)
  const aboveTheLine = boardData.initiatives.filter(init => {
    if (init.priority === 'bullpen') return false;
    const row = getRowColFromSlot(init.priority).row;
    return row <= 5;
  });
  
  const belowTheLine = boardData.initiatives.filter(init => {
    if (init.priority === 'bullpen') return false;
    const row = getRowColFromSlot(init.priority).row;
    return row > 5;
  });
  
  // =========================================================================
  // SECTION 1: ABOVE THE LINE RISKS (High Priority Work) - FULL WEIGHT
  // =========================================================================
  
  const aboveLineTeams = new Set();
  aboveTheLine.forEach(init => {
    init.teams.forEach(team => aboveLineTeams.add(team));
  });
  
  // 1A. CAPACITY RISKS - Above the line (-4% each)
  const capacityRisksAbove = Array.from(aboveLineTeams).filter(teamName => {
    const team = boardData.teams[teamName];
    return team && (team.capacity === 'Critical' || team.capacity === 'At Risk' || 
           team.capacity === 'critical' || team.capacity === 'at-risk');
  }).length;
  confidence -= capacityRisksAbove * 4;
  
  // 1B. SKILLSET RISKS - Above the line (-3% each)
  const skillsetRisksAbove = Array.from(aboveLineTeams).filter(teamName => {
    const team = boardData.teams[teamName];
    return team && (team.skillset === 'Critical' || team.skillset === 'At Risk' || 
           team.skillset === 'critical' || team.skillset === 'at-risk');
  }).length;
  confidence -= skillsetRisksAbove * 3;
  
  // 1C. BLOCKED WORK - Above the line only (-0.5% per item, max -15%)
  const blockedItemsAbove = aboveTheLine.reduce((total, init) => {
    return total + (init.jira?.flagged || 0);
  }, 0);
  const blockerPenalty = Math.min(blockedItemsAbove * 0.5, 15);
  confidence -= blockerPenalty;
  
  // 1D. STAGNANT INITIATIVES - Above the line only (-3% each)
  const stagnantAbove = aboveTheLine.filter(init => {
    return init.progress < 25;
  }).length;
  confidence -= stagnantAbove * 3;
  
  // 1E. OVER-UTILIZATION - All teams (-2% each)
  const overUtilizedTeams = Object.values(boardData.teams).filter(team => {
    return (team.jira?.utilization || 0) > 95;
  }).length;
  confidence -= overUtilizedTeams * 2;
  
  // 1F. SUPPORT RISKS - Above the line teams only (-2% each)
  const supportRisksAbove = Array.from(aboveLineTeams).filter(teamName => {
    const team = boardData.teams[teamName];
    return team && (team.support === 'Critical' || team.support === 'At Risk' || 
           team.support === 'critical' || team.support === 'at-risk');
  }).length;
  confidence -= supportRisksAbove * 2;
  
  // =========================================================================
  // SECTION 2: BELOW THE LINE RISKS - REDUCED WEIGHT (50%)
  // =========================================================================
  
  const belowLineTeams = new Set();
  belowTheLine.forEach(init => {
    init.teams.forEach(team => belowLineTeams.add(team));
  });
  
  // 2A. CAPACITY RISKS - Below the line (-2% each, 50% weight)
  const capacityRisksBelow = Array.from(belowLineTeams).filter(teamName => {
    const team = boardData.teams[teamName];
    return team && (team.capacity === 'Critical' || team.capacity === 'At Risk' || 
           team.capacity === 'critical' || team.capacity === 'at-risk');
  }).length;
  confidence -= capacityRisksBelow * 2;
  
  // 2B. SKILLSET RISKS - Below the line (-1.5% each, 50% weight)
  const skillsetRisksBelow = Array.from(belowLineTeams).filter(teamName => {
    const team = boardData.teams[teamName];
    return team && (team.skillset === 'Critical' || team.skillset === 'At Risk' || 
           team.skillset === 'critical' || team.skillset === 'at-risk');
  }).length;
  confidence -= skillsetRisksBelow * 1.5;
  
  // =========================================================================
  // SECTION 3: DISTRACTION PENALTY
  // =========================================================================
  
  const activeWorkBelowLine = belowTheLine.filter(init => {
    return init.progress > 10; // More than just started
  }).length;
  
  const distractionPenalty = Math.floor(activeWorkBelowLine / 3) * 2;
  confidence -= distractionPenalty;
  
  // =========================================================================
  // SECTION 4: FOCUS BONUS
  // =========================================================================
  
  let focusBonus = 0;
  if (activeWorkBelowLine === 0) {
    focusBonus = 3; // Perfect focus!
  } else if (activeWorkBelowLine <= 2) {
    focusBonus = 2;
  } else if (activeWorkBelowLine <= 4) {
    focusBonus = 1;
  }
  confidence += focusBonus;
  
  // Ensure confidence stays within reasonable bounds
  confidence = Math.max(confidence, 45);
  confidence = Math.min(confidence, 95);
  
  // Determine rating based on confidence level
  let rating;
  if (confidence >= 85) {
    rating = 'Excellent';
  } else if (confidence >= 70) {
    rating = 'Good';
  } else if (confidence >= 55) {
    rating = 'Fair';
  } else {
    rating = 'At Risk';
  }
  
  return {
    score: Math.round(confidence),
    rating: rating,
    breakdown: {
      capacityAbove: capacityRisksAbove,
      skillsetAbove: skillsetRisksAbove,
      blockersAbove: blockedItemsAbove,
      blockerPenalty: Math.round(blockerPenalty),
      stagnantAbove: stagnantAbove,
      supportAbove: supportRisksAbove,
      capacityBelow: capacityRisksBelow,
      skillsetBelow: skillsetRisksBelow,
      overUtilization: overUtilizedTeams,
      activeWorkBelowLine: activeWorkBelowLine,
      distractionPenalty: distractionPenalty,
      focusBonus: focusBonus,
      totalAboveLineInitiatives: aboveTheLine.length,
      totalBelowLineInitiatives: belowTheLine.length
    }
  };
}

/**
 * Calculate Portfolio Risk Score for a team
 * Mirrors calculateRiskBreakdown from script.js
 */
function calculateTeamRiskScore(teamName, allInitiatives) {
  // Find initiatives this team is working on
  const teamInitiatives = allInitiatives.filter(init => 
    init.teams && init.teams.includes(teamName)
  );
  
  if (teamInitiatives.length === 0) {
    return { total: 0, health: 0, validation: 0, blockers: 0, focus: 0 };
  }
  
  let healthScore = 0;
  let validationScore = 0;
  let blockersScore = 0;
  let focusScore = 0;
  
  // For each initiative, calculate risk components
  teamInitiatives.forEach(init => {
    // Health risk - base score per initiative
    healthScore += 5;
    
    // Validation risk
    const validation = (init.validation || '').toLowerCase();
    if (validation === 'not validated' || validation === 'notvalidated') {
      validationScore += 10;
    } else if (validation === 'validating') {
      validationScore += 5;
    }
    
    // Blockers risk
    const flagged = init.jira?.flagged || 0;
    blockersScore += flagged * 5;
    
    // Focus & Load risk - base per initiative
    focusScore += 3;
  });
  
  // Add risk for having too many initiatives (more than 3)
  if (teamInitiatives.length > 3) {
    focusScore += (teamInitiatives.length - 3) * 5;
  }
  
  const total = healthScore + validationScore + blockersScore + focusScore;
  
  return {
    total: Math.round(total),
    health: Math.round(healthScore),
    validation: Math.round(validationScore),
    blockers: Math.round(blockersScore),
    focus: Math.round(focusScore)
  };
}

function extractTeamData(boardData) {
  const teams = boardData.teams || {};
  const initiatives = boardData.initiatives || [];
  
  console.log('Ã°Å¸â€œÅ  Extracting data for', Object.keys(teams).length, 'teams...');
  
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
      console.log(`\nÃ°Å¸â€Â Team: ${name}`);
      console.log('  Raw comment type:', typeof rawComment);
      if (typeof rawComment === 'object') {
        console.log('  Raw comment structure:', rawComment.type || 'no type', 
                    Array.isArray(rawComment.content) ? `${rawComment.content.length} content items` : 'no content');
      }
      console.log('  Ã¢Å“â€¦ Extracted text:', commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''));
    }
    
    // Calculate portfolio risk score for this team
    const riskScore = calculateTeamRiskScore(name, initiatives);
    
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
      activeStories: data.jira?.stories || 0,  // âœ… ADDED
      blockers: data.jira?.blockers || 0,  // âœ… FIXED: Read from .blockers not .flagged
      portfolioRiskScore: riskScore.total,  // âœ… ADDED
      riskBreakdown: riskScore,  // âœ… ADDED (health, validation, blockers, focus)
      comments: commentText, // Ã¢Å“â€¦ NOW PROPERLY EXTRACTED!
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
    flagged: init.jira?.flagged || 0,
    // âœ… OPPORTUNITY CANVAS FIELDS
    customer: init.canvas?.customer || 'N/A',
    problem: init.canvas?.problem || 'N/A',
    solution: init.canvas?.solution || 'N/A',
    marketSize: init.canvas?.marketSize || 'N/A',
    keyResult: init.canvas?.keyResult || 'N/A',
    successMetrics: init.canvas?.measures || 'N/A',
    alternatives: init.canvas?.alternatives || 'N/A'
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

PORTFOLIO DELIVERY CONFIDENCE:
- Score: ${context.deliveryConfidence.score}% (${context.deliveryConfidence.rating})
- Above the Line Initiatives: ${context.deliveryConfidence.breakdown.totalAboveLineInitiatives}
- Below the Line Initiatives: ${context.deliveryConfidence.breakdown.totalBelowLineInitiatives}
- Capacity Risks (Above): ${context.deliveryConfidence.breakdown.capacityAbove} teams (-${context.deliveryConfidence.breakdown.capacityAbove * 4}%)
- Skillset Risks (Above): ${context.deliveryConfidence.breakdown.skillsetAbove} teams (-${context.deliveryConfidence.breakdown.skillsetAbove * 3}%)
- Blocked Work Items: ${context.deliveryConfidence.breakdown.blockersAbove} items (-${context.deliveryConfidence.breakdown.blockerPenalty}%)
- Stagnant Initiatives: ${context.deliveryConfidence.breakdown.stagnantAbove} (<25% progress, -${context.deliveryConfidence.breakdown.stagnantAbove * 3}%)
- Over-Utilized Teams: ${context.deliveryConfidence.breakdown.overUtilization} teams (-${context.deliveryConfidence.breakdown.overUtilization * 2}%)
- Active Work Below Line: ${context.deliveryConfidence.breakdown.activeWorkBelowLine} initiatives (-${context.deliveryConfidence.breakdown.distractionPenalty}%)
- Focus Bonus: +${context.deliveryConfidence.breakdown.focusBonus}%

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
  
  // Top teams summary WITH FULL COMMENTS AND METRICS
  const topTeams = context.teams.slice(0, 15); // Include more teams
  formatted += `KEY TEAMS:\n`;
  topTeams.forEach(t => {
    formatted += `\n- ${t.name}:\n`;
    formatted += `  Initiatives: ${t.initiativeCount}\n`;
    formatted += `  Capacity: ${t.capacity}\n`;
    formatted += `  Utilization: ${t.utilization}%\n`;
    formatted += `  Active Stories: ${t.activeStories}\n`;
    formatted += `  Blockers: ${t.blockers}\n`;
    formatted += `  Portfolio Risk Score: ${t.portfolioRiskScore} (Health: ${t.riskBreakdown.health}, Validation: ${t.riskBreakdown.validation}, Blockers: ${t.riskBreakdown.blockers}, Focus: ${t.riskBreakdown.focus})\n`;
    
    // Include FULL comment text now that we're extracting it properly
    if (t.comments && t.comments.length > 0) {
      formatted += `  Team Comments: "${t.comments}"\n`;
    }
    
    if (t.currentWork && t.currentWork.length > 0) {
      formatted += `  Current Work: ${t.currentWork.join(', ')}\n`;
    }
  });
  
  // INITIATIVES WITH OPPORTUNITY CANVAS DATA
  formatted += `\n\nKEY INITIATIVES:\n`;
  context.initiatives.forEach(init => {
    formatted += `\n- ${init.title}:\n`;
    formatted += `  Type: ${init.type}\n`;
    formatted += `  Teams: ${init.teams.join(', ')}\n`;
    formatted += `  Validation: ${init.validation}\n`;
    formatted += `  Progress: ${init.progress}%\n`;
    formatted += `  Stories: ${init.stories}, Flagged: ${init.flagged}\n`;
    
    // OPPORTUNITY CANVAS FIELDS
    if (init.customer && init.customer !== 'N/A') {
      formatted += `  Customer: ${init.customer}\n`;
    }
    if (init.problem && init.problem !== 'N/A') {
      formatted += `  Problem: ${init.problem}\n`;
    }
    if (init.solution && init.solution !== 'N/A') {
      formatted += `  Solution: ${init.solution}\n`;
    }
    if (init.marketSize && init.marketSize !== 'N/A') {
      formatted += `  Market Size: ${init.marketSize}\n`;
    }
    if (init.keyResult && init.keyResult !== 'N/A') {
      formatted += `  Key Result: ${init.keyResult}\n`;
    }
    if (init.successMetrics && init.successMetrics !== 'N/A') {
      formatted += `  Success Metrics: ${init.successMetrics}\n`;
    }
    if (init.alternatives && init.alternatives !== 'N/A') {
      formatted += `  Alternatives: ${init.alternatives}\n`;
    }
  });
  
  console.log('Ã°Å¸â€œâ€ž Formatted context length:', formatted.length, 'characters');
  
  return formatted;
}

console.log('Ã¢Å“â€¦ VueSense AI Data Prep with Jira Comment Extraction loaded');
