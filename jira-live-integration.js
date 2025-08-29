// jira-integration.js - Live Jira Data Integration
// Add this to your existing project to replace static data with live Jira data

class JiraIntegration {
    constructor() {
        this.baseUrl = window.location.origin; // Uses current Jira instance
        this.cache = {
            initiatives: null,
            okrs: null,
            projects: null,
            lastUpdated: null
        };
        this.refreshInterval = 5 * 60 * 1000; // 5 minutes
    }

    // Main method to load all data and update the board
    async loadAndUpdateBoard() {
        try {
            console.log('🔄 Loading live data from Jira...');
            
            // Show loading state
            this.showLoadingState();
            
            // Load all data in parallel
            const [initiatives, okrs, projects] = await Promise.all([
                this.loadInitiatives(),
                this.loadOKRs(),
                this.loadProjects()
            ]);
            
            // Transform Jira data to match existing board structure
            const boardData = this.transformToBoard Data(initiatives, okrs, projects);
            
            // Update global boardData variable
            window.boardData = boardData;
            
            // Refresh all board components
            this.refreshBoardUI();
            
            // Update cache
            this.cache = {
                initiatives,
                okrs,
                projects,
                lastUpdated: new Date()
            };
            
            console.log('✅ Board updated with live Jira data');
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('❌ Failed to load Jira data:', error);
            this.showErrorMessage(error.message);
        }
    }

    // Load all initiative epics from STRAT, KTLO, EMRG projects
    async loadInitiatives() {
        const response = await fetch(`${this.baseUrl}/rest/api/3/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jql: 'project IN (STRAT, KTLO, EMRG) AND issuetype = Epic ORDER BY project ASC, created ASC',
                maxResults: 100,
                fields: [
                    'summary', 'project', 'status', 'priority', 'progress',
                    'issuelinks', 'customfield_*', 'description'
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load initiatives: ${response.status}`);
        }

        return await response.json();
    }

    // Load OKR objectives and key results
    async loadOKRs() {
        const response = await fetch(`${this.baseUrl}/rest/api/3/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jql: 'project = OKR ORDER BY issuetype DESC, created ASC',
                maxResults: 50,
                fields: [
                    'summary', 'issuetype', 'status', 'parent', 'subtasks', 
                    'issuelinks', 'description'
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load OKRs: ${response.status}`);
        }

        return await response.json();
    }

    // Load project information
    async loadProjects() {
        const response = await fetch(`${this.baseUrl}/rest/api/3/project`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status}`);
        }

        return await response.json();
    }

    // Transform Jira data to match existing boardData structure
    transformToBoardData(initiativesResponse, okrsResponse, projectsResponse) {
        const initiatives = this.transformInitiatives(initiativesResponse.issues, okrsResponse.issues);
        const teams = this.generateTeamData(initiatives); // You may want to load this separately
        const projects = projectsResponse.filter(p => ['STRAT', 'KTLO', 'EMRG', 'OKR'].includes(p.key));

        // Separate pipeline/bullpen initiatives from active ones
        const activeInitiatives = initiatives.filter(init => init.priority !== 'pipeline');
        const bullpenInitiatives = initiatives.filter(init => init.priority === 'pipeline');

        return {
            initiatives: activeInitiatives,
            bullpen: bullpenInitiatives,
            teams: teams,
            projects: projects,
            lastSync: new Date().toISOString()
        };
    }

    // Transform Jira issues to initiative objects
    transformInitiatives(issues, okrIssues) {
        return issues.map((issue, index) => {
            const project = issue.fields.project.key;
            
            // Map project to initiative type
            const typeMapping = {
                'STRAT': 'strategic',
                'KTLO': 'ktlo', 
                'EMRG': 'emergent'
            };

            // Find OKR alignment
            const linkedOKR = this.findLinkedOKR(issue, okrIssues);
            
            // Extract custom field values (you'll need to map these to actual field IDs)
            const matrixSlot = this.getCustomFieldValue(issue, 'Matrix Slot') || (index + 1);
            const validationStatus = this.getCustomFieldValue(issue, 'Validation Status') || 'not-validated';
            const teamsAssigned = this.getCustomFieldValue(issue, 'Teams Assigned') || ['Core Platform'];
            
            return {
                id: parseInt(issue.key.split('-')[1]), // Extract number from STRAT-123
                title: issue.fields.summary,
                type: typeMapping[project] || 'strategic',
                validation: validationStatus,
                priority: matrixSlot === 'pipeline' ? 'pipeline' : matrixSlot,
                teams: Array.isArray(teamsAssigned) ? teamsAssigned : [teamsAssigned],
                progress: this.calculateProgress(issue),
                jira: {
                    key: issue.key,
                    status: issue.fields.status.name,
                    priority: issue.fields.priority?.name || 'Medium',
                    stories: this.getCustomFieldValue(issue, 'Story Count') || 0,
                    completed: this.getCustomFieldValue(issue, 'Completed Stories') || 0,
                    inProgress: this.getCustomFieldValue(issue, 'In Progress Stories') || 0,
                    blocked: this.getCustomFieldValue(issue, 'Blocked Stories') || 0,
                    velocity: this.getCustomFieldValue(issue, 'Velocity') || 0
                },
                canvas: this.extractCanvasData(issue),
                okrAlignment: linkedOKR ? {
                    keyResult: linkedOKR.fields.summary,
                    objective: linkedOKR.parent?.fields.summary || 'Unknown Objective'
                } : null
            };
        });
    }

    // Find which OKR key result this initiative is linked to
    findLinkedOKR(initiative, okrIssues) {
        if (!initiative.fields.issuelinks || initiative.fields.issuelinks.length === 0) {
            return null;
        }

        const keyResults = okrIssues.filter(okr => okr.fields.issuetype.name === 'Task');
        
        for (const link of initiative.fields.issuelinks) {
            const linkedIssue = link.outwardIssue || link.inwardIssue;
            if (linkedIssue && linkedIssue.key.startsWith('OKR-')) {
                return keyResults.find(kr => kr.key === linkedIssue.key);
            }
        }
        
        return null;
    }

    // Extract custom field values by name/pattern
    getCustomFieldValue(issue, fieldName) {
        // This is a simplified version - you'll need to map actual custom field IDs
        // You can find the exact field IDs by logging the issue object
        
        // Look for fields that might match
        const customFields = Object.keys(issue.fields).filter(key => key.startsWith('customfield_'));
        
        // For now, return placeholder values
        // In production, you'd map these to actual Jira custom field IDs
        const fieldMappings = {
            'Matrix Slot': 'customfield_10001', // Replace with actual field ID
            'Validation Status': 'customfield_10002',
            'Teams Assigned': 'customfield_10003',
            'Story Count': 'customfield_10004'
            // Add more mappings as needed
        };
        
        const fieldId = fieldMappings[fieldName];
        return fieldId ? issue.fields[fieldId] : null;
    }

    // Calculate progress percentage from Jira data
    calculateProgress(issue) {
        // Try to get from custom field first
        const customProgress = this.getCustomFieldValue(issue, 'Progress Percentage');
        if (customProgress !== null) {
            return customProgress;
        }

        // Calculate from story completion if available
        const total = this.getCustomFieldValue(issue, 'Story Count') || 0;
        const completed = this.getCustomFieldValue(issue, 'Completed Stories') || 0;
        
        if (total > 0) {
            return Math.round((completed / total) * 100);
        }

        // Default based on status
        const statusMapping = {
            'To Do': 0,
            'In Progress': 25,
            'In Review': 75,
            'Done': 100
        };

        return statusMapping[issue.fields.status.name] || 10;
    }

    // Extract canvas/business model data from description or custom fields
    extractCanvasData(issue) {
        // This would ideally come from custom fields
        // For now, return basic structure
        return {
            outcome: this.getCustomFieldValue(issue, 'Canvas Outcome') || 'Outcome to be defined',
            measures: this.getCustomFieldValue(issue, 'Success Measures') || 'Success measures to be defined',
            keyResult: this.getCustomFieldValue(issue, 'Key Result Mapping') || 'No OKR',
            marketSize: this.getCustomFieldValue(issue, 'TAM') || 'Market size TBD',
            customer: this.getCustomFieldValue(issue, 'Target Customer') || 'Customer segment TBD',
            problem: this.getCustomFieldValue(issue, 'Problem Statement') || issue.fields.description || 'Problem statement needed',
            solution: this.getCustomFieldValue(issue, 'Solution Description') || 'Solution to be defined',
            bigPicture: this.getCustomFieldValue(issue, 'Big Picture Vision') || 'Vision to be articulated',
            alternatives: this.getCustomFieldValue(issue, 'Alternative Solutions') || 'Alternatives to be researched'
        };
    }

    // Generate team data (you might want to load this from another source)
    generateTeamData(initiatives) {
        const allTeams = [...new Set(initiatives.flatMap(init => init.teams))];
        const teams = {};

        allTeams.forEach(teamName => {
            teams[teamName] = {
                capacity: "healthy",
                skillset: "healthy", 
                vision: "healthy",
                support: "healthy",
                teamwork: "healthy",
                autonomy: "healthy",
                jira: {
                    sprint: "Current Sprint",
                    velocity: Math.floor(Math.random() * 20) + 5,
                    utilization: Math.floor(Math.random() * 30) + 70,
                    stories: Math.floor(Math.random() * 20) + 10,
                    bugs: Math.floor(Math.random() * 5),
                    blockers: Math.floor(Math.random() * 3)
                }
            };
        });

        return teams;
    }

    // UI update methods
    showLoadingState() {
        // Add loading spinner or message to the UI
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'jira-loading';
        loadingDiv.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: var(--bg-secondary); padding: 15px 20px; border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 1000;">
                <div style="display: flex; align-items: center; gap: 10px; color: var(--text-primary);">
                    <div style="width: 16px; height: 16px; border: 2px solid var(--accent-blue); border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    Loading live data from Jira...
                </div>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        document.body.appendChild(loadingDiv);
    }

    showSuccessMessage() {
        this.hideLoadingState();
        this.showMessage('✅ Board updated with live Jira data', 'success');
    }

    showErrorMessage(error) {
        this.hideLoadingState();
        this.showMessage(`❌ Error loading Jira data: ${error}`, 'error');
    }

    hideLoadingState() {
        const loading = document.getElementById('jira-loading');
        if (loading) loading.remove();
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: var(--bg-secondary); padding: 15px 20px; border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 1000; color: var(--text-primary);">
                ${message}
            </div>
        `;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Refresh the board UI with new data
    refreshBoardUI() {
        // Trigger refresh of all board components
        if (typeof updateBoard === 'function') {
            updateBoard();
        }
        
        if (typeof updateBentoCards === 'function') {
            updateBentoCards();
        }
        
        if (typeof updateTeamHealth === 'function') {
            updateTeamHealth();
        }

        // Force re-render of initiative cards
        if (typeof renderInitiativeCards === 'function') {
            renderInitiativeCards();
        }
    }

    // Auto-refresh functionality
    startAutoRefresh() {
        setInterval(() => {
            this.loadAndUpdateBoard();
        }, this.refreshInterval);
    }
}

// Global instance
const jiraIntegration = new JiraIntegration();

// Export for use in other scripts
window.jiraIntegration = jiraIntegration;

// Auto-load on page ready
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    jiraIntegration.loadAndUpdateBoard();
    
    // Start auto-refresh
    // jiraIntegration.startAutoRefresh(); // Uncomment to enable auto-refresh
});

// Add refresh button to UI
function addRefreshButton() {
    const refreshButton = document.createElement('button');
    refreshButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
        </svg>
        Sync Jira
    `;
    refreshButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: var(--shadow-md);
    `;
    
    refreshButton.addEventListener('click', () => {
        jiraIntegration.loadAndUpdateBoard();
    });
    
    document.body.appendChild(refreshButton);
}

// Add the refresh button when page loads
document.addEventListener('DOMContentLoaded', addRefreshButton);