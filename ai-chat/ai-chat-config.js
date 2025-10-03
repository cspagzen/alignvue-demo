/**
 * VueSense AI Configuration - Backend Version
 * All sensitive config stored on Vercel backend
 */

const AI_CHAT_CONFIG = {
  // Backend Configuration
  backendUrl: 'https://vuesense-ai-backend-2519tgy58.vercel.app',
  
  // Model Configuration (for reference only - actual values used by backend)
  model: 'gpt-4o-mini',
  maxTokens: 1000,
  temperature: 0.7,
  
  // Cost Tracking (per 1M tokens)
  inputCostPer1M: 0.150,
  outputCostPer1M: 0.600,
  
  // Feature Flags
  cacheEnabled: true,
  cacheDuration: 300000, // 5 minutes
  conversationHistoryEnabled: true,
  maxHistoryMessages: 10,
  
  // Error Messages
  errors: {
    apiKeyMissing: 'API key configuration error. Please contact administrator.',
    apiError: 'Unable to reach AI service. Please check your connection and try again.',
    rateLimitError: 'Rate limit exceeded. Please wait a moment and try again.',
    networkError: 'Network error. Please check your internet connection.',
    invalidKey: 'Invalid API key configuration. Please contact administrator.',
    quotaExceeded: 'API quota exceeded. Please contact administrator.',
    backendError: 'Backend service unavailable. Please try again later.'
  },
  
  // UI Messages
  messages: {
    welcome: 'Hi! I\'m VueSense AI. I can help you analyze your portfolio, understand initiative priorities, and answer questions about your strategic planning.',
    thinkingPrefix: '💭 ',
    errorPrefix: '❌ ',
    placeholder: 'Ask me anything about your portfolio...'
  }
};