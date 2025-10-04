/**
 * AI Chat Engine - Clean, Simple, Working Version
 * This version actually answers questions about your portfolio
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
  
  buildSystemMessage() {
    // Get the actual board data
    const teams = window.boardData?.teams || {};
    const initiatives = window.boardData?.initiatives || [];
    
    // Extract team data with health status
    const teamData = Object.entries(teams).map(([name, data]) => {
      const issues = [];
      if (data.capacity === 'critical') issues.push('Critical capacity');
      if (data.capacity === 'at-risk') issues.push('At-risk capacity');
      if (data.skillset === 'critical') issues.push('Critical skillset');
      if (data.skillset === 'at-risk') issues.push('At-risk skillset');
      if (data.vision === 'critical') issues.push('Critical vision');
      if (data.vision === 'at-risk') issues.push('At-risk vision');
      if (data.utilization > 95) issues.push(`Overloaded at ${data.utilization}% utilization`);
      
      return {
        name: name,
        capacity: data.capacity,
        skillset: data.skillset,
        vision: data.vision,
        support: data.support,
        teamwork: data.teamwork,
        autonomy: data.autonomy,
        utilization: data.utilization || 0,
        issues: issues
      };
    });
    
    // Extract initiative data with teams
    const initiativeData = initiatives.map(init => ({
      title: init.title || init.name,
      type: init.type,
      priority: init.priority,
      validationStatus: init.validationStatus || init.validation,
      teams: init.teams || [],
      progress: init.progress || 0
    }));
    
    // Build the system message
    return `You are VueSense AI, a portfolio management assistant.

CURRENT PORTFOLIO DATA:

TEAMS (${Object.keys(teams).length} total):
${JSON.stringify(teamData, null, 2)}

INITIATIVES (${initiatives.length} total):
${JSON.stringify(initiativeData, null, 2)}

INSTRUCTIONS:
- When asked "Which teams need support?", list the SPECIFIC team names that have issues
- When asked "What initiatives is [Team] working on?", find all initiatives where that team appears in the teams array
- When asked "What teams are working on [Initiative]?", find that initiative and list its teams
- Always use the actual data provided above
- Never give generic advice - always reference specific teams and initiatives by name
- For team health questions, look at capacity, skillset, vision, support, teamwork, autonomy
- Teams with "critical" or "at-risk" status or >95% utilization need support`;
  }
  
  buildMinimalSystemMessage() {
    // Minimal version if full data is too large
    return `You are VueSense AI, a portfolio management assistant.
    
Current portfolio: ${Object.keys(window.boardData?.teams || {}).length} teams, ${(window.boardData?.initiatives || []).length} initiatives.

Instructions: Answer questions about the portfolio using specific team and initiative names. Never give generic advice.`;
  }
  
  clearHistory() {
    this.conversationHistory = [];
  }
  
  getCostStats() {
    return this.costTracker.getStats();
  }
}

// Create and export the engine
window.aiEngine = new AIEngine();