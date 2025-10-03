/**
 * VueSense AI Configuration
 * API settings, cost tracking, and feature flags
 */

const AI_CHAT_CONFIG = {
  // API Configuration
  apiProvider: 'openai',
  apiModel: 'gpt-5-mini', // Using GPT-5 Mini for best performance
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  
  // Model Parameters
  maxInputTokens: 8000,      // Context window for portfolio data
  maxOutputTokens: 2000,     // Maximum response length
  temperature: 0.3,          // Lower = more focused, higher = more creative
  
  // Cost Tracking (GPT-5 Mini estimated pricing)
  inputCostPer1M: 0.15,      // $0.15 per 1M input tokens
  outputCostPer1M: 0.60,     // $0.60 per 1M output tokens
  
  // Note: Actual GPT-5 Mini pricing will be updated when available
  // These are conservative estimates based on GPT-4o Mini
  
  // Caching
  cacheEnabled: true,
  cacheDuration: 300000,     // 5 minutes in milliseconds
  
  // UI Settings
  typingDelay: 1500,         // Simulated AI thinking time (ms)
  messageAnimationSpeed: 300,
  
  // Feature Flags
  suggestedQuestionsEnabled: true,
  conversationHistoryEnabled: true,
  costTrackingVisible: true,
  
  // System Prompt
  systemPrompt: `You are VueSense AI, an expert portfolio management consultant analyzing real-time data for an organization.

YOUR ROLE:
- Provide direct, actionable insights about portfolio health
- Identify patterns and risks in team capacity and initiative status
- Think like a seasoned consultant with strategic instincts
- Be concise but thorough
- Use natural, conversational language

RESPONSE GUIDELINES:
1. Answer the specific question directly
2. Provide evidence from the portfolio data
3. Highlight non-obvious patterns or risks
4. Suggest concrete next steps when appropriate
5. Keep responses under 200 words unless asked for details

TONE:
- Professional but approachable
- Data-driven but human
- Strategic and forward-thinking`,

  // Error Messages
  errors: {
    apiKeyMissing: 'Please configure your OpenAI API key in settings to start chatting.',
    apiError: 'Unable to reach AI service. Please check your connection and try again.',
    rateLimitError: 'Rate limit exceeded. Please wait a moment and try again.',
    networkError: 'Network error. Please check your internet connection.',
    invalidKey: 'Invalid API key. Please check your settings.',
    quotaExceeded: 'API quota exceeded. Please check your OpenAI account.'
  }
};

// API Key Management
class APIKeyManager {
  constructor() {
    this.storageKey = 'vuesense_openai_key';
  }
  
  setKey(apiKey) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }
    
    // Basic validation (OpenAI keys start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      console.warn('Warning: OpenAI API keys typically start with "sk-"');
    }
    
    localStorage.setItem(this.storageKey, apiKey.trim());
    return true;
  }
  
  getKey() {
    return localStorage.getItem(this.storageKey);
  }
  
  hasKey() {
    const key = this.getKey();
    return key && key.length > 0;
  }
  
  removeKey() {
    localStorage.removeItem(this.storageKey);
  }
  
  validateKey(apiKey) {
    return apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
  }
}

// Cost Tracking
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
    this.maxSize = 50;
  }
  
  getCacheKey(question, context) {
    // Create a simple hash from question + context summary
    const contextSummary = context ? JSON.stringify(context.summary) : '';
    return `${question.toLowerCase().trim()}_${contextSummary}`.substring(0, 100);
  }
  
  get(question, context) {
    if (!AI_CHAT_CONFIG.cacheEnabled) return null;
    
    const key = this.getCacheKey(question, context);
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp < AI_CHAT_CONFIG.cacheDuration)) {
      console.log('Cache hit:', key);
      return cached.response;
    }
    
    return null;
  }
  
  set(question, context, response) {
    if (!AI_CHAT_CONFIG.cacheEnabled) return;
    
    const key = this.getCacheKey(question, context);
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  clear() {
    this.cache.clear();
  }
}

// Export instances
const apiKeyManager = new APIKeyManager();
const costTracker = new CostTracker();
const responseCache = new ResponseCache();