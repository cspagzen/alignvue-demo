/**
 * AI Chat Engine - Main conversation handler
 * Manages AI interactions with proper data context
 */

// ============================================================================
// CORE AI INTERACTION
// ============================================================================

async function askAI(question, conversationHistory = []) {
    try {
        // Check if API key exists
        if (!AI_CHAT_CONFIG.apiKey && !apiKeyManager.getKey()) {
            throw new Error('API key not configured. Please add your OpenAI API key in settings.');
        }

        // Get the relevant knowledge base based on question
        const knowledge = getRelevantKnowledge ? getRelevantKnowledge(question) : 
                         (window.AI_KNOWLEDGE_BASE || '');

        // CRITICAL: Extract current board data for AI context
        const currentData = extractBoardData();
        
        // Build the complete system prompt with data
        const systemPrompt = buildSystemPrompt(knowledge, currentData);

        // Prepare messages for API
        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: "user",
                content: question
            }
        ];

        // Make API call
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CHAT_CONFIG.apiKey || apiKeyManager.getKey()}`
            },
            body: JSON.stringify({
                model: AI_CHAT_CONFIG.model || 'gpt-4o-mini',
                messages: messages,
                temperature: AI_CHAT_CONFIG.temperature || 0.7,
                max_tokens: AI_CHAT_CONFIG.maxOutputTokens || 1500,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Track costs if enabled
        if (window.costTracker && AI_CHAT_CONFIG.costTrackingVisible) {
            const inputTokens = data.usage?.prompt_tokens || 0;
            const outputTokens = data.usage?.completion_tokens || 0;
            costTracker.addUsage(inputTokens, outputTokens);
        }

        return data.choices[0].message.content;

    } catch (error) {
        console.error('AI Chat Error:', error);
        throw error;
    }
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

function extractBoardData() {
    // Check if boardData exists
    if (!window.boardData) {
        console.warn('BoardData not available');
        return {
            error: 'Portfolio data not loaded',
            initiatives: [],
            teams: {},
            okrs: {},
            bullpen: []
        };
    }

    // Extract complete portfolio data
    const data = {
        timestamp: new Date().toISOString(),
        initiatives: extractInitiativesData(),
        teams: extractTeamsData(),
        okrs: extractOKRData(),
        bullpen: extractBullpenData(),
        summary: generatePortfolioSummary()
    };

    return data;
}

function extractInitiativesData() {
    if (!window.boardData?.initiatives) return [];
    
    return window.boardData.initiatives.map(initiative => ({
        id: initiative.id,
        title: initiative.title || initiative.name,
        type: initiative.type,
        priority: initiative.priority,
        row: initiative.row,
        column: initiative.column,
        validationStatus: initiative.validationStatus,
        teams: initiative.teams || [],
        progress: initiative.progress || 0,
        status: initiative.status,
        jira: initiative.jira || {},
        canvas: initiative.canvas || {},
        description: initiative.description,
        blockedCount: initiative.jira?.blockedStories || 0,
        flaggedCount: initiative.jira?.flaggedStories || 0
    }));
}

function extractTeamsData() {
    if (!window.boardData?.teams) return {};
    
    const teamsData = {};
    
    for (const [teamName, teamData] of Object.entries(window.boardData.teams)) {
        teamsData[teamName] = {
            name: teamName,
            // 6 Health Dimensions
            capacity: teamData.capacity || 'not-set',
            skillset: teamData.skillset || 'not-set',
            vision: teamData.vision || 'not-set',
            support: teamData.support || 'not-set',
            teamwork: teamData.teamwork || 'not-set',
            autonomy: teamData.autonomy || 'not-set',
            // Metrics
            utilization: teamData.utilization || 0,
            velocity: teamData.jira?.velocity || 0,
            activeStories: teamData.jira?.activeStories || 0,
            blockedStories: teamData.jira?.blockedStories || 0,
            flaggedStories: teamData.jira?.flaggedStories || 0,
            // Additional info
            comments: teamData.comments || '',
            initiativeCount: countTeamInitiatives(teamName)
        };
    }
    
    return teamsData;
}

function extractOKRData() {
    if (!window.boardData?.okrs) return {};
    
    return {
        objective: window.boardData.okrs.objective || '',
        keyResults: (window.boardData.okrs.keyResults || []).map(kr => ({
            id: kr.id,
            title: kr.title || kr.name,
            currentValue: kr.currentValue || 0,
            targetValue: kr.targetValue || 0,
            unit: kr.unit || '',
            progress: kr.progress || 0,
            trend: kr.trend || 'stable',
            history: kr.history || []
        }))
    };
}

function extractBullpenData() {
    if (!window.boardData?.bullpen) return [];
    
    return window.boardData.bullpen.map(item => ({
        id: item.id,
        title: item.title || item.name,
        type: item.type,
        validationStatus: item.validationStatus,
        teams: item.teams || [],
        description: item.description
    }));
}

function generatePortfolioSummary() {
    const initiatives = window.boardData?.initiatives || [];
    const teams = window.boardData?.teams || {};
    
    return {
        totalInitiatives: initiatives.length,
        aboveMendozaLine: initiatives.filter(i => i.row <= 5).length,
        belowMendozaLine: initiatives.filter(i => i.row > 5).length,
        totalTeams: Object.keys(teams).length,
        criticalTeams: countCriticalTeams(),
        atRiskTeams: countAtRiskTeams(),
        healthyTeams: countHealthyTeams()
    };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function countTeamInitiatives(teamName) {
    if (!window.boardData?.initiatives) return 0;
    return window.boardData.initiatives.filter(init => 
        init.teams && init.teams.includes(teamName)
    ).length;
}

function countCriticalTeams() {
    if (!window.boardData?.teams) return 0;
    return Object.values(window.boardData.teams).filter(team => 
        getTeamHealthLevel(team) === 'critical'
    ).length;
}

function countAtRiskTeams() {
    if (!window.boardData?.teams) return 0;
    return Object.values(window.boardData.teams).filter(team => {
        const level = getTeamHealthLevel(team);
        return level === 'high-risk' || level === 'low-risk';
    }).length;
}

function countHealthyTeams() {
    if (!window.boardData?.teams) return 0;
    return Object.values(window.boardData.teams).filter(team => 
        getTeamHealthLevel(team) === 'healthy'
    ).length;
}

function getTeamHealthLevel(team) {
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    let riskCount = 0;
    
    dimensions.forEach(dim => {
        if (team[dim] === 'at-risk' || team[dim] === 'critical') {
            riskCount++;
        }
    });
    
    if (riskCount === 0) return 'healthy';
    if (riskCount <= 2) return 'low-risk';
    if (riskCount <= 4) return 'high-risk';
    return 'critical';
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

function buildSystemPrompt(knowledge, currentData) {
    const basePrompt = window.AI_SYSTEM_PROMPT || `
You are VueSense AI, an expert portfolio management assistant. 
You help analyze and optimize strategic portfolio decisions.`;

    return `${basePrompt}

==== CURRENT PORTFOLIO DATA ====
${JSON.stringify(currentData, null, 2)}

==== KNOWLEDGE BASE ====
${knowledge}

==== INSTRUCTIONS ====
1. ALWAYS use the actual data provided above when answering questions
2. When referencing initiatives or teams, use the exact names from the data
3. For team questions, look at ALL teams in an initiative's teams array
4. Calculate metrics using the exact formulas from the knowledge base
5. If data is missing or unclear, state that explicitly
6. Provide specific, actionable recommendations based on the data

Remember: The user is looking at the actual board, so be precise and reference specific initiatives, teams, and metrics.`;
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

const conversationHistory = [];
const MAX_HISTORY_LENGTH = 10;

function addToHistory(role, content) {
    conversationHistory.push({ role, content });
    
    // Keep only recent messages
    while (conversationHistory.length > MAX_HISTORY_LENGTH * 2) {
        conversationHistory.splice(0, 2);
    }
}

async function askAIWithHistory(question) {
    // Add user question to history
    addToHistory('user', question);
    
    try {
        // Get AI response with full context
        const response = await askAI(question, conversationHistory);
        
        // Add AI response to history
        addToHistory('assistant', response);
        
        return response;
    } catch (error) {
        // Remove the question if there was an error
        conversationHistory.pop();
        throw error;
    }
}

function clearConversationHistory() {
    conversationHistory.length = 0;
}

// ============================================================================
// CACHING
// ============================================================================

const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedResponse(question) {
    const cached = responseCache.get(question);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.response;
    }
    return null;
}

function cacheResponse(question, response) {
    responseCache.set(question, {
        response,
        timestamp: Date.now()
    });
    
    // Limit cache size
    if (responseCache.size > 50) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }
}

async function askAIWithCache(question) {
    // Check cache first
    const cached = getCachedResponse(question);
    if (cached && AI_CHAT_CONFIG.cacheEnabled) {
        console.log('Using cached response');
        return cached;
    }
    
    // Get fresh response
    const response = await askAIWithHistory(question);
    
    // Cache it
    if (AI_CHAT_CONFIG.cacheEnabled) {
        cacheResponse(question, response);
    }
    
    return response;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function handleAIError(error) {
    console.error('AI Error:', error);
    
    if (error.message.includes('API key')) {
        return 'Please configure your OpenAI API key in settings to use AI features.';
    }
    
    if (error.message.includes('rate limit')) {
        return 'Rate limit reached. Please wait a moment and try again.';
    }
    
    if (error.message.includes('network')) {
        return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('Portfolio data not loaded')) {
        return 'Portfolio data is not available. Please refresh the page and try again.';
    }
    
    return 'An error occurred while processing your request. Please try again.';
}

// ============================================================================
// PUBLIC API
// ============================================================================

window.VueSenseAI = {
    ask: askAIWithCache,
    askDirect: askAI,
    clearHistory: clearConversationHistory,
    getHistory: () => [...conversationHistory],
    extractData: extractBoardData,
    handleError: handleAIError
};

// Log successful load
console.log('✅ AI Chat Engine loaded with data extraction');