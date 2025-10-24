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
      
      // âœ… FIXED: ALWAYS update system message with fresh data
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
    
    console.log('ðŸ” Building system message with', Object.keys(teams).length, 'teams and', initiatives.length, 'initiatives');
    
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
      
      const commentText = data.jira?.comments || null;
      
      if (commentText) {
        console.log(`ðŸ“ Team ${name} has ${commentText.length} chars of comments`);
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
        blockers: (data.jira && data.jira.blockers) || 0,  // âœ… FIXED: Read from .blockers not .flagged
        comments: commentText,
        portfolioRiskScore: data.portfolioRiskScore || 0,
        riskBreakdown: data.riskBreakdown || { health: 0, validation: 0, blockers: 0, focus: 0, utilization: 0 },
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
    
    console.log('âœ… System message built - Sample team:', teamData[0]?.name, 'has', teamData[0]?.activeStories, 'active stories');
    console.log('âœ… System message built - Sample init:', initiativeData[0]?.title, 'market size:', initiativeData[0]?.marketSize);
    
    return AI_SYSTEM_PROMPT + '\n\n' +
      '---\n\n' +
      'CURRENT PORTFOLIO DATA:\n\n' +
      'TEAMS (' + Object.keys(teams).length + ' total):\n' +
      JSON.stringify(teamData, null, 2) + '\n\n' +
      'INITIATIVES (' + initiatives.length + ' total):\n' +
      JSON.stringify(initiativeData, null, 2);
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
    let riskScore = 0;
    
    // 1. TEAM HEALTH RISK SCORING
    if (initiative.teams && Array.isArray(initiative.teams)) {
      initiative.teams.forEach(teamName => {
        const team = window.boardData && window.boardData.teams && window.boardData.teams[teamName];
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
    }
    
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
        (initiative.validation === 'not-validated' || initiative.validationStatus === 'not-validated')) {
      if (initiative.type === 'strategic') {
        riskScore += 2;
      } else if (initiative.type === 'ktlo' || initiative.type === 'emergent') {
        riskScore += 1;
      }
    }
    
    // 4. PRIORITY AMPLIFICATION
    // Check if initiative is in top 2 rows (priority 1-10 based on 5 columns)
    const isTopPriority = initiative.priority <= 10;
    if (isTopPriority && riskScore > 4) {
      riskScore += 1;
    }
    
    // Cap at 50 points
    riskScore = Math.min(riskScore, 50);
    
    return riskScore;
  }
}

// Create and export the engine
window.aiEngine = new AIEngine();

console.log('âœ… VueSense AI Engine loaded - WITH ALL FIELDS AND SYSTEM MESSAGE UPDATES!');
