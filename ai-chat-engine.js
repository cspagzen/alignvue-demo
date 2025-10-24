/**
 * AI Chat Engine - COMPLETE FIX
 * Includes ALL fields and updates system message on every request
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
    const saved = localStorage.getItem('ai_cost_tracker');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(this, data);
    }
  }
  
  save() {
    localStorage.setItem('ai_cost_tracker', JSON.stringify({
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCost: this.totalCost,
      questionCount: this.questionCount
    }));
  }
  
  trackUsage(inputTokens, outputTokens) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    
    const inputCost = (inputTokens / 1000000) * (AI_CHAT_CONFIG.inputCostPer1M || 0.15);
    const outputCost = (outputTokens / 1000000) * (AI_CHAT_CONFIG.outputCostPer1M || 0.60);
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
    this.backendUrl = AI_CHAT_CONFIG.backendUrl || 'https://vuesense-backend.onrender.com';
  }
  
  async sendMessage(userMessage) {
    try {
      // Build the system message with ACTUAL PORTFOLIO DATA
      const systemMessage = this.buildSystemMessage();
      
      // ✅ FIXED: ALWAYS update system message with fresh data
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: systemMessage
        });
      } else {
        // Update the system message with fresh data on every request
        this.conversationHistory[0] = {
          role: 'system',
          content: systemMessage
        };
      }
      
      // Add user message
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      
      // Call the backend
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
        const errorData = await response.json().catch(() => ({}));
        
        // Check for payload too large error
        if (response.status === 413) {
          // Reset conversation and try again with smaller payload
          this.conversationHistory = [
            {
              role: 'system',
              content: this.buildMinimalSystemMessage()
            },
            {
              role: 'user',
              content: userMessage
            }
          ];
          
          // Retry with smaller payload
          const retryResponse = await fetch(`${this.backendUrl}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: this.conversationHistory
            })
          });
          
          if (!retryResponse.ok) {
            throw new Error('Failed to get AI response. Please try again.');
          }
          
          const retryData = await retryResponse.json();
          this.handleResponse(retryData);
          return retryData;
        }
        
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const data = await response.json();
      this.handleResponse(data);
      return data;
      
    } catch (error) {
      console.error('AI Engine Error:', error);
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
    var self = this;
    const teams = window.boardData?.teams || {};
    const initiatives = window.boardData?.initiatives || [];
    
    console.log('🔍 Building system message with', Object.keys(teams).length, 'teams and', initiatives.length, 'initiatives');
    
    const teamData = Object.entries(teams).map(function(entry) {
      const name = entry[0];
      const data = entry[1];
      const issues = [];
      
      if (data.capacity === 'critical' || data.capacity === 'Critical') issues.push('Critical capacity');
      if (data.capacity === 'at-risk' || data.capacity === 'At Risk') issues.push('At-risk capacity');
      if (data.skillset === 'critical' || data.skillset === 'Critical') issues.push('Critical skillset');
      if (data.skillset === 'at-risk' || data.skillset === 'At Risk') issues.push('At-risk skillset');
      if (data.vision === 'critical' || data.vision === 'Critical') issues.push('Critical vision');
      if (data.vision === 'at-risk' || data.vision === 'At Risk') issues.push('At-risk vision');
      if (data.jira && data.jira.utilization > 95) issues.push('Overloaded at ' + data.jira.utilization + '% utilization');
      
      const riskScore = self.calculateTeamRisk(name, data);
      const commentText = data.jira?.comments || null;
      
      if (commentText) {
        console.log(`📝 Team ${name} has ${commentText.length} chars of comments`);
      }
      
      return {
        name,
        capacity: data.capacity,
        skillset: data.skillset,
        vision: data.vision,
        support: data.support,
        teamwork: data.teamwork,
        autonomy: data.autonomy,
        utilization: (data.jira && data.jira.utilization) || 0,
        activeStories: (data.jira && data.jira.stories) || 0,
        blockers: (data.jira && data.jira.blockers) || 0,  // ✅ FIXED: Read from .blockers not .flagged
        comments: commentText,
        riskScore: riskScore,
        issues: issues
      };
    });
    
    const initiativeData = initiatives.map(function(init) {
      const riskScore = self.calculateInitiativeRisk(init);
      
      return {
        title: init.title || init.name,
        type: init.type,
        priority: init.priority,
        validationStatus: init.validationStatus || init.validation,
        teams: init.teams || [],
        progress: init.progress || 0,
        stories: (init.jira && init.jira.stories) || 0,
        flagged: (init.jira && init.jira.flagged) || 0,
        customer: (init.canvas && init.canvas.customer) || null,
        problem: (init.canvas && init.canvas.problem) || null,
        solution: (init.canvas && init.canvas.solution) || null,
        marketSize: (init.canvas && init.canvas.marketSize) || null,
        keyResult: (init.canvas && init.canvas.keyResult) || null,
        successMetrics: (init.canvas && init.canvas.measures) || null,
        alternatives: (init.canvas && init.canvas.alternatives) || null,
        riskScore: riskScore
      };
    });
    
    console.log('✅ System message built - Sample team:', teamData[0]?.name, 'has', teamData[0]?.activeStories, 'active stories');
    console.log('✅ System message built - Sample init:', initiativeData[0]?.title, 'market size:', initiativeData[0]?.marketSize);
    
    return 'You are VueSense AI, a portfolio management assistant.\n\n' +
      'CURRENT PORTFOLIO DATA:\n\n' +
      'TEAMS (' + Object.keys(teams).length + ' total):\n' +
      JSON.stringify(teamData, null, 2) + '\n\n' +
      'INITIATIVES (' + initiatives.length + ' total):\n' +
      JSON.stringify(initiativeData, null, 2) + '\n\n' +
      'CRITICAL INSTRUCTIONS:\n' +
      '- You MUST answer questions using the ACTUAL DATA provided above\n' +
      '- When asked about teams, reference the team data by name\n' +
      '- When asked about initiatives, reference the initiative data by title\n' +
      '- When asked about market size, read the "marketSize" field\n' +
      '- When asked about active stories, read the "activeStories" field\n' +
      '- When asked about blockers, read the "blockers" field\n' +
      '- When asked about team comments, read the "comments" field and quote exactly\n' +
      '- When asked "how many teams", count the teams in the data above\n' +
      '- NEVER say "I don\'t have access to" or "I don\'t have specific data" - you DO have the data above!\n' +
      '- Always use specific team names and initiative titles from the data\n\n' +
      'ANTI-HALLUCINATION RULES:\n' +
      '- For team comments: USE THE EXACT TEXT from the "comments" field, in quotes\n' +
      '- NEVER make up or paraphrase comments\n' +
      '- If no comment exists, say "no comments provided"\n\n' +
      'RISK SCORE INTERPRETATION:\n' +
      'Team Risk Scores: 0-20 Low, 21-40 Moderate, 41-60 High, 61+ Critical\n' +
      'Initiative Risk Scores (out of 50): 0-12 Low, 13-22 Moderate, 23-35 High, 36+ Critical';
  }

  buildMinimalSystemMessage() {
    return 'You are VueSense AI, a portfolio management assistant. Answer questions about teams and initiatives based on the user\'s data. Be concise and specific.';
  }

  calculateTeamRisk(teamName, teamData) {
    var totalRisk = 0;
    var criticalCount = 0;
    var atRiskCount = 0;
    
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    dimensions.forEach(function(dim) {
      const value = teamData[dim];
      if (value === 'critical' || value === 'Critical') {
        criticalCount++;
        totalRisk += 15;
      } else if (value === 'at-risk' || value === 'At Risk') {
        atRiskCount++;
        totalRisk += 7;
      }
    });
    
    var multiplier = 1.0;
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
    // Use EXACT same logic as UI (script.js lines 1055-1156)
    let actualValues = {
      teamHealth: { capacity: 0, skillset: 0, support: 0, utilization: 0, vision: 0, teamwork: 0, autonomy: 0 },
      flaggedWork: { percentage: 0, count: 0, points: 0 },
      validation: { points: 0, reason: '' },
      priority: { points: 0, applied: false },
      totalScore: 0
    };
    
    // Team health points calculation
    if (initiative.teams && Array.isArray(initiative.teams)) {
      initiative.teams.forEach(teamName => {
        const team = window.boardData && window.boardData.teams && window.boardData.teams[teamName];
        if (!team) return;
        
        // CAPACITY (3 pts At Risk, 6 pts Critical)
        if (team.capacity === 'At Risk' || team.capacity === 'at-risk') {
          actualValues.teamHealth.capacity += 3;
        } else if (team.capacity === 'Critical' || team.capacity === 'critical') {
          actualValues.teamHealth.capacity += 6;
        }
        
        // SKILLSET (3 pts At Risk, 6 pts Critical)
        if (team.skillset === 'At Risk' || team.skillset === 'at-risk') {
          actualValues.teamHealth.skillset += 3;
        } else if (team.skillset === 'Critical' || team.skillset === 'critical') {
          actualValues.teamHealth.skillset += 6;
        }
        
        // SUPPORT (2 pts At Risk, 4 pts Critical)
        if (team.support === 'At Risk' || team.support === 'at-risk') {
          actualValues.teamHealth.support += 2;
        } else if (team.support === 'Critical' || team.support === 'critical') {
          actualValues.teamHealth.support += 4;
        }
        
        // UTILIZATION
        if (team.jira && team.jira.utilization > 95) {
          actualValues.teamHealth.utilization += 2;
        }
        
        // VISION (1 pt At Risk, 2 pts Critical)
        if (team.vision === 'At Risk' || team.vision === 'at-risk') {
          actualValues.teamHealth.vision += 1;
        } else if (team.vision === 'Critical' || team.vision === 'critical') {
          actualValues.teamHealth.vision += 2;
        }
        
        // TEAM COHESION (1 pt At Risk, 2 pts Critical)
        if (team.teamwork === 'At Risk' || team.teamwork === 'at-risk') {
          actualValues.teamHealth.teamwork += 1;
        } else if (team.teamwork === 'Critical' || team.teamwork === 'critical') {
          actualValues.teamHealth.teamwork += 2;
        }
        
        // AUTONOMY (1 pt At Risk, 2 pts Critical)
        if (team.autonomy === 'At Risk' || team.autonomy === 'at-risk') {
          actualValues.teamHealth.autonomy += 1;
        } else if (team.autonomy === 'Critical' || team.autonomy === 'critical') {
          actualValues.teamHealth.autonomy += 2;
        }
      });
    }
    
    // Flagged work points
    if (initiative.jira && initiative.jira.flagged > 0) {
      const totalStories = initiative.jira.stories || 0;
      const flaggedStories = initiative.jira.flagged || 0;
      const flaggedPercentage = totalStories > 0 ? (flaggedStories / totalStories) * 100 : 0;
      
      actualValues.flaggedWork.percentage = flaggedPercentage;
      actualValues.flaggedWork.count = flaggedStories;
      
      if (flaggedPercentage >= 50) actualValues.flaggedWork.points = 8;
      else if (flaggedPercentage >= 25) actualValues.flaggedWork.points = 5;
      else if (flaggedPercentage >= 15) actualValues.flaggedWork.points = 3;
      else if (flaggedPercentage >= 5) actualValues.flaggedWork.points = 2;
      else actualValues.flaggedWork.points = 1;
    }
    
    // Validation points
    if (initiative.priority >= 1 && initiative.priority <= 15) {
      const validation = initiative.validationStatus || initiative.validation;
      if (validation === 'not-validated') {
        if (initiative.type === 'strategic') {
          actualValues.validation.points = 2;
        } else if (initiative.type === 'ktlo' || initiative.type === 'emergent') {
          actualValues.validation.points = 1;
        }
      }
    }
    
    // Priority amplification
    const baseScore = Object.values(actualValues.teamHealth).reduce((a, b) => a + b, 0) + 
                     actualValues.flaggedWork.points + 
                     actualValues.validation.points;
    
    // Check if priority 1-10 (rows 1-2 in 5-column grid)
    if (initiative.priority <= 10 && baseScore > 4) {
      actualValues.priority.points = 1;
      actualValues.priority.applied = true;
    }
    
    actualValues.totalScore = baseScore + actualValues.priority.points;
    actualValues.totalScore = Math.min(actualValues.totalScore, 50);
    
    return actualValues.totalScore;
  }
}

// Create and export the engine
window.aiEngine = new AIEngine();

console.log('✅ VueSense AI Engine loaded - WITH ALL FIELDS AND SYSTEM MESSAGE UPDATES!');
