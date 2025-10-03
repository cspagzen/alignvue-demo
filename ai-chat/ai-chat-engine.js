/**
 * VueSense AI Engine
 * Handles OpenAI API calls and response generation
 */

class VueSenseAIEngine {
  constructor() {
    this.conversationHistory = [];
  }
  
  async askQuestion(question, boardData = null) {
    try {
      // 1. Check API key
      if (!apiKeyManager.hasKey()) {
        throw new Error(AI_CHAT_CONFIG.errors.apiKeyMissing);
      }
      
      // 2. Check cache
      const context = boardData ? preparePortfolioContext(boardData) : null;
      const cachedResponse = responseCache.get(question, context);
      
      if (cachedResponse) {
        return {
          answer: cachedResponse,
          cached: true,
          timestamp: new Date().toISOString()
        };
      }
      
      // 3. Prepare messages for OpenAI
      const messages = this.buildMessages(question, context);
      
      // 4. Call OpenAI API
      const response = await this.callOpenAI(messages);
      
      // 5. Track costs
      const costInfo = costTracker.trackUsage(
        response.usage.prompt_tokens,
        response.usage.completion_tokens
      );
      
      // 6. Cache response
      responseCache.set(question, context, response.content);
      
      // 7. Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: question },
        { role: 'assistant', content: response.content }
      );
      
      // Keep history limited to last 10 messages
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }
      
      return {
        answer: response.content,
        usage: response.usage,
        cost: costInfo.cost,
        totalCost: costInfo.totalCost,
        cached: false,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  buildMessages(question, context) {
    const messages = [];
    
    // System prompt with portfolio context
    let systemContent = AI_CHAT_CONFIG.systemPrompt;
    
    if (context) {
      systemContent += '\n\nCURRENT PORTFOLIO DATA:\n' + formatContextForAI(context);
    } else {
      systemContent += '\n\nNote: No portfolio data available. Provide general guidance.';
    }
    
    messages.push({
      role: 'system',
      content: systemContent
    });
    
    // Add recent conversation history (if enabled)
    if (AI_CHAT_CONFIG.conversationHistoryEnabled && this.conversationHistory.length > 0) {
      // Only include last 6 messages to save tokens
      const recentHistory = this.conversationHistory.slice(-6);
      messages.push(...recentHistory);
    }
    
    // Add current question
    messages.push({
      role: 'user',
      content: question
    });
    
    return messages;
  }
  
  async callOpenAI(messages) {
    const apiKey = apiKeyManager.getKey();
    
    const requestBody = {
  model: AI_CHAT_CONFIG.apiModel,
  messages: messages,
  temperature: AI_CHAT_CONFIG.temperature,
  max_completion_tokens: AI_CHAT_CONFIG.maxOutputTokens  // ✅ NEW - Correct parameter
};
    
    const response = await fetch(AI_CHAT_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(this.mapAPIError(response.status, errorData));
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }
  
  mapAPIError(status, errorData) {
    const errorMessage = errorData.error?.message || '';
    
    if (status === 401) {
      return AI_CHAT_CONFIG.errors.invalidKey;
    }
    if (status === 429) {
      if (errorMessage.includes('quota')) {
        return AI_CHAT_CONFIG.errors.quotaExceeded;
      }
      return AI_CHAT_CONFIG.errors.rateLimitError;
    }
    if (status >= 500) {
      return AI_CHAT_CONFIG.errors.apiError;
    }
    
    return `API Error: ${errorMessage || 'Unknown error occurred'}`;
  }
  
  handleError(error) {
    console.error('VueSense AI Error:', error);
    
    let userMessage = error.message || AI_CHAT_CONFIG.errors.apiError;
    
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      userMessage = AI_CHAT_CONFIG.errors.networkError;
    }
    
    return {
      answer: `⚠️ ${userMessage}`,
      error: true,
      timestamp: new Date().toISOString()
    };
  }
  
  clearHistory() {
    this.conversationHistory = [];
  }
  
  getHistory() {
    return this.conversationHistory;
  }
}

// Create global instance
const aiEngine = new VueSenseAIEngine();