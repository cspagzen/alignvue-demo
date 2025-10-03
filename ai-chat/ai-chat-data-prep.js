/**
 * VueSense AI Data Preparation
 * Extracts and formats portfolio data for AI context
 */

function preparePortfolioContext(boardData) {
  if (!boardData || typeof boardData !== 'object') {
    console.warn('Invalid boardData provided to preparePortfolioContext');
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
    
    return context;
  } catch (error) {
    console.error('Error preparing portfolio context:', error);
    return null;
  }
}

function generateSummary(boardData) {
  const teams = boardData.teams || {};
  const teamCount = Object.keys(teams).length;
  
  let totalInitiatives = 0;
  let criticalInitiatives = 0;
  let healthyInitiatives = 0;
  
  Object.values(teams).forEach(team => {
    if (team.initiatives) {
      totalInitiatives += team.initiatives.length;
      team.initiatives.forEach(init => {
        if (init.health === 'critical') criticalInitiatives++;
        if (init.health === 'healthy') healthyInitiatives++;
      });
    }
  });
  
  return {
    totalTeams: teamCount,
    totalInitiatives,
    criticalInitiatives,
    healthyInitiatives,
    atRiskInitiatives: totalInitiatives - criticalInitiatives - healthyInitiatives
  };
}

function extractTeamData(boardData) {
  const teams = boardData.teams || {};
  
  return Object.entries(teams).map(([name, data]) => {
    const health = calculateTeamHealth(data);
    
    return {
      name,
      capacity: data.capacity || 'unknown',
      skillsets: data.skillsets || 'unknown',
      leadership: data.leadership || 'unknown',
      initiativeCount: data.initiatives?.length || 0,
      health,
      currentWork: data.initiatives?.map(i => i.name) || []
    };
  });
}

function extractInitiativeData(boardData) {
  const teams = boardData.teams || {};
  const initiatives = [];
  
  Object.entries(teams).forEach(([teamName, teamData]) => {
    if (teamData.initiatives) {
      teamData.initiatives.forEach(init => {
        initiatives.push({
          name: init.name,
          team: teamName,
          health: init.health || 'unknown',
          status: init.status || 'unknown',
          priority: init.priority || 'unknown',
          type: init.type || 'unknown'
        });
      });
    }
  });
  
  return initiatives;
}

function detectPatterns(boardData) {
  const teams = extractTeamData(boardData);
  const initiatives = extractInitiativeData(boardData);
  
  // Detect capacity issues
  const overloadedTeams = teams.filter(t => 
    t.capacity === 'red' || t.initiativeCount > 3
  );
  
  // Detect health trends
  const criticalTeams = teams.filter(t => t.health === 'critical');
  const healthyTeams = teams.filter(t => t.health === 'healthy');
  
  // Detect initiative risks
  const criticalInitiatives = initiatives.filter(i => i.health === 'critical');
  const blockedInitiatives = initiatives.filter(i => i.status === 'blocked');
  
  return {
    capacity: {
      overloadedTeams: overloadedTeams.map(t => t.name),
      overloadCount: overloadedTeams.length
    },
    health: {
      criticalTeams: criticalTeams.map(t => t.name),
      healthyTeams: healthyTeams.map(t => t.name),
      criticalCount: criticalTeams.length
    },
    initiatives: {
      critical: criticalInitiatives.map(i => i.name),
      blocked: blockedInitiatives.map(i => i.name),
      atRiskCount: criticalInitiatives.length + blockedInitiatives.length
    }
  };
}

function calculateTeamHealth(teamData) {
  const redFlags = [];
  
  if (teamData.capacity === 'red') redFlags.push('capacity');
  if (teamData.skillsets === 'red') redFlags.push('skills');
  if (teamData.leadership === 'red') redFlags.push('leadership');
  
  if (redFlags.length >= 2) return 'critical';
  if (redFlags.length === 1) return 'at-risk';
  return 'healthy';
}

function formatContextForAI(context) {
  if (!context) return 'No portfolio data available.';
  
  let formatted = `PORTFOLIO OVERVIEW:
- Total Teams: ${context.summary.totalTeams}
- Total Initiatives: ${context.summary.totalInitiatives}
- Critical Initiatives: ${context.summary.criticalInitiatives}
- Healthy Initiatives: ${context.summary.healthyInitiatives}

`;

  if (context.patterns.capacity.overloadCount > 0) {
    formatted += `CAPACITY CONCERNS:
- Overloaded Teams (${context.patterns.capacity.overloadCount}): ${context.patterns.capacity.overloadedTeams.join(', ')}

`;
  }
  
  if (context.patterns.health.criticalCount > 0) {
    formatted += `HEALTH ALERTS:
- Critical Teams (${context.patterns.health.criticalCount}): ${context.patterns.health.criticalTeams.join(', ')}

`;
  }
  
  if (context.patterns.initiatives.atRiskCount > 0) {
    formatted += `AT-RISK INITIATIVES:
- Critical: ${context.patterns.initiatives.critical.join(', ') || 'None'}
- Blocked: ${context.patterns.initiatives.blocked.join(', ') || 'None'}

`;
  }
  
  // Add top teams summary
  const topTeams = context.teams.slice(0, 5);
  formatted += `TOP TEAMS:
${topTeams.map(t => `- ${t.name}: ${t.initiativeCount} initiatives, Capacity: ${t.capacity}, Health: ${t.health}`).join('\n')}
`;
  
  return formatted;
}