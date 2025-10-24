/**
 * VueSense AI Data Preparation - FIXED
 * Extracts and formats portfolio data for AI context
 */

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
      timestamp: new Date().toISOString(),
      dataQuality: validateDataQuality(boardData)
    };
    
    console.log('âœ… Portfolio context prepared:', context);
    
    // Warn if utilization data is missing
    if (context.dataQuality.missingUtilizationData) {
      console.warn('âš ï¸ Utilization data is missing for teams. Make sure Jira team health data has been loaded.');
    }
    
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
  
  return Object.entries(teams).map(([name, data]) => {
    // Find initiatives this team is working on
    const teamInitiatives = initiatives.filter(init => 
      init.teams && init.teams.includes(name)
    );
    
    // Get utilization - it can be at data.jira.utilization
    // Handle both undefined and 0 as valid values
    let utilization = 0;
    if (data.jira && typeof data.jira.utilization === 'number') {
      utilization = data.jira.utilization;
    }
    
    // Get comments from the correct location
    const comments = data.comments || (data.jira && data.jira.comments) || '';
    
    return {
      name,
      capacity: data.capacity || 'unknown',
      skillset: data.skillset || 'unknown',
      vision: data.vision || 'unknown',
      support: data.support || 'unknown',
      teamwork: data.teamwork || 'unknown',
      autonomy: data.autonomy || 'unknown',
      initiativeCount: teamInitiatives.length,
      utilization: utilization,
      velocity: data.jira?.velocity || 0,
      stories: data.jira?.stories || 0,
      blockers: data.jira?.blockers || 0,
      comments: comments,
      currentWork: teamInitiatives.map(i => i.title || i.name).slice(0, 5),
      // Add raw jira data for debugging
      _rawJiraData: data.jira ? {
        hasUtilization: typeof data.jira.utilization !== 'undefined',
        utilizationValue: data.jira.utilization
      } : null
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
  
  // Top teams summary
  const topTeams = context.teams.slice(0, 8);
  formatted += `KEY TEAMS:\n`;
  topTeams.forEach(t => {
    formatted += `- ${t.name}: ${t.initiativeCount} initiatives, Capacity: ${t.capacity}, Utilization: ${t.utilization}%\n`;
    if (t.comments) {
      formatted += `  Comments: ${t.comments.substring(0, 100)}...\n`;
    }
  });
  
  return formatted;
}

function validateDataQuality(boardData) {
  const teams = boardData.teams || {};
  const teamCount = Object.keys(teams).length;
  
  let teamsWithUtilization = 0;
  let teamsWithJiraData = 0;
  
  Object.values(teams).forEach(team => {
    if (team.jira) {
      teamsWithJiraData++;
      if (typeof team.jira.utilization === 'number') {
        teamsWithUtilization++;
      }
    }
  });
  
  return {
    totalTeams: teamCount,
    teamsWithJiraData: teamsWithJiraData,
    teamsWithUtilization: teamsWithUtilization,
    missingUtilizationData: teamsWithUtilization === 0 && teamCount > 0,
    jiraDataPercent: teamCount > 0 ? Math.round((teamsWithJiraData / teamCount) * 100) : 0,
    utilizationDataPercent: teamCount > 0 ? Math.round((teamsWithUtilization / teamCount) * 100) : 0
  };
}