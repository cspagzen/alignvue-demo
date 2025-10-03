// ==========================================
// VueSense AI Chat Engine - Backend Version
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

// Main AI Engine
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
      
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
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
    let prompt = 'You are VueSense AI, a helpful assistant for a product management application. ';
    
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