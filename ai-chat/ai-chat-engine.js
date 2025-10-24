/**
 * AI Chat Engine - Uses Complete Data Prep
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
      // Build the system message with complete portfolio data
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
  
  buildSystemMessage() {
    // Check if boardData exists and has data
    if (!window.boardData || !window.boardData.initiatives || window.boardData.initiatives.length === 0) {
      console.warn('⚠️ boardData not fully loaded yet');
      return window.AI_SYSTEM_PROMPT + '\n\nWaiting for portfolio data to load...';
    }
    
    // Use the comprehensive data prep functions that extract ALL fields
    const context = preparePortfolioContext(window.boardData);
    
    if (!context) {
      console.error('Failed to prepare portfolio context');
      return window.AI_SYSTEM_PROMPT + '\n\nERROR: Could not load portfolio data';
    }
    
    const formattedContext = formatContextForAI(context);
    
    // Combine system prompt with complete portfolio data
    const systemMessage = window.AI_SYSTEM_PROMPT + '\n\n---\n\n## CURRENT PORTFOLIO DATA\n\n' + formattedContext;
    
    console.log('✅ System message built with COMPLETE data:');
    console.log('  Teams:', context.teams.length);
    console.log('  Initiatives:', context.initiatives.length);
    console.log('  Sample initiative canvas check:', context.initiatives[0]?.customer !== 'N/A' ? 'HAS DATA' : 'NO CANVAS DATA');
    console.log('  📊 SAMPLE MARKET SIZE:', context.initiatives[0]?.marketSize);
    console.log('  Total context length:', systemMessage.length, 'characters');
    
    // Log a snippet to verify canvas data is in the message
    if (systemMessage.includes('Market Size:')) {
      console.log('✅ CONFIRMED: Market Size data IS in the system message');
    } else {
      console.error('❌ ERROR: Market Size data NOT FOUND in system message!');
    }
    
    return systemMessage;
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

console.log('✅ VueSense AI Engine loaded with complete data prep');
