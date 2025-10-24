/**
 * AI Chat Engine - FIXED TO USE ACTUAL COMMENT TEXT
 * NO MORE HALLUCINATED QUOTES!
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
  
  // CRITICAL FIX: Read comments from data.comments NOT data.jira.comments
  buildSystemMessage() {
    var self = this;
    const teams = window.boardData?.teams || {};
    const initiatives = window.boardData?.initiatives || [];
    
    console.log('🔍 Building system message with', Object.keys(teams).length, 'teams');
    
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
      
      // ✅ CRITICAL FIX: Read from data.comments (NOT data.jira.comments)
      const comments = data.comments || null;
      
      // Debug log to see what we're sending
      if (comments) {
        console.log(`📝 Team ${name} has comments:`, comments.substring(0, 100));
      }
      
      return {
        name: name,
        capacity: data.capacity,
        skillset: data.skillset,
        vision: data.vision,
        support: data.support,
        teamwork: data.teamwork,
        autonomy: data.autonomy,
        utilization: (data.jira && data.jira.utilization) || 0,
        comments: comments, // ✅ NOW READING FROM THE RIGHT PLACE!
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
        riskScore: riskScore
      };
    });
    
    return 'You are VueSense AI, a portfolio management assistant.\n\n' +
      'CURRENT PORTFOLIO DATA:\n\n' +
      'TEAMS (' + Object.keys(teams).length + ' total):\n' +
      JSON.stringify(teamData, null, 2) + '\n\n' +
      'INITIATIVES (' + initiatives.length + ' total):\n' +
      JSON.stringify(initiativeData, null, 2) + '\n\n' +
      'CRITICAL ANTI-HALLUCINATION RULES:\n' +
      '⚠️ WHEN ASKED FOR TEAM COMMENTS OR QUOTES:\n' +
      '  1. READ the "comments" field for each team\n' +
      '  2. USE THE EXACT TEXT from the comments field\n' +
      '  3. Put quotes around the actual comment text\n' +
      '  4. NEVER make up or paraphrase what teams said\n' +
      '  5. If a team has no comments, say "no comments provided"\n' +
      '  6. NEVER synthesize comments from health dimensions\n\n' +
      'EXAMPLE - CORRECT:\n' +
      'User: "Give me quotes from teams with capacity issues"\n' +
      'You: "Core Platform Team: \\"Our workload is very high, and autonomy is at risk. We often have to wait on architectural decisions from leadership, which slows our delivery.\\""\n\n' +
      'EXAMPLE - WRONG (DO NOT DO THIS):\n' +
      'You: "Core Platform Team: \\"We are experiencing critical capacity constraints\\"" ← THIS IS MADE UP!\n\n' +
      'INSTRUCTIONS:\n' +
      '- When asked "Which teams need support?", list the SPECIFIC team names that have issues\n' +
      '- When asked about team comments or patterns, read the "comments" field for each team\n' +
      '- When asked about risk scores, use the "riskScore" field that is already calculated\n' +
      '- Always use the actual data provided above\n' +
      '- Never give generic advice - always reference specific teams and initiatives by name\n' +
      '- IMPORTANT: Read team comments to understand WHY teams have issues - comments contain critical context\n' +
      '- IMPORTANT: Risk scores are already calculated - use them directly, do not recalculate\n\n' +
      'RISK SCORE INTERPRETATION:\n' +
      'Team Risk Scores: 0-20 Low, 21-40 Moderate, 41-60 High, 61+ Critical\n' +
      'Initiative Risk Scores: 0-7 Low, 8-11 Medium, 12-22 High, 23+ Critical';
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
    var riskScore = 0;
    
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
}

// Create and export the engine
window.aiEngine = new AIEngine();

console.log('✅ VueSense AI Engine loaded - FIXED to use actual comment text!');
