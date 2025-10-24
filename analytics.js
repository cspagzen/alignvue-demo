/**
 * Google Analytics Helper for AlignVue
 * Custom event tracking for portfolio management actions
 */

// Check if GA is loaded
function isGALoaded() {
    return typeof gtag !== 'undefined';
}

// Generic event tracker
function trackEvent(eventName, eventParams = {}) {
    if (!isGALoaded()) {
        console.log('GA not loaded, skipping event:', eventName);
        return;
    }
    
    gtag('event', eventName, eventParams);
}

// === Navigation Events ===
function trackNavigation(view) {
    trackEvent('navigation', {
        view_name: view,
        event_category: 'Navigation'
    });
}

// === Initiative Events ===
function trackInitiativeView(initiativeTitle, teamName) {
    trackEvent('view_initiative', {
        initiative_title: initiativeTitle,
        team_name: teamName,
        event_category: 'Initiative'
    });
}

function trackInitiativeCreate(initiativeTitle, priority) {
    trackEvent('create_initiative', {
        initiative_title: initiativeTitle,
        priority: priority,
        event_category: 'Initiative'
    });
}

function trackInitiativePriorityChange(initiativeTitle, oldPriority, newPriority) {
    trackEvent('change_priority', {
        initiative_title: initiativeTitle,
        old_priority: oldPriority,
        new_priority: newPriority,
        event_category: 'Initiative'
    });
}

// === AI Chat Events ===
function trackAIChatOpen() {
    trackEvent('open_ai_chat', {
        event_category: 'AI_Assistant'
    });
}

function trackAIChatQuestion(questionLength, hasContext) {
    trackEvent('ask_ai_question', {
        question_length: questionLength,
        has_context: hasContext,
        event_category: 'AI_Assistant'
    });
}

function trackAIChatCost(cost, totalCost) {
    trackEvent('ai_chat_cost', {
        session_cost: cost,
        total_cost: totalCost,
        event_category: 'AI_Assistant',
        event_label: 'Cost_Tracking'
    });
}

// === Jira Sync Events ===
function trackJiraSync(syncType, itemCount) {
    trackEvent('jira_sync', {
        sync_type: syncType, // 'manual', 'auto', 'initial'
        item_count: itemCount,
        event_category: 'Data_Sync'
    });
}

function trackJiraSyncError(errorType) {
    trackEvent('jira_sync_error', {
        error_type: errorType,
        event_category: 'Data_Sync'
    });
}

// === Team Events ===
function trackTeamView(teamName, teamSize) {
    trackEvent('view_team', {
        team_name: teamName,
        team_size: teamSize,
        event_category: 'Team'
    });
}

// === Search Events ===
function trackSearch(query, resultCount) {
    trackEvent('search', {
        search_term: query.toLowerCase().substring(0, 50), // Limit PII
        result_count: resultCount,
        event_category: 'Search'
    });
}

// === Quick Filter Events ===
function trackQuickFilter(filterType, resultCount) {
    trackEvent('quick_filter', {
        filter_type: filterType,
        result_count: resultCount,
        event_category: 'Filters'
    });
}

// === Modal Events ===
function trackModalOpen(modalType) {
    trackEvent('open_modal', {
        modal_type: modalType,
        event_category: 'UI_Interaction'
    });
}

function trackModalClose(modalType, timeSpent) {
    trackEvent('close_modal', {
        modal_type: modalType,
        time_spent: timeSpent,
        event_category: 'UI_Interaction'
    });
}

// === User Engagement ===
function trackSessionDuration() {
    // Track session duration in 5-minute increments
    const sessionStart = sessionStorage.getItem('session_start');
    if (!sessionStart) {
        sessionStorage.setItem('session_start', Date.now());
        return;
    }
    
    const duration = Math.floor((Date.now() - parseInt(sessionStart)) / 60000); // minutes
    if (duration > 0 && duration % 5 === 0) {
        trackEvent('session_milestone', {
            duration_minutes: duration,
            event_category: 'Engagement'
        });
    }
}

// === Screen Resolution Tracking ===
function trackScreenResolution() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = (width / height).toFixed(2);
    
    trackEvent('screen_info', {
        resolution: `${width}x${height}`,
        aspect_ratio: ratio,
        event_category: 'Device_Info'
    });
}

// === Error Tracking ===
function trackError(errorType, errorMessage) {
    trackEvent('error_occurred', {
        error_type: errorType,
        error_message: errorMessage.substring(0, 100), // Limit length
        event_category: 'Errors'
    });
}

// === Performance Tracking ===
function trackPerformance(metricName, value) {
    trackEvent('performance_metric', {
        metric_name: metricName,
        metric_value: value,
        event_category: 'Performance'
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    // Track initial page view
    trackNavigation('initial_load');
    
    // Track screen resolution (helpful for your responsive design targets)
    trackScreenResolution();
    
    // Track session duration every 5 minutes
    setInterval(trackSessionDuration, 60000); // Check every minute
});

// === User Journey Tracking ===
const userJourney = [];
let journeyStartTime = Date.now();

function trackUserJourney(action, metadata = {}) {
    userJourney.push({
        action: action,
        timestamp: Date.now(),
        metadata: metadata
    });
    
    // After 5 actions, send journey to GA
    if (userJourney.length >= 5) {
        const journey = userJourney.map(j => j.action).join(' → ');
        const totalTime = Date.now() - journeyStartTime;
        
        trackEvent('user_journey', {
            event_category: 'Engagement',
            journey_path: journey.substring(0, 100),
            journey_length: userJourney.length,
            journey_duration_seconds: Math.floor(totalTime / 1000)
        });
        
        // Reset for next journey
        userJourney.length = 0;
        journeyStartTime = Date.now();
    }
}

// === Global Error Tracking ===
// Track all JavaScript errors
window.addEventListener('error', function(event) {
    if (window.analytics) {
        window.analytics.trackError(
            'javascript_error',
            event.message || 'Unknown error'
        );
        
        // Also log the file and line number
        if (event.filename) {
            console.error('Error tracked:', {
                message: event.message,
                file: event.filename,
                line: event.lineno,
                column: event.colno
            });
        }
    }
});

// Track all unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    if (window.analytics) {
        window.analytics.trackError(
            'promise_rejection',
            String(event.reason).substring(0, 100)
        );
        
        console.error('Promise rejection tracked:', event.reason);
    }
});

console.log('✅ Error tracking initialized');

// === Performance Tracking Helper ===
function trackAsyncOperation(operationName, asyncFunction) {
    return async function(...args) {
        const startTime = performance.now();
        
        try {
            const result = await asyncFunction(...args);
            const duration = performance.now() - startTime;
            
            if (window.analytics) {
                window.analytics.trackPerformance(operationName, Math.floor(duration));
                
                // Track if slow (> 2 seconds)
                if (duration > 2000) {
                    window.analytics.trackEvent('slow_operation', {
                        event_category: 'Performance',
                        operation: operationName,
                        duration_ms: Math.floor(duration)
                    });
                }
            }
            
            return result;
        } catch (error) {
            if (window.analytics) {
                window.analytics.trackError(operationName + '_error', error.message);
            }
            throw error;
        }
    };
}

console.log('✅ Performance tracking initialized');

// Export functions for global use
window.analytics = {
    trackEvent,
    trackNavigation,
    trackInitiativeView,
    trackInitiativeCreate,
    trackInitiativePriorityChange,
    trackAIChatOpen,
    trackAIChatQuestion,
    trackAIChatCost,
    trackJiraSync,
    trackJiraSyncError,
    trackTeamView,
    trackSearch,
    trackQuickFilter,
    trackModalOpen,
    trackModalClose,
    trackScreenResolution,
    trackError,
    trackPerformance,
    trackUserJourney,
    trackAsyncOperation
};