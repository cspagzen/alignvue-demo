/**
 * VueSense AI Chat Engine - DEMO READY VERSION
 * Simplified, bulletproof, guaranteed to work
 */

// Cost Tracker
class CostTracker {
  constructor() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCost = 0;
    this.questionCount = 0;
    this.load();
  }
  
  load() {
    try {
      const saved = localStorage.getItem('ai_cost_tracker');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this, data);
      }
    } catch (e) {
      console.warn('Could not load cost tracker:', e);
    }
  }
  
  save() {
    try {
      localStorage.setItem('ai_cost_tracker', JSON.stringify({
        totalInputTokens: this.totalInputTokens,
        totalOutputTokens: this.totalOutputTokens,
        totalCost: this.totalCost,
        questionCount: this.questionCount
      }));
    } catch (e) {
      console.warn('Could not save cost tracker:', e);
    }
  }
  
  trackUsage(inputTokens, outputTokens) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    
    const inputCost = (inputTokens / 1000000) * 0.15;
    const outputCost = (outputTokens / 1000000) * 0.60;
    const cost = inputCost + outputCost;
    
    this.totalCost += cost;
    this.questionCount++;
    
    this.save();
    
    return { cost, totalCost: this.totalCost };
  }
  
  getStats() {
    return {
      questionCount: this.questionCount,
      totalCost: this.totalCost,
      avgCostPerQuestion: this.questionCount > 0 ? this.totalCost / this.questionCount : 0
    };
  }
  
  reset() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCost = 0;
    this.questionCount = 0;
    this.save();
  }
}

// Main AI Engine
class AIEngine {
  constructor() {
    this.conversationHistory = [];
    this.costTracker = new CostTracker();
    this.backendUrl = 'https://vuesense-backend.onrender.com';
    console.log('✅ AIEngine initialized');
  }
  
  async sendMessage(userMessage) {
    try {
      console.log('📤 Sending message to AI:', userMessage.substring(0, 50) + '...');
      
      // Build system message with portfolio data
      const systemMessage = this.buildSystemMessage();
      
      // Initialize conversation with system message if needed
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: systemMessage
        });
      }
      
      // Add user message
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      
      // Call the backend
      console.log('🌐 Calling backend API...');
      const response = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: this.conversationHistory
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', response.status, errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Got response from AI');
      
      this.handleResponse(data);
      return data;
      
    } catch (error) {
      console.error('❌ AI Engine Error:', error);
      throw error;
    }
  }
  
  handleResponse(data) {
    // Add AI response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: data.response
    });
    
    // Track costs
    if (data.usage) {
      this.costTracker.trackUsage(
        data.usage.inputTokens || 0,
        data.usage.outputTokens || 0
      );
    }
    
    // Limit history size to prevent payload issues
    if (this.conversationHistory.length > 10) {
      // Keep system message and last 4 exchanges (8 messages)
      this.conversationHistory = [
        this.conversationHistory[0],
        ...this.conversationHistory.slice(-8)
      ];
    }
  }
  
  buildSystemMessage() {
    const teams = window.boardData?.teams || {};
    const initiatives = window.boardData?.initiatives || [];
    
    // Calculate data quality inline
    let dataQuality = {
      totalTeams: 0,
      teamsWithUtilization: 0,
      utilizationDataPercent: 0
    };
    
    try {
      const teamCount = Object.keys(teams).length;
      let teamsWithUtilization = 0;
      
      Object.values(teams).forEach(function(team) {
        if (team.jira && typeof team.jira.utilization === 'number') {
          teamsWithUtilization++;
        }
      });
      
      dataQuality = {
        totalTeams: teamCount,
        teamsWithUtilization: teamsWithUtilization,
        utilizationDataPercent: teamCount > 0 ? Math.round((teamsWithUtilization / teamCount) * 100) : 0
      };
    } catch (error) {
      console.warn('Could not calculate data quality:', error);
    }
    
    // Build team data
    const teamData = Object.entries(teams).map((entry) => {
      const name = entry[0];
      const data = entry[1];
      const issues = [];
      
      if (data.capacity === 'Critical' || data.capacity === 'critical') issues.push('Critical capacity');
      if (data.capacity === 'At Risk' || data.capacity === 'at-risk') issues.push('At-risk capacity');
      if (data.skillset === 'Critical' || data.skillset === 'critical') issues.push('Critical skillset');
      if (data.skillset === 'At Risk' || data.skillset === 'at-risk') issues.push('At-risk skillset');
      if (data.vision === 'Critical' || data.vision === 'critical') issues.push('Critical vision');
      if (data.vision === 'At Risk' || data.vision === 'at-risk') issues.push('At-risk vision');
      if (data.jira && data.jira.utilization > 95) issues.push('Overloaded at ' + data.jira.utilization + '% utilization');
      
      const riskScore = this.calculateTeamRisk(name, data);
      
      return {
        name: name,
        capacity: data.capacity,
        skillset: data.skillset,
        vision: data.vision,
        support: data.support,
        teamwork: data.teamwork,
        autonomy: data.autonomy,
        utilization: (data.jira && typeof data.jira.utilization === 'number') ? data.jira.utilization : 0,
        comments: (data.jira && data.jira.comments) || data.comments || null,
        riskScore: riskScore,
        issues: issues
      };
    });
    
    // Build initiative data
    const initiativeData = initiatives.map((init) => {
      const riskScore = this.calculateInitiativeRisk(init);
      
      return {
        title: init.title || init.name,
        type: init.type,
        priority: init.priority,
        validationStatus: init.validationStatus || init.validation,
        teams: init.teams || [],
        progress: init.progress || 0,
        riskScore: riskScore
      };
    });
    
    // Build data quality warning
    let dataQualityWarning = '';
    if (dataQuality.utilizationDataPercent < 100 && dataQuality.utilizationDataPercent > 0) {
      dataQualityWarning = '\n\n⚠️ DATA QUALITY WARNING:\n' +
        'Only ' + dataQuality.utilizationDataPercent + '% of teams have utilization data (' + 
        dataQuality.teamsWithUtilization + ' out of ' + dataQuality.totalTeams + ' teams).\n' +
        'When answering questions about utilization, acknowledge that data may be incomplete.\n';
    } else if (dataQuality.utilizationDataPercent === 0 && dataQuality.totalTeams > 0) {
      dataQualityWarning = '\n\n⚠️ DATA QUALITY WARNING:\n' +
        'No teams have utilization data loaded. Inform the user that Jira team health data needs to be synced.\n';
    }
    
    return 'You are VueSense AI, a portfolio management assistant.\n\n' +
      'CURRENT PORTFOLIO DATA:\n\n' +
      'DATA QUALITY: ' + dataQuality.utilizationDataPercent + '% of teams have utilization data' + dataQualityWarning + '\n' +
      'TEAMS (' + Object.keys(teams).length + ' total):\n' +
      JSON.stringify(teamData, null, 2) + '\n\n' +
      'INITIATIVES (' + initiatives.length + ' total):\n' +
      JSON.stringify(initiativeData, null, 2) + '\n\n' +
      'INSTRUCTIONS:\n' +
      '- When asked about teams, list the SPECIFIC team names with their actual data\n' +
      '- When asked about utilization, use the actual utilization percentages from the data\n' +
      '- When asked about risk scores, use the pre-calculated riskScore field\n' +
      '- Always reference specific teams and initiatives by name\n' +
      '- Read team comments to understand WHY teams have issues\n' +
      '- Risk scores are already calculated - use them directly\n\n' +
      'RISK SCORE INTERPRETATION:\n' +
      'Team Risk Scores: 0-20 Low, 21-40 Moderate, 41-60 High, 61+ Critical\n' +
      'Initiative Risk Scores: 0-7 Low, 8-11 Medium, 12-22 High, 23+ Critical';
  }
  
  calculateTeamRisk(teamName, teamData) {
    let totalRisk = 0;
    let criticalCount = 0;
    let atRiskCount = 0;
    
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    dimensions.forEach(function(dim) {
      const value = teamData[dim];
      if (value === 'Critical' || value === 'critical') {
        criticalCount++;
        totalRisk += 15;
      } else if (value === 'At Risk' || value === 'at-risk') {
        atRiskCount++;
        totalRisk += 7;
      }
    });
    
    let multiplier = 1.0;
    if (criticalCount >= 3) multiplier = 2.0;
    else if (criticalCount >= 1 || atRiskCount >= 3) multiplier = 1.5;
    
    totalRisk = totalRisk * multiplier;
    
    if (teamData.jira && teamData.jira.utilization > 95) {
      totalRisk += 2;
    }
    
    const teamInitiatives = (window.boardData && window.boardData.initiatives) ? 
      window.boardData.initiatives.filter(function(init) {
        return init.teams && init.teams.includes(teamName);
      }) : [];
    
    const initiativeCount = teamInitiatives.length;
    if (initiativeCount > 5) {
      totalRisk += (initiativeCount - 5) * 5;
    } else if (initiativeCount > 3) {
      totalRisk += (initiativeCount - 3) * 3;
    }
    
    return Math.round(totalRisk);
  }
  
  calculateInitiativeRisk(initiative) {
    let riskScore = 0;
    
    if (initiative.teams && Array.isArray(initiative.teams)) {
      initiative.teams.forEach(function(teamName) {
        const team = window.boardData && window.boardData.teams && window.boardData.teams[teamName];
        if (!team) return;
        
        if (team.capacity === 'At Risk' || team.capacity === 'at-risk') riskScore += 3;
        if (team.capacity === 'Critical' || team.capacity === 'critical') riskScore += 6;
        
        if (team.skillset === 'At Risk' || team.skillset === 'at-risk') riskScore += 3;
        if (team.skillset === 'Critical' || team.skillset === 'critical') riskScore += 6;
        
        if (team.support === 'At Risk' || team.support === 'at-risk') riskScore += 2;
        if (team.support === 'Critical' || team.support === 'critical') riskScore += 4;
        
        if (team.jira && team.jira.utilization > 95) riskScore += 2;
      });
    }
    
    if (initiative.jira && initiative.jira.stories > 0) {
      const flaggedPct = ((initiative.jira.flagged || 0) / initiative.jira.stories) * 100;
      if (flaggedPct >= 50) riskScore += 8;
      else if (flaggedPct >= 25) riskScore += 5;
      else if (flaggedPct >= 15) riskScore += 3;
      else if (flaggedPct >= 5) riskScore += 2;
      else if (flaggedPct >= 1) riskScore += 1;
    }
    
    if (initiative.priority <= 15) {
      const validation = initiative.validationStatus || initiative.validation;
      if (validation === 'not-validated') {
        if (initiative.type === 'strategic') riskScore += 2;
        else riskScore += 1;
      }
    }
    
    if (initiative.priority <= 2 && riskScore > 4) {
      riskScore += 1;
    }
    
    return Math.min(riskScore, 50);
  }
  
  resetConversation() {
    this.conversationHistory = [];
    console.log('🔄 Conversation history reset');
  }
}

// Create and export the engine globally
console.log('🚀 Creating AI Engine...');
try {
  window.aiEngine = new AIEngine();
  console.log('✅ window.aiEngine created successfully');
} catch (error) {
  console.error('❌ Failed to create aiEngine:', error);
}
