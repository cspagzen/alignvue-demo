/**
 * AlignVue AI Data Preparation - COMPLETE VERSION
 * Extracts and formats ALL portfolio data for AI context
 * Includes EVERY field displayed in modals and cards
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
  console.warn('Unexpected comment format:', typeof comment, comment);
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

/**
 * Calculate team portfolio risk score
 * Matches the calculation in script.js
 */
function calculateTeamRiskScore(teamData, teamInitiatives) {
  // Health score (0-20) - based on health dimensions
  const healthDimensions = [
    teamData.capacity,
    teamData.skillset,
    teamData.vision,
    teamData.support,
    teamData.teamwork,
    teamData.autonomy
  ];
  
  const criticalCount = healthDimensions.filter(d => d === 'Critical').length;
  const atRiskCount = healthDimensions.filter(d => d === 'At Risk').length;
  const healthScore = (criticalCount * 5) + (atRiskCount * 2);
  
  // Delivery score (0-20) - based on flagged stories and utilization
  const flagged = teamData.jira?.flagged || 0;
  const utilization = teamData.jira?.utilization || 0;
  const deliveryScore = Math.min(20, (flagged * 3) + Math.max(0, (utilization - 80) / 2));
  
  // Strategic score (0-10) - based on initiative count
  const initiativeCount = teamInitiatives.length;
  const strategicScore = Math.min(10, Math.max(0, (initiativeCount - 2) * 2));
  
  return {
    total: Math.round(healthScore + deliveryScore + strategicScore),
    health: Math.round(healthScore),
    delivery: Math.round(deliveryScore),
    strategic: Math.round(strategicScore)
  };
}

/**
 * Calculate initiative risk score
 * Matches the calculation in script.js
 */
function calculateInitiativeRiskScore(initiative, boardData) {
  let riskScore = 0;
  const factors = [];
  
  // Health dimensions of involved teams (0-20 points)
  if (initiative.teams && initiative.teams.length > 0) {
    let teamHealthRisk = 0;
    initiative.teams.forEach(teamName => {
      const team = boardData.teams[teamName];
      if (team) {
        const criticalCount = [team.capacity, team.skillset, team.vision, team.support, team.teamwork, team.autonomy]
          .filter(d => d === 'Critical').length;
        const atRiskCount = [team.capacity, team.skillset, team.vision, team.support, team.teamwork, team.autonomy]
          .filter(d => d === 'At Risk').length;
        teamHealthRisk += (criticalCount * 3) + (atRiskCount * 1);
      }
    });
    teamHealthRisk = Math.min(20, teamHealthRisk);
    riskScore += teamHealthRisk;
    if (teamHealthRisk > 0) factors.push(`Team Health: ${teamHealthRisk}`);
  }
  
  // Validation state (0-15 points)
  const validationRisk = {
    'Not Started': 15,
    'Discovery': 10,
    'Validated': 0,
    'unknown': 5
  }[initiative.validation] || 5;
  riskScore += validationRisk;
  if (validationRisk > 0) factors.push(`Validation: ${validationRisk}`);
  
  // Progress (0-10 points) - inverse relationship
  const progress = initiative.progress || 0;
  const progressRisk = Math.max(0, 10 - (progress / 10));
  riskScore += progressRisk;
  if (progressRisk > 5) factors.push(`Progress: ${progressRisk.toFixed(1)}`);
  
  // Flagged stories (0-5 points)
  const flaggedRisk = Math.min(5, (initiative.jira?.flagged || 0));
  riskScore += flaggedRisk;
  if (flaggedRisk > 0) factors.push(`Blockers: ${flaggedRisk}`);
  
  return {
    riskScore: Math.round(riskScore),
    factors: factors
  };
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
    
    console.log('Portfolio context prepared:', context);
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
  
  console.log('Extracting data for', Object.keys(teams).length, 'teams...');
  
  return Object.entries(teams).map(([name, data]) => {
    // Find initiatives this team is working on
    const teamInitiatives = initiatives.filter(init => 
      init.teams && init.teams.includes(name)
    );
    
    // Extract comment text from Jira doc format
    const rawComment = data.comments || '';
    const commentText = extractTextFromJiraDoc(rawComment);
    
    // Calculate portfolio risk score for this team
    const riskBreakdown = calculateTeamRiskScore(data, teamInitiatives);
    
    return {
      name,
      
      // Health dimensions (displayed in modal)
      capacity: data.capacity || 'unknown',
      skillset: data.skillset || 'unknown',
      vision: data.vision || 'unknown',
      support: data.support || 'unknown',
      teamwork: data.teamwork || 'unknown',
      autonomy: data.autonomy || 'unknown',
      
      // Jira metrics (displayed in cards)
      activeStories: data.jira?.stories || 0,
      blockers: data.jira?.flagged || 0,
      utilization: data.jira?.utilization || 0,
      
      // Portfolio risk (displayed in modal)
      portfolioRiskScore: riskBreakdown.total,
      riskHealthComponent: riskBreakdown.health,
      riskDeliveryComponent: riskBreakdown.delivery,
      riskStrategicComponent: riskBreakdown.strategic,
      
      // Context
      initiativeCount: teamInitiatives.length,
      comments: commentText,
      currentWork: teamInitiatives.map(i => i.title || i.name)
    };
  });
}

function extractInitiativeData(boardData) {
  const initiatives = boardData.initiatives || [];
  
  console.log('🔍 Extracting data for', initiatives.length, 'initiatives...');
  
  return initiatives.map(init => {
    const riskAnalysis = calculateInitiativeRiskScore(init, boardData);
    
    // DEBUG: Check if canvas exists
    if (init.canvas) {
      console.log(`✅ Initiative "${init.title}" HAS canvas data:`, {
        customer: init.canvas.customer ? 'YES' : 'NO',
        marketSize: init.canvas.marketSize ? 'YES' : 'NO',
        problem: init.canvas.problem ? 'YES' : 'NO'
      });
    } else {
      console.warn(`❌ Initiative "${init.title}" has NO canvas data`);
    }
    
    return {
      // Basic info
      title: init.title || init.name || 'Untitled',
      teams: init.teams || [],
      priority: init.priority,
      type: init.type || 'unknown',
      
      // Validation & Progress
      validation: init.validation || 'unknown',
      progress: init.progress || 0,
      
      // Jira data (displayed in modal)
      epicKey: init.jira?.key || 'N/A',
      epicStatus: init.jira?.status || 'N/A',
      stories: init.jira?.stories || 0,
      flagged: init.jira?.flagged || 0,
      lastUpdated: init.jira?.updated || 'N/A',
      
      // Risk score (displayed in modal)
      riskScore: riskAnalysis.riskScore,
      riskFactors: riskAnalysis.factors,
      
      // Opportunity Canvas fields (ALL displayed in modal)
      customer: init.canvas?.customer || 'N/A',
      problem: init.canvas?.problem || 'N/A',
      solution: init.canvas?.solution || 'N/A',
      marketSize: init.canvas?.marketSize || 'N/A',
      keyResult: init.canvas?.keyResult || 'N/A',
      successMeasures: init.canvas?.measures || 'N/A',
      alternatives: init.canvas?.alternatives || 'N/A',
      outcome: init.canvas?.outcome || 'N/A'
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
  
  // Teams with high risk scores
  const highRiskTeams = teams.filter(t => t.portfolioRiskScore > 30);
  
  // Teams with blockers
  const teamsWithBlockers = teams.filter(t => t.blockers > 0);
  
  // Initiatives with issues
  const flaggedInits = initiatives.filter(i => i.flagged > 0);
  const highRiskInits = initiatives.filter(i => i.riskScore > 30);
  const unvalidatedInits = initiatives.filter(i => i.validation === 'Not Started');
  
  return {
    capacityIssues: capacityIssues.map(t => t.name),
    overloadedTeams: overloaded.map(t => t.name),
    highRiskTeams: highRiskTeams.map(t => ({name: t.name, score: t.portfolioRiskScore})),
    teamsWithBlockers: teamsWithBlockers.map(t => ({name: t.name, count: t.blockers})),
    flaggedInitiatives: flaggedInits.map(i => i.title),
    highRiskInitiatives: highRiskInits.map(i => ({title: i.title, score: i.riskScore})),
    unvalidatedInitiatives: unvalidatedInits.map(i => i.title),
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

  // Critical patterns
  if (context.patterns.highRiskTeams.length > 0) {
    formatted += `HIGH RISK TEAMS (Score > 30):\n`;
    context.patterns.highRiskTeams.forEach(t => {
      formatted += `- ${t.name}: Risk Score ${t.score}\n`;
    });
    formatted += '\n';
  }

  if (context.patterns.capacityIssues.length > 0) {
    formatted += `CAPACITY CONCERNS:\n`;
    formatted += `- Teams with capacity issues: ${context.patterns.capacityIssues.join(', ')}\n\n`;
  }
  
  if (context.patterns.overloadedTeams.length > 0) {
    formatted += `OVERLOADED TEAMS (>90% utilization):\n`;
    formatted += `- ${context.patterns.overloadedTeams.join(', ')}\n\n`;
  }
  
  if (context.patterns.teamsWithBlockers.length > 0) {
    formatted += `TEAMS WITH BLOCKERS:\n`;
    context.patterns.teamsWithBlockers.forEach(t => {
      formatted += `- ${t.name}: ${t.count} blocker(s)\n`;
    });
    formatted += '\n';
  }
  
  if (context.patterns.highRiskInitiatives.length > 0) {
    formatted += `HIGH RISK INITIATIVES (Score > 30):\n`;
    context.patterns.highRiskInitiatives.forEach(i => {
      formatted += `- ${i.title}: Risk Score ${i.score}\n`;
    });
    formatted += '\n';
  }
  
  if (context.patterns.flaggedInitiatives.length > 0) {
    formatted += `FLAGGED INITIATIVES:\n`;
    formatted += `- ${context.patterns.flaggedInitiatives.join(', ')}\n\n`;
  }
  
  if (context.patterns.unvalidatedInitiatives.length > 0) {
    formatted += `UNVALIDATED INITIATIVES:\n`;
    formatted += `- ${context.patterns.unvalidatedInitiatives.join(', ')}\n\n`;
  }

  // COMPLETE team data
  formatted += `\n=== DETAILED TEAM DATA ===\n`;
  context.teams.forEach(t => {
    formatted += `\n## ${t.name}\n`;
    formatted += `Active Stories: ${t.activeStories}\n`;
    formatted += `Blockers: ${t.blockers}\n`;
    formatted += `Utilization: ${t.utilization}%\n`;
    formatted += `Portfolio Risk Score: ${t.portfolioRiskScore} (Health: ${t.riskHealthComponent}, Delivery: ${t.riskDeliveryComponent}, Strategic: ${t.riskStrategicComponent})\n`;
    formatted += `Health Dimensions:\n`;
    formatted += `  - Capacity: ${t.capacity}\n`;
    formatted += `  - Skillset: ${t.skillset}\n`;
    formatted += `  - Vision: ${t.vision}\n`;
    formatted += `  - Support: ${t.support}\n`;
    formatted += `  - Teamwork: ${t.teamwork}\n`;
    formatted += `  - Autonomy: ${t.autonomy}\n`;
    if (t.comments) {
      formatted += `Comments: "${t.comments}"\n`;
    }
    if (t.currentWork && t.currentWork.length > 0) {
      formatted += `Current Work (${t.initiativeCount} initiatives):\n`;
      t.currentWork.forEach(w => formatted += `  - ${w}\n`);
    }
  });
  
  // COMPLETE initiative data
  formatted += `\n\n=== DETAILED INITIATIVE DATA ===\n`;
  context.initiatives.forEach(i => {
    formatted += `\n## ${i.title}\n`;
    formatted += `Type: ${i.type}\n`;
    formatted += `Priority: ${i.priority}\n`;
    formatted += `Teams: ${i.teams.join(', ')}\n`;
    formatted += `Validation: ${i.validation}\n`;
    formatted += `Progress: ${i.progress}%\n`;
    formatted += `Risk Score: ${i.riskScore}/50`;
    if (i.riskFactors.length > 0) {
      formatted += ` (${i.riskFactors.join(', ')})`;
    }
    formatted += '\n';
    formatted += `Jira Epic: ${i.epicKey} (${i.epicStatus})\n`;
    formatted += `Stories: ${i.stories}, Blockers: ${i.flagged}\n`;
    formatted += `Last Updated: ${i.lastUpdated}\n`;
    formatted += `\nOpportunity Canvas:\n`;
    formatted += `  Customer: ${i.customer}\n`;
    formatted += `  Problem: ${i.problem}\n`;
    formatted += `  Solution: ${i.solution}\n`;
    formatted += `  Market Size: ${i.marketSize}\n`;
    formatted += `  Key Result: ${i.keyResult}\n`;
    formatted += `  Success Measures: ${i.successMeasures}\n`;
    formatted += `  Alternatives: ${i.alternatives}\n`;
    formatted += `  Outcome: ${i.outcome}\n`;
  });
  
  console.log('Formatted context length:', formatted.length, 'characters');
  
  return formatted;
}

console.log('AlignVue AI Data Prep - COMPLETE VERSION loaded');
