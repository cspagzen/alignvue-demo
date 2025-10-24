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
  console.warn('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Unexpected comment format:', typeof comment, comment);
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
      text += 'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ ' + extractTextFromContent(node.content) + ' ';
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
    
    console.log('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Portfolio context prepared:', context);
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
 * Helper function to calculate row and column from priority slot
 * Uses triangular layout: Row 1 has 1 slot, Row 2 has 2 slots, Row 3 has 3 slots, etc.
 * Matches the UI's getRowColFromSlot function in script.js
 */
function getRowColFromSlot(slot) {
  let row = 1;
  let slotsUsed = 0;
  
  // Find which row this slot is in
  while (slotsUsed + row < slot) {
    slotsUsed += row;
    row++;
  }
  
  // Calculate column position within the row (right-to-left: 1 = rightmost)
  const positionInRow = slot - slotsUsed;
  const col = row - positionInRow + 1;
  return { row, col };
}

/**
 * Calculate Portfolio Delivery Confidence
 * EXACT COPY from script.js - must stay in sync!
 */
function calculateDeliveryConfidence(boardData) {
  let confidence = 90; // Start at 90%
  
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
 * EXACT COPY from script.js calculateRiskBreakdown - must stay in sync!
 */
function calculateTeamRiskScore(teamName, allInitiatives, allTeams) {
  const team = allTeams[teamName];
  if (!team) return { total: 0, health: 0, validation: 0, blockers: 0, focus: 0, utilization: 0 };
  
  let totalRisk = 0;
  
  // 1. TEAM HEALTH RISK (Base + Multiplier)
  let teamHealthMultiplier = 1.0;
  let baseTeamHealth = 0;
  
  const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
  let criticalCount = 0;
  let atRiskCount = 0;
  
  dimensions.forEach(dim => {
    const value = team[dim];
    if (value === 'critical' || value === 'Critical') {
      criticalCount++;
      baseTeamHealth += 15; // 15 points per critical dimension
    } else if (value === 'at-risk' || value === 'At Risk') {
      atRiskCount++;
      baseTeamHealth += 7; // 7 points per at-risk dimension
    }
  });
  
  // Team health multiplier affects ALL other risk
  if (criticalCount >= 3) {
    teamHealthMultiplier = 2.0; // Double all risk if severely unhealthy
  } else if (criticalCount >= 1 || atRiskCount >= 3) {
    teamHealthMultiplier = 1.5; // 50% more risk if struggling
  }
  
  totalRisk += baseTeamHealth;
  
  // 2. Get team's initiatives (exclude bullpen/pipeline)
  const teamInitiatives = allInitiatives.filter(init => 
    init.teams && init.teams.includes(teamName) && init.priority !== 'bullpen'
  );
  
  // 3. INITIATIVE-BASED RISK (with multiplier)
  let initiativeRisk = 0;
  
  teamInitiatives.forEach(init => {
    // Validation risk
    if (init.validation === 'not-validated') initiativeRisk += 8;
    else if (init.validation === 'in-validation') initiativeRisk += 4;
    
    // Blocker risk
    const blockerRisk = Math.min(8, Math.floor((init.jira?.flagged || 0) / 3));
    initiativeRisk += blockerRisk;
  });
  
  // Apply team health multiplier to initiative risk
  totalRisk += (initiativeRisk * teamHealthMultiplier);
  
  // 4. FOCUS PENALTY (Too Many Initiatives)
  let focusRisk = 0;
  const initiativeCount = teamInitiatives.length;
  if (initiativeCount > 5) {
    focusRisk += (initiativeCount - 5) * 5;
  } else if (initiativeCount > 3) {
    focusRisk += (initiativeCount - 3) * 3;
  }
  totalRisk += focusRisk;
  
  // 5. OVER-UTILIZATION PENALTY
  let utilizationRisk = 0;
  const utilization = team.jira?.utilization || 0;
  if (utilization > 95) {
    utilizationRisk += 20;
  } else if (utilization > 85) {
    utilizationRisk += 10;
  }
  totalRisk += utilizationRisk;
  
  return {
    total: Math.round(totalRisk),
    health: baseTeamHealth,
    validation: Math.round(initiativeRisk * teamHealthMultiplier),
    blockers: 0, // Included in validation now
    focus: focusRisk,
    utilization: utilizationRisk
  };
}

/**
 * Calculate Initiative Risk Score
 * EXACT COPY from script.js analyzeInitiativeRisk - must stay in sync!
 */
function calculateInitiativeRiskScore(initiative, allTeams) {
  let riskScore = 0;
  
  // 1. TEAM HEALTH RISK SCORING
  initiative.teams.forEach(teamName => {
    const team = allTeams[teamName];
    if (!team) return;
    
    // Capacity: At Risk = +3, Critical = +6
    if (team.capacity === 'At Risk' || team.capacity === 'at-risk') {
      riskScore += 3;
    } else if (team.capacity === 'Critical' || team.capacity === 'critical') {
      riskScore += 6;
    }
    
    // Skillset: At Risk = +3, Critical = +6
    if (team.skillset === 'At Risk' || team.skillset === 'at-risk') {
      riskScore += 3;
    } else if (team.skillset === 'Critical' || team.skillset === 'critical') {
      riskScore += 6;
    }
    
    // Support: At Risk = +2, Critical = +4
    if (team.support === 'At Risk' || team.support === 'at-risk') {
      riskScore += 2;
    } else if (team.support === 'Critical' || team.support === 'critical') {
      riskScore += 4;
    }
    
    // Vision: At Risk = +1, Critical = +2
    if (team.vision === 'At Risk' || team.vision === 'at-risk') {
      riskScore += 1;
    } else if (team.vision === 'Critical' || team.vision === 'critical') {
      riskScore += 2;
    }
    
    // Team Cohesion (teamwork): At Risk = +1, Critical = +2
    if (team.teamwork === 'At Risk' || team.teamwork === 'at-risk') {
      riskScore += 1;
    } else if (team.teamwork === 'Critical' || team.teamwork === 'critical') {
      riskScore += 2;
    }
    
    // Autonomy: At Risk = +1, Critical = +2
    if (team.autonomy === 'At Risk' || team.autonomy === 'at-risk') {
      riskScore += 1;
    } else if (team.autonomy === 'Critical' || team.autonomy === 'critical') {
      riskScore += 2;
    }
    
    // Utilization: >95% = +2
    if (team.jira && team.jira.utilization > 95) {
      riskScore += 2;
    }
  });
  
  // 2. FLAGGED WORK RISK SCORING
  if (initiative.jira && initiative.jira.flagged > 0) {
    const totalStories = initiative.jira.stories || 0;
    const flaggedStories = initiative.jira.flagged || 0;
    const flaggedPercentage = totalStories > 0 ? 
      (flaggedStories / totalStories) * 100 : 0;
    
    let flaggedPoints = 0;
    if (flaggedPercentage >= 50) flaggedPoints = 8;
    else if (flaggedPercentage >= 25) flaggedPoints = 5;
    else if (flaggedPercentage >= 15) flaggedPoints = 3;
    else if (flaggedPercentage >= 5) flaggedPoints = 2;
    else flaggedPoints = 1;
    
    riskScore += flaggedPoints;
  }
  
  // 3. VALIDATION RISK SCORING
  if (initiative.priority >= 1 && initiative.priority <= 15 && 
      initiative.validation === 'not-validated') {
    if (initiative.type === 'strategic') {
      riskScore += 2;
    } else if (initiative.type === 'ktlo' || initiative.type === 'emergent') {
      riskScore += 1;
    }
  }
  
  // 4. PRIORITY AMPLIFICATION
  // Check if initiative is in top 2 rows (priorities 1-3: row 1 has 1 slot, row 2 has 2 slots)
  // Must match UI logic from script.js analyzeInitiativeRisk
  const row = getRowColFromSlot(initiative.priority).row;
  if (row <= 2 && riskScore > 4) {
    riskScore += 1;
  }
  
  // Cap at 50 points
  riskScore = Math.min(riskScore, 50);
  
  // Determine level
  let level;
  if (riskScore <= 12) level = 'LOW';
  else if (riskScore <= 22) level = 'MODERATE';
  else if (riskScore <= 35) level = 'HIGH';
  else level = 'CRITICAL';
  
  return {
    score: riskScore,
    level: level
  };
}

function extractTeamData(boardData) {
  const teams = boardData.teams || {};
  const initiatives = boardData.initiatives || [];
  
  console.log('ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€¦Ã‚Â  Extracting data for', Object.keys(teams).length, 'teams...');
  
  return Object.entries(teams).map(([name, data]) => {
    // Find initiatives this team is working on (exclude bullpen/pipeline)
    const teamInitiatives = initiatives.filter(init => 
      init.teams && init.teams.includes(name) && init.priority !== 'bullpen'
    );
    
    // Extract comment text from Jira doc format
    const rawComment = data.comments || '';
    const commentText = extractTextFromJiraDoc(rawComment);
    
    // Debug logging to see what we're extracting
    if (rawComment) {
      console.log(`\nÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â Team: ${name}`);
      console.log('  Raw comment type:', typeof rawComment);
      if (typeof rawComment === 'object') {
        console.log('  Raw comment structure:', rawComment.type || 'no type', 
                    Array.isArray(rawComment.content) ? `${rawComment.content.length} content items` : 'no content');
      }
      console.log('  ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Extracted text:', commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''));
    }
    
    // Calculate portfolio risk score for this team
    const riskScore = calculateTeamRiskScore(name, initiatives, teams);
    
    // Calculate overall health (simple count-based)
    let atRiskCount = 0;
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    dimensions.forEach(dim => {
      const value = data[dim];
      if (value === 'At Risk' || value === 'at-risk' || value === 'Critical' || value === 'critical') {
        atRiskCount++;
      }
    });
    
    let overallHealth;
    if (atRiskCount === 0) overallHealth = 'HEALTHY';
    else if (atRiskCount <= 2) overallHealth = 'LOW RISK';
    else if (atRiskCount <= 4) overallHealth = 'HIGH RISK';
    else overallHealth = 'CRITICAL';
    
    // Calculate blockers by summing flagged stories from team's initiatives
    // Matches UI logic from script.js lines 14313-14326
    const blockerCount = teamInitiatives.reduce((sum, init) => {
      if (init.priority === 'bullpen') return sum; // Skip pipeline
      return sum + (init.jira?.flagged || 0);
    }, 0);
    
    return {
      name,
      capacity: data.capacity || 'unknown',
      skillset: data.skillset || 'unknown',
      vision: data.vision || 'unknown',
      support: data.support || 'unknown',
      teamwork: data.teamwork || 'unknown',
      autonomy: data.autonomy || 'unknown',
      overallHealth,  // ADDED: Simple count-based health assessment
      initiativeCount: teamInitiatives.length,
      utilization: data.jira?.utilization || 0,
      activeStories: data.jira?.stories || 0,  // ✓ ADDED
      blockers: blockerCount,  // ✓ FIXED: Calculate from initiatives, not read from team
      portfolioRiskScore: riskScore.total,  // ✓ ADDED
      riskBreakdown: riskScore,  // ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ADDED (health, validation, blockers, focus)
      comments: commentText, // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ NOW PROPERLY EXTRACTED!
      currentWork: teamInitiatives.map(i => i.title || i.name).slice(0, 5)
    };
  });
}

function extractInitiativeData(boardData) {
  const initiatives = boardData.initiatives || [];
  const teams = boardData.teams || {};
  
  return initiatives.map(init => {
    const riskScore = calculateInitiativeRiskScore(init, teams);
    
    return {
      title: init.title || init.name || 'Untitled',
      teams: init.teams || [],
      priority: init.priority,
      type: init.type || 'unknown',
      validation: init.validation || 'unknown',
      progress: init.progress || 0,
      stories: init.jira?.stories || 0,
      flagged: init.jira?.flagged || 0,
      riskScore: riskScore.score,  // Ã¢Å“â€¦ ADDED
      riskLevel: riskScore.level,  // Ã¢Å“â€¦ ADDED
      // Ã¢Å“â€¦ OPPORTUNITY CANVAS FIELDS
      customer: init.canvas?.customer || 'N/A',
      problem: init.canvas?.problem || 'N/A',
      solution: init.canvas?.solution || 'N/A',
      marketSize: init.canvas?.marketSize || 'N/A',
      keyResult: init.canvas?.keyResult || 'N/A',
      successMetrics: init.canvas?.measures || 'N/A',
      alternatives: init.canvas?.alternatives || 'N/A',
      jira: init.jira  // Ã¢Å“â€¦ ADDED: Include full jira object for risk calculation
    };
  });
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
    formatted += `  Risk Score: ${init.riskScore}/50 (${init.riskLevel})\n`;  // Ã¢Å“â€¦ ADDED
    
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
  
  console.log('ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ Formatted context length:', formatted.length, 'characters');
  
  return formatted;
}

console.log('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ VueSense AI Data Prep with Jira Comment Extraction loaded');
