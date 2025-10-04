// ==========================================
// VueSense AI Chat Engine - Backend Version WITH KNOWLEDGE BASE
// ==========================================

// Cost Tracking (client-side only for display)
class CostTracker {
  constructor() {
    this.storageKey = 'vuesense_cost_tracker';
    this.load();
  }
  
  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      this.totalInputTokens = data.totalInputTokens || 0;
      this.totalOutputTokens = data.totalOutputTokens || 0;
      this.totalCost = data.totalCost || 0;
      this.questionCount = data.questionCount || 0;
      this.lastReset = data.lastReset || new Date().toISOString();
    } else {
      this.reset();
    }
  }
  
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCost: this.totalCost,
      questionCount: this.questionCount,
      lastReset: this.lastReset
    }));
  }
  
  trackUsage(inputTokens, outputTokens) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    
    const inputCost = (inputTokens / 1000000) * AI_CHAT_CONFIG.inputCostPer1M;
    const outputCost = (outputTokens / 1000000) * AI_CHAT_CONFIG.outputCostPer1M;
    
    this.totalCost += (inputCost + outputCost);
    this.questionCount += 1;
    
    this.save();
    
    return {
      inputTokens,
      outputTokens,
      cost: inputCost + outputCost,
      totalCost: this.totalCost
    };
  }
  
  getStats() {
    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCost: this.totalCost,
      questionCount: this.questionCount,
      avgCostPerQuestion: this.questionCount > 0 
        ? this.totalCost / this.questionCount 
        : 0,
      lastReset: this.lastReset
    };
  }
  
  reset() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCost = 0;
    this.questionCount = 0;
    this.lastReset = new Date().toISOString();
    this.save();
  }
}

// Response Cache
class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000;
  }
  
  generateKey(question, context) {
    const contextStr = context ? JSON.stringify(context) : '';
    return `${question.toLowerCase().trim()}_${contextStr}`;
  }
  
  set(question, context, response) {
    const key = this.generateKey(question, context);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }
  
  get(question, context) {
    const key = this.generateKey(question, context);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.response;
  }
  
  clear() {
    this.cache.clear();
  }
}

// ============================================================================
// NEW FUNCTIONS: Portfolio Context Preparation
// ============================================================================

function preparePortfolioContextForAI() {
  if (!window.boardData) {
    return "ERROR: No portfolio data available";
  }
  
  // Extract key portfolio metrics
  const teams = Object.keys(window.boardData.teams || {});
  const initiatives = window.boardData.initiatives || [];
  
  // Calculate summary stats
  const teamsAtRisk = teams.filter(teamName => {
    const team = window.boardData.teams[teamName];
    return team.capacity === 'Critical' || team.capacity === 'At Risk' ||
           team.skillset === 'Critical' || team.skillset === 'At Risk' ||
           team.vision === 'Critical' || team.vision === 'At Risk' ||
           team.support === 'Critical' || team.support === 'At Risk' ||
           team.teamwork === 'Critical' || team.teamwork === 'At Risk' ||
           team.autonomy === 'Critical' || team.autonomy === 'At Risk';
  }).length;
  
  const initiativesAboveLine = initiatives.filter(i => i.priority <= 15).length;
  const initiativesBelowLine = initiatives.filter(i => i.priority > 15).length;
  const notValidated = initiatives.filter(i => i.validation === 'not-validated').length;
  
  // Return formatted context
  return `
CURRENT PORTFOLIO STATE:
- Total Teams: ${teams.length}
- Teams At Risk: ${teamsAtRisk}
- Total Initiatives: ${initiatives.length}
- Above Mendoza Line: ${initiativesAboveLine}
- Below Mendoza Line: ${initiativesBelowLine}
- Not Validated: ${notValidated}

FULL DATA ACCESS:
You have complete access to window.boardData which contains:
- window.boardData.teams (${teams.length} teams with full health dimensions)
- window.boardData.initiatives (${initiatives.length} initiatives with teams, validation, priority, etc.)
- window.boardData.mendozaLineRow (currently: ${window.boardData.mendozaLineRow || 5})

TEAM NAMES: ${teams.join(', ')}

INITIATIVE NAMES: ${initiatives.map(i => i.name || i.title).filter(n => n).slice(0, 10).join(', ')}${initiatives.length > 10 ? '...' : ''}
`.trim();
}

function buildSystemMessageWithKnowledge(portfolioContext) {
  // Check if knowledge base and system prompt are loaded
  if (!window.AI_SYSTEM_PROMPT) {
    console.error('AI_SYSTEM_PROMPT not loaded!');
    return 'You are a helpful portfolio management assistant.';
  }
  
  if (!window.AI_KNOWLEDGE_BASE) {
    console.error('AI_KNOWLEDGE_BASE not loaded!');
    return window.AI_SYSTEM_PROMPT;
  }
  
  return `
${window.AI_SYSTEM_PROMPT}

---

# KNOWLEDGE BASE (Domain Expert Reference)

${window.AI_KNOWLEDGE_BASE}

---

# CURRENT PORTFOLIO DATA

${portfolioContext}

---

# YOUR TASK

Answer the user's question using:
1. The SYSTEM PROMPT rules for how to behave
2. The KNOWLEDGE BASE for domain understanding
3. The CURRENT PORTFOLIO DATA for specific facts

Remember: 
- ALWAYS query actual data from window.boardData
- NEVER give generic responses
- ALWAYS return specific team names, initiative names, and numbers
- Calculate risk scores using the exact formulas provided
- Format answers with: Direct Answer → Specific Data → Analysis → Recommendation
`.trim();
}

// ============================================================================
// Main AI Engine (MODIFIED)
// ============================================================================

class AIEngine {
  constructor() {
    this.conversationHistory = [];
    this.costTracker = new CostTracker();
    this.responseCache = new ResponseCache();
    this.backendUrl = AI_CHAT_CONFIG.backendUrl;
  }
  
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.backendUrl}/api/health`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
  
  async sendMessage(userMessage, context = null) {
    try {
      const cachedResponse = this.responseCache.get(userMessage, context);
      if (cachedResponse) {
        console.log('📦 Using cached response');
        return {
          response: cachedResponse,
          cached: true,
          cost: 0,
          usage: { inputTokens: 0, outputTokens: 0 }
        };
      }
      
      const isHealthy = await this.checkBackendHealth();
      if (!isHealthy) {
        throw new Error(AI_CHAT_CONFIG.errors.backendError || 'Backend service unavailable');
      }
      
      // MODIFIED: Build system message with knowledge base
      const portfolioContext = preparePortfolioContextForAI();
      const systemMessage = buildSystemMessageWithKnowledge(portfolioContext);
      
      // Add system message to conversation history (ONLY ONCE at the start)
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: systemMessage
        });
      }
      
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      
      const payload = {
        messages: this.conversationHistory,
        context: context ? this.buildContextPrompt(context) : null
      };
      
      const response = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || AI_CHAT_CONFIG.errors.apiError || 'API error occurred');
      }
      
      const data = await response.json();
      
      this.conversationHistory.push({
        role: 'assistant',
        content: data.response
      });
      
      const costInfo = this.costTracker.trackUsage(
        data.usage.inputTokens,
        data.usage.outputTokens
      );
      
      this.responseCache.set(userMessage, context, data.response);
      
      if (this.conversationHistory.length > 20) {
        // Keep system message + last 10 exchanges
        const systemMsg = this.conversationHistory[0];
        this.conversationHistory = [systemMsg, ...this.conversationHistory.slice(-19)];
      }
      
      return {
        response: data.response,
        cached: false,
        cost: costInfo.cost,
        usage: data.usage,
        totalCost: costInfo.totalCost
      };
      
    } catch (error) {
      console.error('AI Engine Error:', error);
      throw error;
    }
  }
  
  buildContextPrompt(context) {
    let prompt = 'Additional context: ';
    
    if (context.initiatives && context.initiatives.length > 0) {
      prompt += '\n\nCurrent Portfolio Context:\n';
      prompt += `Total Initiatives: ${context.initiatives.length}\n`;
      
      const byType = {};
      const byStatus = {};
      
      context.initiatives.forEach(init => {
        byType[init.type] = (byType[init.type] || 0) + 1;
        byStatus[init.validation] = (byStatus[init.validation] || 0) + 1;
      });
      
      prompt += '\nBy Type:\n';
      Object.entries(byType).forEach(([type, count]) => {
        prompt += `- ${type}: ${count}\n`;
      });
      
      prompt += '\nBy Status:\n';
      Object.entries(byStatus).forEach(([status, count]) => {
        prompt += `- ${status}: ${count}\n`;
      });
    }
    
    if (context.selectedInitiative) {
      const init = context.selectedInitiative;
      prompt += `\n\nCurrently Viewing Initiative:\n`;
      prompt += `Title: ${init.title}\n`;
      prompt += `Type: ${init.type}\n`;
      prompt += `Status: ${init.validation}\n`;
      prompt += `Priority: ${init.priority}\n`;
      prompt += `Teams: ${init.teams.join(', ')}\n`;
      prompt += `Progress: ${init.progress}%\n`;
    }
    
    if (context.currentView) {
      prompt += `\n\nCurrent View: ${context.currentView}\n`;
    }
    
    prompt += '\n\nProvide helpful, specific insights based on this context.';
    
    return prompt;
  }
  
  clearHistory() {
    this.conversationHistory = [];
    this.responseCache.clear();
  }
  
  getCostStats() {
    return this.costTracker.getStats();
  }
  
  resetCosts() {
    this.costTracker.reset();
  }
}

const aiEngine = new AIEngine();