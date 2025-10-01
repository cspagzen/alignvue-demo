        let currentZoom = 1;
        let selectedInitiativeId = null;
        let draggedInitiative = null;

// Completion data caching
const COMPLETION_CACHE_KEY = 'jira_completion_cache';
const CACHE_EXPIRY_KEY = 'jira_completion_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 30 minutes

function cacheCompletionData(initiatives) {
    const cacheData = initiatives.map(init => ({
        id: init.id,
        jiraKey: init.jira?.key,
        progress: init.progress,
        stories: init.jira?.stories,
        completed: init.jira?.completed,
        inProgress: init.jira?.inProgress,
        blocked: init.jira?.blocked,
        hasLiveData: init.jira?.hasLiveData
    }));
    
    localStorage.setItem(COMPLETION_CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION);
    console.log(`Cached completion data for ${cacheData.length} initiatives`);
}

function loadCachedCompletionData() {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiry || Date.now() > parseInt(expiry)) {
        return null;
    }
    
    const cached = localStorage.getItem(COMPLETION_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
}

function applyCachedCompletion(initiatives) {
    const cachedData = loadCachedCompletionData();
    if (!cachedData) return false;
    
    let appliedCount = 0;
    cachedData.forEach(cached => {
        if (!cached.jiraKey) return;
        
        const initiative = initiatives.find(init => init.jira?.key === cached.jiraKey);
        if (initiative) {
            initiative.progress = cached.progress;
            initiative.jira.stories = cached.stories;
            initiative.jira.completed = cached.completed;
            initiative.jira.inProgress = cached.inProgress;
            initiative.jira.blocked = cached.blocked;
            initiative.jira.hasLiveData = cached.hasLiveData;
            appliedCount++;
        }
    });
    
    console.log(`Applied cached completion data to ${appliedCount} initiatives`);
    return appliedCount > 0;
}

        function getRowGradientColor(row) {
            const colors = [
                'linear-gradient(135deg, #10b981, #059669)',
                'linear-gradient(135deg, #34d399, #10b981)', 
                'linear-gradient(135deg, #fbbf24, #f59e0b)',
                'linear-gradient(135deg, #fb923c, #ea580c)',
                'linear-gradient(135deg, #f87171, #dc2626)', 
                'linear-gradient(135deg, #ef4444, #b91c1c)', 
                'linear-gradient(135deg, #dc2626, #991b1b)',
                'linear-gradient(135deg, #b91c1c, #7f1d1d)'
            ];
            return colors[row - 1];
        }

        function getTypeColor(type) {
    switch(type) {
        case 'strategic': return 'bg-teal-500';    // Should be BLUE border
        case 'ktlo': return 'bg-violet-500';       // Should be PURPLE border  
        case 'emergent': return 'bg-orange-500';   // Should be ORANGE border
        default: return 'bg-gray-500';
    }
}

        function getValidationIndicator(validation) {
    switch(validation) {
        case 'validated': 
            return '<div class="absolute top-1 right-1" style="border: none !important; outline: none !important;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg></div>';
        case 'in-validation': 
            return '<div class="absolute top-1 right-1" style="border: none !important; outline: none !important;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/></svg></div>';
        case 'not-validated': 
            return '<div class="absolute top-1 right-1" style="border: none !important; outline: none !important;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg></div>';
        default: 
            return '<div class="absolute top-1 right-1" style="border: none !important; outline: none !important;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg></div>';
    }
}

        function getHealthClass(status) {
            return status === 'healthy' ? 'health-healthy' : 'health-at-risk';
        }
        function getValidationColor(validation) {
            switch(validation) {
                case 'validated': return 'bg-lime-300 border-2 border-black';
                case 'in-validation': return 'bg-yellow-300 border-2 border-black';
                case 'not-validated': return 'bg-red-500 border-2 border-black';
                default: return 'bg-red-500 border-2 border-white';
            }
        }
        
        // Drag and Drop Functions
       function getRowColFromSlot(slot) {
    let row = 1;
    let slotsUsed = 0;
    
    // Find which row this slot is in
    while (slotsUsed + row < slot) {
        slotsUsed += row;
        row++;
    }
    
    // Calculate column position within the row (right-to-left: 1 = rightmost)
    const positionInRow = slot - slotsUsed;
    const col = row - positionInRow + 1;  // This reverses the order for right-to-left
    return { row, col };
}

function getSlotFromRowCol(row, col) {
    // Calculate how many slots are in rows above this one
    let slotsAbove = 0;
    for (let r = 1; r < row; r++) {
        slotsAbove += r;
    }
    
    // Add position within current row (right-to-left: col 1 = rightmost = highest priority in row)
    return slotsAbove + (row - col + 1);
}

function getRowColFromLinearSlot(slot) {
    let row = 1;
    let totalPositions = 0;
    
    while (totalPositions + row < slot) {
        totalPositions += row;
        row++;
    }
    
    const positionInRow = slot - totalPositions;
    const col = row - positionInRow + 1;
    return { row, col };
}

function shiftInitiativesDown(fromSlot) {
    // Get all initiatives that need to be shifted
    const toShift = boardData.initiatives.filter(init => init.priority >= fromSlot);
    
    // Shift each one down by 1
    toShift.forEach(init => {
        init.priority++;
        
        // If it goes beyond slot 36, move to bullpen
        if (init.priority > 36) {
            init.priority = "bullpen";
            
            // Remove from initiatives array
            const index = boardData.initiatives.indexOf(init);
            boardData.initiatives.splice(index, 1);
            
            // Find first available bullpen slot
            const emptySlot = boardData.bullpen.findIndex(slot => !slot);
            if (emptySlot !== -1) {
                boardData.bullpen[emptySlot] = init;
            } else {
                boardData.bullpen.push(init);
            }
        }
    });
}

        function enableDragAndDrop(card, initiative) {
            card.draggable = true;
            
            card.addEventListener('dragstart', function(e) {
                draggedInitiative = initiative;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.outerHTML);
            });

            card.addEventListener('dragend', function() {
                card.classList.remove('dragging');
                draggedInitiative = null;
            });
        }

       function enableDropZone(dropZone, targetRow, targetCol) {
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        if (draggedInitiative) {
           const targetSlot = getSlotFromRowCol(targetRow, targetCol);
            
            if (draggedInitiative.priority === "pipeline") {
                // Moving from bullpen to matrix
                handleBullpenToMatrix(draggedInitiative, targetSlot);
            } else {
                // Moving within matrix
                handleMatrixToMatrix(draggedInitiative, targetSlot);
            }
            
            generatePyramid();
            generateTeamHealthMatrix();
            
        }
    });
}

function handleBullpenToMatrix(initiative, targetSlot) {
    // Remove from bullpen
    const bullpenIndex = boardData.bullpen.findIndex(init => init && init.id === initiative.id);
    if (bullpenIndex !== -1) {
        boardData.bullpen[bullpenIndex] = null;
    }
    
    // Shift everything at target slot and higher down by 1
    shiftInitiativesDown(targetSlot);
    
    // Place initiative at target slot
    initiative.priority = targetSlot;
    queueJiraUpdate(initiative, { priority: targetSlot });
    boardData.initiatives.push(initiative);
    
    // Refresh the pipeline display after moving item
    setTimeout(() => {
        updatePipelineCard();
    }, 100);
}

function handleMatrixToMatrix(initiative, targetSlot) {
    const sourceSlot = initiative.priority;
    
    if (sourceSlot === targetSlot) return; // No change needed
    if (targetSlot < sourceSlot) {
        // Moving up (to higher priority) - shift items at target and between down by 1
        boardData.initiatives.forEach(init => {
            if (init.id !== initiative.id && init.priority >= targetSlot && init.priority < sourceSlot) {
                init.priority++;
                
                // Handle overflow to bullpen
                if (init.priority > 36) {
                    init.priority = "bullpen";
                    const index = boardData.initiatives.indexOf(init);
                    boardData.initiatives.splice(index, 1);
                    
                    const emptySlot = boardData.bullpen.findIndex(slot => !slot);
                    if (emptySlot !== -1) {
                        boardData.bullpen[emptySlot] = init;
                    } else {
                        boardData.bullpen.push(init);
                    }
                }
            }
        });
    } else {
        // Moving down (to lower priority) - shift items between source and target up by 1
        boardData.initiatives.forEach(init => {
            if (init.id !== initiative.id && init.priority > sourceSlot && init.priority <= targetSlot) {
                init.priority--;
            }
        });
    }
    
    // Place dragged initiative at target slot
    initiative.priority = targetSlot;
    queueJiraUpdate(initiative, { priority: targetSlot });
}
      
function handleAtRiskCardClick(initiativeId) {
    const initiative = boardData.initiatives.find(init => init.id === initiativeId);
    if (initiative) {
        // Highlight on main board
        highlightInitiativeAndTeam(initiative.id);
        // Show specialized at-risk analysis modal
        showAtRiskAnalysisModal(initiative);
    }
}

// =============================================================================
// AT-RISK MODAL: CLEAN TABBED INTERFACE WITH PROPER SCROLLING
// Risk Factors (default), Impacted Teams, Recommendations - no action buttons
// =============================================================================

function injectAtRiskModalStyles() {
    if (!document.getElementById('at-risk-modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'at-risk-modal-styles';
        styleSheet.textContent = `
            .at-risk-tab {
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .at-risk-tab:hover {
                color: var(--accent-primary) !important;
            }
            
            .tab-content {
                transition: opacity 0.2s ease;
            }
            
            .tab-content.hidden {
                display: none;
            }
            
            .team-detail-card {
                background: var(--bg-tertiary);
                border: 1px solid var(--border-primary);
                border-radius: 8px;
                padding: 16px;
                transition: all 0.2s ease;
            }
            
            .team-detail-card:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .health-indicator {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 8px;
                border-radius: 4px;
                font-size: 12px;
                margin: 2px 0;
            }
            
            .health-indicator.healthy {
                background: rgba(34, 197, 94, 0.1);
                color: var(--accent-green);
            }
            
            .health-indicator.at-risk {
                background: rgba(239, 68, 68, 0.1);
                color: var(--accent-red);
            }
            
            .scrollbar-hide {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            
            #at-risk-tab-content {
                scrollbar-width: auto;
                scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
            }
            
            #at-risk-tab-content::-webkit-scrollbar {
                width: 8px;
            }
            
            #at-risk-tab-content::-webkit-scrollbar-track {
                background: transparent;
            }
            
            #at-risk-tab-content::-webkit-scrollbar-thumb {
                background-color: rgba(156, 163, 175, 0.5);
                border-radius: 4px;
            }
            
            #at-risk-tab-content::-webkit-scrollbar-thumb:hover {
                background-color: rgba(156, 163, 175, 0.7);
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

function showAtRiskAnalysisModal(initiative) {
   injectAtRiskModalStyles();
   
   const modal = document.getElementById('detail-modal');
   const title = document.getElementById('modal-title');
   const content = document.getElementById('modal-content');
   
   const riskAnalysis = analyzeInitiativeRisk(initiative);
   const riskLevel = getRiskLevel(riskAnalysis.riskScore);
   
   title.textContent = `At-Risk Analysis: ${initiative.title}`;
   
   content.innerHTML = `
       <div class="space-y-4">
           <div class="flex items-center justify-between p-4 rounded-lg" style="background: linear-gradient(135deg, ${riskLevel.bgColor} 0%, ${riskLevel.bgColorLight} 100%); border: 1px solid ${riskLevel.borderColor};">
               <div class="flex items-center gap-4">
                   <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: ${riskLevel.color}; color: white;">
                       ${riskLevel.icon}
                   </div>
                   <div>
                       <div class="font-bold text-lg" style="color: ${riskLevel.color};">${riskLevel.label}</div>
                       <div class="text-sm" style="color: var(--text-secondary);">Priority ${initiative.priority} • ${initiative.type.toUpperCase()}</div>
                   </div>
               </div>
               <div class="text-right">
                   <div class="text-3xl font-bold" style="color: ${riskLevel.color};">${riskAnalysis.riskScore}/50</div>
                   <button onclick="showRiskScoreInfoModalForInitiative(${initiative.id})" class="text-xs underline hover:opacity-75 transition-opacity" style="color: var(--accent-blue); background: none; border: none; padding: 0; cursor: pointer;">
    See the full risk score breakdown for this initiative
                   </button>
               </div>
           </div>

           <div class="border-b" style="border-color: var(--border-primary);">
               <div class="flex space-x-6 overflow-x-auto pb-2" style="scrollbar-width: none; -ms-overflow-style: none;">
                   <button onclick="switchAtRiskTab('factors')" 
                           id="factors-tab" 
                           class="at-risk-tab active py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0"
                           style="border-color: var(--accent-primary); color: var(--accent-primary);">
                       Risk Factors
                       <span class="ml-2 px-2 py-1 rounded-full text-xs" style="background: var(--accent-primary); color: white;">
                           ${riskAnalysis.riskFactors.length}
                       </span>
                   </button>
                   <button onclick="switchAtRiskTab('teams')" 
                           id="teams-tab" 
                           class="at-risk-tab py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0"
                           style="border-color: transparent; color: var(--text-secondary);">
                       Impacted Teams
                       <span class="ml-2 px-2 py-1 rounded-full text-xs" style="background: var(--text-tertiary); color: var(--text-secondary);">
                           ${riskAnalysis.impactedTeams.length}
                       </span>
                   </button>
                   <button onclick="switchAtRiskTab('blocked-work')" 
                           id="blocked-work-tab" 
                           class="at-risk-tab py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0"
                           style="border-color: transparent; color: var(--text-secondary);">
                       Blocked Work
                       <span class="ml-2 px-2 py-1 rounded-full text-xs" style="background: var(--text-tertiary); color: var(--text-secondary);">
                           ${initiative.jira?.flagged || 0}
                       </span>
                   </button>
                   <button onclick="switchAtRiskTab('recommendations')" 
                           id="recommendations-tab" 
                           class="at-risk-tab py-2 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0"
                           style="border-color: transparent; color: var(--text-secondary);">
                       Recommendations
                       <span class="ml-2 px-2 py-1 rounded-full text-xs" style="background: var(--text-tertiary); color: var(--text-secondary);">
                           ${riskAnalysis.recommendations.length}
                       </span>
                   </button>
               </div>
           </div>

           <div id="at-risk-tab-content" style="max-height: 400px; overflow-y: auto;">
               <div id="factors-content" class="tab-content">
                   ${riskAnalysis.riskFactors.length > 0 ?
                       `<div class="space-y-3">
                           ${riskAnalysis.riskFactors.map(factor => `
                               <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border-left: 4px solid ${factor.color};">
                                   <div class="flex items-start justify-between mb-2">
                                       <h4 class="font-semibold" style="color: var(--text-primary);">${factor.name}</h4>
                                       <span class="px-2 py-1 rounded text-xs font-medium" style="background: ${factor.color}; color: white;">
                                           ${factor.severity}
                                       </span>
                                   </div>
                                   <p class="text-sm mb-2" style="color: var(--text-secondary);">${factor.description}</p>
                                   <div class="text-xs" style="color: var(--text-secondary);">
                                       <strong>Impact:</strong> ${factor.impact}
                                   </div>
                               </div>
                           `).join('')}
                       </div>` : 
                       `<div class="text-center py-8" style="color: var(--text-secondary);">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
                               <path d="M9 12l2 2 4-4"/>
                               <circle cx="12" cy="12" r="10"/>
                           </svg>
                           <p>No significant risk factors detected</p>
                       </div>`
                   }
               </div>
              <div id="teams-content" class="tab-content hidden">
                   ${riskAnalysis.impactedTeams.length > 0 ?
                       `<div class="space-y-3">
                           ${riskAnalysis.impactedTeams.map(team => `
                               <div class="team-detail-card" style="border-left: 4px solid ${team.riskColor};">
                                   <div class="flex items-center justify-between mb-3">
                                       <h4 class="font-semibold" style="color: var(--text-primary);">${team.name}</h4>
                                       <div class="w-3 h-3 rounded-full" style="background: ${team.riskColor};"></div>
                                   </div>
                                   <div class="space-y-2">
                                       ${team.riskFactors.map(factor => {
                                           // Handle both old string format and new object format
                                           const factorName = typeof factor === 'string' ? factor : factor.name;
                                           const factorState = typeof factor === 'string' ? 'At Risk' : factor.state;
                                           const cssClass = factorState === 'Critical' ? 'health-indicator critical' : 'health-indicator at-risk';
                                           
                                           return `
                                               <div class="${cssClass}">
                                                   <span>${factorName}</span>
                                                   <span>${factorState}</span>
                                               </div>
                                           `;
                                       }).join('')}
                                   </div>
                               </div>
                           `).join('')}
                       </div>` :
                       `<div class="text-center py-8" style="color: var(--text-secondary);">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
                               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                               <circle cx="9" cy="7" r="4"/>
                               <path d="m22 21-3-3m0-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                           </svg>
                           <p>No teams at risk</p>
                       </div>`
                   }
               </div>
               <div id="blocked-work-content" class="tab-content hidden">
                   <!-- Content populated by switchAtRiskTab -->
               </div>
               <div id="recommendations-content" class="tab-content hidden">
                   ${riskAnalysis.recommendations.length > 0 ?
                       `<div class="space-y-3">
                           ${riskAnalysis.recommendations.map((rec, index) => `
                               <div class="flex items-start gap-3 p-3 rounded-lg" style="background: var(--bg-tertiary);">
                                   <div class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style="background: var(--accent-blue); color: white;">
                                       ${index + 1}
                                   </div>
                                   <div class="text-sm leading-relaxed" style="color: var(--text-primary);">${rec}</div>
                               </div>
                           `).join('')}
                       </div>` : 
                       `<div class="text-center py-8" style="color: var(--text-secondary);">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
                               <path d="M9 12l2 2 4-4"/>
                               <circle cx="12" cy="12" r="10"/>
                           </svg>
                           <p>No recommendations needed</p>
                       </div>`
                   }
               </div>
           </div>
       </div>
   `;
   
   modal.classList.add('show');
}

function switchAtRiskTab(tabName) {
    document.querySelectorAll('.at-risk-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.borderColor = 'transparent';
        tab.style.color = 'var(--text-secondary)';
        
        const badge = tab.querySelector('span');
        if (badge) {
            badge.style.background = 'var(--text-tertiary)';
            badge.style.color = 'var(--text-secondary)';
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeTab = document.getElementById(`${tabName}-tab`);
    const activeContent = document.getElementById(`${tabName}-content`);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeTab.style.borderColor = 'var(--accent-primary)';
        activeTab.style.color = 'var(--accent-primary)';
        
        const badge = activeTab.querySelector('span');
        if (badge) {
            badge.style.background = 'var(--accent-primary)';
            badge.style.color = 'white';
        }
        
        activeContent.classList.remove('hidden');
        
        // Handle blocked-work tab content
if (tabName === 'blocked-work') {
    // Find the initiative that opened this modal by looking at the modal title
    const modalTitle = document.getElementById('modal-title').textContent;
    const initiativeTitle = modalTitle.replace('At-Risk Analysis: ', '');
    const initiative = boardData.initiatives.find(i => i.title === initiativeTitle);
    
    // Insert content directly into activeContent (which exists and is the correct element)
    if (initiative && activeContent) {
        activeContent.innerHTML = generateBlockedWorkTab(initiative);
        console.log('Content inserted into activeContent');
    } else {
        console.log('Missing initiative or activeContent:', {initiative: !!initiative, activeContent: !!activeContent});
    }
}
    }
}

function generateBlockedWorkTab(initiative) {
    const jira = initiative.jira || {};
    const flaggedCount = jira.flagged || 0;
    
    if (flaggedCount === 0) {
        return `
            <div class="text-center py-8">
                <h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);">No Flagged Work</h3>
                <p style="color: var(--text-secondary);">All ${jira.stories || 0} stories are progressing normally.</p>
            </div>
        `;
    }
    
    const flaggedStories = (jira.childIssues || []).filter(issue => {
        const flaggedValue = issue.fields.customfield_10021;
        return flaggedValue && Array.isArray(flaggedValue) && flaggedValue.length > 0;
    });
    
    return `
        <div class="space-y-4">
            <div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">
                <div class="text-2xl font-bold mb-1" style="color: var(--accent-red);">${flaggedCount}</div>
                <div class="text-sm" style="color: var(--text-secondary);">Flagged Stories</div>
            </div>

            <div class="space-y-2">
                ${flaggedStories.map(story => `
                    <div class="p-3 rounded cursor-pointer transition-colors hover:bg-opacity-80" 
                         style="background: var(--bg-tertiary); border-left: 4px solid var(--accent-red);"
                         onclick="window.open('https://alignvue.atlassian.net/browse/${story.key}', '_blank')">
                        <div class="font-medium text-sm" style="color: var(--text-primary);">
                            ${story.key}: ${story.fields.summary}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function analyzeInitiativeRisk(initiative) {
    const analysis = {
        riskScore: 0,
        riskFactors: [],
        impactedTeams: [],
        recommendations: [],
        primaryRiskFactors: []
    };

    // Track team health issues for risk factors
    let teamHealthIssues = {
        criticalTeams: [],
        atRiskTeams: [],
        overUtilizedTeams: []
    };

    // UPDATED TEAM HEALTH RISK SCORING with 4-state support
    initiative.teams.forEach(teamName => {
        const team = boardData.teams[teamName];
        if (!team) return;

        const teamRiskFactors = [];
        let teamRiskColor = 'var(--accent-green)';

        // CAPACITY SCORING (3 pts At Risk, 6 pts Critical)
        if (team.capacity === 'At Risk' || team.capacity === 'at-risk') {
            teamRiskFactors.push('Capacity');
            analysis.riskScore += 3;
            teamHealthIssues.atRiskTeams.push(`${teamName} (Capacity)`);
        } else if (team.capacity === 'Critical' || team.capacity === 'critical') {
            teamRiskFactors.push('Capacity'); // FIXED: Remove (Critical) suffix
            analysis.riskScore += 6;
            teamHealthIssues.criticalTeams.push(`${teamName} (Capacity)`);
        }
        
        // SKILLSET SCORING (3 pts At Risk, 6 pts Critical)
        if (team.skillset === 'At Risk' || team.skillset === 'at-risk') {
            teamRiskFactors.push('Skillset');
            analysis.riskScore += 3;
            teamHealthIssues.atRiskTeams.push(`${teamName} (Skillset)`);
        } else if (team.skillset === 'Critical' || team.skillset === 'critical') {
            teamRiskFactors.push('Skillset'); // FIXED: Remove (Critical) suffix
            analysis.riskScore += 6;
            teamHealthIssues.criticalTeams.push(`${teamName} (Skillset)`);
        }
        
        // SUPPORT SCORING (2 pts At Risk, 4 pts Critical)
        if (team.support === 'At Risk' || team.support === 'at-risk') {
            teamRiskFactors.push('Support');
            analysis.riskScore += 2;
            teamHealthIssues.atRiskTeams.push(`${teamName} (Support)`);
        } else if (team.support === 'Critical' || team.support === 'critical') {
            teamRiskFactors.push('Support');
            analysis.riskScore += 4;
            teamHealthIssues.criticalTeams.push(`${teamName} (Support)`);
        }
        
        // UTILIZATION SCORING (unchanged)
        if (team.jira && team.jira.utilization > 95) {
            teamRiskFactors.push('Over-utilized');
            analysis.riskScore += 2;
            teamHealthIssues.overUtilizedTeams.push(teamName);
        }
        
        // VISION SCORING (1 pt At Risk, 2 pts Critical)
        if (team.vision === 'At Risk' || team.vision === 'at-risk') {
            teamRiskFactors.push('Vision');
            analysis.riskScore += 1;
            teamHealthIssues.atRiskTeams.push(`${teamName} (Vision)`);
        } else if (team.vision === 'Critical' || team.vision === 'critical') {
            teamRiskFactors.push('Vision');
            analysis.riskScore += 2;
            teamHealthIssues.criticalTeams.push(`${teamName} (Vision)`);
        }
        
        // TEAM COHESION SCORING (1 pt At Risk, 2 pts Critical)
        if (team.teamwork === 'At Risk' || team.teamwork === 'at-risk') {
            teamRiskFactors.push('Team Cohesion');
            analysis.riskScore += 1;
            teamHealthIssues.atRiskTeams.push(`${teamName} (Team Cohesion)`);
        } else if (team.teamwork === 'Critical' || team.teamwork === 'critical') {
            teamRiskFactors.push('Team Cohesion');
            analysis.riskScore += 2;
            teamHealthIssues.criticalTeams.push(`${teamName} (Team Cohesion)`);
        }
        
        // AUTONOMY SCORING (1 pt At Risk, 2 pts Critical)
        if (team.autonomy === 'At Risk' || team.autonomy === 'at-risk') {
            teamRiskFactors.push('Autonomy');
            analysis.riskScore += 1;
            teamHealthIssues.atRiskTeams.push(`${teamName} (Autonomy)`);
        } else if (team.autonomy === 'Critical' || team.autonomy === 'critical') {
            teamRiskFactors.push('Autonomy');
            analysis.riskScore += 2;
            teamHealthIssues.criticalTeams.push(`${teamName} (Autonomy)`);
        }

        // FIXED: Determine team risk color based on actual critical factors in the data
        const hasCriticalCapacity = team.capacity === 'Critical' || team.capacity === 'critical';
        const hasCriticalSkillset = team.skillset === 'Critical' || team.skillset === 'critical';
        const hasCriticalSupport = team.support === 'Critical' || team.support === 'critical';
        const hasCriticalVision = team.vision === 'Critical' || team.vision === 'critical';
        const hasCriticalTeamwork = team.teamwork === 'Critical' || team.teamwork === 'critical';
        const hasCriticalAutonomy = team.autonomy === 'Critical' || team.autonomy === 'critical';
        
        const criticalCount = [hasCriticalCapacity, hasCriticalSkillset, hasCriticalSupport, 
                              hasCriticalVision, hasCriticalTeamwork, hasCriticalAutonomy]
                              .filter(Boolean).length;
        const totalFactors = teamRiskFactors.length;
        
        if (criticalCount >= 2) teamRiskColor = 'var(--accent-red)';
        else if (criticalCount >= 1 || totalFactors >= 4) teamRiskColor = '#f97316';
        else if (totalFactors >= 3) teamRiskColor = 'var(--accent-orange)';
        else if (totalFactors >= 1) teamRiskColor = '#eab308';

        if (teamRiskFactors.length > 0) {
            // Create proper factor objects with state information
            const enhancedRiskFactors = teamRiskFactors.map(factor => {
                // Determine the actual state for each factor
                let state = 'At Risk'; // default
                
                if (factor === 'Capacity') {
                    state = (team.capacity === 'Critical' || team.capacity === 'critical') ? 'Critical' : 'At Risk';
                } else if (factor === 'Skillset') {
                    state = (team.skillset === 'Critical' || team.skillset === 'critical') ? 'Critical' : 'At Risk';
                } else if (factor === 'Support') {
                    state = (team.support === 'Critical' || team.support === 'critical') ? 'Critical' : 'At Risk';
                } else if (factor === 'Vision') {
                    state = (team.vision === 'Critical' || team.vision === 'critical') ? 'Critical' : 'At Risk';
                } else if (factor === 'Team Cohesion') {
                    state = (team.teamwork === 'Critical' || team.teamwork === 'critical') ? 'Critical' : 'At Risk';
                } else if (factor === 'Autonomy') {
                    state = (team.autonomy === 'Critical' || team.autonomy === 'critical') ? 'Critical' : 'At Risk';
                }
                
                return {
                    name: factor.replace(' (Critical)', ''), // Clean up the name
                    state: state,
                    severity: state === 'Critical' ? 'CRITICAL' : 'HIGH'
                };
            });

            analysis.impactedTeams.push({
                name: teamName,
                riskFactors: enhancedRiskFactors,
                riskColor: teamRiskColor
            });
        }
    });

    // CREATE RISK FACTORS FOR THE MODAL
    
    // Critical Team Health Risk Factor
    if (teamHealthIssues.criticalTeams.length > 0) {
        analysis.riskFactors.push({
            name: 'Critical Team Health Issues',
            severity: 'CRITICAL',
            color: 'var(--accent-red)',
            description: `${teamHealthIssues.criticalTeams.length} team dimension(s) in critical state requiring immediate attention.`,
            impact: 'Severe delivery risk and quality concerns'
        });
    }
    
    // At Risk Team Health Risk Factor
    if (teamHealthIssues.atRiskTeams.length > 0) {
        analysis.riskFactors.push({
            name: 'At-Risk Team Health Issues',
            severity: 'HIGH',
            color: '#f97316',
            description: `${teamHealthIssues.atRiskTeams.length} team dimension(s) showing warning signs that need attention.`,
            impact: 'Moderate delivery risk if not addressed'
        });
    }
    
    // Over-utilization Risk Factor
    if (teamHealthIssues.overUtilizedTeams.length > 0) {
        analysis.riskFactors.push({
            name: 'Team Over-utilization',
            severity: 'HIGH',
            color: 'var(--accent-orange)',
            description: `${teamHealthIssues.overUtilizedTeams.length} team(s) operating above 95% capacity.`,
            impact: 'Burnout risk and reduced sprint velocity'
        });
    }

    // FLAGGED WORK RISK SCORING (unchanged)
    if (initiative.jira && initiative.jira.flagged > 0) {
        const totalStories = initiative.jira.stories || 0;
        const flaggedStories = initiative.jira.flagged || 0;
        const flaggedPercentage = totalStories > 0 ? 
            (flaggedStories / totalStories) * 100 : 0;
            
        let flaggedPoints = 0;
        if (flaggedPercentage >= 50) flaggedPoints = 8;
        else if (flaggedPercentage >= 25) flaggedPoints = 5;
        else if (flaggedPercentage >= 15) flaggedPoints = 3;
        else if (flaggedPercentage >= 5) flaggedPoints = 2;
        else flaggedPoints = 1;
        
        analysis.riskScore += flaggedPoints;
        analysis.primaryRiskFactors.push('flagged-work');
        
        // Add flagged work risk factor
        let flaggedSeverity = 'LOW';
        let flaggedColor = 'var(--accent-orange)';
        if (flaggedPercentage >= 50) {
            flaggedSeverity = 'CRITICAL';
            flaggedColor = 'var(--accent-red)';
        } else if (flaggedPercentage >= 25) {
            flaggedSeverity = 'HIGH';
            flaggedColor = '#f97316';
        } else if (flaggedPercentage >= 15) {
            flaggedSeverity = 'MODERATE';
        }
        
        analysis.riskFactors.push({
            name: 'Flagged Work Issues',
            severity: flaggedSeverity,
            color: flaggedColor,
            description: `${flaggedPercentage.toFixed(1)}% of stories (${flaggedStories}/${totalStories}) are flagged or blocked.`,
            impact: flaggedPercentage >= 25 ? 'Significant delivery delays likely' : 'Minor delivery impact'
        });
    }
    
    // VALIDATION RISK SCORING (unchanged)
    if (initiative.priority >= 1 && initiative.priority <= 15 && initiative.validation === 'not-validated') {
        let validationPoints = 0;
        let validationSeverity = 'LOW';
        
        if (initiative.type === 'strategic') {
            validationPoints = 2;
            validationSeverity = 'HIGH';
        } else if (initiative.type === 'ktlo' || initiative.type === 'emergent') {
            validationPoints = 1;
            validationSeverity = 'MODERATE';
        }
        
        if (validationPoints > 0) {
            analysis.riskScore += validationPoints;
            analysis.primaryRiskFactors.push('validation');
            
            // Add validation risk factor
            analysis.riskFactors.push({
                name: 'Validation Risk',
                severity: validationSeverity,
                color: validationSeverity === 'HIGH' ? '#f97316' : 'var(--accent-orange)',
                description: `${initiative.type.charAt(0).toUpperCase() + initiative.type.slice(1)} initiative above-the-line without validation.`,
                impact: validationSeverity === 'HIGH' ? 'Market alignment uncertainty' : 'Delivery approach uncertainty'
            });
        }
    }

    // PRIORITY AMPLIFICATION (unchanged)
    const riskScoreBeforePriority = analysis.riskScore;
    const row = getRowColFromSlot(initiative.priority).row;
    if (row <= 2 && riskScoreBeforePriority > 4) {
        analysis.riskScore += 1;
        
        // Add priority amplification risk factor
        analysis.riskFactors.push({
            name: 'High-Priority Risk Amplification',
            severity: 'CRITICAL',
            color: 'var(--accent-red)',
            description: 'Critical priority initiative with existing risk factors poses organizational risk.',
            impact: 'Major impact on strategic objectives'
        });
    }

    // Generate recommendations based on risk factors
    if (analysis.impactedTeams.length > 0) {
        const capacityIssues = analysis.impactedTeams.filter(t => 
    t.riskFactors.some(f => typeof f === 'string' ? f.includes('Capacity') : f.name.includes('Capacity'))
).length;
const skillsetIssues = analysis.impactedTeams.filter(t => 
    t.riskFactors.some(f => typeof f === 'string' ? f.includes('Skillset') : f.name.includes('Skillset'))
).length;
const criticalIssues = analysis.impactedTeams.filter(t => 
    t.riskFactors.some(f => typeof f === 'string' ? f.includes('Critical') : f.state === 'Critical')
).length;
        
        if (criticalIssues > 0) {
            analysis.recommendations.push('URGENT: Multiple teams have critical health issues requiring immediate attention.');
        }
        if (capacityIssues > 0) {
            analysis.recommendations.push('Consider redistributing workload or bringing in additional resources to overloaded teams.');
        }
        if (skillsetIssues > 0) {
            analysis.recommendations.push('Provide training or augment teams with required skills to prevent quality issues.');
        }
    }

    if (analysis.primaryRiskFactors.includes('flagged-work')) {
        analysis.recommendations.push('Review and resolve flagged work items to prevent delivery delays.');
    }

    if (analysis.primaryRiskFactors.includes('validation')) {
        analysis.recommendations.push('Prioritize validation activities to reduce market and delivery risks.');
    }

    // Cap at 50 points
    analysis.riskScore = Math.min(analysis.riskScore, 50);

    return analysis;
}

    

function getRiskLevel(riskScore) {
    if (riskScore <= 12) {
        return {
            label: 'Low Risk Initiative',
            color: 'var(--accent-green)',
            borderColor: 'var(--accent-green)',
            bgColor: 'rgba(34, 197, 94, 0.1)',
            bgColorLight: 'rgba(34, 197, 94, 0.05)',
            description: 'This initiative has minimal risk factors and is likely to deliver on schedule.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
            </svg>`
        };
    } else if (riskScore <= 22) {
        return {
            label: 'Moderate Risk Initiative',
            color: 'var(--accent-orange)',
            borderColor: 'var(--accent-orange)',
            bgColor: 'rgba(251, 146, 60, 0.1)',
            bgColorLight: 'rgba(251, 146, 60, 0.05)',
            description: 'This initiative has some risk factors that require monitoring and may need intervention.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                <path d="M12 17h.01"/>
            </svg>`
        };
    } else if (riskScore <= 35) {
        return {
            label: 'High Risk Initiative',
            color: '#f97316',
            borderColor: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.1)',
            bgColorLight: 'rgba(249, 115, 22, 0.05)',
            description: 'This initiative has significant risk factors that require immediate attention and active management.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
            </svg>`
        };
    } else {
        return {
            label: 'Critical Risk Initiative',
            color: 'var(--accent-red)',
            borderColor: 'var(--accent-red)',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            bgColorLight: 'rgba(239, 68, 68, 0.05)',
            description: 'This initiative has critical risk factors across multiple teams that pose serious threats to delivery and require immediate escalation.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`
        };
    }
}

function showRiskScoreInfoModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Get the current initiative being analyzed
    const initiative = window.currentModalInitiative;
    
    // Calculate actual values for this initiative using UPDATED 4-state logic
    let actualValues = {
        teamHealth: { capacity: 0, skillset: 0, support: 0, utilization: 0, vision: 0, teamwork: 0, autonomy: 0 },
        flaggedWork: { percentage: 0, count: 0, points: 0 },
        validation: { points: 0, reason: '' },
        priority: { points: 0, applied: false },
        totalScore: 0
    };
    
    if (initiative) {
        // UPDATED team health points calculation with 4-state support
        initiative.teams.forEach(teamName => {
            const team = boardData.teams[teamName];
            if (!team) return;
            
            // CAPACITY (3 pts At Risk, 6 pts Critical)
            if (team.capacity === 'At Risk' || team.capacity === 'at-risk') {
                actualValues.teamHealth.capacity += 3;
            } else if (team.capacity === 'Critical' || team.capacity === 'critical') {
                actualValues.teamHealth.capacity += 6;
            }
            
            // SKILLSET (3 pts At Risk, 6 pts Critical)
            if (team.skillset === 'At Risk' || team.skillset === 'at-risk') {
                actualValues.teamHealth.skillset += 3;
            } else if (team.skillset === 'Critical' || team.skillset === 'critical') {
                actualValues.teamHealth.skillset += 6;
            }
            
            // SUPPORT (2 pts At Risk, 4 pts Critical)
            if (team.support === 'At Risk' || team.support === 'at-risk') {
                actualValues.teamHealth.support += 2;
            } else if (team.support === 'Critical' || team.support === 'critical') {
                actualValues.teamHealth.support += 4;
            }
            
            // UTILIZATION (unchanged)
            if (team.jira && team.jira.utilization > 95) {
                actualValues.teamHealth.utilization += 2;
            }
            
            // VISION (1 pt At Risk, 2 pts Critical)
            if (team.vision === 'At Risk' || team.vision === 'at-risk') {
                actualValues.teamHealth.vision += 1;
            } else if (team.vision === 'Critical' || team.vision === 'critical') {
                actualValues.teamHealth.vision += 2;
            }
            
            // TEAM COHESION (1 pt At Risk, 2 pts Critical)
            if (team.teamwork === 'At Risk' || team.teamwork === 'at-risk') {
                actualValues.teamHealth.teamwork += 1;
            } else if (team.teamwork === 'Critical' || team.teamwork === 'critical') {
                actualValues.teamHealth.teamwork += 2;
            }
            
            // AUTONOMY (1 pt At Risk, 2 pts Critical)
            if (team.autonomy === 'At Risk' || team.autonomy === 'at-risk') {
                actualValues.teamHealth.autonomy += 1;
            } else if (team.autonomy === 'Critical' || team.autonomy === 'critical') {
                actualValues.teamHealth.autonomy += 2;
            }
        });
        
        // Calculate flagged work points
        if (initiative.jira && initiative.jira.flagged > 0) {
            const totalStories = initiative.jira.stories || 0;
            const flaggedStories = initiative.jira.flagged || 0;
            const flaggedPercentage = totalStories > 0 ? (flaggedStories / totalStories) * 100 : 0;
            
            actualValues.flaggedWork.percentage = flaggedPercentage;
            actualValues.flaggedWork.count = flaggedStories;
            
            if (flaggedPercentage >= 50) actualValues.flaggedWork.points = 8;
            else if (flaggedPercentage >= 25) actualValues.flaggedWork.points = 5;
            else if (flaggedPercentage >= 15) actualValues.flaggedWork.points = 3;
            else if (flaggedPercentage >= 5) actualValues.flaggedWork.points = 2;
            else actualValues.flaggedWork.points = 1;
        }
        
        // Calculate validation points
        if (initiative.priority >= 1 && initiative.priority <= 15 && initiative.validation === 'not-validated') {
            if (initiative.type === 'strategic') {
                actualValues.validation.points = 2;
                actualValues.validation.reason = 'Strategic initiative above-the-line without validation';
            } else if (initiative.type === 'ktlo' || initiative.type === 'emergent') {
                actualValues.validation.points = 1;
                actualValues.validation.reason = `${initiative.type} initiative above-the-line without validation`;
            }
        }
        
        // Calculate priority amplification
        const baseScore = Object.values(actualValues.teamHealth).reduce((a, b) => a + b, 0) + actualValues.flaggedWork.points + actualValues.validation.points;
        const row = getRowColFromSlot(initiative.priority).row;
        if (row <= 2 && baseScore > 4) {
            actualValues.priority.points = 1;
            actualValues.priority.applied = true;
        }
        
        actualValues.totalScore = baseScore + actualValues.priority.points;
        actualValues.totalScore = Math.min(actualValues.totalScore, 50);
    }
    
    title.textContent = 'Risk Score Calculation';
    
    content.innerHTML = `
        <div class="risk-modal-content" style="max-height: 70vh; overflow-y: auto; padding-right: 12px;">
            <style>
                .section {
                    margin-bottom: 24px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }
                .formula-box {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-primary);
                    border-radius: 8px;
                    padding: 16px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                }
                .score-breakdown {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin: 12px 0;
                }
                .score-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: var(--bg-quaternary);
                    border-radius: 4px;
                    font-size: 14px;
                }
                .score-excellent { color: var(--accent-green); }
                .score-good { color: var(--accent-blue); }
                .score-needs-improvement { color: var(--accent-orange); }
                .score-poor { color: var(--accent-red); }
                .interpretation-grid {
                    display: grid;
                    grid-template-columns: 120px 1fr;
                    gap: 12px 16px;
                    align-items: center;
                    margin: 16px 0;
                }
                .score-range {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    text-align: center;
                    font-size: 12px;
                }
                .score-range.excellent { background: var(--accent-green); color: white; }
                .score-range.good { background: var(--accent-blue); color: white; }
                .score-range.needs-improvement { background: var(--accent-orange); color: white; }
                .score-range.poor { background: var(--accent-red); color: white; }
            </style>
            
            <div class="space-y-6">
                <!-- Team Health Risk Factors -->
                <div class="section">
                    <div class="section-title">Team Health Risk Dimensions</div>
                    <div style="color: var(--text-secondary); margin-bottom: 12px;">
                        Critical dimensions receive double points to reflect their severity.
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Capacity Risk:</span>
        <span style="color: ${actualValues.teamHealth.capacity > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.capacity} pts</span>
    </div>
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Skillset Risk:</span>
        <span style="color: ${actualValues.teamHealth.skillset > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.skillset} pts</span>
    </div>
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Support Risk:</span>
        <span style="color: ${actualValues.teamHealth.support > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.support} pts</span>
    </div>
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Over-utilization (>95%):</span>
        <span style="color: ${actualValues.teamHealth.utilization > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.utilization} pts</span>
    </div>
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Vision Risk:</span>
        <span style="color: ${actualValues.teamHealth.vision > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.vision} pts</span>
    </div>
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Team Cohesion Risk:</span>
        <span style="color: ${actualValues.teamHealth.teamwork > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.teamwork} pts</span>
    </div>
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span>Autonomy Risk:</span>
        <span style="color: ${actualValues.teamHealth.autonomy > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.autonomy} pts</span>
    </div>
</div>
                    
                    <div class="formula-box">
                        <strong>Team Health Scoring:</strong><br>
                        • Capacity/Skillset = 3 pts if At Risk, 6 pts if Critical<br>
                        • Support = 2 pts if At Risk, 4 pts if Critical<br>
                        • Vision/Cohesion/Autonomy = 1 pt if At Risk, 2 pts if Critical<br>
                        • Over Utilization = 1 pt if over utilized<br>
                    </div>
                </div>

                <!-- Flagged Work Factors -->
                <div class="section">
                    <div class="section-title">Flagged Work Factors</div>
                    <div style="color: var(--text-secondary); margin-bottom: 12px;">
                        Stories marked as flagged, blocked, or requiring attention.
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Flagged Work:</div>
                            <div style="color: #f59e0b; font-size: 18px; font-weight: 600;">
                                ${actualValues.flaggedWork.percentage.toFixed(1)}% (${actualValues.flaggedWork.count} stories)
                            </div>
                        </div>
                        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Risk Points:</div>
                            <div style="color: #f59e0b; font-size: 18px; font-weight: 600;">${actualValues.flaggedWork.points} pts</div>
                        </div>
                    </div>
                    
                    <div class="formula-box">
                        <strong>Flagged Work Scoring:</strong><br>
                        • 50%+ flagged = 8 points<br>
                        • 25-49% flagged = 5 points<br>
                        • 15-24% flagged = 3 points<br>
                        • 5-14% flagged = 2 points<br>
                        • 1-4% flagged = 1 point
                    </div>
                </div>

                <!-- Validation Risk -->
                <div class="section">
                    <div class="section-title">Validation Risk</div>
                    <div style="color: var(--text-secondary); margin-bottom: 12px;">
                        Above-the-line initiatives without validation.
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Validation Status:</div>
                            <div style="color: ${actualValues.validation.points > 0 ? '#f59e0b' : 'var(--accent-green)'}; font-size: 18px; font-weight: 600;">
                                ${actualValues.validation.points > 0 ? 'Not Validated' : 'Validated'}
                            </div>
                        </div>
                        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Risk Points:</div>
                            <div style="color: ${actualValues.validation.points > 0 ? '#f59e0b' : 'var(--accent-green)'}; font-size: 18px; font-weight: 600;">${actualValues.validation.points} pts</div>
                        </div>
                    </div>
                    
                    <div class="formula-box">
                        <strong>Validation Scoring:</strong><br>
                        • Strategic initiatives above-the-line without validation = 2 points<br>
                        • KTLO/Emergent initiatives above-the-line without validation = 1 point<br>
                        • Below-the-line or validated initiatives = 0 points
                    </div>
                </div>
                
                <!-- Priority Amplification -->
                <div class="section">
                    <div class="section-title">Priority Amplification</div>
                    <div style="color: var(--text-secondary); margin-bottom: 12px;">
                        High-priority initiatives with existing risk factors receive additional scrutiny.
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Amplification Applied:</div>
                            <div style="color: ${actualValues.priority.applied ? '#f59e0b' : 'var(--accent-green)'}; font-size: 18px; font-weight: 600;">
                                ${actualValues.priority.applied ? 'Yes' : 'No'}
                            </div>
                        </div>
                        <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Risk Points:</div>
                            <div style="color: ${actualValues.priority.points > 0 ? '#f59e0b' : 'var(--accent-green)'}; font-size: 18px; font-weight: 600;">${actualValues.priority.points} pts</div>
                        </div>
                    </div>
                    
                    <div class="formula-box">
                        <strong>Priority Amplification Logic:</strong><br>
                        • High-priority initiatives (Rows 1-2) with existing risk factors receive +1 point<br>
                        • Ensures critical initiatives with risk factors get extra attention
                    </div>
                </div>

                ${initiative ? `
    <div class="section">
        <div class="section-title">Current Initiative Summary</div>
        <div class="section-subtitle">
            Overall risk assessment for this specific initiative.
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
    <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Risk Score:</div>
    <div style="color: #f59e0b; font-size: 18px; font-weight: 600;">${actualValues.totalScore}/50</div>
</div>
<div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; text-align: center;">
    <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Risk Level:</div>
    <div style="color: #f59e0b; font-size: 18px; font-weight: 600;">${getRiskLevel(actualValues.totalScore).label}</div>
</div>
</div>
        <div class="formula-box">
            <strong>Total Risk Score Breakdown:</strong><br>
            Team Health: ${Object.values(actualValues.teamHealth).reduce((a, b) => a + b, 0)} pts<br>
            Flagged Work: ${actualValues.flaggedWork.points} pts<br>
            Validation: ${actualValues.validation.points} pts<br>
            Priority Amplification: ${actualValues.priority.points} pts<br>
            <hr style="margin: 8px 0; border: 1px solid #ccc;">
            <strong>Total: ${actualValues.totalScore}/50 pts</strong><br>
            <strong>Risk Level: ${getRiskLevel(actualValues.totalScore).label}</strong>
        </div>
    </div>
` : ''}

                <!-- Risk Level Interpretation -->
                <div class="section">
                    <div class="section-title">Risk Level Interpretation</div>
                    <div class="interpretation-grid">
                        <div class="score-range excellent">0-12 pts</div>
                        <div><strong>Low Risk:</strong> Minimal risk factors, likely to deliver on schedule.</div>
                        
                        <div class="score-range good">13-22 pts</div>
                        <div><strong>Moderate Risk:</strong> Some risk factors requiring monitoring and possible intervention.</div>
                        
                        <div class="score-range needs-improvement">23-35 pts</div>
                        <div><strong>High Risk:</strong> Significant risk factors requiring active management and mitigation.</div>
                        
                        <div class="score-range poor">36-50 pts</div>
                        <div><strong>Critical Risk:</strong> Severe risk factors across multiple areas requiring immediate attention.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}


        function showInitiativeModal(initiative) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Store the element that opened the modal for focus restoration
    modal.dataset.previousFocus = document.activeElement ? document.activeElement.dataset.initiativeId || document.activeElement.dataset.teamName || 'unknown' : 'unknown';
    
    title.innerHTML = initiative.title + '<span class="ml-2 text-xs font-normal opacity-75" style="color: var(--text-secondary);">Initiative Details</span>';
    
    content.innerHTML = 
        '<div class="space-y-6">' +
            '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
                // Left Column - Strategic Overview
                '<div>' +
                    '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                            '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>' +
                            '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' +
                        '</svg>' +
                        'Strategic Overview' +
                    '</h3>' +
                    
                    '<div class="space-y-4">' +
                        // Problem & Solution
                        '<div class="grid gap-3" style="grid-template-columns: 1fr 1fr;">' +
                            '<div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                                '<div class="text-sm font-bold mb-2" style="color: var(--text-primary);">Problem</div>' +
                                '<p class="text-xs leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.problem : 'N/A') + '</p>' +
                            '</div>' +
                            '<div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                                '<div class="text-sm font-bold mb-2" style="color: var(--text-primary);">Solution</div>' +
                                '<p class="text-xs leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.solution : 'N/A') + '</p>' +
                            '</div>' +
                        '</div>' +
                        
                        // Market & Customer
                        '<div class="grid gap-3" style="grid-template-columns: 1fr 1fr;">' +
                            '<div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                                '<div class="text-sm font-bold mb-2" style="color: var(--text-primary);">Market Size</div>' +
                                '<p class="text-xs leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.marketSize : 'N/A') + '</p>' +
                            '</div>' +
                            '<div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                                '<div class="text-sm font-bold mb-2" style="color: var(--text-primary);">Customer</div>' +
                                '<p class="text-xs leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.customer : 'N/A') + '</p>' +
                            '</div>' +
                        '</div>' +
                        
                        // Key Result
                        '<div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%); border: 1px solid var(--accent-purple);">' +
                            '<div class="text-sm font-bold mb-2 flex items-center gap-2" style="color: var(--accent-purple);">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                    '<path d="M12 13V2l8 4-8 4"/>' +
                                    '<path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/>' +
                                    '<path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/>' +
                                '</svg>' +
                                'Related Key Result' +
                            '</div>' +
                            '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.keyResult : 'N/A') + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                // Right Column - Execution Details
                '<div>' +
                    '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                            '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>' +
                            '<line x1="16" y1="2" x2="16" y2="6"/>' +
                            '<line x1="8" y1="2" x2="8" y2="6"/>' +
                            '<line x1="3" y1="10" x2="21" y2="10"/>' +
                        '</svg>' +
                        'Execution Details' +
                    '</h3>' +
                    
                    '<div class="space-y-4">' +
                        // Jira Analytics with compact View button
                        '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--accent-green);">' +
                            '<div class="text-sm font-bold mb-3 flex items-center justify-between" style="color: var(--accent-green);">' +
                                '<span class="flex items-center gap-2">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                        '<path d="M3 6h18"/>' +
                                        '<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>' +
                                        '<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>' +
                                        '<line x1="10" x2="10" y1="11" y2="17"/>' +
                                        '<line x1="14" x2="14" y1="11" y2="17"/>' +
                                    '</svg>' +
                                    'Jira Analytics' +
                                '</span>' +
                                // Small inline button in the header
                                (initiative.jira && initiative.jira.key ? 
                                    '<button onclick="openJiraEpic(\'' + initiative.jira.key + '\')" class="px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1" style="background: #0052CC; color: white;" onmouseover="this.style.background=\'#003d99\'" onmouseout="this.style.background=\'#0052CC\'">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                            '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
                                            '<polyline points="15,3 21,3 21,9"/>' +
                                            '<line x1="10" x2="21" y1="14" y2="3"/>' +
                                        '</svg>' +
                                        'View' +
                                    '</button>' 
                                    : '') +
                            '</div>' +
                            '<div class="grid gap-3" style="grid-template-columns: 1fr 1fr;">' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Epic Key</div>' +
                                    '<div class="text-sm font-bold" style="color: var(--text-primary);">' + (initiative.jira ? initiative.jira.key : 'N/A') + '</div>' +
                                '</div>' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Status</div>' +
                                    '<div class="text-sm font-bold" style="color: var(--text-primary);">' + (initiative.jira ? initiative.jira.status : 'N/A') + '</div>' +
                                '</div>' +
                                '<div>' +
    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Risk Score</div>' +
    '<div class="text-sm font-bold flex items-center gap-2">' +
        '<span style="color: ' + getRiskLevelColor(analyzeInitiativeRisk(initiative).riskScore) + ';">' +
            analyzeInitiativeRisk(initiative).riskScore + '/50' +
        '</span>' +
        '<button onclick="showRiskScoreInfoModalForInitiative(' + initiative.id + ')" ' +
                'class="w-4 h-4 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors" ' +
                'style="background: rgba(59, 130, 246, 0.1); color: var(--accent-blue);" ' +
                'title="How is Risk Score calculated?">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" ' +
                 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"/>' +
                '<path d="M12 16v-4"/>' +
                '<path d="M12 8h.01"/>' +
            '</svg>' +
        '</button>' +
    '</div>' +
'</div>' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Updated</div>' +
                                    '<div class="text-sm font-bold" style="color: var(--text-primary);">' + (initiative.jira ? new Date(initiative.jira.updated).toLocaleDateString() : 'N/A') + '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        
                        // Teams Section
                        '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                            '<div class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
                                    '<circle cx="9" cy="7" r="4"/>' +
                                    '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>' +
                                    '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>' +
                                '</svg>' +
                                'Teams (' + initiative.teams.length + ')' +
                            '</div>' +
                            '<div class="grid gap-2" style="grid-template-columns: 1fr;">' +
                                initiative.teams.map(teamName => {
                                    const teamData = boardData.teams[teamName];
                                    const pillStyle = getTeamHealthPillStyle(teamData);
                                    const healthIcon = getHealthIcon(teamData);
                                    return '<button class="text-xs px-3 py-2 rounded cursor-pointer border flex items-center justify-between ' + pillStyle + '" onclick="closeModal(); showTeamModal(\'' + teamName + '\', boardData.teams[\'' + teamName + '\'])" aria-label="View ' + teamName + ' team details">' + 
                                           '<span class="flex items-center gap-2">' +
                                               '<span class="flex-shrink-0">' + healthIcon + '</span>' +
                                               '<span>' + teamName + '</span>' +
                                           '</span>' +
                                           '<span class="text-xs opacity-75">View Details →</span>' +
                                           '</button>';
                                }).join('') +
                            '</div>' +
                        '</div>' +
                        
                        // Measures & Alternatives
                        '<div class="space-y-3">' +
                            '<div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                                '<div class="text-sm font-bold mb-2" style="color: var(--text-primary);">Success Measures</div>' +
                                '<p class="text-xs leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.measures : 'N/A') + '</p>' +
                            '</div>' +
                            '<div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                                '<div class="text-sm font-bold mb-2" style="color: var(--text-primary);">Alternatives</div>' +
                                '<p class="text-xs leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.alternatives : 'N/A') + '</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus the close button for immediate keyboard navigation
    setTimeout(() => {
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
    
    announceToScreenReader(`Opened details for ${initiative.title} initiative`);
}

function showRiskScoreInfoModalForInitiative(initiativeId) {
    const initiative = boardData.initiatives.find(i => i.id === initiativeId);
    if (!initiative) return;
    
    window.currentModalInitiative = initiative;
    showRiskScoreInfoModal();
}

function openJiraEpic(epicKey) {
    const jiraUrl = `https://alignvue.atlassian.net/browse/${epicKey}`;
    window.open(jiraUrl, '_blank', 'noopener,noreferrer');
}

        
        function showAddInitiativeModal(row, col) {
            const modal = document.getElementById('detail-modal');
            const title = document.getElementById('modal-title');
            const content = document.getElementById('modal-content');
            
            const getColumnLabel = (col) => String.fromCharCode(69 - col);
            
            title.textContent = 'Add New Initiative';
            content.innerHTML = 
    '<form id="add-initiative-form" class="space-y-4">' +
        '<div class="grid grid-cols-2 gap-4">' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Initiative Title</label>' +
                '<input type="text" name="title" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
            '</div>' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Type</label>' +
                '<select name="type" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
                    '<option value="strategic">Strategic</option>' +
                    '<option value="ktlo">KTLO/Tech</option>' +
                    '<option value="emergent">Emergent</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div>' +
            '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Outcome</label>' +
            '<textarea name="outcome" class="w-full px-3 py-2 border rounded-md" rows="2" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required></textarea>' +
        '</div>' +
        '<div>' +
            '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Problem</label>' +
            '<textarea name="problem" class="w-full px-3 py-2 border rounded-md" rows="2" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required></textarea>' +
        '</div>' +
        '<div>' +
            '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Solution</label>' +
            '<textarea name="solution" class="w-full px-3 py-2 border rounded-md" rows="2" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required></textarea>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-4">' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Teams (select multiple)</label>' +
                '<select name="teams" multiple class="w-full px-3 py-2 border rounded-md h-24" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
                    Object.keys(boardData.teams).map(team => '<option value="' + team + '">' + team + '</option>').join('') +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Validation Status</label>' +
                '<select name="validation" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
                    '<option value="not-validated">Not Validated</option>' +
                    '<option value="in-validation">In Validation</option>' +
                    '<option value="validated">Validated</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="flex justify-end gap-3 pt-4">' +
            '<button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-md hover:bg-opacity-90" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);">Cancel</button>' +
            '<button type="submit" class="px-4 py-2 rounded-md hover:bg-opacity-90" style="background: var(--accent-primary); color: white;">Add Initiative</button>' +
        '</div>' +
    '</form>';
            
            const form = document.getElementById('add-initiative-form');
const handleSubmit = function(e) {
    e.preventDefault();
    alert('Initiative would be added at this position. This is a demo - no actual data is saved.');
    form.removeEventListener('submit', handleSubmit);
    closeModal();
};
form.addEventListener('submit', handleSubmit);
            
            modal.classList.add('show');
        }

        function showAddTeamModal() {
            const modal = document.getElementById('detail-modal');
            const title = document.getElementById('modal-title');
            const content = document.getElementById('modal-content');
            
            title.textContent = 'Add New Team';
            content.innerHTML = 
    '<form id="add-team-form" class="space-y-4">' +
        '<div>' +
            '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Team Name</label>' +
            '<input type="text" name="teamName" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
        '</div>' +
        '<div class="grid grid-cols-3 gap-4">' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Capacity</label>' +
                '<select name="capacity" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
                    '<option value="healthy">Healthy</option>' +
                    '<option value="at-risk">At Risk</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Skillset</label>' +
                '<select name="skillset" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
                    '<option value="healthy">Healthy</option>' +
                    '<option value="at-risk">At Risk</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Leadership</label>' +
                '<select name="leadership" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
                    '<option value="healthy">Healthy</option>' +
                    '<option value="at-risk">At Risk</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-4">' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Current Velocity</label>' +
                '<input type="number" name="velocity" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
            '</div>' +
            '<div>' +
                '<label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">Utilization %</label>' +
                '<input type="number" name="utilization" min="0" max="100" class="w-full px-3 py-2 border rounded-md" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);" required>' +
            '</div>' +
        '</div>' +
        '<div class="flex justify-end gap-3 pt-4">' +
            '<button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-md hover:bg-opacity-90" style="background: var(--bg-quaternary); border-color: var(--border-primary); color: var(--text-primary);">Cancel</button>' +
            '<button type="submit" class="px-4 py-2 rounded-md hover:bg-opacity-90" style="background: var(--accent-primary); color: white;">Add Team</button>' +
        '</div>' +
    '</form>';
            
            const teamForm = document.getElementById('add-team-form');
const handleTeamSubmit = function(e) {
    e.preventDefault();
    alert('Team would be added. This is a demo - no actual data is saved.');
    teamForm.removeEventListener('submit', handleTeamSubmit);
    closeModal();
};
teamForm.addEventListener('submit', handleTeamSubmit);
            
            modal.classList.add('show');
        }

        function closeModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus to the element that opened the modal
    const previousFocusId = modal.dataset.previousFocus;
    if (previousFocusId && previousFocusId !== 'unknown') {
        const previousElement = document.querySelector(`[data-initiative-id="${previousFocusId}"]`) || 
                              document.querySelector(`[data-team-name="${previousFocusId}"]`);
        if (previousElement) {
            setTimeout(() => {
                previousElement.focus();
            }, 100);
        }
    }
    
    announceToScreenReader('Modal closed');
}
        
        function showAccountModal() {
    const modal = document.getElementById('account-modal');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus the close button for immediate keyboard navigation
    setTimeout(() => {
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
    
    announceToScreenReader('Opened account profile modal');
}

function closeAccountModal() {
    const modal = document.getElementById('account-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    announceToScreenReader('Account modal closed');
}

function highlightInitiativeAndTeam(initiativeId) {
    console.log("FUNCTION CALLED WITH ID:", initiativeId);
    clearHighlights();
    selectedInitiativeId = initiativeId;
    
    const initiative = boardData.initiatives.find(init => init.id === initiativeId);
    if (!initiative) return;
    
    // DEBUG: Log the teams for this initiative
    console.log(`=== HOVER DEBUG for ${initiative.title} (ID: ${initiativeId}) ===`);
    console.log('Initiative teams:', initiative.teams);
    console.log('Initiative teams type:', typeof initiative.teams);
    console.log('Initiative teams length:', initiative.teams ? initiative.teams.length : 'null');
    
    // Highlight the initiative card
    document.querySelectorAll('.initiative-card').forEach(card => {
        if (parseInt(card.dataset.initiativeId) === initiativeId) {
            card.classList.add('highlighted');
            console.log(`Highlighted initiative card: ${card.dataset.initiativeId}`);
        }
    });
    
    // Debug which other initiatives share teams
    if (initiative.teams && Array.isArray(initiative.teams)) {
        initiative.teams.forEach((teamName, index) => {
            console.log(`Checking team ${index}: "${teamName}" (type: ${typeof teamName})`);
            
            // Find which OTHER initiatives also have this team
            boardData.initiatives.forEach(otherInit => {
                if (otherInit.id !== initiativeId && otherInit.teams && otherInit.teams.includes(teamName)) {
                    console.log(`  -> ${otherInit.title} ALSO has team "${teamName}"`);
                    console.log(`     Other init teams:`, otherInit.teams);
                }
            });
        });
    } else {
        console.log('Teams is not an array or is null:', initiative.teams);
    }
    
    // Only highlight team cards on the same row as the initiative
    initiative.teams.forEach(teamName => {
        console.log(`Looking for team cards with team: "${teamName}" and initiativeId: ${initiativeId}`);
        
        document.querySelectorAll('.team-health-card').forEach(card => {
            const cardTeamName = card.dataset.teamName;
            const cardInitiativeId = parseInt(card.dataset.initiativeId);
            
            console.log(`  Checking card: team="${cardTeamName}", initId=${cardInitiativeId}`);
            
            if (cardTeamName === teamName && cardInitiativeId === initiativeId) {
                card.classList.add('highlighted');
                console.log(`  -> Highlighted team card: ${cardTeamName} for initiative ${cardInitiativeId}`);
            }
        });
    });
    
    console.log('=== END HOVER DEBUG ===');
}

        function highlightTeamAndInitiatives(teamName) {
    clearHighlights();
    
    // Only highlight initiatives this team works on (NOT other team cards)
    boardData.initiatives.forEach(initiative => {
        if (initiative.teams.includes(teamName)) {
            document.querySelectorAll('.initiative-card').forEach(card => {
                if (parseInt(card.dataset.initiativeId) === initiative.id) {
                    card.classList.add('highlighted');
                }
            });
        }
    });
}

        function clearHighlights() {
    selectedInitiativeId = null;
    const highlightedElements = document.querySelectorAll('.highlighted');
    highlightedElements.forEach(el => {
        el.classList.remove('highlighted');
    });
}

        function handleClickableItem(text) {
            const initiative = boardData.initiatives.find(init => init.title === text);
            if (initiative) {
                highlightInitiativeAndTeam(initiative.id);
                showInitiativeModal(initiative);
                return;
            }
            
            const teamName = Object.keys(boardData.teams).find(name => name === text);
            if (teamName) {
                highlightTeamAndInitiatives(teamName);
                showTeamModal(teamName, boardData.teams[teamName]);
            }
        }

        
        
        function getProgressClass(progress) {
    if (progress >= 70) return 'high-progress';
    if (progress >= 40) return 'medium-progress';
    return 'low-progress';
}
        
        function generatePyramid() {
            const container = document.getElementById('priority-matrix');
            container.innerHTML = '';

            for (let row = 1; row <= 8; row++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'row-container justify-end';
    
            // Add time horizon label for specific rows
            if (row === 1 || row === 4 || row === 7) {
                const timeLabel = document.createElement('div');
            timeLabel.style.cssText = `
                position: absolute;
                left: 70px;
                color: ${row === 1 ? '#10b981' : row === 4 ? '#fb923c' : '#ef4444'};
                font-weight: bold;
                font-size: 24px;
                z-index: 10;
            `;
            timeLabel.textContent = row === 1 ? 'NOW' : row === 4 ? 'NEXT' : 'LATER';
            rowDiv.appendChild(timeLabel);
            }
    
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'flex gap-2 mr-4';
                
                const emptySlots = 8 - row;
                for (let i = 0; i < emptySlots; i++) {
                    const spacer = document.createElement('div');
                    spacer.style.width = '124px';
                    cardsContainer.appendChild(spacer);
                }
                
                for (let col = 1; col <= row; col++) {
    const targetSlot = getSlotFromRowCol(row, col);
    const initiative = boardData.initiatives.find(init => init.priority === targetSlot);
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.dataset.row = row;
    dropZone.dataset.col = col;
    
    enableDropZone(dropZone, row, col);
    
    if (initiative) {
    const card = document.createElement('div');
    card.className = 'initiative-card ' + getTypeColor(initiative.type) + ' text-white';
    card.dataset.initiativeId = initiative.id;
    card.id = 'initiative-card-${initiative.id}';
    card.style.position = 'relative';
    
    // Add ARIA attributes
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Initiative: ${initiative.title}, Priority ${targetSlot}, ${initiative.progress}% complete, ${initiative.validation.replace('-', ' ')} validation, ${initiative.type} type. Press Enter for details.`);
    card.setAttribute('aria-describedby', `initiative-${initiative.id}-description`);
    
    // Add warning animation for initiative that will cross Mendoza line (slot 15)
    if (targetSlot === 15) {
        card.classList.add('approaching-mendoza');
        card.setAttribute('aria-label', card.getAttribute('aria-label') + ' Warning: This initiative is at risk of crossing the Mendoza line.');
    }
    
    card.innerHTML = 
        '<div class="initiative-priority-number" aria-hidden="true">' + targetSlot + '</div>' +
        '<div class="p-2 h-full flex flex-col justify-between">' +
            '<div class="text-xs font-medium leading-tight">' + initiative.title + '</div>' +
            '<div>' +
                '<div class="progress-label">Progress</div>' +
                '<div class="progress-bar-container" role="progressbar" aria-valuenow="' + initiative.progress + '" aria-valuemin="0" aria-valuemax="100" aria-label="Progress: ' + initiative.progress + '% completed">' +
                    '<div class="progress-bar ' + getProgressClass(initiative.progress) + '" style="width: ' + initiative.progress + '%"></div>' +
                '</div>' +
                '<div class="text-xs opacity-90 font-medium mt-1">' + initiative.progress + '% completed</div>' +
                '<div class="text-xs opacity-75 flex items-center mt-1">' +
                    '<span class="font-bold">Validation:</span> <div class="ml-1 inline-flex items-center">' + getValidationIndicator(initiative.validation).replace('absolute top-1 right-1', 'inline-block').replace('width="14" height="14"', 'width="16" height="16"') + '</div>' +
                '</div>' +
            '</div>' +
            '<div id="initiative-' + initiative.id + '-description" class="sr-only">Initiative in row ' + row + ', column ' + col + '. Teams: ' + initiative.teams.join(', ') + '</div>' +
        '</div>';
                        
                        enableDragAndDrop(card, initiative);
                        
                        card.addEventListener('mouseenter', function() {
    if (!card.classList.contains('dragging')) {
        highlightInitiativeAndTeam(initiative.id);
    }
});
card.addEventListener('mouseleave', clearHighlights);
card.addEventListener('click', function(e) {
    e.stopPropagation();
    highlightInitiativeAndTeam(initiative.id);
    showInitiativeModal(initiative);
});
                        
                        dropZone.appendChild(card);
                    } else {
                        dropZone.classList.add('empty-zone');
                        dropZone.innerHTML = '<div class="text-center text-green-600 font-bold text-lg">+</div>';
                        dropZone.addEventListener('click', function() {
                            showAddInitiativeModal(row, col);
                        });
                    }
                    
                    cardsContainer.appendChild(dropZone);
                }
                
                rowDiv.appendChild(cardsContainer);
                
                const rowNumber = document.createElement('div');
rowNumber.className = 'row-number ml-4';
rowNumber.style.position = 'relative';

// Determine priority level and styling
// Determine priority level and styling
let priorityLabel;
if (row <= 2) {
    rowNumber.style.background = '#dc2626';
    priorityLabel = 'CRITICAL';
} else if (row <= 4) {
    rowNumber.style.background = '#ea580c';
    priorityLabel = 'HIGH';
} else if (row <= 6) {
    rowNumber.style.background = '#d97706';
    priorityLabel = 'MEDIUM';
} else {
    rowNumber.style.background = '#6b7280';
    priorityLabel = 'LOW';
}

rowNumber.textContent = row;

// Add priority label overlay
const priorityLabelDiv = document.createElement('div');
priorityLabelDiv.className = 'priority-label-overlay';
priorityLabelDiv.textContent = priorityLabel;
rowNumber.appendChild(priorityLabelDiv);

rowDiv.appendChild(rowNumber);
                
                container.appendChild(rowDiv);
                
                if (row === 5) {
                    const mendozaLine = document.createElement('div');
                    mendozaLine.className = 'mendoza-line';
                    container.appendChild(mendozaLine);
                }
            }
            
            // Add priority arrow after the last row
            const priorityArrow = document.createElement('div');
            priorityArrow.className = 'priority-arrow priority-arrow-start';
            priorityArrow.innerHTML = 
                '<div class="priority-label priority-label-left">LOWEST PRIORITY</div>' +
                '<div class="priority-label priority-label-right">HIGHEST PRIORITY</div>';
            container.appendChild(priorityArrow);
            
        }
  
        // Updated function to get team health status class
function getTeamHealthStatus(teamData) {
    let atRiskCount = 0;
    if (isDimensionAtRisk(teamData.capacity)) atRiskCount++;
    if (isDimensionAtRisk(teamData.skillset)) atRiskCount++;
    if (isDimensionAtRisk(teamData.vision)) atRiskCount++;
    if (isDimensionAtRisk(teamData.support)) atRiskCount++;
    if (isDimensionAtRisk(teamData.teamwork)) atRiskCount++;
    if (isDimensionAtRisk(teamData.autonomy)) atRiskCount++;
    
    if (atRiskCount === 0) return 'team-health-white'; // Healthy
    if (atRiskCount <= 2) return 'team-health-yellow'; // Low Risk  
    if (atRiskCount <= 4) return 'team-health-high-risk'; // High Risk
    return 'team-health-red'; // Critical
}
        
        // Updated function to get health icon (keeping same Lucide icons)
function getHealthIcon(teamData) {
    let atRiskCount = 0;
    if (isDimensionAtRisk(teamData.capacity)) atRiskCount++;
    if (isDimensionAtRisk(teamData.skillset)) atRiskCount++;
    if (isDimensionAtRisk(teamData.vision)) atRiskCount++;
    if (isDimensionAtRisk(teamData.support)) atRiskCount++;
    if (isDimensionAtRisk(teamData.teamwork)) atRiskCount++;
    if (isDimensionAtRisk(teamData.autonomy)) atRiskCount++;
    
    if (atRiskCount === 0) {
        // Healthy - Green checkmark
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>';
    } else if (atRiskCount <= 2) {
        // Low Risk - Amber warning triangle  
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
    } else if (atRiskCount <= 4) {
        // High Risk - Orange alert octagon
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5F1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>';
    } else {
        // Critical - Red flame
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
    }
}
      
      // Updated function to get pill styling for team health cards
function getTeamHealthPillStyle(teamData) {
    if (!teamData) return 'bg-gray-100 text-gray-800 border-gray-300';
    
    let atRiskCount = 0;
    if (isDimensionAtRisk(teamData.capacity)) atRiskCount++;
    if (isDimensionAtRisk(teamData.skillset)) atRiskCount++;
    if (isDimensionAtRisk(teamData.vision)) atRiskCount++;
    if (isDimensionAtRisk(teamData.support)) atRiskCount++;
    if (isDimensionAtRisk(teamData.teamwork)) atRiskCount++;
    if (isDimensionAtRisk(teamData.autonomy)) atRiskCount++;
    
    if (atRiskCount === 0) {
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    } else if (atRiskCount <= 2) {
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
    } else if (atRiskCount <= 4) {
        return 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200';
    } else {
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
    }
}
        
        function getHealthIndicatorIcon(status) {
    if (status === 'healthy') {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49"/><path d="M15 15h6"/><path d="M18 12v6"/></svg>';
    } else {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.876 18.99-1.368 1.323a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.244 1.572"/><path d="M15 15h6"/></svg>';
    }
}

function isDimensionAtRisk(dimensionValue) {
    return dimensionValue === 'At Risk' || 
           dimensionValue === 'at-risk' || 
           dimensionValue === 'Critical' || 
           dimensionValue === 'critical';
}
        
        function generateTeamHealthMatrix() {
            const container = document.getElementById('team-health-matrix');
            container.innerHTML = '';

            for (let row = 1; row <= 8; row++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'teams-row-container';
                
                const teamsContent = document.createElement('div');
                teamsContent.className = 'teams-content';
                
                // // Get initiatives for this row using linear slot calculation
const rowStartSlot = ((row - 1) * row / 2) + 1;  // First slot in row
const rowEndSlot = (row * (row + 1) / 2);        // Last slot in row

const rowInitiatives = boardData.initiatives.filter(init => 
    init.priority >= rowStartSlot && init.priority <= rowEndSlot
);

// Sort by priority to mirror the initiative positions (highest priority = leftmost teams)
rowInitiatives.sort((a, b) => a.priority - b.priority);
                
                if (rowInitiatives.length > 0) {
                    rowInitiatives.forEach(initiative => {
                        const teamGroupContainer = document.createElement('div');
                        teamGroupContainer.className = 'team-group-container';
                        
                        const groupLabel = document.createElement('div');
                        groupLabel.className = 'team-group-label';
                        groupLabel.textContent = initiative.title;
                        teamGroupContainer.appendChild(groupLabel);
                        
                        const teamsInnerContainer = document.createElement('div');
                        teamsInnerContainer.style.display = 'flex';
                        teamsInnerContainer.style.gap = '4px';
                        
                        initiative.teams.forEach(teamName => {
                            const teamData = boardData.teams[teamName];
                            if (teamData) {
                                const teamCard = document.createElement('div');
                                const healthStatusClass = getTeamHealthStatus(teamData);
                                teamCard.className = 'team-health-card ' + healthStatusClass;
                                teamCard.dataset.teamName = teamName;
                                teamCard.dataset.initiativeId = initiative.id;
                                
                               // Function to get utilization color class
const getUtilizationColor = (utilization) => {
    if (utilization < 50) return 'text-orange-600';      // Underutilized
    if (utilization <= 70) return 'text-yellow-600';     // Low utilization
    if (utilization <= 85) return 'text-green-600';      // Optimal
    if (utilization <= 95) return 'text-yellow-600';     // High
    if (utilization <= 100) return 'text-orange-600';    // Overloaded
    return 'text-red-600';                               // Critical
};

// Function to get health status text and icon
const getHealthStatusIndicator = (teamData) => {
    let atRiskCount = 0;
    // Count all 6 dimensions instead of just 3
    if (isDimensionAtRisk(teamData.capacity)) atRiskCount++;
    if (isDimensionAtRisk(teamData.skillset)) atRiskCount++;
    if (isDimensionAtRisk(teamData.vision)) atRiskCount++;
    if (isDimensionAtRisk(teamData.support)) atRiskCount++;
    if (isDimensionAtRisk(teamData.teamwork)) atRiskCount++;
    if (isDimensionAtRisk(teamData.autonomy)) atRiskCount++;
    
    // Updated status mapping
    if (atRiskCount === 0) return { text: 'HEALTHY', icon: '✓', color: 'text-green-700' };
    if (atRiskCount <= 2) return { text: 'LOW RISK', icon: '⚠', color: 'text-amber-700' };
    if (atRiskCount <= 4) return { text: 'HIGH RISK', icon: '⚠⚠', color: 'text-orange-700' };
    return { text: 'CRITICAL', icon: '🔥', color: 'text-red-700' };
};

const healthStatus = getHealthStatusIndicator(teamData);
const healthIcon = getHealthIcon(teamData);

teamCard.innerHTML = 
    '<div class="h-full flex flex-col">' +
        // Top row - existing team name and health icon positioning
        '<div class="flex justify-between items-start mb-1">' +
            '<div class="text-xs font-bold flex-1 pr-1 leading-none" style="font-size: 12px; max-height: 20px; overflow: hidden;">' + teamName + '</div>' +
            '<div class="text-lg font-bold ' + healthStatus.color + ' flex-shrink-0">' + healthIcon + '</div>' +
        '</div>' +
        
        // Main content area - health status + utilization on left, grid on right
        '<div class="flex items-center justify-between" style="margin-top: 8px;">' +
            // Left side - health status and utilization
            '<div class="flex flex-col justify-between" style="height: 50px; margin-right: 8px;">' +
                // Overall health status - bigger, bold, moved right
                '<div class="text-sm font-bold ' + healthStatus.color + '" style="font-size: 12px; margin-left: 4px;">' + healthStatus.text + '</div>' +
                
                // Utilization - moved up and right, bold
                '<div class="text-xs font-bold ' + getUtilizationColor(teamData.jira.utilization) + '" style="font-size: 10px; line-height: 1.1; margin-left: 4px;">' +
                    'UTILIZATION<br>' + teamData.jira.utilization + '%' +
                '</div>' +
            '</div>' +
            
            // Right side - 2x3 dimensions grid
            '<div class="dimensions-grid-2x3">' +
                // First column: C, Su
                '<div class="grid-column">' +
                    '<div class="dimension-cell ' + getDimensionCellClass(teamData.capacity) + '" title="Capacity - Workload & Resources">C</div>' +
                    '<div class="dimension-cell ' + getDimensionCellClass(teamData.support) + '" title="Support - Tools & Organizational Backing">Su</div>' +
                '</div>' +
                // Second column: S, T  
                '<div class="grid-column">' +
                    '<div class="dimension-cell ' + getDimensionCellClass(teamData.skillset) + '" title="Skillset - Technical Capabilities">S</div>' +
                    '<div class="dimension-cell ' + getDimensionCellClass(teamData.teamwork) + '" title="Team Cohesion - Collaboration & Communication">T</div>' +
                '</div>' +
                // Third column: V, A
                '<div class="grid-column">' +
                    '<div class="dimension-cell ' + getDimensionCellClass(teamData.vision) + '" title="Vision - Clarity & Alignment">V</div>' +
                    '<div class="dimension-cell ' + getDimensionCellClass(teamData.autonomy) + '" title="Autonomy - Decision-making Authority">A</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
                                
                                teamCard.addEventListener('mouseenter', function() {
                                    highlightTeamAndInitiatives(teamName);
                                });
                                teamCard.addEventListener('mouseleave', clearHighlights);
                                
                                teamCard.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    highlightTeamAndInitiatives(teamName);
                                    showTeamModal(teamName, teamData);
                                });
                                
                                teamsInnerContainer.appendChild(teamCard);
                            }
                        });
                        
                        teamGroupContainer.appendChild(teamsInnerContainer);
                        teamsContent.appendChild(teamGroupContainer);
                    });
                }
                
                rowDiv.appendChild(teamsContent);
                container.appendChild(rowDiv);
                
                if (row === 5) {
                    const mendozaLine = document.createElement('div');
                    mendozaLine.className = 'mendoza-line-plain';
                    container.appendChild(mendozaLine);
                }
            }
            
        }

        function isAlignedWithOKRs(initiative) {
    // Only check initiatives that are actively on the board (not pipeline)
    if (initiative.priority === "pipeline") {
        return true; // Don't count pipeline items in alignment calculations
    }
    
    // Check if initiative has an OKR mapping from Jira
    // If canvas.keyResult is "No OKR", it means no OKR was found in Jira linking
    return initiative.canvas && initiative.canvas.keyResult && initiative.canvas.keyResult !== "No OKR";
}
  
       
        //BENTO GRID CREATION FUNCTIONS
        
    function generateBentoGrid() {
    console.log('=== GENERATE BENTO GRID CALLED ===');
    console.log('Time:', new Date().toISOString());
    console.log('boardData.recentlyCompleted exists:', !!boardData?.recentlyCompleted);
    console.log('boardData.recentlyCompleted length:', boardData?.recentlyCompleted?.length || 0);
    console.log('boardData.recentlyCompleted:', boardData?.recentlyCompleted);
    
    updatePipelineCard();
    updateOKRCard();
    updateProgressCard();
    updateHealthCard();
    updateAtRiskCard();
    updateResourceCard();
    updateDeliveryConfidenceCard();
    updateCriticalTeamStatusCard();
    updateRecentlyCompletedCard();
    updateValidationCard();
    updateMendozaCard();
}


        
function updatePipelineCard() {
    const content = document.getElementById('pipeline-content');
    const countBadge = document.getElementById('pipeline-count');
    
    const bullpenItems = boardData.bullpen.filter(item => item !== null);
    countBadge.textContent = bullpenItems.length;

// Toggle scrollbars based on content
    const toggleScrollbars = () => {
        setTimeout(() => {
            const contentHeight = content.scrollHeight;
            const containerHeight = content.clientHeight;
            
            if (contentHeight <= containerHeight) {
                content.style.overflowY = 'hidden';
            } else {
                content.style.overflowY = 'auto';
            }
        }, 100);
    };
    
    // Function to get validation icon
    const getValidationIcon = (validation) => {
        switch(validation) {
            case 'validated': 
                return '<svg class="bento-validation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/></svg>';
            case 'in-validation': 
                return '<svg class="bento-validation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/></svg>';
            case 'not-validated': 
                return '<svg class="bento-validation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg>';
            default: 
                return '<svg class="bento-validation-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/></svg>';
        }
    };

    

    // Function to format validation text
    const getValidationText = (validation) => {
        return validation.replace('-', ' ');
    };

    content.innerHTML = bullpenItems.map(initiative => `
    <div class="bento-pipeline-item validation-${initiative.validation}" 
         data-initiative-id="${initiative.id}"
         onclick="showInitiativeModal(boardData.bullpen.find(init => init && init.id === ${initiative.id}))"
         style="position: relative;">
        <div class="bento-pipeline-item-header">
    <div class="bento-pipeline-item-title" 
         onclick="showInitiativeModal(boardData.bullpen.find(init => init && init.id === ${initiative.id}))"
         style="cursor: pointer; flex: 1;">
        ${initiative.title}
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
            <span class="bento-type-badge bento-type-${initiative.type}">${initiative.type.toUpperCase()}</span>
            <div class="bento-pipeline-validation">
                ${getValidationIcon(initiative.validation)}
                <span class="bento-validation-text">${getValidationText(initiative.validation)}</span>
            </div>
        </div>
        <button class="pipeline-prioritize-icon-btn" 
        onclick="event.stopPropagation(); openQuickPrioritizeModal(boardData.bullpen.find(init => init && init.id === ${initiative.id}));"
        title="Prioritize this initiative">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-narrow-wide-icon lucide-arrow-up-narrow-wide">
        <path d="m3 8 4-4 4 4"/>
        <path d="M7 4v16"/>
        <path d="M11 12h4"/>
        <path d="M11 16h7"/>
        <path d="M11 20h10"/>
    </svg>
</button>
    </div>
</div>
    </div>
`).join('');
    
    // Enable drag functionality for pipeline items
content.querySelectorAll('.bento-pipeline-item').forEach(item => {
    enablePipelineDragDrop(item);
});
}

function updateOKRCard() {
    const content = document.getElementById('okr-content');
    const alignmentPercentage = calculateOKRAlignment();
    
    // Calculate misaligned initiatives count (only active board initiatives)
    const activeBoardInitiatives = boardData.initiatives.filter(init => init.priority !== "pipeline");
    const misalignedCount = activeBoardInitiatives.filter(init => !isAlignedWithOKRs(init)).length;
    
    // Color logic
    let color;
    if (alignmentPercentage >= 85) {
        color = 'var(--accent-green)';
    } else if (alignmentPercentage >= 70) {
        color = 'var(--accent-orange)';
    } else {
        color = 'var(--accent-red)';
    }
    
    content.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center space-y-2 kpi-gauge-card cursor-pointer hover:opacity-80 transition-opacity"
             onclick="event.stopPropagation(); showOKRAlignmentModal()"
             title="View OKR alignment analysis">
            <div class="text-sm font-bold" style="color: var(--text-secondary);">Aligned Initiatives</div>
            <div class="text-5xl font-bold" style="color: ${color};">${alignmentPercentage}%</div>
            <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <span class="text-base font-medium" style="color: var(--text-tertiary);">${misalignedCount} need review</span>
            </div>
        </div>
    `;
}


// Parse OKR data from Jira to get objectives and key results
function parseOKRData() {
    console.log('parseOKRData called, boardData.okrs:', boardData.okrs);
    
    // Handle case where boardData.okrs might be undefined
    if (!boardData || !boardData.okrs) {
        console.log('No boardData.okrs available');
        return { objectives: [], keyResults: [] };
    }
    
    // Handle both possible data structures
    let okrIssues = [];
    if (Array.isArray(boardData.okrs)) {
        // boardData.okrs is directly an array
        okrIssues = boardData.okrs;
    } else if (boardData.okrs.issues && Array.isArray(boardData.okrs.issues)) {
        // boardData.okrs.issues is the array
        okrIssues = boardData.okrs.issues;
    } else {
        console.log('No valid OKR issues found');
        return { objectives: [], keyResults: [] };
    }
    
    const objectives = [];
    const keyResults = [];
    
    okrIssues.forEach(issue => {
        // Safety check for issue structure
        if (!issue || !issue.fields || !issue.fields.issuetype) {
            console.log('Invalid issue structure:', issue);
            return;
        }
        
        // Epic = Objective, Task/Story = Key Result
        if (issue.fields.issuetype.name === 'Epic') {
            objectives.push({
                key: issue.key,
                summary: issue.fields.summary,
                id: issue.id
            });
        } else if (issue.fields.parent) {
            // This is a child task/story = Key Result
            keyResults.push({
                key: issue.key,
                summary: issue.fields.summary,
                parentKey: issue.fields.parent.key,
                parentId: issue.fields.parent.id
            });
        }
    });
    
    console.log(`Found ${objectives.length} objectives and ${keyResults.length} key results`);
    return { objectives, keyResults };
}

// Modal for showing only misaligned initiatives
function showMisalignedInitiativesModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    const misalignedInitiatives = boardData.initiatives.filter(init => !isAlignedWithOKRs(init));
    
    title.textContent = 'Initiatives Needing Review';
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%); border: 1px solid var(--accent-orange);">
                <div class="flex items-center gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/>
                        <path d="M12 17h.01"/>
                    </svg>
                    <div>
                        <div class="font-bold text-lg" style="color: var(--accent-orange);">${misalignedInitiatives.length} Need OKR Review</div>
                        <div class="text-sm" style="color: var(--text-secondary);">These initiatives may need OKR mapping or priority adjustment</div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                ${misalignedInitiatives.map(init => `
                    <div class="bento-pipeline-item" 
                         onclick="closeModal(); setTimeout(() => showInitiativeModal(boardData.initiatives.find(i => i.id === ${init.id})), 100);"
                         style="position: relative; cursor: pointer;">
                        <div class="bento-pipeline-item-header">
                            <div class="bento-pipeline-item-title">
                                ${init.title}
                                <span class="bento-type-badge bento-type-${init.type}">${init.type.toUpperCase()}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                    <path d="M12 9v4"/>
                                    <path d="M12 17h.01"/>
                                </svg>
                                <span class="text-xs" style="color: var(--accent-orange);">Priority ${init.priority}</span>
                                ${getRowColFromSlot(init.priority).row <= 4 && init.priority !== 'bullpen' ? 
                                    '<span class="text-xs px-2 py-1 rounded" style="background: var(--accent-red); color: white; margin-left: 8px;">HIGH PRIORITY</span>' : 
                                    ''
                                }
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="pt-4 border-t" style="border-color: var(--border-primary);">
                <button onclick="showOKRAlignmentModal()" 
                        class="w-full px-4 py-2 rounded font-medium transition-colors" 
                        style="background: var(--accent-primary); color: white;">
                    View Full OKR Analysis
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');

}
      
function calculateTeamsPerLowPriorityInitiative() {
    return Math.round((21 / 16) * 10) / 10; // 21 teams below line / 16 initiatives below line = 1.3
}

function calculateActivityTypeBreakdown() {
    console.log('=== CALCULATING ACTIVITY TYPE BREAKDOWN ===');
    
    const breakdown = {
        aboveLine: {
            // High cost activities
            development: 0,
            'defects/fixes': 0,
            integration: 0,
            infrastructure: 0,
            'go-to-market': 0,
            // Low cost activities  
            compliance: 0,
            prototyping: 0,
            validation: 0,
            optimization: 0,
            support: 0,
            research: 0,
            planning: 0,
            community: 0
        },
        belowLine: {
            // High cost activities
            development: 0,
            'defects/fixes': 0,
            integration: 0,
            infrastructure: 0,
            'go-to-market': 0,
            // Low cost activities
            compliance: 0,
            prototyping: 0,
            validation: 0,
            optimization: 0,
            support: 0,
            research: 0,
            planning: 0,
            community: 0
        }
    };
    
    if (!boardData?.initiatives) {
        return breakdown;
    }
    
    boardData.initiatives.forEach(initiative => {
        const priority = initiative.priority;
        const isAboveLine = priority <= 15;
        
        if (initiative.jira?.hasLiveData && initiative.jira?.childIssues) {
            initiative.jira.childIssues.forEach(childIssue => {
                // Get activity type from the child issue
                let activityType = getFieldValue(childIssue, 'customfield_10190');
                
                // Normalize the activity type to match our categories
                if (activityType) {
                    activityType = activityType.toLowerCase().trim();
                    
                    // Map variations to standard names
                    if (activityType.includes('defect') || activityType.includes('fix') || activityType.includes('bug')) {
                        activityType = 'defects/fixes';
                    } else if (activityType.includes('go-to-market') || activityType.includes('marketing')) {
                        activityType = 'go-to-market';
                    }
                    
                    // Count in appropriate section if we recognize the activity type
                    const targetSection = isAboveLine ? breakdown.aboveLine : breakdown.belowLine;
                    if (targetSection.hasOwnProperty(activityType)) {
                        targetSection[activityType]++;
                    } else {
                        console.log(`Unknown activity type: ${activityType} for ${childIssue.key}`);
                    }
                } else {
                    console.log(`No activity type found for ${childIssue.key}`);
                }
            });
        }
    });
    
    console.log('Activity type breakdown:', breakdown);
    return breakdown;
}

// Update the modal to use activity type breakdown instead of issue type
function showMendozaAnalysisModal() {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content');
    
    document.getElementById('modal-title').textContent = 'Mendoza Line Analysis';
    
    const metrics = window.currentMendozaMetrics || calculateResourceAllocation();
    console.log('Modal using stored metrics:', metrics.efficiencyScore + '%');
    
    const detailedBreakdown = calculateDetailedResourceBreakdown();
    const activityBreakdown = calculateActivityTypeBreakdown();
    
    // Calculate totals for high/low cost activities
    const highCostActivities = ['development', 'defects/fixes', 'integration', 'infrastructure', 'go-to-market'];
const lowCostActivities = ['compliance', 'prototyping', 'validation', 'optimization', 'support', 'research', 'planning', 'community'];

const highCostAbove = highCostActivities.reduce((sum, activity) => sum + (activityBreakdown.aboveLine[activity] || 0), 0);
const highCostBelow = highCostActivities.reduce((sum, activity) => sum + (activityBreakdown.belowLine[activity] || 0), 0);
const lowCostAbove = lowCostActivities.reduce((sum, activity) => sum + (activityBreakdown.aboveLine[activity] || 0), 0);
const lowCostBelow = lowCostActivities.reduce((sum, activity) => sum + (activityBreakdown.belowLine[activity] || 0), 0);
    
   document.getElementById('modal-title').textContent = 'Mendoza Line Analysis';
modalContent.innerHTML = `
    <div class="space-y-6">
            <!-- Training Load Style Efficiency Display -->
<div class="efficiency-display">
    <div class="efficiency-header">
    <h3 class="efficiency-title">Resource Allocation Efficiency</h3>
    <button class="info-button" onclick="showEfficiencyCalculationModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
        </svg>
        How is this calculated and what does it mean?
    </button>
</div>

    <div class="sweet-spot-section">
        <h4 class="sweet-spot-title" id="efficiency-zone-title">Needs Improvement</h4>
        <div class="efficiency-value-large" id="efficiency-value"></div>
    </div>

    <div class="efficiency-bar-container">
    <div class="efficiency-bar" onmousemove="showEfficiencyTooltip(event, this)" onmouseleave="hideEfficiencyTooltip()">
        <div class="efficiency-indicator" id="efficiency-indicator"></div>
    </div>
    <div class="tooltip" id="efficiency-tooltip"></div>
</div>

    <div class="efficiency-description">
        Measures how well your organization allocates resources<br>
        as the percentage of maximum possible optimal allocation.
    </div>
</div>
            
            <!-- Activity Type Breakdown with Info Icons -->
            <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                <h4 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Work Item Allocation by Activity Type</h4>
                
                <div class="grid grid-cols-2 gap-6">
                    <!-- High Cost Activities -->
                    <div>
                        <div class="flex items-center gap-2 mb-3">
    <h5 class="font-medium text-sm" style="color: var(--accent-red);">High Cost Activities</h5>
    <button onclick="showActivityInfoModal('high-cost')" class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10 transition-colors" style="color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
        </svg>
    </button>
                        </div>
                        <div class="p-3 rounded" style="background: var(--bg-quaternary);">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm" style="color: var(--text-secondary);">Above Line</span>
                                <span class="font-medium" style="color: var(--accent-green);">
                                    ${highCostAbove} work items
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm" style="color: var(--text-secondary);">Below Line</span>
                                <span class="font-medium" style="color: var(--accent-red);">
                                    ${highCostBelow} work items
                                </span>
                            </div>
                            <div class="text-xs mt-2 pt-2 border-t" style="color: ${highCostBelow > highCostAbove ? 'var(--accent-red)' : 'var(--accent-green)'}; border-color: var(--border-primary);">
                                ${highCostAbove + highCostBelow > 0 ? Math.round((highCostAbove / (highCostAbove + highCostBelow)) * 100) : 0}% properly allocated above line
                            </div>
                        </div>
                    </div>
                    
                    <!-- Low Cost Activities -->
                    <div>
                        <div class="flex items-center gap-2 mb-3">
    <h5 class="font-medium text-sm" style="color: var(--accent-green);">Low Cost Activities</h5>
    <button onclick="showActivityInfoModal('low-cost')" class="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10 transition-colors" style="color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
        </svg>
    </button>
</div>
                        <div class="p-3 rounded" style="background: var(--bg-quaternary);">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm" style="color: var(--text-secondary);">Above Line</span>
                                <span class="font-medium" style="color: var(--accent-orange);">
                                    ${lowCostAbove} work items
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm" style="color: var(--text-secondary);">Below Line</span>
                                <span class="font-medium" style="color: var(--accent-green);">
                                    ${lowCostBelow} work items
                                </span>
                            </div>
                            <div class="text-xs mt-2 pt-2 border-t" style="color: ${lowCostBelow > lowCostAbove ? 'var(--accent-green)' : 'var(--accent-orange)'}; border-color: var(--border-primary);">
                                ${lowCostAbove + lowCostBelow > 0 ? Math.round((lowCostBelow / (lowCostAbove + lowCostBelow)) * 100) : 0}% properly allocated below line
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Summary Stats -->
                <div class="mt-4 pt-4 border-t" style="border-color: var(--border-primary);">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="flex justify-between">
                            <span style="color: var(--text-secondary);">Total Above Line:</span>
                            <span style="color: var(--text-primary);">
                                ${highCostAbove + lowCostAbove} work items
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span style="color: var(--text-secondary);">Total Below Line:</span>
                            <span style="color: var(--text-primary);">
                                ${highCostBelow + lowCostBelow} work items
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Warning for high waste -->
            ${highCostBelow > 20 ? `
            <div class="p-4 rounded-lg" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red);">
                <h4 class="font-semibold mb-2" style="color: var(--accent-red);">
                    Resource Waste Alert
                </h4>
                <p class="text-sm" style="color: var(--text-secondary);">
                    ${highCostBelow} high-cost work items below the line represent significant resource waste. 
                    These development, infrastructure, and go-to-market activities should be prioritized above the line.
                </p>
            </div>
            ` : ''}
            
           <!-- Activity Distribution Chart -->
<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
    <h4 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Work Item Allocation by Activity Type</h4>
    
    <div>
        <div class="relative" style="height: 300px;">
            <canvas id="modal-activity-chart"></canvas>
        </div>
    </div>
</div>
            
            <!-- Enhanced Recommendations -->
<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
    <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
        Actionable Recommendations
    </h4>
    <div class="space-y-3" id="recommendations-list">
        <!-- Recommendations will be populated by generateEnhancedRecommendations -->
    </div>
</div>
    `;
    
    // Update efficiency display with actual values
const efficiencyScore = metrics.efficiencyScore; // Use your actual efficiency score
const valueElement = document.getElementById('efficiency-value');
const titleElement = document.getElementById('efficiency-zone-title');
const indicatorElement = document.getElementById('efficiency-indicator');

// Update the value
valueElement.textContent = `${efficiencyScore}%`;

// Determine color and description based on your thresholds
let color, description;
if (efficiencyScore >= 85) {
    color = 'var(--accent-green)';
    description = 'Excellent';
} else if (efficiencyScore >= 70) {
    color = 'var(--accent-blue)';
    description = 'Good';
} else if (efficiencyScore >= 55) {
    color = 'var(--accent-orange)';
    description = 'Needs Improvement';
} else {
    color = 'var(--accent-red)';
    description = 'Poor';
}

// Apply colors
valueElement.style.color = color;
titleElement.textContent = description;
titleElement.style.color = color;
indicatorElement.style.background = color;

// Position the indicator
indicatorElement.style.left = `${efficiencyScore}%`;

// Update the indicator line color
const style = document.createElement('style');
style.textContent = `
    .efficiency-indicator::after {
        background: ${color} !important;
    }
`;
document.head.appendChild(style);
    
    createModalActivityChart(detailedBreakdown);
    populateEnhancedModalDetails(detailedBreakdown, metrics, activityBreakdown);
    modal.classList.add('show');
        // Make modal scrollable - optimized for 1366×768 minimum resolution
modal.style.maxHeight = '85vh'; // ~610px on 1366×768, ~720px on 1600×900
modal.style.overflow = 'auto';
const modalContentElement = modal.querySelector('.modal-content');
if (modalContentElement) {
    modalContentElement.style.maxHeight = '80vh'; // ~580px on 1366×768, ~680px on 1600×900  
    modalContentElement.style.overflow = 'auto';
    modalContentElement.style.paddingRight = '4px'; // Account for scrollbar
}
}

function getZoneInfo(percentage) {
    if (percentage < 55) return { name: 'Poor', range: '0-54%' };
    if (percentage < 70) return { name: 'Needs Improvement', range: '55-69%' };
    if (percentage < 85) return { name: 'Good', range: '70-84%' };
    return { name: 'Excellent', range: '85-100%' };
}

function showEfficiencyTooltip(event, barElement) {
    const rect = barElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    const zoneInfo = getZoneInfo(clampedPercentage);
    
    const tooltip = document.getElementById('efficiency-tooltip');
    tooltip.textContent = `${zoneInfo.name} (${zoneInfo.range})`;
    tooltip.style.left = `${x}px`;
    tooltip.classList.add('show');
}

function hideEfficiencyTooltip() {
    const tooltip = document.getElementById('efficiency-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

function showEfficiencyCalculationModal() {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content');
    
    // Get current metrics
    const metrics = window.currentMendozaMetrics || calculateResourceAllocation();
    const totalItems = metrics.aboveLineCount + metrics.belowLineCount;
    const expensiveWastePercent = Math.round((metrics.breakdown.expensiveWorkBelowLine / metrics.breakdown.totalExpensiveWork) * 100);
    const discoveryMisallocationPercent = metrics.breakdown.totalDiscoveryWork > 0 ? 
        Math.round((metrics.breakdown.discoveryWorkAboveLine / metrics.breakdown.totalDiscoveryWork) * 100) : 0;
    
    document.getElementById('modal-title').textContent = 'How Resource Allocation Efficiency is Calculated';
    
    modalContent.innerHTML = `
        <div class="calculation-modal-content">
            <!-- Your Current Numbers -->
            <div class="section">
                <h3 class="section-title">Your Current Numbers</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Capacity Risk:</span>
        <span style="color: ${actualValues.teamHealth.capacity > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.capacity} pts</span>
    </div>
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Skillset Risk:</span>
        <span style="color: ${actualValues.teamHealth.skillset > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.skillset} pts</span>
    </div>
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Support Risk:</span>
        <span style="color: ${actualValues.teamHealth.support > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.support} pts</span>
    </div>
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Over-utilization (>95%):</span>
        <span style="color: ${actualValues.teamHealth.utilization > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.utilization} pts</span>
    </div>
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Vision Risk:</span>
        <span style="color: ${actualValues.teamHealth.vision > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.vision} pts</span>
    </div>
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Team Cohesion Risk:</span>
        <span style="color: ${actualValues.teamHealth.teamwork > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.teamwork} pts</span>
    </div>
    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; border: 1px solid var(--border-secondary); display: flex; justify-content: space-between; align-items: center;">
        <span>Autonomy Risk:</span>
        <span style="color: ${actualValues.teamHealth.autonomy > 0 ? '#f59e0b' : '#6b7280'}; font-weight: 600;">${actualValues.teamHealth.autonomy} pts</span>
    </div>
</div>
            </div>

            <!-- How It Works -->
            <div class="section">
                <h3 class="section-title">How It Works</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
                    The efficiency score measures how optimally your organization allocates work items above and below the "Mendoza Line" (priority threshold). Each type of work has different weights based on strategic importance.
                </p>
                
                <div class="weight-explanation">
                    <h4 style="color: var(--text-primary); margin: 0 0 12px 0; font-size: 1rem;">Activity Weights & Ideal Placement:</h4>
                    <div class="weight-item">
                        <span style="color: var(--text-secondary);">Expensive Work (Development, Integration, Infrastructure)</span>
                        <span style="color: var(--accent-red); font-weight: 600;">Weight: 3.0 → Should be Above Line</span>
                    </div>
                    <div class="weight-item">
                        <span style="color: var(--text-secondary);">Discovery Work (Research, Prototyping, Validation)</span>
                        <span style="color: var(--accent-orange); font-weight: 600;">Weight: 1.5 → Should be Below Line</span>
                    </div>
                    <div class="weight-item">
                        <span style="color: var(--text-secondary);">Support Work (Compliance, Documentation)</span>
                        <span style="color: var(--text-secondary); font-weight: 600;">Weight: 0.5 → Either Position OK</span>
                    </div>
                </div>
            </div>

            <!-- Calculation Formula -->
            <div class="section">
                <h3 class="section-title">Calculation Formula</h3>
                <div class="formula-box">
Efficiency = (Actual Weighted Score / Maximum Possible Score) × 100

Where:
- Expensive work above line = Full points (weight × count)
- Expensive work below line = Zero points (pure waste)
- Discovery work below line = Full points (weight × count)  
- Discovery work above line = Partial points (weight × count × 0.6)
- Support work = Full points regardless of position
                </div>
                
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 12px;">
                    <strong>Your calculation:</strong> ${metrics.breakdown.weightedScore.toFixed(1)} points earned out of ${metrics.breakdown.maxPossibleScore} maximum possible = ${metrics.efficiencyScore}%
                </p>
            </div>

            <!-- What This Means -->
            <div class="section">
                <h3 class="section-title">What Your ${metrics.efficiencyScore}% Means</h3>
                <div class="interpretation-grid">
                    <div class="score-range excellent">85-100%</div>
                    <div style="color: var(--text-secondary);">Excellent allocation with minimal waste</div>
                    
                    <div class="score-range good">70-84%</div>
                    <div style="color: var(--text-secondary);">Good allocation with some optimization opportunities</div>
                    
                    <div class="score-range needs-improvement">55-69%</div>
                    <div style="color: var(--text-secondary);">Needs improvement, significant misallocation</div>
                    
                    <div class="score-range poor">0-54%</div>
                    <div style="color: var(--text-secondary);"><strong>Your score:</strong> ${metrics.efficiencyDescription} allocation ${metrics.efficiencyScore < 55 ? 'requiring urgent attention' : ''}</div>
                </div>
                
                <p style="color: var(--text-secondary); line-height: 1.6; margin-top: 16px; font-size: 0.875rem;">
                    <strong>Key Issues:</strong> ${expensiveWastePercent}% of expensive development work is below the priority line (${metrics.breakdown.expensiveWorkBelowLine} out of ${metrics.breakdown.totalExpensiveWork} items), and ${discoveryMisallocationPercent}% of discovery work is consuming high-priority slots. Moving expensive work above the line and discovery work below would significantly improve efficiency.
                </p>
            </div>
            
            <div class="mt-4 text-center">
                <button onclick="showMendozaAnalysisModal()" class="px-4 py-2 rounded" style="background: var(--accent-blue); color: white;">
                    Back to Analysis
                </button>
            </div>
        </div>
    `;
    
    // Modal is already open, no need to show it again
}

// Add the activity info modal function
function showActivityInfoModal(type) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content');
    
    if (type === 'high-cost') {
        document.getElementById('modal-title').textContent = 'High Cost Activities';
        
        modalContent.innerHTML = `
            <div class="p-6 space-y-4">
                <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--accent-red);">
                    <h3 class="font-semibold mb-3" style="color: var(--accent-red);">Expensive Work That Should Be Above the Line</h3>
                    <p class="text-sm mb-4" style="color: var(--text-secondary);">
                        These activities require expensive development teams, infrastructure resources, or significant market investment. 
                        They should be prioritized above the Mendoza line (positions 1-14) to ensure valuable resources work on high-impact initiatives.
                    </p>
                    
                    <div class="space-y-3">
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-blue);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Development</div>
                                <div class="text-xs" style="color: var(--text-secondary);">New features, enhancements, technical implementation</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-blue);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Defects/Fixes</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Bug fixes, critical issues, system repairs</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-blue);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Integration</div>
                                <div class="text-xs" style="color: var(--text-secondary);">System integrations, API development, data connections</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-blue);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Infrastructure</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Platform improvements, scalability, performance optimization</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-blue);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Go-to-Market</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Marketing campaigns, sales enablement, customer acquisition</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center">
                    <button onclick="showMendozaAnalysisModal()" class="px-4 py-2 rounded" style="background: var(--accent-blue); color: white;">
                        Back to Analysis
                    </button>
                </div>
            </div>
        `;
    } else {
        document.getElementById('modal-title').textContent = 'Low Cost Activities';
        
        modalContent.innerHTML = `
            <div class="p-6 space-y-4">
                <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--accent-green);">
                    <h3 class="font-semibold mb-3" style="color: var(--accent-green);">Cheap Discovery Work That Should Be Below the Line</h3>
                    <p class="text-sm mb-4" style="color: var(--text-secondary);">
                        These activities are relatively inexpensive and help validate ideas before committing expensive development resources. 
                        They should typically be positioned below the Mendoza line (positions 15+) where they can inform prioritization decisions.
                    </p>
                    
                    <div class="space-y-3">
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Validation</div>
                                <div class="text-xs" style="color: var(--text-secondary);">User testing, market validation, concept proof</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Research</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Market research, user interviews, competitive analysis</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Prototyping</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Quick prototypes, mockups, proof of concepts</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Planning</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Strategic planning, roadmap development, requirements gathering</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Support</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Customer support, documentation, training</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Compliance</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Regulatory compliance, audits, policy updates</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Community</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Community engagement, developer relations, partnerships</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 rounded-full mt-2" style="background: var(--accent-green);"></div>
                            <div>
                                <div class="font-medium text-sm" style="color: var(--text-primary);">Optimization</div>
                                <div class="text-xs" style="color: var(--text-secondary);">Process improvements, efficiency gains, cost reduction</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center">
                    <button onclick="showMendozaAnalysisModal()" class="px-4 py-2 rounded" style="background: var(--accent-blue); color: white;">
                        Back to Analysis
                    </button>
                </div>
            </div>
        `;
    }
}



function populateEnhancedModalDetails(breakdown, metrics, activityBreakdown) {
    const recommendations = generateEnhancedRecommendations(breakdown, metrics);
    const recElement = document.getElementById('recommendations-list');
    if (recElement) {
        recElement.innerHTML = recommendations.map(rec => `
    <div class="p-3 rounded-lg ${rec.clickable ? 'cursor-pointer hover:opacity-80' : ''}" 
         style="background: var(--bg-quaternary); border-left: 3px solid ${rec.priority === 'high' ? 'var(--accent-red)' : rec.priority === 'medium' ? 'var(--accent-orange)' : 'var(--accent-blue)'};"
         ${rec.clickable ? `onclick="${rec.modalFunction}()"` : ''}>
        <div class="flex items-start gap-3">
            <div class="text-lg">${rec.icon}</div>
            <div class="flex-1">
                <div class="font-medium text-sm mb-1" style="color: var(--text-primary);">${rec.title}</div>
                <div class="text-xs mb-2" style="color: var(--text-secondary);">${rec.description}</div>
                <div class="text-xs font-medium" style="color: ${rec.priority === 'high' ? 'var(--accent-red)' : rec.priority === 'medium' ? 'var(--accent-orange)' : 'var(--accent-blue)'};">
                    ${rec.action}
                    ${rec.clickable ? '<span style="text-decoration: underline; margin-left: 8px;">Click to view details</span>' : ''}
                </div>
            </div>
        </div>
    </div>
`).join('');
    }
}

function getExpensiveInitiativesBelowLine() {
    const expensiveActivities = ['development', 'defects/fixes', 'infrastructure', 'go-to-market'];
    const expensiveInitiatives = [];
    
    if (!boardData?.initiatives) return [];
    
    boardData.initiatives.forEach(initiative => {
        // Only check initiatives below the Mendoza line (priority > 14)
        if (initiative.priority > 15) {
            let expensiveWorkCount = 0;
            const expensiveWorkDetails = [];
            
            // Count expensive work items in this initiative
            if (initiative.jira?.hasLiveData && initiative.jira?.childIssues) {
                initiative.jira.childIssues.forEach(childIssue => {
                    let activityType = getFieldValue(childIssue, 'customfield_10190');
                    
                    if (activityType) {
                        activityType = activityType.toLowerCase().trim();
                        
                        // Normalize activity type
                        if (activityType.includes('defect') || activityType.includes('fix') || activityType.includes('bug')) {
                            activityType = 'defects/fixes';
                        } else if (activityType.includes('go-to-market') || activityType.includes('marketing')) {
                            activityType = 'go-to-market';
                        }
                        
                        // Check if this is an expensive activity
                        if (expensiveActivities.includes(activityType)) {
                            expensiveWorkCount++;
                            expensiveWorkDetails.push({
                                key: childIssue.key,
                                summary: childIssue.fields?.summary || 'No summary',
                                activityType: activityType
                            });
                        }
                    }
                });
            }
            
            // Only include initiatives that have expensive work
            if (expensiveWorkCount > 0) {
                expensiveInitiatives.push({
                    title: initiative.title,
                    priority: initiative.priority,
                    teams: initiative.teams || [],
                    expensiveWorkCount: expensiveWorkCount,
                    expensiveWorkDetails: expensiveWorkDetails,
                    totalWorkItems: initiative.jira?.childIssues?.length || 0
                });
            }
        }
    });
    
    // Sort by number of expensive work items (descending)
    return expensiveInitiatives.sort((a, b) => b.expensiveWorkCount - a.expensiveWorkCount);
}

// Enhanced recommendations function
function generateEnhancedRecommendations(breakdown, metrics) {
    const recommendations = [];
    
    // Get expensive initiatives below the line
    const expensiveInitiativesBelowLine = getExpensiveInitiativesBelowLine();
    const activityBreakdown = calculateActivityTypeBreakdown();
const highCostActivities = ['development', 'defects/fixes', 'integration', 'infrastructure', 'go-to-market'];
const totalExpensiveWorkBelowLine = highCostActivities.reduce((sum, activity) => sum + (activityBreakdown.belowLine[activity] || 0), 0);

    
    // High priority recommendations for expensive initiatives below line
    if (expensiveInitiativesBelowLine.length > 3) {
        recommendations.push({
            priority: 'high',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
            title: 'Move Development Work Above the Line',
            description: `${expensiveInitiativesBelowLine.length} initiatives with expensive work (${totalExpensiveWorkBelowLine} items total) are below priority 15, wasting engineering capacity.`,
            action: 'Review initiatives 16-32 and promote high-value development work to positions 1-15.',
            clickable: true,
            modalFunction: 'showExpensiveInitiativesBelowLineModal'
        });
    } else if (expensiveInitiativesBelowLine.length > 0) {
        recommendations.push({
            priority: 'medium',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
            title: 'Optimize Development Placement',
            description: `${expensiveInitiativesBelowLine.length} initiatives with expensive work could be better prioritized.`,
            action: 'Evaluate if these development efforts should be promoted or deprecated.'
        });
    }
    
    // Discovery work above line recommendations
    const discoveryWorkAboveLine = metrics.breakdown?.discoveryWorkAboveLine || 0;
    if (discoveryWorkAboveLine > 8) {
        recommendations.push({
            priority: 'medium',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c0 4.9-4 9-9 9s-9-4.1-9-9c0-4.9 4-9 9-9s9 4.1 9 9"/><path d="M9 12l2 2 4-4"/></svg>',
            title: 'Move Validation Work Below the Line',
            description: `${discoveryWorkAboveLine} discovery items are consuming high-priority slots.`,
            action: 'Move research and validation work to positions 16+ to free up development capacity.'
        });
    }
    
    // Efficiency-based recommendations
    if (metrics.efficiencyScore < 60) {
        recommendations.push({
            priority: 'high',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="3" height="8" x="13" y="2" rx="1.5"/><path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"/><rect width="3" height="8" x="8" y="14" rx="1.5"/><path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"/><rect width="8" height="3" x="14" y="13" rx="1.5"/><path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"/><rect width="8" height="3" x="2" y="8" rx="1.5"/><path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"/></svg>',
            title: 'Conduct Priority Rebalancing Session',
            description: 'Resource allocation efficiency is below 60%, indicating systematic prioritization issues.',
            action: 'Schedule a leadership session to review and reorder the entire initiative matrix.'
        });
    } else if (metrics.efficiencyScore < 75) {
        recommendations.push({
            priority: 'medium',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
            title: 'Fine-tune Priority Boundaries',
            description: 'Good allocation overall, but some optimization opportunities remain.',
            action: 'Focus on edge cases around the priority 14 boundary for maximum impact.'
        });
    }
    
    // Success case
    if (metrics.efficiencyScore >= 85 && expensiveInitiativesBelowLine.length <= 2) {
        recommendations.push({
            priority: 'low',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>',
            title: 'Maintain Current Allocation',
            description: 'Resource allocation is operating efficiently with minimal waste.',
            action: 'Continue current prioritization process and monitor for any degradation.'
        });
    }
    
    // Store for modal use
    window.expensiveInitiativesBelowLine = expensiveInitiativesBelowLine;
    
    return recommendations;
}

function showExpensiveInitiativesBelowLineModal() {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content');
    
    const expensiveInitiatives = window.expensiveInitiativesBelowLine || [];
    
    // Only update the title and content, don't replace the entire modal structure
    document.getElementById('modal-title').textContent = 'Expensive Initiatives Below the Line';
    
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                <h4 class="font-semibold mb-3" style="color: var(--accent-red);">
                    ${expensiveInitiatives.length} Initiatives with Expensive Work Below Priority 15
                </h4>
                <p class="text-sm mb-4" style="color: var(--text-secondary);">
                    These initiatives contain development, infrastructure, or go-to-market work that requires expensive specialized teams. 
                    Consider promoting them above the Mendoza line or deprecating them to free up engineering capacity.
                </p>
                
                <div class="space-y-3">
                    ${expensiveInitiatives.map(initiative => `
                        <div class="p-3 rounded-lg" style="background: var(--bg-quaternary); border-left: 3px solid var(--accent-red);">
                            <div class="flex justify-between items-start mb-2">
                                <h5 class="font-medium" style="color: var(--text-primary);">${initiative.title}</h5>
                                <div class="flex gap-2">
                                    <span class="text-xs px-2 py-1 rounded" style="background: var(--accent-red); color: white;">
                                        Priority ${initiative.priority}
                                    </span>
                                    <span class="text-xs px-2 py-1 rounded" style="background: var(--accent-orange); color: white;">
                                        ${initiative.expensiveWorkCount} Expensive Items
                                    </span>
                                </div>
                            </div>
                            
                            <div class="text-xs mb-2" style="color: var(--text-secondary);">
                                Teams: ${initiative.teams.join(', ') || 'Not assigned'}
                            </div>
                            
                            <div class="space-y-1">
                                ${initiative.expensiveWorkDetails.slice(0, 3).map(item => `
                                    <div class="text-xs flex justify-between" style="color: var(--text-tertiary);">
                                        <span>${item.key}: ${item.summary.substring(0, 50)}${item.summary.length > 50 ? '...' : ''}</span>
                                        <span class="capitalize" style="color: var(--accent-orange);">${item.activityType}</span>
                                    </div>
                                `).join('')}
                                ${initiative.expensiveWorkDetails.length > 3 ? `
                                    <div class="text-xs" style="color: var(--text-muted);">
                                        +${initiative.expensiveWorkDetails.length - 3} more expensive items...
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-4 text-center">
                    <button onclick="showMendozaAnalysisModal()" class="px-4 py-2 rounded" style="background: var(--accent-blue); color: white;">
                        Back to Analysis
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // The modal is already open, so we don't need to show it again
    // modal.classList.add('show'); // Remove this line
}

function calculateResourceAllocation() {
    console.log('=== CALCULATING WEIGHTED RESOURCE ALLOCATION ===');
    
    // Define activity classifications with weights
    const activityClassification = {
        // Expensive work that should be above the line (weight = high impact on score)
        'expensive': {
            activities: ['development', 'defects/fixes', 'integration', 'infrastructure', 'go-to-market'],
            correctPlacement: 'above',
            weight: 3.0  // High weight - these misallocations hurt the score significantly
        },
        // Cheap discovery that should be below the line (weight = medium impact)
        'discovery': {
            activities: ['validation', 'research', 'prototyping', 'planning', 'optimization'],
            correctPlacement: 'below', 
            weight: 1.5  // Medium weight - less critical but still matters
        },
        // Neutral activities that can be either place (weight = low impact)
        'neutral': {
            activities: ['compliance', 'support', 'community'],
            correctPlacement: 'either',
            weight: 0.5  // Low weight - placement doesn't matter much
        }
    };
    
    let totalWeightedScore = 0;
    let maxPossibleScore = 0;
    let aboveLineTotal = 0;
    let belowLineTotal = 0;
    let expensiveWorkBelowLine = 0;
    let discoveryWorkAboveLine = 0;
    let totalExpensiveWork = 0;
    let totalDiscoveryWork = 0;
    
    // Use the correct activity breakdown (with 407 Jira items)
    // Use the correct activity breakdown (with 407 Jira items)
const activityBreakdown = calculateDetailedResourceBreakdown();
    
    // Process above-line activities
    Object.entries(activityBreakdown.aboveLine).forEach(([activity, count]) => {
        aboveLineTotal += count;
        
        const classification = getActivityClassification(activity, activityClassification);
        const weight = classification.weight;
        maxPossibleScore += count * weight;
        
        if (classification.type === 'expensive') {
            totalExpensiveWork += count;
            totalWeightedScore += count * weight; // Full points for expensive work above line
        } else if (classification.type === 'discovery') {
            totalDiscoveryWork += count;
            discoveryWorkAboveLine += count;
            // Partial points for discovery work above line (not ideal but not terrible)
            totalWeightedScore += count * weight * 0.6;
        } else {
            // Neutral work gets full points regardless of placement
            totalWeightedScore += count * weight;
        }
    });
    
    // Process below-line activities  
    Object.entries(activityBreakdown.belowLine).forEach(([activity, count]) => {
        belowLineTotal += count;
        
        const classification = getActivityClassification(activity, activityClassification);
        const weight = classification.weight;
        maxPossibleScore += count * weight;
        
        if (classification.type === 'expensive') {
            totalExpensiveWork += count;
            expensiveWorkBelowLine += count;
            // No points for expensive work below line (this is waste)
            totalWeightedScore += 0;
        } else if (classification.type === 'discovery') {
            totalDiscoveryWork += count;
            totalWeightedScore += count * weight; // Full points for discovery work below line
        } else {
            // Neutral work gets full points regardless of placement
            totalWeightedScore += count * weight;
        }
    });
    
    // Calculate efficiency score
    const efficiencyScore = maxPossibleScore > 0 ? 
        Math.round((totalWeightedScore / maxPossibleScore) * 100) : 0;
    
    // Calculate waste percentages
    const totalWork = aboveLineTotal + belowLineTotal;
    const expensiveWastePercent = totalWork > 0 ? 
        Math.round((expensiveWorkBelowLine / totalWork) * 100) : 0;
    const discoveryMisallocationPercent = totalWork > 0 ? 
        Math.round((discoveryWorkAboveLine / totalWork) * 100) : 0;
    
    // Determine efficiency color and description
    let efficiencyColor, efficiencyDescription;
    if (efficiencyScore >= 85) {
        efficiencyColor = 'var(--accent-green)';
        efficiencyDescription = 'Excellent';
    } else if (efficiencyScore >= 70) {
        efficiencyColor = 'var(--accent-blue)';
        efficiencyDescription = 'Good';
    } else if (efficiencyScore >= 55) {
        efficiencyColor = 'var(--accent-orange)';
        efficiencyDescription = 'Needs Improvement';
    } else {
        efficiencyColor = 'var(--accent-red)';
        efficiencyDescription = 'Poor';
    }
    
    console.log('=== WEIGHTED ALLOCATION RESULTS ===');
    console.log(`Efficiency Score: ${efficiencyScore}% (${efficiencyDescription})`);
    console.log(`Expensive work below line: ${expensiveWorkBelowLine}/${totalExpensiveWork} (${expensiveWastePercent}% waste)`);
    console.log(`Discovery work above line: ${discoveryWorkAboveLine}/${totalDiscoveryWork} (${discoveryMisallocationPercent}% misallocation)`);
    console.log(`Weighted score: ${totalWeightedScore}/${maxPossibleScore}`);
    
    const result = {
        efficiencyScore,
        efficiencyColor,
        efficiencyDescription,
        aboveLineCount: aboveLineTotal,
        belowLineCount: belowLineTotal,
        aboveLinePercent: totalWork > 0 ? Math.round((aboveLineTotal / totalWork) * 100) : 0,
        belowLinePercent: totalWork > 0 ? Math.round((belowLineTotal / totalWork) * 100) : 0,
        wasteLevel: expensiveWastePercent,
        breakdown: {
            expensiveWorkAboveLine: totalExpensiveWork - expensiveWorkBelowLine,
            expensiveWorkBelowLine: expensiveWorkBelowLine,
            discoveryWorkAboveLine: discoveryWorkAboveLine,
            discoveryWorkBelowLine: totalDiscoveryWork - discoveryWorkAboveLine,
            totalExpensiveWork,
            totalDiscoveryWork,
            weightedScore: totalWeightedScore,
            maxPossibleScore
        }
    };
    
    // Store for modal use
    window.currentMendozaMetrics = result;
    
    return result;
}

// Helper function to classify activities - do we still need this
function getActivityClassification(activity, activityClassification) {
    for (const [type, config] of Object.entries(activityClassification)) {
        if (config.activities.includes(activity.toLowerCase())) {
            return { type, ...config };
        }
    }
    // Default to neutral if not found
    return { type: 'neutral', ...activityClassification.neutral };
}

// Add this missing function to your script.js

function calculateDetailedResourceBreakdown() {
    console.log('=== CALCULATING ACTIVITY BREAKDOWN FROM CHILD ISSUES ===');
    
    const breakdown = {
        aboveLine: {},
        belowLine: {},
        misallocated: []
    };
    
    const highResourceActivities = ['development', 'go-to-market', 'infrastructure', 'support'];
    
    if (boardData?.initiatives) {
        console.log('Processing initiatives for child issue activity breakdown:', boardData.initiatives.length);
        
        boardData.initiatives.forEach(initiative => {
            const priority = initiative.priority;
            const isAboveLine = priority <= 15;
            
            console.log(`Processing initiative: ${initiative.title}, Priority: ${priority}, Above line: ${isAboveLine}`);
            
            // Check if this initiative has live Jira data with child issues
            if (initiative.jira?.hasLiveData && initiative.jira?.childIssues) {
                console.log(`  - Has ${initiative.jira.childIssues.length} child issues`);
                
                // Process each child issue for activity types
                initiative.jira.childIssues.forEach(childIssue => {
                    // Get Activity Type from child issue's customfield_10190
                    const activityType = getFieldValue(childIssue, 'customfield_10190');
                    
                    if (activityType) {
                        console.log(`    Child ${childIssue.key}: Activity Type = ${activityType}`);
                        
                        // Add to appropriate section based on parent initiative's priority
                        const target = isAboveLine ? breakdown.aboveLine : breakdown.belowLine;
                        target[activityType] = (target[activityType] || 0) + 1;
                        
                        // Track misallocated high-resource work below the line
                        const isHighResource = highResourceActivities.includes(activityType);
                        if (!isAboveLine && isHighResource) {
                            breakdown.misallocated.push({
                                title: childIssue.fields.summary,
                                parentTitle: initiative.title,
                                activityType: activityType,
                                priority: priority,
                                teams: initiative.teams,
                                childKey: childIssue.key
                            });
                        }
                    } else {
                        console.log(`    Child ${childIssue.key}: No Activity Type found`);
                    }
                });
            } else {
                console.log(`  - No child issues data available (using fallback)`);
                
                // Fallback: Use parent initiative activity type if no child data
                const activityType = getInitiativeActivityType(initiative);
                
                if (priority !== 'pipeline') {
                    const target = isAboveLine ? breakdown.aboveLine : breakdown.belowLine;
                    target[activityType] = (target[activityType] || 0) + 1;
                    
                    const isHighResource = highResourceActivities.includes(activityType);
                    if (!isAboveLine && isHighResource) {
                        breakdown.misallocated.push({
                            title: initiative.title,
                            activityType: activityType,
                            priority: priority,
                            teams: initiative.teams
                        });
                    }
                }
            }
        });
    }
    
    console.log('Activity breakdown result from child issues:');
    console.log('Above line activities:', breakdown.aboveLine);
    console.log('Below line activities:', breakdown.belowLine);
    console.log('Total above line items:', Object.values(breakdown.aboveLine).reduce((a, b) => a + b, 0));
    console.log('Total below line items:', Object.values(breakdown.belowLine).reduce((a, b) => a + b, 0));
    console.log('Misallocated items:', breakdown.misallocated.length);
    
    return breakdown;
}

// Also add the missing populateModalDetails function if it doesn't exist
function populateModalDetails(breakdown, metrics) {
    // Generate recommendations
    const recommendations = generateRecommendations(breakdown, metrics);
    const recElement = document.getElementById('recommendations-list');
    if (recElement) {
        recElement.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    }
}

function generateRecommendations(breakdown, metrics) {
    const recommendations = [];
    
    if (metrics.wasteLevel > 20) {
        recommendations.push('Move development and go-to-market initiatives above priority 14');
    }
    
    if (breakdown.belowLine.development > 2) {
        recommendations.push('Consider promoting high-impact development work to higher priorities');
    }
    
    if (breakdown.aboveLine.validation > 1) {
        recommendations.push('Move validation activities below the line to preserve development capacity');
    }
    
    if (metrics.efficiencyScore < 60) {
        recommendations.push('Review initiative prioritization to align resource-intensive work above the line');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Resource allocation looks efficient - maintain current prioritization approach');
    }
    
    return recommendations;
}

function createModalActivityChart(breakdown) {
    console.log('=== CREATING ACTIVITY CHART WITH FIXED COLORS AND DEDUPLICATION ===');
    console.log('Breakdown received:', breakdown);
    
    const canvas = document.getElementById('modal-activity-chart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.modalActivityChart) {
        window.modalActivityChart.destroy();
    }
    
    // Clean and deduplicate the breakdown data
    const cleanedBreakdown = {
        aboveLine: {},
        belowLine: {},
        misallocated: breakdown.misallocated || []
    };
    
    // Function to normalize activity names (remove duplicates)
    function normalizeActivity(activity) {
        if (!activity) return 'unknown';
        return activity.toLowerCase().trim();
    }
    
    // Consolidate above line activities
    Object.entries(breakdown.aboveLine || {}).forEach(([activity, count]) => {
        const normalized = normalizeActivity(activity);
        cleanedBreakdown.aboveLine[normalized] = (cleanedBreakdown.aboveLine[normalized] || 0) + count;
    });
    
    // Consolidate below line activities  
    Object.entries(breakdown.belowLine || {}).forEach(([activity, count]) => {
        const normalized = normalizeActivity(activity);
        cleanedBreakdown.belowLine[normalized] = (cleanedBreakdown.belowLine[normalized] || 0) + count;
    });
    
    // Get ALL unique activities from BOTH above and below line (after normalization)
    const allActivities = Array.from(new Set([
    ...Object.keys(cleanedBreakdown.aboveLine),
    ...Object.keys(cleanedBreakdown.belowLine)
])).sort((a, b) => {
    const totalA = (cleanedBreakdown.aboveLine[a] || 0) + (cleanedBreakdown.belowLine[a] || 0);
    const totalB = (cleanedBreakdown.aboveLine[b] || 0) + (cleanedBreakdown.belowLine[b] || 0);
    return totalB - totalA; // Descending order by total count
});
    
    console.log('Cleaned unique activities:', Array.from(allActivities));
    
    if (allActivities.size === 0) {
        console.warn('No activities found in breakdown');
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'flex items-center justify-center h-full text-center';
        emptyDiv.style.color = 'var(--text-secondary)';
        emptyDiv.innerHTML = '<div>No activity data available</div>';
        canvas.parentElement.appendChild(emptyDiv);
        canvas.style.display = 'none';
        return;
    }
    
    const aboveData = [];
    const belowData = [];
    const labels = [];
    
    // Build chart data with proper capitalization
    allActivities.forEach(activity => {
        labels.push(activity.charAt(0).toUpperCase() + activity.slice(1));
        aboveData.push(cleanedBreakdown.aboveLine[activity] || 0);
        belowData.push(cleanedBreakdown.belowLine[activity] || 0);
    });
    
    console.log('Chart data prepared:');
    console.log('Labels:', labels);
    console.log('Above data:', aboveData);
    console.log('Below data:', belowData);
    
    window.modalActivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Above the Line',
                data: aboveData,
                backgroundColor: '#14b8a6E6', // Teal with 90% opacity
                borderColor: '#14b8a6',      // Teal border
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }, {
                label: 'Below the Line',
                data: belowData,
                backgroundColor: '#ec489980', // Pink with 50% opacity  
                borderColor: '#ec4899CC',     // Pink border with 80% opacity
                borderWidth: 1,
                borderDash: [5, 5],
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: { 
                            size: 12,
                            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'rect'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 35, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label + ' Activities';
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' Work Items';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Activity Type',
                        color: '#ffffff',
                        font: { 
                            size: 14,
                            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    ticks: { 
                        color: '#d1d5db',
                        font: { 
                            size: 11,
                            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: { 
                        display: false 
                    },
                    border: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Work Items',
                        color: '#ffffff',
                        font: { 
                            size: 14,
                            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    ticks: { 
                        color: '#d1d5db',
                        font: { 
                            size: 11,
                            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        },
                        stepSize: 1,
                        beginAtZero: true
                    },
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 0.5
                    },
                    border: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    console.log('Activity chart created successfully with teal/pink colors and deduplication');
}




function showEfficiencyInfoModal() {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 class="text-xl font-bold" style="color: var(--text-primary);">
                How Resource Efficiency Works
            </h2>
        </div>
        
        <div class="p-6 space-y-6">
            <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border);">
                <h3 class="text-lg font-semibold mb-3" style="color: var(--accent-blue);">
                    The Simple Idea
                </h3>
                <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">
                    We want our expensive development resources (engineers, designers, product managers) working on 
                    <strong>above the line</strong> priorities. Cheap discovery work (research, validation) should happen 
                    <strong>below the line</strong> where it doesn't consume precious development capacity.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 rounded-lg" style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-green);">
                    <h4 class="font-semibold mb-2" style="color: var(--accent-green);">
                        Expensive Work (Above Line)
                    </h4>
                    <ul class="text-sm space-y-1" style="color: var(--text-secondary);">
                        <li>• Full development teams</li>
                        <li>• Go-to-market campaigns</li>
                        <li>• Infrastructure projects</li>
                        <li>• Customer support</li>
                    </ul>
                </div>
                
                <div class="p-4 rounded-lg" style="background: rgba(251, 146, 60, 0.1); border: 1px solid var(--accent-orange);">
                    <h4 class="font-semibold mb-2" style="color: var(--accent-orange);">
                        Cheap Discovery (Below Line)
                    </h4>
                    <ul class="text-sm space-y-1" style="color: var(--text-secondary);">
                        <li>• User interviews</li>
                        <li>• Market research</li>
                        <li>• Quick prototypes</li>
                        <li>• Planning and design</li>
                    </ul>
                </div>
            </div>
            
            <div class="p-4 rounded-lg" style="background: var(--status-info-bg); border: 1px solid var(--accent-blue);">
                <h4 class="font-semibold mb-2" style="color: var(--accent-blue);">
                    What the Score Means
                </h4>
                <div class="text-sm space-y-2" style="color: var(--text-secondary);">
                    <p><strong style="color: var(--accent-green);">80%+ (Green):</strong> Most expensive work is above the line - efficient use of resources</p>
                    <p><strong style="color: var(--accent-orange);">60-79% (Orange):</strong> Some expensive work below the line - room for improvement</p>
                    <p><strong style="color: var(--accent-red);">Below 60% (Red):</strong> Too much expensive work below the line - wasting development capacity</p>
                </div>
            </div>
            
            <div class="text-center">
                <button onclick="showMendozaAnalysisModal()" class="px-6 py-2 rounded-md text-sm font-medium" style="background: var(--accent-blue); color: white;">
                    Back to Analysis
                </button>
            </div>
        </div>
    `;
}

// Add new function for team allocation modals
function showTeamAllocationModal(allocationType) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    let modalTitle = '';
    let teams = [];
    let description = '';
    let headerColor = '';
    
    switch(allocationType) {
        case 'high-priority-only':
            modalTitle = 'Teams Working ONLY on High-Priority Initiatives';
            teams = ['Core Platform', 'User Experience', 'Security']; // Example teams
            description = 'These teams are focused exclusively on critical and high-priority initiatives (rows 1-4).';
            headerColor = 'var(--accent-green)';
            break;
        case 'low-priority-only':
            modalTitle = 'Teams Working ONLY on Low-Priority Initiatives';
            teams = ['Legal Tech', 'Risk Management', 'Actuarial', 'Procurement', 'Finance', 'Content', 'Business Operations', 'Process Engineering', 'Claims Operations'];
            description = 'These teams are allocated exclusively to low-priority initiatives (rows 6-8) below the Mendoza line.';
            headerColor = 'var(--accent-red)';
            break;
        case 'mixed-priority':
            modalTitle = 'Teams Working on Both High and Low Priority Initiatives';
            teams = ['Data Engineering', 'Analytics', 'Site Reliability', 'Product Management', 'Customer Support', 'Machine Learning', 'Payments', 'Mobile Development', 'Compliance', 'Product Marketing', 'Accessibility', 'Partner Engineering', 'Migration Team', 'Business Continuity', 'Developer Relations'];
            description = 'These teams are split across both high-priority and low-priority initiatives, potentially causing context switching overhead.';
            headerColor = 'var(--accent-orange)';
            break;
    }
    
    title.textContent = modalTitle;
    content.innerHTML = 
        '<div class="space-y-6">' +
            '<div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid var(--accent-blue);">' +
                '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">' + description + '</p>' +
            '</div>' +
            
            '<div class="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">' +
                teams.map(teamName => `
                    <div class="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-opacity-90 transition-all" 
                         style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);"
                         onclick="closeModal(); setTimeout(() => showTeamModal('${teamName}', boardData.teams['${teamName}']), 100);">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: ${headerColor}; color: white;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div>
                                <div class="font-medium" style="color: var(--text-primary);">${teamName}</div>
                                <div class="text-sm" style="color: var(--text-secondary);">
                                    ${boardData.teams[teamName] ? `${boardData.teams[teamName].jira.velocity} velocity • ${boardData.teams[teamName].jira.utilization}% utilization` : 'Team details'}
                                </div>
                            </div>
                        </div>
                        <div class="text-xs px-3 py-1 rounded" style="background: ${headerColor}; color: white;">
                            View Details →
                        </div>
                    </div>
                `).join('') +
            '</div>' +
            
            '<div class="text-center pt-4 border-t" style="border-color: var(--border-primary);">' +
                '<button onclick="showMendozaAnalysisModal()" class="px-4 py-2 rounded-md text-sm font-medium" style="background: var(--accent-blue); color: white;">← Back to Impact Analysis</button>' +
            '</div>' +
        '</div>';
    
    modal.classList.add('show');
}

// Function to fetch Key Results and Value History data from Jira
async function fetchKeyResultsData() {
    try {
        console.log('Fetching Key Results data from Jira...');
        
        // Fetch Key Results (Tasks under OKR Epics)
        const keyResultsResponse = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/rest/api/3/search/jql',
                method: 'POST',
                
                    jql: `project = "OKRs" AND issuetype = Task AND parent IS NOT EMPTY ORDER BY key ASC`,
                    fields: [
                        "summary", "key", "parent",
                        "customfield_10048", // Current Value
                        "customfield_10047", // Target Value
                        "customfield_10050", // Value Unit
                        "customfield_10049", // KR Type
                        "customfield_10163"  // KR Short Names
                    ],
                    maxResults: 100
                
            })
        });
        
        // Fetch Value History records
        const valueHistoryResponse = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/rest/api/3/search/jql',
                method: 'POST',
                    jql: `project = "OKRs" AND issuetype = "Value History" ORDER BY created ASC`,
                    fields: [
                        "customfield_10162", // Parent OKR
                        "customfield_10159", // Change Date
                        "customfield_10158"  // New Value
                    ],
                    maxResults: 500
            })
        });
        
        if (!keyResultsResponse.ok || !valueHistoryResponse.ok) {
            console.error('Failed to fetch Key Results data from Jira');
            return { keyResults: [], valueHistory: [] };
        }
        
        const keyResultsData = await keyResultsResponse.json();
        const valueHistoryData = await valueHistoryResponse.json();
        
        console.log(`Fetched ${keyResultsData.issues.length} Key Results and ${valueHistoryData.issues.length} Value History records`);
        
        return {
            keyResults: keyResultsData.issues || [],
            valueHistory: valueHistoryData.issues || []
        };
        
    } catch (error) {
        console.error('Error fetching Key Results data:', error);
        return { keyResults: [], valueHistory: [] };
    }
}

// Function to transform Key Results data for display
function transformKeyResultsData(keyResults, valueHistory) {
    return keyResults.slice(0, 3).map(kr => { // Limit to 3 cards to match current layout
        const currentValue = getFieldValue(kr, 'customfield_10048') || 0;
        const targetValue = getFieldValue(kr, 'customfield_10047') || 100;
        const valueUnit = getFieldValue(kr, 'customfield_10050') || 'count';
        const krType = getFieldValue(kr, 'customfield_10049') || 'Operations';
        const shortName = getFieldValue(kr, 'customfield_10163') || kr.fields.summary;
        
        // Debug the Value History field structure
console.log(`Debugging Value History records for ${kr.key}:`);
valueHistory.slice(0, 3).forEach((vh, i) => {
    const parentField = getFieldValue(vh, 'customfield_10162');
    console.log(`  VH ${i}: parentField =`, parentField);
    console.log(`  VH ${i}: parentField type =`, typeof parentField);
    if (parentField && typeof parentField === 'object') {
        console.log(`  VH ${i}: parentField keys =`, Object.keys(parentField));
    }
});
        
        // Get historical data for sparkline
        const krHistoryRecords = valueHistory.filter(vh => {
    const parentOKR = getFieldValue(vh, 'customfield_10162');
    return parentOKR === kr.key;  // Direct string comparison instead of parentOKR.key
});
        
        console.log(`${kr.key}: Found ${krHistoryRecords.length} raw history records`);
        krHistoryRecords.forEach((record, i) => {
            const date = getFieldValue(record, 'customfield_10159');
            const value = getFieldValue(record, 'customfield_10158');
        console.log(`  Record ${i}: date=${date}, value=${value}, parsedValue=${parseFloat(value)}`);
        });
        
        // Sort by change date and extract values
        const sortedHistory = krHistoryRecords
            .map(record => ({
                date: getFieldValue(record, 'customfield_10159'),
                value: parseFloat(getFieldValue(record, 'customfield_10158')) || 0
            }))
            .filter(record => record.date && !isNaN(record.value))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log(`${shortName}: sortedHistory data:`);
sortedHistory.forEach((point, i) => {
    console.log(`  ${i}: ${point.date} → ${point.value}`);
});
        
        // Add this debugging:
console.log(`${shortName}: Found ${krHistoryRecords.length} history records`);
console.log(`${shortName}: Sorted history length: ${sortedHistory.length}`);
if (sortedHistory.length > 0) {
    console.log(`${shortName}: Sample history:`, sortedHistory.slice(0, 3));
}
        
        // Generate sparkline points (last 30 data points or pad with current value)
        let sparklineValues = sortedHistory.map(h => h.value);
        if (sparklineValues.length === 0) {
            sparklineValues = [currentValue]; // Fallback to current value
        }
        
        // Pad or trim to reasonable sparkline length
        while (sparklineValues.length < 10) {
            sparklineValues.unshift(sparklineValues[0] || 0);
        }
        sparklineValues = sparklineValues.slice(-30); // Last 30 points max
        
        // Generate sparkline path
        const sparklinePath = generateSparklinePath(sparklineValues);
        
        // Format unit for display
        const formattedUnit = formatValueUnit(valueUnit);
        
        // Calculate progress percentage
        const progressPercentage = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
        
        // Determine badge color based on KR Type
        const badgeColor = getBadgeColor(krType);
        
       return {
    key: kr.key,
    title: shortName,
    currentValue: currentValue,
    targetValue: targetValue,
    unit: formattedUnit,
    progress: progressPercentage,
    krType: krType,
    badgeColor: badgeColor,
    // Replace the existing trendPoints calculation with this:
trendPoints: sortedHistory.length > 0 ? 
    sortedHistory.slice(-6).map((historyPoint, index) => {
        const minVal = 0;
        const maxVal = targetValue * 1.1; // Target + 10% buffer
        const range = maxVal - minVal;
        const x = (index / Math.max(1, sortedHistory.slice(-6).length - 1)) * 120;
        const y = (historyPoint.value - minVal) / range * 25;
        return `${x},${y}`;
    }).join(' ') : 
    generateFallbackSparkline(currentValue, Math.max(targetValue, 100)),
    color: progressPercentage >= 80 ? 'var(--accent-green)' : 
           progressPercentage >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)'
};
    });
}

// Helper function to format value units
function formatValueUnit(unit) {
    switch (unit?.toLowerCase()) {
        case 'percent':
            return '%';
        case 'count':
            return '';
        case 'score':
            return '';
        case 'days':
            return 'Days';
        case 'users':
            return 'Users';
        default:
            return '';
    }
}

// Helper function to get badge colors for KR Types
function getBadgeColor(krType) {
    switch (krType?.toLowerCase()) {
        case 'growth':
            return 'var(--accent-green)';
        case 'innovation':
            return 'var(--accent-blue)';
        case 'operations':
            return 'var(--accent-orange)';
        default:
            return 'var(--accent-blue)';
    }
}

// Helper function to generate sparkline SVG path
function generateSparklinePath(values) {
    if (values.length === 0) return '';
    
    const width = 60;
    const height = 30;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Avoid division by zero
    
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - minValue) / range) * height;
        return `${x},${y}`;
    }).join(' ');
    
    return `M${points.split(' ').join(' L')}`;
}

// Global variable to store live KR data
let liveKeyResultsData = [];

// Helper function to generate fallback sparkline for existing data
function generateFallbackSparkline(currentValue, maxValue) {
    const points = [];
    const numPoints = 6; // Reduced from 10 to fit better
    
    for (let i = 0; i < numPoints; i++) {
        const variation = (Math.random() - 0.5) * (maxValue * 0.1);
        const value = Math.max(0, Math.min(maxValue, currentValue + variation));
        const x = (i / (numPoints - 1)) * 120; // Changed from 60 to 120 to match chart width
        const y = 30 - ((value / maxValue) * 25); // Adjusted Y scaling
        points.push(`${x},${y}`);
    }
    
    return points.join(' ');
}
      
// CORRECTED updateProgressCard function - restored original structure with just badges added
function updateProgressCard() {
    const content = document.getElementById('progress-overview-content');
    
    // Calculate KPI values (will use live data if available)
    calculateOKRProgress().then(kpis => {
        content.innerHTML = `
            <div class="grid grid-cols-3 gap-2 h-full">
                ${kpis.map((kpi, index) => `
                    <div class="kpi-gauge-card">
                        <div class="kpi-gauge-header" style="min-height: 4.5em; display: flex; align-items: flex-start; justify-content: flex-start; text-align: left; padding-top: 0.2rem;">${kpi.title}</div>
                        
                        <!-- Centered content group - moved up -->
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; flex: 1; margin-top: -2rem; margin-bottom: 0.25rem; padding-top: 0;">
                            
                            <div style="color: white; font-size: clamp(0.75rem, 1vw, 0.875rem); text-align: center; margin-bottom: 0.25rem;">Target: ${kpi.targetValue}${kpi.unit || ''}</div>
                            
                            <div class="kpi-current-value" style="color: ${kpi.color};">${kpi.currentValue}${kpi.unit || ''}</div>
                            
                            <div class="kpi-gauge-chart" style="margin-bottom: 2px;">
                                <svg width="100%" height="80" viewBox="0 0 200 110" style="max-width: 200px;">
                                    <!-- Red zone (0-33%) -->
                                    <path d="M 20 90 A 80 80 0 0 1 73.2 26.9" 
                                          fill="none" stroke="var(--accent-red)" stroke-width="16" stroke-linecap="round"/>
                                    
                                    <!-- Orange zone (33-66%) -->
                                    <path d="M 73.2 26.9 A 80 80 0 0 1 126.8 26.9" 
                                          fill="none" stroke="var(--accent-orange)" stroke-width="16" stroke-linecap="round"/>
                                    
                                    <!-- Green zone (66-100%) -->
                                    <path d="M 126.8 26.9 A 80 80 0 0 1 180 90" 
                                          fill="none" stroke="var(--accent-green)" stroke-width="16" stroke-linecap="round"/>
                                    
                                    <!-- Needle -->
                                    <g transform="translate(100, 90)">
                                        <line x1="0" y1="0" x2="0" y2="-60" 
                                              stroke="white" stroke-width="4" stroke-linecap="round"
                                              transform="rotate(${(kpi.progress / 100) * 180 - 90})"/>
                                        <circle cx="0" cy="0" r="5" fill="white"/>
                                    </g>
                                </svg>
                            </div>
                            
                            <div class="kpi-trend-chart" style="margin-bottom: 0.1rem;">
                                <svg width="100%" height="48" viewBox="0 0 120 40">
                                    <!-- Define gradient for this specific KPI -->
                                    <defs>
                                        <linearGradient id="trendGradient${index}" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:${kpi.color};stop-opacity:0.3" />
                                            <stop offset="100%" style="stop-color:${kpi.color};stop-opacity:0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    <!-- Y-axis -->
                                    <line x1="0" y1="5" x2="0" y2="35" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    
                                    <!-- X-axis -->
                                    <line x1="0" y1="35" x2="120" y2="35" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                                    
                                    <!-- Grid lines -->
                                    <line x1="0" y1="20" x2="120" y2="20" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                                    <line x1="0" y1="12" x2="120" y2="12" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                                    <line x1="0" y1="28" x2="120" y2="28" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                                    
                                    <!-- Gradient fill area -->
                                    <polygon points="${(kpi.trendPoints || '0,35 20,35 40,35').split(' ').map((point, pointIndex) => {
    const [x, y] = point.split(',');
    return `${pointIndex * 20},${35 - (parseInt(y) * 1.2)}`;
}).join(' ') + ' 120,35 0,35'}"
                                              fill="url(#trendGradient${index})" stroke="none"/>
                                    
                                    <!-- Trend line - Special handling for Strategic Capabilities -->
<polyline points="${(kpi.trendPoints || '0,35 20,35 40,35').split(' ').map((point, pointIndex) => {
    const [x, y] = point.split(',');
    return `${pointIndex * 20},${35 - (parseInt(y) * 1.2)}`;
}).join(' ')}"
                                              fill="none" stroke="${kpi.color}" stroke-width="2" stroke-linecap="round"/>
                                    
                                   ${(kpi.trendPoints || '0,35 20,35 40,35').split(' ').map((point, pointIndex) => {
    const [x, y] = point.split(',');
    return `<circle cx="${pointIndex * 20}" cy="${35 - (parseInt(y) * 1.2)}" r="2" fill="${kpi.color}"/>`;
}).join('')}
                                </svg>
                                <div class="kpi-trend-label">Last 30 days</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers to make entire cards clickable
        setTimeout(() => {
            const cards = document.querySelectorAll('#progress-overview-content .kpi-gauge-card');
            
            cards.forEach((card, index) => {
                card.style.cursor = 'pointer';
                card.style.transition = 'all 0.2s ease';
                
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
                
                card.addEventListener('click', function(e) {
                    // Don't open detail modal if clicking the edit button
                    if (e.target.closest('.kpi-edit-button')) {
                        return;
                    }
                    // Use the current KPI directly based on the index
                    openKPIDetailModal(kpis[index]);
                });
            });
        }, 100);
    });
}

// Add CSS styles for KR Type badges
const krTypeBadgeStyles = `
.kpi-kr-type-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
    font-weight: 600;
    color: white;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    z-index: 2;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.kpi-gauge-card {
    position: relative;
}

/* Make edit button respect the badge placement */
.kpi-edit-button {
    top: 3rem !important;
}
`;

// Function to inject KR Type badge styles
function ensureKRTypeBadgeStyles() {
    if (!document.getElementById('kr-type-badge-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'kr-type-badge-styles';
        styleSheet.textContent = krTypeBadgeStyles;
        document.head.appendChild(styleSheet);
    }
}




function updateHealthCard() {
    const content = document.getElementById('health-status-content');
    const healthCounts = getTeamHealthCounts();
    const indicatorCounts = getHealthIndicatorCounts();
    
    // Find max values for scaling (updated for new health levels)
    const maxHealthValue = Math.max(healthCounts.healthy, healthCounts.lowRisk, healthCounts.highRisk, healthCounts.critical);
    const maxIndicatorValue = Math.max(indicatorCounts.capacity, indicatorCounts.skillset, indicatorCounts.vision, indicatorCounts.support, indicatorCounts.teamwork, indicatorCounts.autonomy);
    
    content.innerHTML = `
        <div class="h-full flex flex-col" style="gap: 0.5rem;">
            <!-- Team Health Card - Top -->
            <div class="flex-1 kpi-gauge-card" style="display: flex; flex-direction: column; padding: 0.5rem;">
                <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
                    <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">Team Health</div>
                    <div style="color: var(--accent-blue); font-size: 0.8rem;">Click segments for details</div>
                </div>
                
                <!-- Updated Bar Chart Container - 4 bars for new health levels -->
                <div class="flex items-end justify-between gap-1" style="height: 4rem; flex: 1;">
                    <!-- Healthy Bar -->
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
    <div style="flex: 1; display: flex; align-items: end; width: 100%;">
        <div class="cursor-pointer kpi-gauge-card"
             onclick="showTeamHealthModal('healthy')"
             title="Healthy Teams: ${healthCounts.healthy} teams"
             style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); 
                    border: 1px solid #14532d;
                    width: 100%; 
                    height: ${(healthCounts.healthy / Math.max(1, maxHealthValue)) * 100}%; 
                    border-radius: 0.25rem 0.25rem 0 0; 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: 0.9rem; color: white; font-weight: 700; 
                    transition: all 0.2s ease;
                    min-height: 2rem;">
            ${healthCounts.healthy}
        </div>
    </div>
    <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Healthy</div>
</div>

<!-- Low Risk Bar -->
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
    <div style="flex: 1; display: flex; align-items: end; width: 100%;">
        <div class="cursor-pointer kpi-gauge-card"
             onclick="showTeamHealthModal('low-risk')"
             title="Low Risk Teams: ${healthCounts.lowRisk} teams"
             style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); 
                    border: 1px solid #b45309;
                    width: 100%; 
                    height: ${(healthCounts.lowRisk / Math.max(1, maxHealthValue)) * 100}%; 
                    border-radius: 0.25rem 0.25rem 0 0; 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: 0.9rem; color: white; font-weight: 700; 
                    transition: all 0.2s ease;
                    min-height: 2rem;">
            ${healthCounts.lowRisk}
        </div>
    </div>
    <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Low Risk</div>
</div>

<!-- High Risk Bar -->
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
    <div style="flex: 1; display: flex; align-items: end; width: 100%;">
       <div class="cursor-pointer kpi-gauge-card"
             onclick="showTeamHealthModal('high-risk')"
             title="High Risk Teams: ${healthCounts.highRisk} teams"
             style="background: linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%); 
                    border: 1px solid #be123c;
                    width: 100%; 
                    height: ${(healthCounts.highRisk / Math.max(1, maxHealthValue)) * 100}%; 
                    border-radius: 0.25rem 0.25rem 0 0; 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: 0.9rem; color: white; font-weight: 700; 
                    transition: all 0.2s ease;
                    min-height: 2rem;">
            ${healthCounts.highRisk}
        </div>
    </div>
    <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">High Risk</div>
</div>

<!-- Critical Bar -->
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
    <div style="flex: 1; display: flex; align-items: end; width: 100%;">
        <div class="cursor-pointer kpi-gauge-card"
             onclick="showTeamHealthModal('critical')"
             title="Critical Teams: ${healthCounts.critical} teams"
             style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); 
                    border: 1px solid #7f1d1d;
                    width: 100%; 
                    height: ${(healthCounts.critical / Math.max(1, maxHealthValue)) * 100}%; 
                    border-radius: 0.25rem 0.25rem 0 0; 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: 0.9rem; color: white; font-weight: 700; 
                    transition: all 0.2s ease;
                    min-height: 2rem;">
            ${healthCounts.critical}
        </div>
    </div>
    <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Critical</div>
</div>
                </div>
            </div>
            
            <!-- Risk Factors Card - Bottom (Purple gradations) -->
<div class="flex-1 kpi-gauge-card" style="display: flex; flex-direction: column; padding: 0.5rem;">
    <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">Risk Factors</div>
        <div style="color: var(--accent-blue); font-size: 0.8rem;">Click segments for details</div>
    </div>
    
    <!-- Single row of 6 dimensions with purple gradients -->
    <div class="flex gap-1" style="flex: 1; height: 3rem;">
        <!-- Capacity -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('capacity')"
                     title="Capacity Issues: ${indicatorCounts.capacity} teams"
                     style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6b21a8 100%); 
                            border: 1px solid #581c87;
                            width: 100%; 
                            height: ${(indicatorCounts.capacity / Math.max(1, maxIndicatorValue)) * 100}%; 
                            border-radius: 0.25rem 0.25rem 0 0; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 0.8rem; color: white; font-weight: 700; 
                            transition: all 0.2s ease;
                            min-height: 1.5rem;">
                    ${indicatorCounts.capacity}
                </div>
            </div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Capacity</div>
        </div>
        
        <!-- Skillset -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('skillset')"
                     title="Skillset Issues: ${indicatorCounts.skillset} teams"
                     style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6b21a8 100%); 
                            border: 1px solid #581c87;
                            width: 100%; 
                            height: ${(indicatorCounts.skillset / Math.max(1, maxIndicatorValue)) * 100}%; 
                            border-radius: 0.25rem 0.25rem 0 0; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 0.8rem; color: white; font-weight: 700; 
                            transition: all 0.2s ease;
                            min-height: 1.5rem;">
                    ${indicatorCounts.skillset}
                </div>
            </div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Skillset</div>
        </div>
        
        <!-- Vision -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('vision')"
                     title="Vision Issues: ${indicatorCounts.vision} teams"
                     style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6b21a8 100%); 
                            border: 1px solid #581c87;
                            width: 100%; 
                            height: ${(indicatorCounts.vision / Math.max(1, maxIndicatorValue)) * 100}%; 
                            border-radius: 0.25rem 0.25rem 0 0; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 0.8rem; color: white; font-weight: 700; 
                            transition: all 0.2s ease;
                            min-height: 1.5rem;">
                    ${indicatorCounts.vision}
                </div>
            </div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Vision</div>
        </div>
        
        <!-- Support -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('support')"
                     title="Support Issues: ${indicatorCounts.support} teams"
                     style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6b21a8 100%); 
                            border: 1px solid #581c87;
                            width: 100%; 
                            height: ${(indicatorCounts.support / Math.max(1, maxIndicatorValue)) * 100}%; 
                            border-radius: 0.25rem 0.25rem 0 0; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 0.8rem; color: white; font-weight: 700; 
                            transition: all 0.2s ease;
                            min-height: 1.5rem;">
                    ${indicatorCounts.support}
                </div>
            </div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Support</div>
        </div>
        
        <!-- Team Cohesion -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('teamwork')"
                     title="Team Cohesion Issues: ${indicatorCounts.teamwork} teams"
                     style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6b21a8 100%); 
                            border: 1px solid #581c87;
                            width: 100%; 
                            height: ${(indicatorCounts.teamwork / Math.max(1, maxIndicatorValue)) * 100}%; 
                            border-radius: 0.25rem 0.25rem 0 0; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 0.8rem; color: white; font-weight: 700; 
                            transition: all 0.2s ease;
                            min-height: 1.5rem;">
                    ${indicatorCounts.teamwork}
                </div>
            </div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Team Cohesion</div>
        </div>
        
        <!-- Autonomy -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('autonomy')"
                     title="Autonomy Issues: ${indicatorCounts.autonomy} teams"
                     style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6b21a8 100%); 
                            border: 1px solid #581c87;
                            width: 100%; 
                            height: ${(indicatorCounts.autonomy / Math.max(1, maxIndicatorValue)) * 100}%; 
                            border-radius: 0.25rem 0.25rem 0 0; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 0.8rem; color: white; font-weight: 700; 
                            transition: all 0.2s ease;
                            min-height: 1.5rem;">
                    ${indicatorCounts.autonomy}
                </div>
            </div>
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Autonomy</div>
        </div>
    </div>
</div>
            </div>
        </div>
    `;
    content.classList.add('under-construction-content');
    const card = content.closest('.bento-card');
    card.style.position = 'relative';
    card.insertAdjacentHTML('beforeend', '<div class="under-construction-overlay"><div class="under-construction-text">Under Construction</div></div>');
}
      
      function getHealthIndicatorCounts() {
    const teams = Object.values(boardData.teams);
    
    return {
        capacity: teams.filter(team => team.capacity === 'at-risk').length,
        skillset: teams.filter(team => team.skillset === 'at-risk').length,
        vision: teams.filter(team => team.vision === 'at-risk').length,
        support: teams.filter(team => team.support === 'at-risk').length,
        teamwork: teams.filter(team => team.teamwork === 'at-risk').length,
        autonomy: teams.filter(team => team.autonomy === 'at-risk').length
    };
}
      
function updateAtRiskCard() {
    const content = document.getElementById('at-risk-content');
    const atRiskInitiatives = getTopAtRiskInitiatives()
    .sort((a, b) => analyzeInitiativeRisk(b).riskScore - analyzeInitiativeRisk(a).riskScore)
    .slice(0, 3);
    
    content.innerHTML = '<div class="flex gap-3 h-full">' + 
        atRiskInitiatives.map(initiative => {
            
            
            // Calculate risk level and get colors (simplified version for cards)
            const riskScore = analyzeInitiativeRisk(initiative).riskScore;
            const riskColor = getRiskLevelColor(riskScore);
            
            return `
                <div class="flex-1 min-w-0">
                    <div class="initiative-card-mini ${getTypeColor(initiative.type)} text-white h-full cursor-pointer at-risk-card-item"
                         onclick="handleAtRiskCardClick(${initiative.id})"
                         data-initiative-id="${initiative.id}"
                         data-risk-color="${riskColor}"
                         style="padding: 0.75rem; border-radius: 8px; position: relative; min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
                        
                        <!-- Header with title only -->
                        <div class="mb-2">
                            <div class="text-xs font-bold leading-tight" style="line-height: 1.2; max-height: 3em; overflow: hidden;">
                                ${initiative.title}
                            </div>
                        </div>
                        
                        <!-- Risk Score text -->
<div class="text-xs opacity-90 mb-2" style="font-weight: 500; color: ${getRiskLevelColor(analyzeInitiativeRisk(initiative).riskScore)};">
    Risk: ${analyzeInitiativeRisk(initiative).riskScore}/50
</div>
                        
                        <!-- Type badge (styled like pipeline items) -->
                        <div class="flex justify-start">
                            <span class="bento-type-badge bento-type-${initiative.type}">
                                ${initiative.type.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('') + 
    '</div>';
    
    // Apply risk colors after DOM is created
    setTimeout(() => {
        document.querySelectorAll('.at-risk-card-item').forEach(card => {
            const riskColor = card.dataset.riskColor;
            if (riskColor) {
                card.style.setProperty('border', `2px solid ${riskColor}`, 'important');
                card.style.setProperty('border-left', `6px solid ${riskColor}`, 'important');
                card.style.setProperty('box-shadow', `0 8px 25px ${riskColor}33, var(--shadow-lg)`, 'important');
            }
        });
    }, 10);
}



// UPDATE: getRiskLevelColor function for 50-point scale
function getRiskLevelColor(riskScore) {
    if (riskScore <= 12) return 'var(--accent-green)';      // 0-12: Low Risk
    if (riskScore <= 22) return 'var(--accent-orange)';     // 13-22: Moderate Risk
    if (riskScore <= 35) return '#f97316';                  // 23-35: High Risk
    return 'var(--accent-red)';                            // 36-50: Critical Risk
}

//Helper function for Top-3 Priority Color Coded priority numbers
function getPriorityNumberColor(type) {
    switch(type) {
        case 'strategic': return '#06b6d4';    // Teal/Cyan for strategic
        case 'ktlo': return '#8b5cf6';         // Purple for KTLO/Tech  
        case 'emergent': return '#ec4899';     // Pink for emergent
        default: return '#6b7280';             // Gray fallback
    }
}
      
function updateResourceCard() {
    const content = document.getElementById('resource-alerts-content');
    const resourceAnalysis = calculateResourceAlerts();
    
    content.innerHTML = `
        <div class="text-center space-y-2">
            <div class="bento-medium-metric">${resourceAnalysis.overloadedTeams}</div>
            <div class="text-xs" style="color: var(--text-secondary);">Overloaded Teams</div>
            <div class="text-xs" style="color: var(--text-tertiary);">Avg ${resourceAnalysis.avgTeamsPerInit} teams/init</div>
        </div>
    `;
    content.classList.add('under-construction-content');
    const card = content.closest('.bento-card');
    card.style.position = 'relative';
    card.insertAdjacentHTML('beforeend', '<div class="under-construction-overlay"><div class="under-construction-text">Under Construction</div></div>');
}

function updateDeliveryConfidenceCard() {
    const content = document.getElementById('delivery-confidence-content');
    
    // Calculate delivery confidence metrics
    const confidenceMetrics = calculateDeliveryConfidence();
    
    // Determine confidence level and styling
    let confidenceLevel, confidenceIcon, confidenceText, confidenceColor;
    
    if (confidenceMetrics.score >= 85) {
        confidenceLevel = 'high';
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/><path d="M16 5h6"/><path d="M19 2v6"/></svg>';
        confidenceText = 'High Confidence';
        confidenceColor = 'var(--accent-green)';
    } else if (confidenceMetrics.score >= 75) {
        confidenceLevel = 'moderate-confidence';
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
        confidenceText = 'Moderate Confidence';
        confidenceColor = '#eab308';
    } else if (confidenceMetrics.score >= 65) {
        confidenceLevel = 'moderate-risk';
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="15" y2="15"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
        confidenceText = 'Moderate Risk';
        confidenceColor = 'var(--accent-orange)';
    } else {
        confidenceLevel = 'high-risk';
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
        confidenceText = 'High Risk';
        confidenceColor = 'var(--accent-red)';
    }
    
    // Get risk factor colors
    const validationColor = getRiskColor('validation', confidenceMetrics.riskFactors.validation);
    const capacityColor = getRiskColor('capacity', confidenceMetrics.riskFactors.capacity);
    const blockersColor = getRiskColor('blockers', confidenceMetrics.riskFactors.blockers);
    
    content.innerHTML = `
    <div class="h-full flex gap-3">
        <!-- Left: Confidence Icon and Text -->
        <div class="flex-1 flex flex-col items-center justify-center text-center">
            <div class="mb-2">${confidenceIcon.replace('width="90" height="90"', 'width="60" height="60"')}</div>
            <div class="text-sm font-bold" style="color: ${confidenceColor};">${confidenceText}</div>
        </div>
        
        <!-- Right: Risk Metrics -->
        <div class="flex-1 flex flex-col justify-center space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium" style="color: var(--text-tertiary);">Validation Risks</span>
                <div class="text-xl font-bold" style="color: ${getRiskColor('validation', confidenceMetrics.riskFactors.validation)};">${confidenceMetrics.riskFactors.validation}</div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium" style="color: var(--text-tertiary);">Capacity Risks</span>
                <div class="text-xl font-bold" style="color: ${getRiskColor('capacity', confidenceMetrics.riskFactors.capacity)};">${confidenceMetrics.riskFactors.capacity}</div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium" style="color: var(--text-tertiary);">Blocked Items</span>
                <div class="text-xl font-bold" style="color: ${getRiskColor('blockers', confidenceMetrics.riskFactors.blockers)};">${confidenceMetrics.riskFactors.blockers}</div>
            </div>
        </div>
    </div>
`;
    content.classList.add('under-construction');
content.insertAdjacentHTML('beforeend', '<div class="under-construction-overlay"><div class="under-construction-text">Under Construction</div></div>');
}



      
      function getRiskColor(riskType, value) {
    let thresholds;
    
    switch(riskType) {
        case 'validation':
        case 'capacity':
            thresholds = { green: 1, yellow: 3, orange: 5 };
            break;
        case 'blockers':
            thresholds = { green: 10, yellow: 25, orange: 50 };
            break;
        default:
            thresholds = { green: 1, yellow: 3, orange: 5 };
    }
    
    if (value <= thresholds.green) return 'var(--accent-green)';
    if (value <= thresholds.yellow) return '#eab308';
    if (value <= thresholds.orange) return 'var(--accent-orange)';
    return 'var(--accent-red)';
}
      
      function showDeliveryConfidenceModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Calculate delivery confidence metrics
    const confidenceMetrics = calculateDeliveryConfidence();
    
    // Determine confidence level styling
    let confidenceIcon, confidenceText, confidenceColor;
    
    if (confidenceMetrics.score >= 85) {
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/><path d="M16 5h6"/><path d="M19 2v6"/></svg>';
        confidenceText = 'High Confidence';
        confidenceColor = 'var(--accent-green)';
    } else if (confidenceMetrics.score >= 75) {
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
        confidenceText = 'Moderate Confidence';
        confidenceColor = '#eab308';
    } else if (confidenceMetrics.score >= 65) {
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="15" y2="15"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
        confidenceText = 'Moderate Risk';
        confidenceColor = 'var(--accent-orange)';
    } else {
        confidenceIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
        confidenceText = 'High Risk';
        confidenceColor = 'var(--accent-red)';
    }
    
    title.textContent = 'Delivery Confidence Analysis';
    content.innerHTML = 
        '<div class="space-y-6">' +
            // Header Section with Face Icon and Confidence Level
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M9 12l2 2 4-4"/>' +
                        '<path d="M21 12c.552 0 1-.448 1-1V5l-8-3-8 3v6c0 .552.448 1 1 1z"/>' +
                    '</svg>' +
                    'Overall Delivery Confidence' +
                '</h3>' +
                
                // Confidence Status Display
'<div class="p-6 rounded-lg mb-6" style="background: linear-gradient(135deg, rgba(' + (confidenceColor === 'var(--accent-green)' ? '16, 185, 129' : confidenceColor === '#eab308' ? '234, 179, 8' : confidenceColor === 'var(--accent-orange)' ? '251, 146, 60' : '239, 68, 68') + ', 0.1) 0%, rgba(' + (confidenceColor === 'var(--accent-green)' ? '16, 185, 129' : confidenceColor === '#eab308' ? '234, 179, 8' : confidenceColor === 'var(--accent-orange)' ? '251, 146, 60' : '239, 68, 68') + ', 0.05) 100%); border: 1px solid ' + confidenceColor + ';">' +
    '<div class="flex items-center justify-center gap-6">' +
        '<div class="text-5xl font-bold" style="color: ' + confidenceColor + ';">' + confidenceMetrics.score + '%</div>' +
        '<div style="color: ' + confidenceColor + ';">' + confidenceIcon.replace('width="48" height="48"', 'width="96" height="96"') + '</div>' +
        '<div class="text-5xl font-bold" style="color: ' + confidenceColor + ';">' + confidenceText + '</div>' +
    '</div>' +
'</div>' +
            
            // How Confidence Score is Calculated
'<div class="p-4 rounded-lg mb-4" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid var(--accent-blue);">' +
    '<div class="flex items-center gap-3 mb-3">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="12" r="10"/>' +
            '<path d="M12 16v-4"/>' +
            '<path d="M12 8h.01"/>' +
        '</svg>' +
        '<span class="font-medium text-sm" style="color: var(--accent-blue);">How is the confidence score calculated</span>' +
    '</div>' +
    '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">Confidence starts at 85% and deducts points based on:</p>' +
    '<div class="space-y-3 mt-4">' +
        '<div class="flex items-start gap-3">' +
    '<div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" style="background: var(--accent-blue);"></div>' +
    '<div class="text-sm" style="color: var(--text-secondary);"><strong>Validation risks:</strong> -5% per high-priority initiative that\'s not validated</div>' +
'</div>' +
'<div class="flex items-start gap-3">' +
    '<div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" style="background: var(--accent-blue);"></div>' +
    '<div class="text-sm" style="color: var(--text-secondary);"><strong>Capacity risks:</strong> -3% per team with >95% utilization or at-risk capacity</div>' +
'</div>' +
'<div class="flex items-start gap-3">' +
    '<div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" style="background: var(--accent-blue);"></div>' +
    '<div class="text-sm" style="color: var(--text-secondary);"><strong>Blocked items:</strong> -0.5% per blocked story (max 15% deduction)</div>' +
'</div>' +
        '</div>' +
    '</div>' +
'</div>' +
            
            // Risk Factor Breakdown
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' +
                        '<path d="M12 9v4"/>' +
                        '<path d="M12 17h.01"/>' +
                    '</svg>' +
                    'Risk Factor Breakdown' +
                '</h3>' +
                
                '<div class="grid gap-4" style="grid-template-columns: 1fr 1fr 1fr;">' +
                    // Validation Risks
                    '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                        '<div class="flex items-center justify-between mb-3">' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded-full" style="background: ' + getRiskColor('validation', confidenceMetrics.riskFactors.validation) + ';"></div>' +
                                '<span class="font-bold text-sm" style="color: var(--text-primary);">Validation</span>' +
                            '</div>' +
                            '<div class="flex items-center gap-1">' +
                                getTrendArrow('validation') +
                            '</div>' +
                        '</div>' +
                        '<div class="text-3xl font-bold mb-1" style="color: ' + getRiskColor('validation', confidenceMetrics.riskFactors.validation) + ';">' + confidenceMetrics.riskFactors.validation + '</div>' +
                        '<div class="text-xs" style="color: var(--text-tertiary);">High-priority unvalidated</div>' +
                        '<div class="text-xs mt-1" style="color: var(--text-secondary);">Impact severity: ' + getImpactSeverity('validation', confidenceMetrics.riskFactors.validation) + '</div>' +
                    '</div>' +
                    
                    // Capacity Risks
                    '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                        '<div class="flex items-center justify-between mb-3">' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded-full" style="background: ' + getRiskColor('capacity', confidenceMetrics.riskFactors.capacity) + ';"></div>' +
                                '<span class="font-bold text-sm" style="color: var(--text-primary);">Capacity</span>' +
                            '</div>' +
                            '<div class="flex items-center gap-1">' +
                                getTrendArrow('capacity') +
                            '</div>' +
                        '</div>' +
                        '<div class="text-3xl font-bold mb-1" style="color: ' + getRiskColor('capacity', confidenceMetrics.riskFactors.capacity) + ';">' + confidenceMetrics.riskFactors.capacity + '</div>' +
                        '<div class="text-xs" style="color: var(--text-tertiary);">Overloaded teams</div>' +
                        '<div class="text-xs mt-1" style="color: var(--text-secondary);">Impact severity: ' + getImpactSeverity('capacity', confidenceMetrics.riskFactors.capacity) + '</div>' +
                    '</div>' +
                    
                    // Blocked Items
                    '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                        '<div class="flex items-center justify-between mb-3">' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded-full" style="background: ' + getRiskColor('blockers', confidenceMetrics.riskFactors.blockers) + ';"></div>' +
                                '<span class="font-bold text-sm" style="color: var(--text-primary);">Blockers</span>' +
                            '</div>' +
                            '<div class="flex items-center gap-1">' +
                                getTrendArrow('blockers') +
                            '</div>' +
                        '</div>' +
                        '<div class="text-3xl font-bold mb-1" style="color: ' + getRiskColor('blockers', confidenceMetrics.riskFactors.blockers) + ';">' + confidenceMetrics.riskFactors.blockers + '</div>' +
                        '<div class="text-xs" style="color: var(--text-tertiary);">Total blocked stories</div>' +
                        '<div class="text-xs mt-1" style="color: var(--text-secondary);">Impact severity: ' + getImpactSeverity('blockers', confidenceMetrics.riskFactors.blockers) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            // Action-Oriented Insights
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M9 12l2 2 4-4"/>' +
                        '<path d="M21 12c.552 0 1-.448 1-1V5l-8-3-8 3v6c0 .552.448 1 1 1z"/>' +
                    '</svg>' +
                    'Action-Oriented Insights' +
                '</h3>' +
                
                '<div class="grid gap-4" style="grid-template-columns: 1fr 1fr 1fr;">' +
                    getActionInsights(confidenceMetrics) +
                '</div>' +
            '</div>' +
            
            // Historical Trend
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M3 3v16a2 2 0 0 0 2 2h16"/>' +
                        '<path d="m19 9-5 5-4-4-3 3"/>' +
                    '</svg>' +
                    'Historical Trend' +
                '</h3>' +
                
                '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                    '<div class="flex items-center justify-between mb-4">' +
                        '<div class="text-sm font-medium" style="color: var(--text-primary);">Confidence Over Last 30 Days</div>' +
                        '<div class="flex items-center gap-2">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                '<path d="M16 7h6v6"/>' +
                                '<path d="m22 7-8.5 8.5-5-5L2 17"/>' +
                            '</svg>' +
                            '<span class="text-sm font-medium" style="color: var(--accent-green);">Up 12% from last month</span>' +
                        '</div>' +
                    '</div>' +
                    
                    // Sparkline Chart
                    '<div style="height: 100px;">' +
                        '<svg width="100%" height="100" viewBox="0 0 400 100" style="background: rgba(255,255,255,0.02); border-radius: 4px;">' +
                            // Define gradient
                            '<defs>' +
                                '<linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="0%" y2="100%">' +
                                    '<stop offset="0%" style="stop-color:' + confidenceColor + ';stop-opacity:0.3" />' +
                                    '<stop offset="100%" style="stop-color:' + confidenceColor + ';stop-opacity:0" />' +
                                '</linearGradient>' +
                            '</defs>' +
                            
                            // Grid lines
                            '<line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
                            '<line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
                            '<line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
                            
                            // X-axis' +
                            '<line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>' +
                            
                            // Data points for upward trend (65% to 77%)
                            generateConfidenceTrendLine(confidenceColor) +
                            
                            // Current point highlight
                            '<circle cx="400" cy="23" r="4" fill="' + confidenceColor + '" stroke="white" stroke-width="2"/>' +
                        '</svg>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    modal.classList.add('show');
}

function updateCriticalTeamStatusCard() {
    const content = document.getElementById('critical-team-content');
    
    // Get teams in critical status
    const criticalTeams = Object.entries(boardData.teams)
        .filter(([name, data]) => {
            const atRiskCount = [data.capacity, data.skillset, data.vision, data.support, data.teamwork, data.autonomy]
                .filter(status => status === 'at-risk').length;
            return atRiskCount >= 5; // Critical = 5+ at-risk dimensions
        })
        .map(([name]) => name);
    
    content.innerHTML = `
        <div class="text-center space-y-2">
            <div class="bento-medium-metric" style="color: var(--accent-red);">${criticalTeams.length}</div>
            <div class="text-xs" style="color: var(--text-secondary);">Teams in Critical Status</div>
            ${criticalTeams.length > 0 ? 
                `<div class="text-xs" style="color: var(--text-tertiary);">${criticalTeams.slice(0, 2).join(', ')}</div>` 
                : ''}
        </div>
    `;
    
    // ADD THE BLUR OVERLAY
    content.classList.add('under-construction-content');
    const card = content.closest('.bento-card');
    card.style.position = 'relative';
    card.insertAdjacentHTML('beforeend', '<div class="under-construction-overlay"><div class="under-construction-text">Under Construction</div></div>');
}


      
      function getTrendArrow(riskType) {
    // Simulate trend direction based on risk type
    const trends = {
        'validation': 'stable', // Same level of validation risks
        'capacity': 'down',     // Improving (fewer capacity risks)
        'blockers': 'up'        // Getting worse (more blockers)
    };
    
    const trend = trends[riskType] || 'stable';
    
    switch(trend) {
        case 'up':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></svg>';
        case 'down':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>';
        case 'stable':
        default:
            return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8L22 12L18 16"/><path d="M2 12H22"/></svg>';
    }
}

function getImpactSeverity(riskType, value) {
    let severity;
    
    switch(riskType) {
        case 'validation':
        case 'capacity':
            if (value <= 1) severity = 'Low';
            else if (value <= 3) severity = 'Medium';
            else if (value <= 5) severity = 'High';
            else severity = 'Critical';
            break;
        case 'blockers':
            if (value <= 10) severity = 'Low';
            else if (value <= 25) severity = 'Medium';
            else if (value <= 50) severity = 'High';
            else severity = 'Critical';
            break;
        default:
            severity = 'Medium';
    }
    
    return severity;
}

function getActionInsights(confidenceMetrics) {
    const insights = [];
    
    // Determine top blocker
    if (confidenceMetrics.riskFactors.capacity > confidenceMetrics.riskFactors.validation && 
        confidenceMetrics.riskFactors.capacity > confidenceMetrics.riskFactors.blockers) {
        insights.push(`
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid var(--accent-red);">
                <div class="font-bold text-sm mb-2" style="color: var(--accent-red);">Top Blocker</div>
                <div class="text-sm" style="color: var(--text-secondary);">Team capacity overload</div>
                <div class="text-xs mt-1" style="color: var(--text-tertiary);">${confidenceMetrics.riskFactors.capacity} teams at risk</div>
            </div>
        `);
    } else if (confidenceMetrics.riskFactors.validation >= confidenceMetrics.riskFactors.capacity) {
        insights.push(`
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid var(--accent-red);">
                <div class="font-bold text-sm mb-2" style="color: var(--accent-red);">Top Blocker</div>
                <div class="text-sm" style="color: var(--text-secondary);">Unvalidated initiatives</div>
                <div class="text-xs mt-1" style="color: var(--text-tertiary);">${confidenceMetrics.riskFactors.validation} high-priority items</div>
            </div>
        `);
    } else {
        insights.push(`
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid var(--accent-red);">
                <div class="font-bold text-sm mb-2" style="color: var(--accent-red);">Top Blocker</div>
                <div class="text-sm" style="color: var(--text-secondary);">Blocked stories</div>
                <div class="text-xs mt-1" style="color: var(--text-tertiary);">${confidenceMetrics.riskFactors.blockers} total blockers</div>
            </div>
        `);
    }
    
    // Quick win
    if (confidenceMetrics.riskFactors.validation > 2) {
        insights.push(`
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid var(--accent-green);">
                <div class="font-bold text-sm mb-2" style="color: var(--accent-green);">Quick Win</div>
                <div class="text-sm" style="color: var(--text-secondary);">Validate 2 initiatives</div>
                <div class="text-xs mt-1" style="color: var(--text-tertiary);">+10% confidence boost</div>
            </div>
        `);
    } else {
        insights.push(`
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid var(--accent-green);">
                <div class="font-bold text-sm mb-2" style="color: var(--accent-green);">Quick Win</div>
                <div class="text-sm" style="color: var(--text-secondary);">Unblock 10 stories</div>
                <div class="text-xs mt-1" style="color: var(--text-tertiary);">+5% confidence boost</div>
            </div>
        `);
    }
    
    // Risk spike
    insights.push(`
        <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%); border: 1px solid var(--accent-orange);">
            <div class="font-bold text-sm mb-2" style="color: var(--accent-orange);">Risk Spike</div>
            <div class="text-sm" style="color: var(--text-secondary);">If Data Engineering team goes down</div>
            <div class="text-xs mt-1" style="color: var(--text-tertiary);">-15% confidence impact</div>
        </div>
    `);
    
    return insights.join('');
}

function generateConfidenceTrendLine(color) {
    // Generate a sparkline showing improvement from 65% to 77% over 30 days
    const points = [
        { x: 0, y: 65 },      // 30 days ago: 65%
        { x: 50, y: 67 },     // 25 days ago: 67%
        { x: 100, y: 64 },    // 20 days ago: 64% (dip)
        { x: 150, y: 69 },    // 15 days ago: 69%
        { x: 200, y: 71 },    // 10 days ago: 71%
        { x: 250, y: 73 },    // 7 days ago: 73%
        { x: 300, y: 75 },    // 5 days ago: 75%
        { x: 350, y: 76 },    // 2 days ago: 76%
        { x: 400, y: 77 }     // Today: 77%
    ];
    
    // Convert percentages to Y coordinates (inverted for SVG)
    const normalizedPoints = points.map(point => ({
        x: point.x,
        y: 90 - ((point.y - 60) / 40) * 65  // Scale 60-100% to fit in 90-25 Y range
    }));
    
    // Create path string
    const pathData = normalizedPoints.map((point, index) => 
        (index === 0 ? 'M' : 'L') + point.x + ',' + point.y
    ).join(' ');
    
    // Create fill area
    const fillData = 'M0,90 ' + pathData + ' L400,90 Z';
    
    return `
        <!-- Gradient fill area -->
        <path d="${fillData}" fill="url(#confidenceGradient)" stroke="none"/>
        
        <!-- Trend line -->
        <path d="${pathData}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
        
        <!-- Data points -->
        ${normalizedPoints.map(point => 
            `<circle cx="${point.x}" cy="${point.y}" r="2" fill="${color}"/>`
        ).join('')}
    `;
}
      
      function calculateDeliveryConfidence() {
    // Start with base confidence of 85%
    let confidence = 85;
    
    // Calculate risk factors
    const validationRisks = boardData.initiatives.filter(init => 
        init.validation === 'not-validated' && 
        init.priority !== 'bullpen' && 
        getRowColFromSlot(init.priority).row <= 4
    ).length;
    
    const capacityRisks = Object.values(boardData.teams).filter(team => {
        const jiraData = team.jira || {};
        return jiraData.utilization > 95 || team.capacity === 'at-risk';
    }).length;
    
    const blockedItems = boardData.initiatives.reduce((total, init) => {
        return total + (init.jira?.blocked || 0);
    }, 0);
    
    // Reduce confidence based on risk factors
    confidence -= validationRisks * 5;  // 5% per validation risk
    confidence -= capacityRisks * 3;    // 3% per capacity risk
    confidence -= Math.min(blockedItems * 0.5, 15); // 0.5% per blocked item, max 15%
    
    // Ensure confidence stays within reasonable bounds
    confidence = Math.max(confidence, 45);
    confidence = Math.min(confidence, 95);
    
    // Determine color based on confidence level
    let color;
    if (confidence >= 80) {
        color = 'var(--accent-green)';
    } else if (confidence >= 65) {
        color = 'var(--accent-orange)';
    } else {
        color = 'var(--accent-red)';
    }
    
    return {
        score: Math.round(confidence),
        color: color,
        riskFactors: {
            validation: validationRisks,
            capacity: capacityRisks,
            blockers: blockedItems
        }
    };
}

// Function to transform Jira completed initiatives to our data format
// Fixed transform function for completed initiatives
function transformJiraCompletedInitiatives(jiraIssues) {
    return jiraIssues.map(issue => {
        const project = issue.fields.project.key;
        const typeMapping = { 'STRAT': 'strategic', 'KTLO': 'ktlo', 'EMRG': 'emergent' };
        const initiativeType = getFieldValue(issue, 'customfield_10051') || typeMapping[project] || 'strategic';
        
        // Try multiple sources for completion date
        let completedDate = null;
        
        // Option 1: Custom completion date field
        completedDate = getFieldValue(issue, 'customfield_10124');
        
        // Option 2: If custom field empty, use resolved date
        if (!completedDate && issue.fields.resolved) {
            completedDate = issue.fields.resolved;
        }
        
        // Option 3: If still no date, use updated date as fallback
        if (!completedDate && issue.fields.updated) {
            completedDate = issue.fields.updated;
        }
        
        console.log(`Completed initiative ${issue.key}: completedDate = ${completedDate}`);
        
        return {
            id: parseInt(issue.id),
            title: issue.fields.summary,
            type: initiativeType,
            completedDate: completedDate, // This was undefined before
            teams: ['Core Platform'], // Simplified for completed initiatives
            jira: {
                key: issue.key
            },
            canvas: {
                outcome: getFieldValue(issue, 'customfield_10059') || 'Completed outcome',
                measures: getFieldValue(issue, 'customfield_10060') || 'Success achieved',
                customer: getFieldValue(issue, 'customfield_10062') || 'Customer value delivered',
                problem: getFieldValue(issue, 'customfield_10063') || 'Problem solved',
                solution: getFieldValue(issue, 'customfield_10064') || 'Solution implemented',
                bigPicture: getFieldValue(issue, 'customfield_10065') || 'Strategic value delivered',
                alternatives: getFieldValue(issue, 'customfield_10066') || 'Optimal solution chosen'
            }
        };
    });
}
// Function to fetch completed initiatives from Jira (last 90 days to cover all modal needs)
async function fetchCompletedInitiativesFromJira() {
    try {
        console.log('Fetching completed initiatives from Jira...');
        
        // 90 days ago to cover all modal timeframes
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const formattedDate = ninetyDaysAgo.toISOString().split('T')[0];
        
        const response = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/rest/api/3/search/jql',
                method: 'POST',
                    // SIMPLIFIED: Just check if completion date exists (not empty)
                    jql: `project IN (STRAT, EMRG, KTLO) AND issuetype = Epic AND resolved >= -90d ORDER BY resolved DESC`,
                    fields: [
                        "summary", "project", "resolved", "key",
                        "customfield_10051", // initiative type
                        "customfield_10124", // completion date
                        "customfield_10059", // outcome
                        "customfield_10060", // measures  
                        "customfield_10062", // customer
                        "customfield_10063", // problem
                        "customfield_10064", // solution
                        "customfield_10065", // big picture
                        "customfield_10066"  // alternatives
                    ],
                    maxResults: 100
            })
        });

        if (!response.ok) {
            console.error(`Jira API error: ${response.status}`);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return [];
        }

        const data = await response.json();
        console.log(`Found ${data.total || 0} completed initiatives from Jira`);
        console.log('Sample completed initiative:', data.issues?.[0]);
        
        return data.issues || [];
        
    } catch (error) {
        console.error('Error fetching completed initiatives from Jira:', error);
        return [];
    }
}

// Function to get completed initiatives within date range
function getCompletedInitiativesInDays(completedInitiatives, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return completedInitiatives.filter(init => {
        if (!init.completedDate) return false;
        
        const completedDate = new Date(init.completedDate);
        const isValid = !isNaN(completedDate.getTime());
        const isAfterCutoff = completedDate >= cutoffDate;
        
        // Debug logging (remove after fixing)
        console.log(`Filtering ${init.title}: date=${init.completedDate}, parsed=${completedDate}, valid=${isValid}, afterCutoff=${isAfterCutoff}`);
        
        return isValid && isAfterCutoff;
    });
}
// REPLACE your getTypeBreakdown() function with this:

function getTypeBreakdown(initiatives) {
    const breakdown = {
        strategic: { count: 0, color: 'var(--accent-blue)' },
        emergent: { count: 0, color: 'var(--accent-orange)' },
        ktlo: { count: 0, color: 'var(--accent-purple)' }  // Make sure this exists
    };
    
    initiatives.forEach(init => {
        // Debug logging to see what types we're getting
        console.log(`Initiative: ${init.title}, Type: "${init.type}"`);
        
        if (breakdown[init.type]) {
            breakdown[init.type].count++;
        } else {
            console.warn(`Unknown type: "${init.type}" for initiative: ${init.title}`);
        }
    });
    
    console.log('Final breakdown:', breakdown);
    return breakdown;
}

// Update Recently Completed Card
function updateRecentlyCompletedCard() {
    console.log('=== UPDATE RECENTLY COMPLETED CARD DEBUG ===');
    const content = document.getElementById('completed-content');
    
    if (!content) {
        console.log('❌ completed-content element not found');
        return;
    }
    
    console.log('✅ Content element found');
    
    // Get completed initiatives - use empty array if undefined
    const completedInitiatives = boardData.recentlyCompleted || [];
    
    
    // ADD THIS DEBUG BLOCK RIGHT HERE:
console.log('=== CARD VS MODAL DEBUG ===');
console.log('Card sees boardData.recentlyCompleted:', completedInitiatives.length);
console.log('Card data:', completedInitiatives.map(init => ({title: init.title, type: init.type, date: init.completedDate})));
    
    console.log('Raw completed initiatives:', completedInitiatives.length);
    
    // If no data, show 0 and return
    if (completedInitiatives.length === 0) {
        console.log('No completed initiatives found, showing 0');
        content.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center kpi-gauge-card" 
                 onclick="showRecentlyCompletedModal()" style="cursor: pointer;">
                <div class="text-4xl font-bold mb-2" style="color: var(--accent-green);">0</div>
                <div class="text-sm font-medium mb-1" style="color: var(--text-primary);">Initiatives Completed</div>
                <div class="text-xs" style="color: var(--text-secondary);">in Last 60 Days</div>
                <div class="mt-3 pt-3 border-t border-gray-700 w-full text-xs" style="color: var(--text-secondary);">
                    No initiatives completed
                </div>
            </div>
        `;
        return;
    }
    
    console.log('Sample completed initiative:', completedInitiatives[0]);
    
    // Use same functions as modal
const last60Days = getCompletedInitiativesInDays(completedInitiatives, 60);
const breakdown60 = getTypeBreakdown(last60Days);

console.log('60-day filtered result:', last60Days.length);
console.log('Type counts:', breakdown60);
    
    console.log('Type counts:', breakdown60);
    
   // Use same function as modal  
const generateBreakdownText = (breakdown) => {
    return Object.entries(breakdown)
        .filter(([type, data]) => data.count > 0)
        .map(([type, data]) => `<span style="color: ${data.color};">${data.count} ${type.charAt(0).toUpperCase() + type.slice(1)}</span>`)
        .join(' • ');
};

const breakdownText = generateBreakdownText(breakdown60);
    
    // Update the card HTML
    content.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center kpi-gauge-card" 
             onclick="showRecentlyCompletedModal()" style="cursor: pointer;">
            <div class="text-4xl font-bold mb-2" style="color: var(--accent-green);">${last60Days.length}</div>
            <div class="text-sm font-medium mb-1" style="color: var(--text-primary);">Initiatives Completed</div>
            <div class="text-xs" style="color: var(--text-secondary);">in Last 60 Days</div>
            <div class="mt-3 pt-3 border-t border-gray-700 w-full text-xs" style="color: var(--text-secondary);">
                ${breakdownText || 'No type breakdown available'}
            </div>
        </div>
    `;
    
    console.log('✅ Card HTML updated');
}

// Show Recently Completed Modal
function showRecentlyCompletedModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    const completedInitiatives = boardData.recentlyCompleted || [];
    
    // Add this debug block here:
console.log('Modal completed initiatives:', completedInitiatives.length);
completedInitiatives.forEach(init => {
    console.log(`${init.title}: type="${init.type}"`);
});

    
    // Get initiatives for different time periods
    const last30Days = getCompletedInitiativesInDays(completedInitiatives, 30);
    const last60Days = getCompletedInitiativesInDays(completedInitiatives, 60);
    const last90Days = getCompletedInitiativesInDays(completedInitiatives, 90);
    
    const breakdown30 = getTypeBreakdown(last30Days);
    const breakdown60 = getTypeBreakdown(last60Days);
    const breakdown90 = getTypeBreakdown(last90Days);
    
    // Function to format date nicely
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };
    
    // Function to generate breakdown text
    const generateBreakdownText = (breakdown) => {
        return Object.entries(breakdown)
            .filter(([type, data]) => data.count > 0)
            .map(([type, data]) => `<span style="color: ${data.color};">${data.count} ${type.charAt(0).toUpperCase() + type.slice(1)}</span>`)
            .join(' • ');
    };
    
    title.textContent = 'Recently Completed Initiatives';
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Time Period Cards -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 rounded-lg" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);">
                    <div class="text-2xl font-bold mb-2" style="color: var(--accent-green);">${last30Days.length}</div>
                    <div class="text-sm font-medium mb-1" style="color: var(--text-primary);">Last 30 Days</div>
                    <div class="text-xs" style="color: var(--text-secondary);">${generateBreakdownText(breakdown30)}</div>
                </div>
                <div class="text-center p-4 rounded-lg" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);">
                    <div class="text-2xl font-bold mb-2" style="color: var(--accent-green);">${last60Days.length}</div>
                    <div class="text-sm font-medium mb-1" style="color: var(--text-primary);">Last 60 Days</div>
                    <div class="text-xs" style="color: var(--text-secondary);">${generateBreakdownText(breakdown60)}</div>
                </div>
                <div class="text-center p-4 rounded-lg" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);">
                    <div class="text-2xl font-bold mb-2" style="color: var(--accent-green);">${last90Days.length}</div>
                    <div class="text-sm font-medium mb-1" style="color: var(--text-primary);">Last 90 Days</div>
                    <div class="text-xs" style="color: var(--text-secondary);">${generateBreakdownText(breakdown90)}</div>
                </div>
            </div>
            
            <!-- Initiatives List -->
            ${last90Days.length > 0 ? `
                <div style="background: rgba(15, 15, 35, 0.6); border: 1px solid rgba(99, 102, 241, 0.2);" class="rounded-lg p-4">
                    <h4 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-green);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <path d="m9 11 3 3L22 4"/>
                        </svg>
                        Completed Initiatives (${last90Days.length}) - Most Recent First
                    </h4>
                    <div class="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                        ${last90Days.map(init => `
                            <div class="bento-pipeline-item" 
                                 onclick="showInitiativeModal(boardData.recentlyCompleted.find(init => init.id === ${init.id}))"
                                 style="position: relative; cursor: pointer; border-left: 3px solid var(--accent-green);">
                                <div class="bento-pipeline-item-header">
                                    <div class="bento-pipeline-item-title">
                                        ${init.title}
                                        <span class="bento-type-badge bento-type-${init.type}">${init.type.toUpperCase()}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs px-2 py-1 rounded" style="background: var(--accent-green); color: white;">
                                            ${formatDate(init.completedDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="text-center py-8">
                    <div class="text-lg" style="color: var(--text-secondary);">No completed initiatives found in the last 90 days</div>
                </div>
            `}
        </div>
    `;
    
    modal.classList.add('show');
}

function debugCompletedData() {
    console.log('=== COMPLETED INITIATIVES DEBUG ===');
    const completedInitiatives = boardData.recentlyCompleted || [];
    console.log('Total completed initiatives:', completedInitiatives.length);
    console.log('All completed initiatives:', completedInitiatives);
    
    if (completedInitiatives.length > 0) {
        const last30Days = getCompletedInitiativesInDays(completedInitiatives, 30);
        const last60Days = getCompletedInitiativesInDays(completedInitiatives, 60);
        const last90Days = getCompletedInitiativesInDays(completedInitiatives, 90);
        
        console.log('Last 30 days:', last30Days.length);
        console.log('Last 60 days:', last60Days.length); 
        console.log('Last 90 days:', last90Days.length);
        
        // Check if completion dates are valid
        completedInitiatives.forEach((init, index) => {
            if (index < 5) { // Only log first 5
                const completedDate = new Date(init.completedDate);
                const now = new Date();
                const daysAgo = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
                
                console.log(`Initiative ${index}:`, {
                    title: init.title,
                    completedDate: init.completedDate,
                    parsedDate: completedDate,
                    daysAgo: daysAgo,
                    isValid: !isNaN(completedDate.getTime())
                });
            }
        });
    }
    
    return {
        total: completedInitiatives.length,
        last30: completedInitiatives.length > 0 ? getCompletedInitiativesInDays(completedInitiatives, 30).length : 0,
        last60: completedInitiatives.length > 0 ? getCompletedInitiativesInDays(completedInitiatives, 60).length : 0,
        last90: completedInitiatives.length > 0 ? getCompletedInitiativesInDays(completedInitiatives, 90).length : 0
    };
}



function updateValidationCard() {
    const content = document.getElementById('validation-pipeline-content');
    
    // Get live validation counts from Jira data
    const validationCounts = getValidationCounts();
    
    content.innerHTML = `
    <div class="h-full flex flex-col items-center justify-center gap-3">
        <!-- In Validation - Top -->
        <div class="validation-metric-card cursor-pointer hover:scale-105 transition-all duration-200" onclick="showInValidationModal()">
            <div class="kpi-current-value" style="color: #f59e0b;">${validationCounts.active.inValidation}</div>
            <div class="text-xs font-medium text-center" style="color: var(--text-secondary);">Active Initiatives<br>In Validation</div>
        </div>
        
        <!-- Not Validated - Bottom -->
        <div class="validation-metric-card cursor-pointer hover:scale-105 transition-all duration-200" onclick="showNotValidatedModal()">
            <div class="kpi-current-value" style="color: #ef4444;">${validationCounts.active.notValidated}</div>
            <div class="text-xs font-medium text-center" style="color: var(--text-secondary);">Active Initiatives<br>Not Validated</div>
        </div>
    </div>
    `;
    
    // Ensure validation card styles are applied
    ensureValidationCardStyles();
}



// Add this CSS to styles.css file
const validationCardStyles = `
/* Validation Metric Cards - Match KPI Gauge Card Styling */
.validation-metric-card {
    background: linear-gradient(145deg, rgba(15, 15, 35, 0.9) 0%, rgba(20, 18, 45, 0.8) 100%);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
    transition: all 0.2s ease;
    position: relative;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.validation-metric-card:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.4);
}

.validation-metric-card .kpi-current-value {
    margin-bottom: 0.25rem;
}
`;




// Function to inject validation card styles if not already present
function ensureValidationCardStyles() {
    if (!document.getElementById('validation-card-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'validation-card-styles';
        styleSheet.textContent = validationCardStyles;
        document.head.appendChild(styleSheet);
    }
}

// Helper function to map validation status from Jira to our format
function mapJiraValidationStatus(jiraValidationValue) {
    if (!jiraValidationValue) return 'not-validated';
    
    // Handle different possible Jira field formats
    let statusValue = jiraValidationValue;
    if (typeof jiraValidationValue === 'object' && jiraValidationValue.value) {
        statusValue = jiraValidationValue.value;
    }
    
    // Map Jira values to our validation states - EXACT matches only
    switch (statusValue) {
        case 'validated':
            return 'validated';
        case 'in-validation':
            return 'in-validation';
        case 'not-validated':
        default:
            return 'not-validated';
    }
}

// Updated "In Validation" modal with High Priority and Regular tabs
function showInValidationModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Get live data - ONLY active initiatives in validation
    const activeInValidation = (boardData.initiatives || []).filter(init => init.validation === 'in-validation');
    const pipelineInValidation = (boardData.bullpen || []).filter(init => init.validation === 'in-validation');
    
    // Sort by priority
    const sortedActiveInitiatives = activeInValidation.sort((a, b) => a.priority - b.priority);
    const sortedPipelineInitiatives = pipelineInValidation.sort((a, b) => a.priority - b.priority);
    
    // Separate high priority (slots 1-20) from regular
    const highPriorityActive = activeInValidation.filter(init => {
        return typeof init.priority === 'number' && init.priority <= 20;
    }).sort((a, b) => a.priority - b.priority);
    
    const regularActive = activeInValidation.filter(init => {
        return typeof init.priority === 'number' && init.priority > 20;
    }).sort((a, b) => a.priority - b.priority);
    
    title.textContent = 'Initiatives In Validation';
    content.innerHTML = 
        '<div class="space-y-6">' +
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>' +
                        '<path d="m9.5 14.5 5-5"/>' +
                    '</svg>' +
                    'Validation Pipeline - ' + (activeInValidation.length + pipelineInValidation.length) + ' Total Initiatives' +
                '</h3>' +
                
                // Status breakdown with live data
                '<div class="grid grid-cols-3 gap-4 mb-6">' +
                    '<div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">' +
                        '<div class="text-2xl font-bold mb-1" style="color: var(--accent-orange);">' + highPriorityActive.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">High Priority</div>' +
                    '</div>' +
                    '<div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">' +
                        '<div class="text-2xl font-bold mb-1" style="color: var(--accent-blue);">' + regularActive.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Regular</div>' +
                    '</div>' +
                    '<div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">' +
                        '<div class="text-2xl font-bold mb-1" style="color: var(--text-secondary);">' + pipelineInValidation.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Pipeline</div>' +
                    '</div>' +
                '</div>' +
                
                // Tab Navigation
                '<div class="mb-4">' +
                    '<div class="flex border-b" style="border-color: var(--border-primary);">' +
                        `<button class="tab-button px-4 py-2 font-medium text-sm transition-all duration-200 ${highPriorityActive.length > 0 ? 'active' : ''}" 
                                onclick="switchValidationTab('high-priority-in-validation')" 
                                id="tab-high-priority-in-validation"
                                style="border-bottom: 2px solid ${highPriorityActive.length > 0 ? 'var(--accent-orange)' : 'transparent'}; color: ${highPriorityActive.length > 0 ? 'var(--accent-orange)' : 'var(--text-secondary)'};">` +
                            `High Priority (${highPriorityActive.length})` +
                        '</button>' +
                        `<button class="tab-button px-4 py-2 font-medium text-sm transition-all duration-200 ${highPriorityActive.length === 0 ? 'active' : ''}" 
                                onclick="switchValidationTab('regular-in-validation')" 
                                id="tab-regular-in-validation"
                                style="border-bottom: 2px solid ${highPriorityActive.length === 0 ? 'var(--accent-blue)' : 'transparent'}; color: ${highPriorityActive.length === 0 ? 'var(--accent-blue)' : 'var(--text-secondary)'};">` +
                            `Regular (${regularActive.length})` +
                        '</button>' +
                        `<button class="tab-button px-4 py-2 font-medium text-sm transition-all duration-200" 
                                onclick="switchValidationTab('pipeline-in-validation')" 
                                id="tab-pipeline-in-validation"
                                style="border-bottom: 2px solid transparent; color: var(--text-secondary);">` +
                            `Pipeline (${pipelineInValidation.length})` +
                        '</button>' +
                    '</div>' +
                '</div>' +
                
                // Tab Content Container
                '<div id="validation-tab-content">' +
                    // High Priority Tab Content
                    `<div id="high-priority-in-validation" class="tab-content ${highPriorityActive.length > 0 ? '' : 'hidden'}">` +
                        (highPriorityActive.length > 0 ? 
                            '<div class="mb-4 p-3 rounded-lg" style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--accent-orange);">' +
                                '<div class="flex items-center gap-2 mb-2">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2">' +
                                        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>' +
                                        '<path d="M12 9v4"/><path d="m12 17 .01 0"/>' +
                                    '</svg>' +
                                    '<span class="font-medium" style="color: var(--accent-orange);">High Priority Alert</span>' +
                                '</div>' +
                                '<div class="text-sm" style="color: var(--text-primary);">These initiatives need validation completion to maintain priority status.</div>' +
                            '</div>' +
                            '<div class="max-h-80 overflow-y-auto pr-2 space-y-2" style="scrollbar-width: thin; scrollbar-color: var(--accent-orange) var(--bg-quaternary);">' +
                                highPriorityActive.map(init => createValidationListItem(init, 'HIGH PRIORITY', 'var(--accent-orange)')).join('') +
                            '</div>' :
                            '<div class="text-center py-8" style="color: var(--text-secondary);">' +
                                '<div class="text-lg mb-2">No High Priority Initiatives</div>' +
                                '<div class="text-sm">All high priority slots are validated or empty.</div>' +
                            '</div>'
                        ) +
                    '</div>' +
                    
                    // Regular Tab Content
                    `<div id="regular-in-validation" class="tab-content ${highPriorityActive.length === 0 ? '' : 'hidden'}">` +
                        (regularActive.length > 0 ? 
                            '<div class="max-h-80 overflow-y-auto pr-2 space-y-2" style="scrollbar-width: thin; scrollbar-color: var(--accent-blue) var(--bg-quaternary);">' +
                                regularActive.map(init => createValidationListItem(init, `Slot ${init.priority}`, 'var(--accent-blue)')).join('') +
                            '</div>' :
                            '<div class="text-center py-8" style="color: var(--text-secondary);">' +
                                '<div class="text-lg mb-2">No Regular Initiatives</div>' +
                                '<div class="text-sm">All regular priority initiatives are validated.</div>' +
                            '</div>'
                        ) +
                    '</div>' +
                    
                    // Pipeline Tab Content
                    '<div id="pipeline-in-validation" class="tab-content hidden">' +
                        (pipelineInValidation.length > 0 ? 
                            '<div class="max-h-80 overflow-y-auto pr-2 space-y-2" style="scrollbar-width: thin; scrollbar-color: var(--text-secondary) var(--bg-quaternary);">' +
                                sortedPipelineInitiatives.map(init => createValidationListItem(init, 'PIPELINE', 'var(--text-secondary)', true)).join('') +
                            '</div>' :
                            '<div class="text-center py-8" style="color: var(--text-secondary);">' +
                                '<div class="text-lg mb-2">No Pipeline Initiatives</div>' +
                                '<div class="text-sm">Pipeline is clear of in-validation items.</div>' +
                            '</div>'
                        ) +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
   
    modal.classList.add('show');
    ensureTabStyles();
}

// Updated "Not Validated" modal with Urgent and Regular tabs
function showNotValidatedModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Get live data - ONLY initiatives not validated
    const activeNotValidated = (boardData.initiatives || []).filter(init => init.validation === 'not-validated');
    const pipelineNotValidated = (boardData.bullpen || []).filter(init => init.validation === 'not-validated');
    
    // Separate urgent (slots 1-20) from regular
    const urgentActive = activeNotValidated.filter(init => {
        return typeof init.priority === 'number' && init.priority <= 20;
    }).sort((a, b) => a.priority - b.priority);
    
    const regularActive = activeNotValidated.filter(init => {
        return typeof init.priority === 'number' && init.priority > 20;
    }).sort((a, b) => a.priority - b.priority);
    
    const sortedPipelineInitiatives = pipelineNotValidated.sort((a, b) => a.priority - b.priority);
    
    title.textContent = 'Not Validated Initiatives';
    content.innerHTML = 
        '<div class="space-y-6">' +
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>' +
                        '<path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/>' +
                    '</svg>' +
                    'Validation Required - ' + (activeNotValidated.length + pipelineNotValidated.length) + ' Total Initiatives' +
                '</h3>' +
                
                // Status breakdown with live data
                '<div class="grid grid-cols-3 gap-4 mb-6">' +
                    '<div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">' +
                        '<div class="text-2xl font-bold mb-1" style="color: var(--accent-red);">' + urgentActive.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Urgent</div>' +
                    '</div>' +
                    '<div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">' +
                        '<div class="text-2xl font-bold mb-1" style="color: var(--accent-blue);">' + regularActive.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Regular</div>' +
                    '</div>' +
                    '<div class="text-center p-4 rounded-lg" style="background: var(--bg-tertiary);">' +
                        '<div class="text-2xl font-bold mb-1" style="color: var(--text-secondary);">' + pipelineNotValidated.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Pipeline</div>' +
                    '</div>' +
                '</div>' +
                
                // Tab Navigation
                '<div class="mb-4">' +
                    '<div class="flex border-b" style="border-color: var(--border-primary);">' +
                        `<button class="tab-button px-4 py-2 font-medium text-sm transition-all duration-200 ${urgentActive.length > 0 ? 'active' : ''}" 
                                onclick="switchValidationTab('urgent-not-validated')" 
                                id="tab-urgent-not-validated"
                                style="border-bottom: 2px solid ${urgentActive.length > 0 ? 'var(--accent-red)' : 'transparent'}; color: ${urgentActive.length > 0 ? 'var(--accent-red)' : 'var(--text-secondary)'};">` +
                            `Urgent (${urgentActive.length})` +
                        '</button>' +
                        `<button class="tab-button px-4 py-2 font-medium text-sm transition-all duration-200 ${urgentActive.length === 0 ? 'active' : ''}" 
                                onclick="switchValidationTab('regular-not-validated')" 
                                id="tab-regular-not-validated"
                                style="border-bottom: 2px solid ${urgentActive.length === 0 ? 'var(--accent-blue)' : 'transparent'}; color: ${urgentActive.length === 0 ? 'var(--accent-blue)' : 'var(--text-secondary)'};">` +
                            `Regular (${regularActive.length})` +
                        '</button>' +
                        `<button class="tab-button px-4 py-2 font-medium text-sm transition-all duration-200" 
                                onclick="switchValidationTab('pipeline-not-validated')" 
                                id="tab-pipeline-not-validated"
                                style="border-bottom: 2px solid transparent; color: var(--text-secondary);">` +
                            `Pipeline (${pipelineNotValidated.length})` +
                        '</button>' +
                    '</div>' +
                '</div>' +
                
                // Tab Content Container
                '<div id="validation-tab-content">' +
                    // Urgent Tab Content
                    `<div id="urgent-not-validated" class="tab-content ${urgentActive.length > 0 ? '' : 'hidden'}">` +
                        (urgentActive.length > 0 ? 
                            '<div class="mb-4 p-3 rounded-lg" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red);">' +
                                '<div class="flex items-center gap-2 mb-2">' +
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2">' +
                                        '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="m12 16 .01 0"/>' +
                                    '</svg>' +
                                    '<span class="font-medium" style="color: var(--accent-red);">Urgent Validation Required</span>' +
                                '</div>' +
                                '<div class="text-sm" style="color: var(--text-primary);">These initiatives need immediate validation to proceed.</div>' +
                            '</div>' +
                            '<div class="max-h-80 overflow-y-auto pr-2 space-y-2" style="scrollbar-width: thin; scrollbar-color: var(--accent-red) var(--bg-quaternary);">' +
                                urgentActive.map(init => createValidationListItem(init, 'URGENT', 'var(--accent-red)')).join('') +
                            '</div>' :
                            '<div class="text-center py-8" style="color: var(--text-secondary);">' +
                                '<div class="text-lg mb-2">No Urgent Initiatives</div>' +
                                '<div class="text-sm">All high priority slots are validated.</div>' +
                            '</div>'
                        ) +
                    '</div>' +
                    
                    // Regular Tab Content
                    `<div id="regular-not-validated" class="tab-content ${urgentActive.length === 0 ? '' : 'hidden'}">` +
                        (regularActive.length > 0 ? 
                            '<div class="max-h-80 overflow-y-auto pr-2 space-y-2" style="scrollbar-width: thin; scrollbar-color: var(--accent-blue) var(--bg-quaternary);">' +
                                regularActive.map(init => createValidationListItem(init, `Slot ${init.priority}`, 'var(--accent-blue)')).join('') +
                            '</div>' :
                            '<div class="text-center py-8" style="color: var(--text-secondary);">' +
                                '<div class="text-lg mb-2">No Regular Initiatives</div>' +
                                '<div class="text-sm">All regular priority initiatives are validated.</div>' +
                            '</div>'
                        ) +
                    '</div>' +
                    
                    // Pipeline Tab Content
                    '<div id="pipeline-not-validated" class="tab-content hidden">' +
                        (pipelineNotValidated.length > 0 ? 
                            '<div class="max-h-80 overflow-y-auto pr-2 space-y-2" style="scrollbar-width: thin; scrollbar-color: var(--text-secondary) var(--bg-quaternary);">' +
                                sortedPipelineInitiatives.map(init => createValidationListItem(init, 'PIPELINE', 'var(--text-secondary)', true)).join('') +
                            '</div>' :
                            '<div class="text-center py-8" style="color: var(--text-secondary);">' +
                                '<div class="text-lg mb-2">No Pipeline Initiatives</div>' +
                                '<div class="text-sm">Pipeline is clear of non-validated items.</div>' +
                            '</div>'
                        ) +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
   
    modal.classList.add('show');
    ensureTabStyles();
}

// Helper function to create consistent list items
function createValidationListItem(init, badgeText, badgeColor, isPipeline = false) {
    return `
        <div class="p-3 rounded-lg border cursor-pointer hover:bg-opacity-80 hover:scale-[1.02] transition-all duration-200" 
             style="background: ${isPipeline ? 'var(--bg-quaternary)' : 'var(--bg-tertiary)'}; border-color: var(--border-primary);"
             onclick="closeModal(); showInitiativeDetail(${init.id});">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium" style="color: var(--text-primary);">${init.title}</span>
                        <span class="text-xs px-2 py-1 rounded" style="background: var(--accent-${init.type === 'strategic' ? 'blue' : init.type === 'ktlo' ? 'green' : 'purple'}); color: white;">${init.type.toUpperCase()}</span>
                    </div>
                    <div class="text-sm" style="color: var(--text-secondary);">${init.teams.join(', ')}</div>
                    <div class="text-xs mt-1" style="color: var(--text-secondary);">Jira Key: ${init.jira?.key || 'N/A'}</div>
                </div>
                <div class="text-right">
                    <span class="text-xs px-2 py-1 rounded" style="background: ${badgeColor}; color: white;">${badgeText}</span>
                </div>
            </div>
        </div>
    `;
}

// Tab switching function
function switchValidationTab(tabId) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active state from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.style.borderBottomColor = 'transparent';
        button.style.color = 'var(--text-secondary)';
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Update active tab appearance
    const activeTabButton = document.getElementById('tab-' + tabId);
    if (activeTabButton) {
        let color = 'var(--accent-blue)'; // default
        if (tabId.includes('urgent') || tabId.includes('high-priority')) {
            color = tabId.includes('not-validated') ? 'var(--accent-red)' : 'var(--accent-orange)';
        }
        activeTabButton.style.borderBottomColor = color;
        activeTabButton.style.color = color;
    }
}

// Ensure tab styles are available
function ensureTabStyles() {
    if (!document.getElementById('validation-tab-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'validation-tab-styles';
        styleSheet.textContent = `
            /* Tab button hover effects */
            .tab-button:hover {
                background-color: rgba(255, 255, 255, 0.05);
                cursor: pointer;
            }
            
            /* Custom scrollbar styles for tabs */
            .tab-content .max-h-80::-webkit-scrollbar {
                width: 6px;
            }
            
            .tab-content .max-h-80::-webkit-scrollbar-track {
                background: var(--bg-quaternary);
                border-radius: 3px;
            }
            
            .tab-content .max-h-80::-webkit-scrollbar-thumb {
                background: var(--accent-blue);
                border-radius: 3px;
            }
            
            .tab-content .max-h-80::-webkit-scrollbar-thumb:hover {
                background: var(--accent-blue-hover, #4c7ce5);
            }
            
            /* Hide scrollbar for Firefox */
            .tab-content {
                scrollbar-width: thin;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// FIXED: Remove all DOM-based center text and rely ONLY on Chart.js plugin

function updateMendozaCard() {
    const card = document.querySelector('.mendoza-card');
    if (!card) return;
    
    const content = card.querySelector('.bento-card-content');
    if (!content) return;
    
    // Get the metrics ONCE
    const resourceMetrics = calculateResourceAllocation();
    
    // Store it globally so everything can access the SAME value
    window.currentMendozaMetrics = resourceMetrics;
    
    console.log('STORED METRICS:', resourceMetrics.efficiencyScore + '%');
    
    content.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center kpi-gauge-card" id="mendoza-clickable" onclick="showMendozaAnalysisModal()">
            <div class="text-sm font-bold mb-2" style="color: var(--text-secondary);">Resource Efficiency</div>
            
            <!-- Radial Progress Chart -->
            <div class="relative mb-3" style="width: 120px; height: 120px;">
                <svg width="120" height="120" viewBox="0 0 120 120" class="radial-progress">
                    <!-- Background circle -->
                    <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        fill="none" 
                        stroke="rgba(59, 130, 246, 0.2)" 
                        stroke-width="8"
                    />
                    <!-- Progress circle -->
                    <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        fill="none" 
                        stroke="${resourceMetrics.efficiencyColor === 'var(--accent-green)' ? '#10b981' : 
                                resourceMetrics.efficiencyColor === 'var(--accent-orange)' ? '#f59e0b' : '#ef4444'}" 
                        stroke-width="8" 
                        stroke-linecap="round"
                        stroke-dasharray="${2 * Math.PI * 50}"
                        stroke-dashoffset="${2 * Math.PI * 50 * (1 - resourceMetrics.efficiencyScore / 100)}"
                        transform="rotate(-90 60 60)"
                        class="progress-ring"
                    />
                    
                    <!-- Center Text -->
                    <text 
                        x="60" 
                        y="65" 
                        text-anchor="middle" 
                        dominant-baseline="middle" 
                        fill="${resourceMetrics.efficiencyColor === 'var(--accent-green)' ? '#10b981' : 
                               resourceMetrics.efficiencyColor === 'var(--accent-orange)' ? '#f59e0b' : '#ef4444'}" 
                        font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                        font-size="32" 
                        font-weight="bold"
                    >
                        ${resourceMetrics.efficiencyScore}%
                    </text>
                    
                   
                </svg>
            </div>
        </div>
    `;
    
    // Add CSS animation for the radial progress
    if (!document.getElementById('radial-progress-styles')) {
        const style = document.createElement('style');
        style.id = 'radial-progress-styles';
        style.textContent = `
            .progress-ring {
                transition: stroke-dashoffset 1s ease-in-out;
            }
            
            .radial-progress:hover .progress-ring {
                stroke-width: 10;
                transition: stroke-width 0.3s ease;
            }
            
            .kpi-gauge-card:hover {
                transform: translateY(-2px);
                transition: transform 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

// Helper function to classify activities  
function getActivityClassification(activity, activityClassification) {
    for (const [type, config] of Object.entries(activityClassification)) {
        if (config.activities.includes(activity.toLowerCase())) {
            return { type, ...config };
        }
    }
    // Default to neutral if not found
    return { type: 'neutral', ...activityClassification.neutral };
}

function getInitiativeActivityType(initiative) {
    console.log('Getting activity type for:', initiative.title);
    console.log('- initiative.jira?.activityType:', initiative.jira?.activityType);
    console.log('- initiative.activityType:', initiative.activityType);
    
    // Extract activity type from Jira data (customfield_10190)
    if (initiative.jira?.activityType) {
        console.log('- Using jira.activityType:', initiative.jira.activityType);
        return initiative.jira.activityType;
    }
    
    if (initiative.activityType) {
        console.log('- Using activityType:', initiative.activityType);
        return initiative.activityType;
    }
    
    // Fallback logic
    let fallback = 'development';
    if (initiative.validation === 'not-validated') {
        fallback = 'validation';
    } else if (initiative.validation === 'in-validation') {
        fallback = 'prototyping';
    } else if (initiative.type === 'ktlo') {
        fallback = 'support';
    }
    
    console.log('- Using fallback:', fallback);
    return fallback;
}

let mendozaChart = null;

function initializeMendozaChart(metrics) {
    // This function is no longer needed since we're using SVG radial progress
    console.log('Using radial progress instead of Chart.js - no initialization needed');
}



function getTeamsWorkingOnlyOnHighPriority() {
    // Mock data - replace with actual logic
    return ['Core Platform', 'User Experience', 'Security'];
}

function getTeamsWorkingOnlyOnLowPriority() {
    // Mock data - replace with actual logic  
    return ['Legal Tech', 'Risk Management', 'Actuarial', 'Procurement', 'Finance', 'Content', 'Business Operations', 'Process Engineering', 'Claims Operations'];
}

function getTeamsWorkingOnMixed() {
    // Mock data - replace with actual logic
    return ['Data Engineering', 'Analytics', 'Site Reliability', 'Product Management', 'Customer Support', 'Machine Learning', 'Payments', 'Mobile Development', 'Compliance', 'Product Marketing', 'Accessibility', 'Partner Engineering', 'Migration Team', 'Business Continuity', 'Developer Relations'];
}
        
//Calculation and Analysis Functions

function calculateOKRAlignment() {
    // Only consider initiatives actively on the board (exclude pipeline)
    const activeBoardInitiatives = boardData.initiatives.filter(init => init.priority !== "pipeline");
    
    if (activeBoardInitiatives.length === 0) {
        return 100; // If no active initiatives, show 100%
    }
    
    const alignedCount = activeBoardInitiatives.filter(init => isAlignedWithOKRs(init)).length;
    return Math.round((alignedCount / activeBoardInitiatives.length) * 100);
}

// Updated calculateOKRProgress function to use live data
async function calculateOKRProgress() {
    // Use live data if available, otherwise fall back to current hardcoded data
    if (liveKeyResultsData && liveKeyResultsData.length > 0) {
    console.log(`Using ${liveKeyResultsData.length} live Key Results`);
    // Add this debug logging:
    liveKeyResultsData.forEach((kr, index) => {
        console.log(`KR ${index}: ${kr.title}`);
        console.log(`  trendPoints:`, kr.trendPoints);
        console.log(`  trendPoints type:`, typeof kr.trendPoints);
    });
    return liveKeyResultsData;
}
    
    console.log('Using fallback hardcoded data for Key Results');
    
    // Fallback to current hardcoded data structure (for compatibility)
    const userEngagementInits = boardData.initiatives.filter(init => 
        init.canvas && (
            init.canvas.outcome.toLowerCase().includes('user') ||
            init.canvas.outcome.toLowerCase().includes('engagement') ||
            init.canvas.outcome.toLowerCase().includes('onboarding') ||
            init.title.toLowerCase().includes('mobile') ||
            init.title.toLowerCase().includes('experience')
        )
    );
    const mauProgress = Math.min(userEngagementInits.reduce((sum, init) => sum + init.progress, 0) / userEngagementInits.length, 100);
    const mauCurrent = 35;
    
    const reliabilityInits = boardData.initiatives.filter(init => 
        init.canvas && (
            init.canvas.outcome.toLowerCase().includes('uptime') ||
            init.canvas.outcome.toLowerCase().includes('stability') ||
            init.canvas.outcome.toLowerCase().includes('performance') ||
            init.title.toLowerCase().includes('infrastructure') ||
            init.title.toLowerCase().includes('monitoring')
        )
    );
    const uptimeProgress = Math.min(reliabilityInits.reduce((sum, init) => sum + init.progress, 0) / reliabilityInits.length, 100);
    const uptimeCurrent = 94.2;
    
    const strategicInits = boardData.initiatives.filter(init => 
        init.type === 'strategic' && init.priority !== 'pipeline'
    );
    const capabilitiesProgress = Math.min(strategicInits.reduce((sum, init) => sum + init.progress, 0) / strategicInits.length, 100);
    const capabilitiesCurrent = 2;
    
    return [
        {
            title: "Monthly Active Users",
            currentValue: mauCurrent,
            targetValue: 42,
            unit: '%',
            progress: mauProgress,
            krType: 'Growth',
            badgeColor: 'var(--accent-green)',
            color: mauProgress >= 80 ? 'var(--accent-green)' : mauProgress >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)',
            trendPoints: generateFallbackSparkline(mauCurrent, 30)
        },
        {
            title: "System Uptime", 
            currentValue: uptimeCurrent,
            targetValue: 99.5,
            unit: '%',
            progress: uptimeProgress,
            krType: 'Operations',
            badgeColor: 'var(--accent-orange)',
            color: uptimeProgress >= 80 ? 'var(--accent-green)' : uptimeProgress >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)',
            trendPoints: generateFallbackSparkline(uptimeCurrent, 30)
        },
        {
            title: "Strategic Capabilities",
            currentValue: capabilitiesCurrent,
            targetValue: 4,
            unit: '',
            progress: capabilitiesProgress,
            krType: 'Innovation',
            badgeColor: 'var(--accent-blue)',
            color: capabilitiesProgress >= 80 ? 'var(--accent-green)' : capabilitiesProgress >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)',
            trendPoints: generateFallbackSparkline(capabilitiesCurrent, 10)
        }
    ];
}
      


// Updated function to get team health counts for dashboard
function getTeamHealthCounts() {
    const teams = Object.values(boardData.teams);
    
    return {
        healthy: teams.filter(team => {
            const atRiskCount = [team.capacity, team.skillset, team.vision, team.support, team.teamwork, team.autonomy]
                .filter(status => status === 'at-risk').length;
            return atRiskCount === 0;
        }).length,
        
        lowRisk: teams.filter(team => {
            const atRiskCount = [team.capacity, team.skillset, team.vision, team.support, team.teamwork, team.autonomy]
                .filter(status => status === 'at-risk').length;
            return atRiskCount >= 1 && atRiskCount <= 2;
        }).length,
        
        highRisk: teams.filter(team => {
            const atRiskCount = [team.capacity, team.skillset, team.vision, team.support, team.teamwork, team.autonomy]
                .filter(status => status === 'at-risk').length;
            return atRiskCount >= 3 && atRiskCount <= 4;
        }).length,
        
        critical: teams.filter(team => {
            const atRiskCount = [team.capacity, team.skillset, team.vision, team.support, team.teamwork, team.autonomy]
                .filter(status => status === 'at-risk').length;
            return atRiskCount >= 5;
        }).length
    };
}

// Updated function to check for at-risk teams in initiatives
function getTopAtRiskInitiatives() {
    return Object.values(boardData.initiatives)
        .filter(init => {
            if (init.priority === "bullpen") return false;
            const row = getRowColFromSlot(init.priority).row;
            return row <= 5 && init.teams.some(teamName => {
                const team = boardData.teams[teamName];
                if (!team) return false;
                
                // Check if team has any At Risk OR Critical dimensions
                return isDimensionAtRisk(team.capacity) ||
                       isDimensionAtRisk(team.skillset) ||
                       isDimensionAtRisk(team.vision) ||
                       isDimensionAtRisk(team.support) ||
                       isDimensionAtRisk(team.teamwork) ||
                       isDimensionAtRisk(team.autonomy);
            });
        })
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3);
}

function calculateResourceAlerts() {
    const teamWorkloads = {};
    Object.keys(boardData.teams).forEach(teamName => {
        teamWorkloads[teamName] = 0;
    });
    
    boardData.initiatives.forEach(init => {
        init.teams.forEach(teamName => {
            if (teamWorkloads[teamName] !== undefined) {
                teamWorkloads[teamName]++;
            }
        });
    });
    
    const overloadedTeams = Object.values(teamWorkloads).filter(count => count >= 4).length;
    const avgTeamsPerInit = Math.round((boardData.initiatives.reduce((sum, init) => sum + init.teams.length, 0) / boardData.initiatives.length) * 10) / 10;
    
    return { overloadedTeams, avgTeamsPerInit };
}

function calculateVelocityTrend() {
    // Simplified trend calculation - in real implementation, you'd compare with historical data
    const avgVelocity = Object.values(boardData.teams).reduce((sum, team) => sum + team.jira.velocity, 0) / Object.keys(boardData.teams).length;
    
    if (avgVelocity > 15) return { arrow: '↗️', trend: 'up' };
    if (avgVelocity < 10) return { arrow: '↘️', trend: 'down' };
    return { arrow: '➡️', trend: 'stable' };
}

// Updated validation helper function to work with live data
function getValidationCounts() {
    const activeInitiatives = boardData.initiatives || [];
    const pipelineInitiatives = boardData.bullpen || [];
    const allInitiatives = [...activeInitiatives, ...pipelineInitiatives];
    
    return {
        notValidated: allInitiatives.filter(init => init.validation === 'not-validated').length,
        inValidation: allInitiatives.filter(init => init.validation === 'in-validation').length,
        validated: allInitiatives.filter(init => init.validation === 'validated').length,
        // Separate counts for active vs pipeline
        active: {
            notValidated: activeInitiatives.filter(init => init.validation === 'not-validated').length,
            inValidation: activeInitiatives.filter(init => init.validation === 'in-validation').length,
            validated: activeInitiatives.filter(init => init.validation === 'validated').length
        },
        pipeline: {
            notValidated: pipelineInitiatives.filter(init => init.validation === 'not-validated').length,
            inValidation: pipelineInitiatives.filter(init => init.validation === 'in-validation').length,
            validated: pipelineInitiatives.filter(init => init.validation === 'validated').length
        }
    };
}

function calculateMendozaImpact() {
    const belowLineInitiatives = boardData.initiatives.filter(init => {
        if (init.priority === "bullpen") return false;
        return getRowColFromSlot(init.priority).row > 5;
    });
    
    return {
        belowLineCount: belowLineInitiatives.length,
        unvalidatedBelowLine: belowLineInitiatives.filter(init => init.validation === 'not-validated').length
    };
}
      
function getBelowLineTeams() {
    const belowLineInitiatives = boardData.initiatives.filter(init => {
        if (init.priority === "bullpen") return false;
        return getRowColFromSlot(init.priority).row > 5;
    });
    
    const uniqueTeamsSet = new Set();
    const teamDetails = [];
    
    belowLineInitiatives.forEach(init => {
        init.teams.forEach(teamName => {
            if (!uniqueTeamsSet.has(teamName)) {
                uniqueTeamsSet.add(teamName);
                teamDetails.push({
                    name: teamName,
                    row: getRowColFromSlot(init.priority).row,
                    initiativeTitle: init.title
                });
            }
        });
    });
    
    return {
        count: uniqueTeamsSet.size,
        teams: teamDetails.sort((a, b) => b.row - a.row)
    };
}

function getBelowLineInitiatives() {
    const belowLine = boardData.initiatives.filter(init => {
        if (init.priority === "bullpen") return false;
        return getRowColFromSlot(init.priority).row > 5;
    });
    
    return {
        count: belowLine.length,
        initiatives: belowLine
    };
}

function calculateDeliveryImpact() {
    // Based on team distribution analysis
    const belowLineTeamCount = getBelowLineTeams().count;
    const totalTeams = Object.keys(boardData.teams).length;
    const impactRatio = belowLineTeamCount / totalTeams;
    
    return {
        slowerDelivery: Math.round(impactRatio * 100), // 40% slower
        fasterIfMoved: Math.round((1 - impactRatio) * 50) // 25% faster potential
    };
}

function calculateCriticalImpactAnalysis() {
    const criticalInitiatives = boardData.initiatives.filter(init => {
        if (init.priority === "bullpen") return false;
        return getRowColFromSlot(init.priority).row <= 2;
    });
    
    const avgCriticalProgress = criticalInitiatives.reduce((sum, init) => sum + init.progress, 0) / criticalInitiatives.length;
    const belowLineTeamCount = getBelowLineTeams().count;
    
    return {
        avgProgress: Math.round(avgCriticalProgress),
        impactPercentage: 40, // Below line work slowing critical initiatives by 40%
        teamsAffected: belowLineTeamCount
    };
}

function getReallocationOpportunities() {
    const belowLineTeams = getBelowLineTeams();
    
    return {
        teamsToMove: belowLineTeams.count, // Use actual count instead of hardcoded
        potentialSpeedup: 25,
        recommendedTargetRows: [1, 2, 3, 4, 5]
    };
}
        
        
        // Enhanced pipeline drag and drop with Jira integration
function enablePipelineDragDrop(item) {
    const initiative = boardData.bullpen.find(init => init && init.id == item.dataset.initiativeId);
    
    if (!initiative) {
        console.log('Initiative not found for drag:', item.dataset.initiativeId);
        return;
    }
    
    item.draggable = true;
    
    item.addEventListener('dragstart', function(e) {
        draggedInitiative = initiative;
        item.classList.add('dragging');
        
        // Pause sync during drag
        if (typeof syncState !== 'undefined') {
            syncState.isPaused = true;
        }
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.outerHTML);
    });

    item.addEventListener('dragend', function() {
        item.classList.remove('dragging');
        
        // Resume sync after brief delay
        setTimeout(() => {
            if (typeof syncState !== 'undefined') {
                syncState.isPaused = false;
            }
        }, 2000);
        
        draggedInitiative = null;
    });
}
      
function calculateFocusScore() {
    const totalTeams = Object.keys(boardData.teams).length;
    const teamsOnHighPriority = boardData.initiatives
        .filter(init => init.priority !== "bullpen" && getRowColFromSlot(init.priority).row <= 5)
        .reduce((teams, init) => {
            init.teams.forEach(team => teams.add(team));
            return teams;
        }, new Set()).size;
    
    return Math.round((teamsOnHighPriority / totalTeams) * 100);
}      
      
      
      
        // Filter Sidebar Functions
function openFilterSidebar() {
    document.getElementById('filter-sidebar').classList.add('filter-sidebar-open');
    document.getElementById('filter-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeFilterSidebar() {
    document.getElementById('filter-sidebar').classList.remove('filter-sidebar-open');
    document.getElementById('filter-overlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function performAdvancedFiltering() {
    clearAllHighlights();
    hideAllElements();
    
    const matchingInitiatives = [];
    const matchingTeams = new Set();
    
    // Check which filter types are active
    const hasPortfolioFilters = searchState.filters.initiativeTypes.length > 0 || 
                               searchState.filters.validationStatus.length > 0 || 
                               searchState.filters.priorityRange.length > 0 ||
                               (searchState.filters.progressRange && (searchState.filters.progressRange.min > 0 || searchState.filters.progressRange.max < 100));
    
    const hasTeamFilters = searchState.filters.teamFilters.overallHealth.length > 0 ||
                          searchState.filters.teamFilters.healthIndicators.length > 0 ||
                          (searchState.filters.teamFilters.utilizationRange.min > 0 || searchState.filters.teamFilters.utilizationRange.max < 100);
    if (hasPortfolioFilters && hasTeamFilters) {
    // COMBINED FILTERING: Portfolio + Team filters
    boardData.initiatives.forEach(initiative => {
        // First: Does initiative match portfolio criteria?
        if (matchesPortfolioFilters(initiative)) {
            
            // Second: Do any of its teams match the team health criteria?
            const hasMatchingTeams = initiative.teams.some(teamName => {
                const teamData = boardData.teams[teamName];
                return teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters);
            });
            
            if (hasMatchingTeams) {
                matchingInitiatives.push({ type: 'initiative', data: initiative, id: initiative.id });
                // Don't add to matchingTeams - we'll handle individual team cards below
            }
        }
    });
        
        // Check bullpen initiatives too
        boardData.bullpen.forEach(initiative => {
            if (initiative && matchesPortfolioFilters(initiative)) {
                const allTeamsMatch = initiative.teams.every(teamName => {
                    const teamData = boardData.teams[teamName];
                    return teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters);
                });
                
                if (allTeamsMatch) {
                    matchingInitiatives.push({ type: 'initiative', data: initiative, id: initiative.id });
                    initiative.teams.forEach(teamName => {
                        matchingTeams.add(teamName);
                    });
                }
            }
        });
        
    } else if (hasPortfolioFilters && !hasTeamFilters) {
        // PORTFOLIO ONLY FILTERING: Show initiatives and their teams
        boardData.initiatives.forEach(initiative => {
            if (matchesPortfolioFilters(initiative)) {
                matchingInitiatives.push({ type: 'initiative', data: initiative, id: initiative.id });
                initiative.teams.forEach(teamName => {
                    matchingTeams.add(teamName);
                });
            }
        });
        
        boardData.bullpen.forEach(initiative => {
            if (initiative && matchesPortfolioFilters(initiative)) {
                matchingInitiatives.push({ type: 'initiative', data: initiative, id: initiative.id });
                initiative.teams.forEach(teamName => {
                    matchingTeams.add(teamName);
                });
            }
        });
        
    } else if (!hasPortfolioFilters && hasTeamFilters) {
    // TEAM ONLY FILTERING: Show initiatives that have teams matching health criteria
    // Only show initiatives that have at least one team matching the team health criteria
    boardData.initiatives.forEach(initiative => {
        const hasMatchingTeam = initiative.teams.some(teamName => {
            const teamData = boardData.teams[teamName];
            return teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters);
        });
        
        if (hasMatchingTeam) {
            matchingInitiatives.push({ type: 'initiative', data: initiative, id: initiative.id });
        }
    });
    
    boardData.bullpen.forEach(initiative => {
        if (initiative) {
            const hasMatchingTeam = initiative.teams.some(teamName => {
                const teamData = boardData.teams[teamName];
                return teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters);
            });
            
            if (hasMatchingTeam) {
                matchingInitiatives.push({ type: 'initiative', data: initiative, id: initiative.id });
            }
        }
    });
}
    // Show matching initiatives
    matchingInitiatives.forEach(match => {
        showAndHighlightInitiative(match);
    });
    
   // Show matching initiatives and their associated team cards (same row only)
matchingInitiatives.forEach(match => {
    showAndHighlightInitiative(match);
    
    const initiative = match.data;
    
    // Handle team card highlighting based on filter state
    if (hasTeamFilters) {
        // COMBINED FILTERING: Only highlight individual team cards that match BOTH conditions
        initiative.teams.forEach(teamName => {
            const teamData = boardData.teams[teamName];
            
            // Only highlight if team matches the team health criteria
            if (teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters)) {
                document.querySelectorAll('.team-health-card').forEach(card => {
                    const cardTeamName = card.dataset.teamName;
                    const cardInitiativeId = parseInt(card.dataset.initiativeId);
                    
                    if (cardTeamName === teamName && cardInitiativeId === initiative.id) {
                        card.classList.remove('search-dimmed');
                        card.classList.add('search-highlight');
                    }
                });
            }
            // Important: Don't highlight teams that don't match criteria - leave them dimmed
        });
    } else {
        // Portfolio-only filtering: highlight all team cards for matching initiatives
        initiative.teams.forEach(teamName => {
            document.querySelectorAll('.team-health-card').forEach(card => {
                const cardTeamName = card.dataset.teamName;
                const cardInitiativeId = parseInt(card.dataset.initiativeId);
                
                if (cardTeamName === teamName && cardInitiativeId === initiative.id) {
                    card.classList.remove('search-dimmed');
                    card.classList.add('search-highlight');
                }
            });
        });
    }
});
    
    // Handle team-only filtering differently
    if (!hasPortfolioFilters && hasTeamFilters) {
        // Clear any existing highlights from the initiative-based logic above
        document.querySelectorAll('.team-health-card.search-highlight').forEach(card => {
            card.classList.remove('search-highlight');
            card.classList.add('search-dimmed');
        });
        
        
        
        // Highlight ONLY individual team cards that match health criteria
        document.querySelectorAll('.team-health-card').forEach(card => {
            const teamName = card.dataset.teamName;
            const teamData = boardData.teams[teamName];
            
            if (teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters)) {
                card.classList.remove('search-dimmed');
                card.classList.add('search-highlight');
            }
        });
    }
    // VALIDATION: Ensure no team cards are incorrectly highlighted
    if (hasTeamFilters) {
        document.querySelectorAll('.team-health-card.search-highlight').forEach(card => {
            const teamName = card.dataset.teamName;
            const teamData = boardData.teams[teamName];
            const shouldBeHighlighted = teamData && matchesTeamCriteria(teamData, searchState.filters.teamFilters);
            
            if (!shouldBeHighlighted) {
                card.classList.remove('search-highlight');
                card.classList.add('search-dimmed');
            } else {
            }
        });
    }
    
    updateResultsCounter(matchingInitiatives.length + matchingTeams.size);
    
    // Validate and refresh visual effects
    setTimeout(() => 100);
}
        
function matchesPortfolioFilters(initiative) {
    const filters = searchState.filters;
    
    // Type filter
    if (filters.initiativeTypes.length > 0 && !filters.initiativeTypes.includes(initiative.type)) {
        return false;
    }
    
    // Validation filter
    if (filters.validationStatus.length > 0 && !filters.validationStatus.includes(initiative.validation)) {
        return false;
    }
    
    // Priority filter
    if (filters.priorityRange.length > 0) {
        const priorityMatch = filters.priorityRange.some(range => {
            if (range === 'bullpen') return initiative.priority === 'bullpen';
            if (initiative.priority === 'bullpen') return false;
            
            const row = getRowColFromSlot(initiative.priority).row;
            switch(range) {
                case 'critical': return row <= 2;
                case 'high': return row >= 3 && row <= 4;
                case 'medium': return row >= 5 && row <= 6;
                case 'low': return row >= 7 && row <= 8;
                default: return false;
            }
        });
        if (!priorityMatch) return false;
    }
    return true;
}
        


// Simple JavaScript Tooltips for Collapsed Sidebar
function initSidebarTooltips() {
    const sidebarItems = document.querySelectorAll('.sidebar-nav-item[data-tooltip]');
    let tooltip = null;
    
    sidebarItems.forEach(item => {
        item.addEventListener('mouseenter', function(e) {
            // Only show tooltips when sidebar is collapsed
            const sidebar = document.getElementById('sidebar-nav');
            if (sidebar.classList.contains('expanded')) return;
            
            // Create tooltip
            tooltip = document.createElement('div');
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: fixed;
                left: 70px;
                top: ${e.target.getBoundingClientRect().top + 10}px;
                background: var(--bg-quaternary);
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 99999;
                pointer-events: none;
                box-shadow: var(--shadow-md);
                border: 1px solid var(--border-primary);
                font-family: Inter, sans-serif;
            `;
            
            document.body.appendChild(tooltip);
        });
        
        item.addEventListener('mouseleave', function() {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    });
}
        
// Filter Drawer Functions
function initFilterDrawers() {
    setupPortfolioDrawer();
    setupTeamDrawer();
}
      
function initFilterDrawers() {
    setupPortfolioDrawer();
    setupTeamDrawer();
}

function initAccordions() {
    // Handle accordion clicks
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.filter-section-header');
        if (!header) return;
        
        const section = header.closest('.filter-section');
        if (!section) return;
        
        const wasExpanded = section.classList.contains('expanded');
        
        // Toggle the expanded state
        section.classList.toggle('expanded');
        
        // Add smooth transition feedback
        const chevron = header.querySelector('.filter-section-chevron');
        if (chevron) {
            chevron.style.transform = section.classList.contains('expanded') 
                ? 'rotate(180deg)' 
                : 'rotate(0deg)';
        }
        
        // If section was just expanded, scroll it into view
        if (!wasExpanded && section.classList.contains('expanded')) {
            setTimeout(() => {
                const drawerContent = section.closest('.drawer-content');
                if (drawerContent) {
                    const sectionRect = section.getBoundingClientRect();
                    const drawerRect = drawerContent.getBoundingClientRect();
                    
                    // Calculate if section extends below visible area
                    const sectionBottom = sectionRect.bottom;
                    const drawerBottom = drawerRect.bottom;
                    
                    if (sectionBottom > drawerBottom) {
                        // Scroll to show the entire section
                        const scrollOffset = sectionBottom - drawerBottom + 20; // 20px padding
                        drawerContent.scrollTop += scrollOffset;
                    }
                }
            }, 300); // Wait for accordion animation to complete
        }
    });
}

function setupPortfolioDrawer() {
    const toggleButton = document.getElementById('portfolio-filter-toggle');
    const drawer = document.getElementById('portfolio-filter-drawer');
    const closeButton = document.getElementById('close-portfolio-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (!toggleButton || !drawer || !closeButton || !overlay) return;
    
    toggleButton.addEventListener('click', () => openDrawer('portfolio'));
    closeButton.addEventListener('click', () => closeDrawer('portfolio'));
    overlay.addEventListener('click', () => closeDrawer('team'));
    
    // Portfolio filter event listeners
    document.querySelectorAll('.portfolio-filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updatePortfolioFilters();
        });
    });
    
    const clearButton = document.getElementById('clear-portfolio-filters');
    if (clearButton) {
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearPortfolioFilters();
        });
    }
    
    const clearAllButtonPortfolio = document.getElementById('clear-all-filters-portfolio');
    if (clearAllButtonPortfolio) {
        clearAllButtonPortfolio.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearAllFiltersGlobally();
        });
    }
    
}

function setupTeamDrawer() {
    const toggleButton = document.getElementById('team-filter-toggle');
    const drawer = document.getElementById('team-filter-drawer');
    const closeButton = document.getElementById('close-team-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (!toggleButton || !drawer || !closeButton || !overlay) return;
    
    toggleButton.addEventListener('click', () => openDrawer('team'));
    closeButton.addEventListener('click', () => closeDrawer('team'));
    overlay.addEventListener('click', closeAllDrawers);
    
    // Filter event listeners
    document.querySelectorAll('.team-filter-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        updateTeamFilters();
    });
});
    
    const clearButton = document.getElementById('clear-team-filters');
    if (clearButton) {
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearTeamFilters();
        });
    }
    
    const clearAllButtonTeam = document.getElementById('clear-all-filters-team');
    if (clearAllButtonTeam) {
        clearAllButtonTeam.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearAllFiltersGlobally();
        });
    }
    
}

function updateTeamFilters() {
    // ONLY update team-specific filters, preserve portfolio filters
    searchState.filters.teamFilters = {
        overallHealth: [],
        healthIndicators: [],
        utilizationRange: { min: 0, max: 100 }
    };
    
    // Get checked team filter options
    document.querySelectorAll('.team-filter-checkbox:checked').forEach(checkbox => {
        const filterType = checkbox.dataset.filter;
        const filterValue = checkbox.dataset.value;
        
        switch(filterType) {
            case 'overall-health':
                searchState.filters.teamFilters.overallHealth.push(filterValue);
                break;
            case 'health-indicator':
                searchState.filters.teamFilters.healthIndicators.push(filterValue);
                break;
        }
    });
    // Check if no team filters are active
    const hasActiveTeamFilters = searchState.filters.teamFilters.overallHealth.length > 0 ||
                                searchState.filters.teamFilters.healthIndicators.length > 0;
    
    // If no team filters are active, clear team filtering effects
    if (!hasActiveTeamFilters) {
        // Check if portfolio filters are still active
        const hasActivePortfolioFilters = searchState.filters.initiativeTypes.length > 0 || 
                                         searchState.filters.validationStatus.length > 0 || 
                                         searchState.filters.priorityRange.length > 0;
        
        if (!hasActivePortfolioFilters) {
            // No filters active at all - clear everything
            clearSearchResults();
            updateFilterChipBar(); // Add this line
            return;
        }
    }
    
    // Apply combined filtering
    applyCombinedFilters();
    updateFilterChipBar(); // Add this line
}
        
function applyCombinedFilters() {
    // ADD THIS: Always clear previous filtering state first
    clearAllHighlights();
    showAllElements();
    
    // Check if any portfolio filters are active
    const hasActivePortfolioFilters = searchState.filters.initiativeTypes.length > 0 || 
                                     searchState.filters.validationStatus.length > 0 || 
                                     searchState.filters.priorityRange.length > 0 ||
                                     (searchState.filters.progressRange && (searchState.filters.progressRange.min > 0 || searchState.filters.progressRange.max < 100));
    
    // Check if any team filters are active
    const hasActiveTeamFilters = searchState.filters.teamFilters.overallHealth.length > 0 ||
                                searchState.filters.teamFilters.healthIndicators.length > 0 ||
                                (searchState.filters.teamFilters.utilizationRange.min > 0 || searchState.filters.teamFilters.utilizationRange.max < 100);
    if (hasActivePortfolioFilters || hasActiveTeamFilters) {
        searchState.isFiltering = true;
        performAdvancedFiltering();
        updateSearchUI(true);
    } else {
        clearSearchResults();
    }
    updateFilterChipBar();
}

function getDimensionCellClass(dimensionValue) {
    switch(dimensionValue) {
        case 'Healthy': 
        case 'healthy':
            return 'healthy';
        case 'At Risk': 
        case 'at-risk':
            return 'at-risk';
        case 'Critical': 
        case 'critical':
            return 'critical';
        case null:
        case undefined:
        case '':
            return 'not-set';
        default: 
            return 'not-set';
    }
}
    

// Updated function to match team criteria for filtering
function matchesTeamCriteria(teamData, filters) {
    // Validate team data exists
    if (!teamData || !teamData.jira) {
        return false;
    }
    
    // Check overall health filter
    if (filters.overallHealth.length > 0) {
        const overallHealth = getTeamOverallHealth(teamData);
        if (!filters.overallHealth.includes(overallHealth)) {
            return false;
        }
    }
    
    // Check health indicators - updated for new 6 dimensions
    if (filters.healthIndicators.length > 0) {
        const hasMatchingIndicator = filters.healthIndicators.some(indicator => {
            switch(indicator) {
                case 'capacity-healthy': return teamData.capacity === 'healthy';
                case 'skillset-healthy': return teamData.skillset === 'healthy';
                case 'vision-healthy': return teamData.vision === 'healthy';
                case 'support-healthy': return teamData.support === 'healthy';
                case 'teamwork-healthy': return teamData.teamwork === 'healthy';
                case 'autonomy-healthy': return teamData.autonomy === 'healthy';
                case 'capacity-risk': return isDimensionAtRisk(teamData.capacity);
                case 'skillset-risk': return isDimensionAtRisk(teamData.skillset);
                case 'vision-risk': return isDimensionAtRisk(teamData.vision);
                case 'support-risk': return isDimensionAtRisk(teamData.support);
                case 'teamwork-risk': return isDimensionAtRisk(teamData.teamwork);
                case 'autonomy-risk': return isDimensionAtRisk(teamData.autonomy);
                default: return false;
            }
        });
        if (!hasMatchingIndicator) return false;
    }
    
    return true;
}

// Main function to calculate overall team health based on new 6-dimension system
function getTeamOverallHealthAdvanced(teamData) {
    let riskScore = 0;
    
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    
    dimensions.forEach(dim => {
        const value = teamData[dim];
        
        if (value === 'At Risk' || value === 'at-risk') {
            riskScore += 1;  // At Risk = 1 point
        } else if (value === 'Critical' || value === 'critical') {
            riskScore += 2;  // Critical = 2 points (more severe)
        }
    });
    
    // Risk score interpretation
    if (riskScore === 0) return 'HEALTHY';
    if (riskScore <= 2) return 'LOW RISK';
    if (riskScore <= 6) return 'HIGH RISK'; 
    return 'CRITICAL';  // 7+ points = critical team
}

function clearTeamFilters() {
    // Clear all team filter checkboxes
    document.querySelectorAll('.team-filter-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset utilization sliders
    const teamUtilizationMin = document.getElementById('team-utilization-min');
    const teamUtilizationMax = document.getElementById('team-utilization-max');
    const teamUtilizationMinLabel = document.getElementById('team-utilization-min-label');
    const teamUtilizationMaxLabel = document.getElementById('team-utilization-max-label');
    const teamUtilizationRangeDisplay = document.getElementById('team-utilization-range-display');
    
    if (teamUtilizationMin && teamUtilizationMax) {
        teamUtilizationMin.value = 0;
        teamUtilizationMax.value = 100;
        
        // Update display elements
        if (teamUtilizationMinLabel) teamUtilizationMinLabel.textContent = '0%';
        if (teamUtilizationMaxLabel) teamUtilizationMaxLabel.textContent = '100%';
        if (teamUtilizationRangeDisplay) teamUtilizationRangeDisplay.textContent = '0% - 100%';
        
        // Update track visual if it exists
        const utilizationTrack = document.getElementById('team-utilization-track');
        if (utilizationTrack) {
            utilizationTrack.style.left = '0%';
            utilizationTrack.style.width = '100%';
        }
    } else {
    }
    // Reset the main filter state
    searchState.filters.teamFilters = {
        overallHealth: [],
        healthIndicators: [],
        utilizationRange: { min: 0, max: 100 }
    };
    
    // Check if any other filters are still active
    const hasActivePortfolioFilters = searchState.filters.initiativeTypes.length > 0 || 
                                     searchState.filters.validationStatus.length > 0 || 
                                     searchState.filters.priorityRange.length > 0 ||
                                     (searchState.filters.progressRange && (searchState.filters.progressRange.min > 0 || searchState.filters.progressRange.max < 100));
    
    if (hasActivePortfolioFilters) {
        // Keep filtering with remaining portfolio filters
        performAdvancedFiltering();
        updateSearchUI(true);
    } else {
        // Clear all filtering
        clearSearchResults();
    }
}
        
function clearAllFiltersGlobally() {
    // Clear all portfolio filter checkboxes
    document.querySelectorAll('.portfolio-filter-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear all team filter checkboxes
    document.querySelectorAll('.team-filter-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset portfolio progress sliders
    const portfolioProgressMin = document.getElementById('portfolio-progress-min');
    const portfolioProgressMax = document.getElementById('portfolio-progress-max');
    if (portfolioProgressMin && portfolioProgressMax) {
        portfolioProgressMin.value = 0;
        portfolioProgressMax.value = 100;
        // Trigger display update
        const event = new Event('input');
        portfolioProgressMin.dispatchEvent(event);
    }
    
    // Reset team utilization sliders
    const teamUtilizationMin = document.getElementById('team-utilization-min');
    const teamUtilizationMax = document.getElementById('team-utilization-max');
    if (teamUtilizationMin && teamUtilizationMax) {
        teamUtilizationMin.value = 0;
        teamUtilizationMax.value = 100;
        // Trigger display update
        const event = new Event('input');
        teamUtilizationMin.dispatchEvent(event);
    }
    
    // Reset the complete filter state
    searchState.filters = {
        initiativeTypes: [],
        validationStatus: [],
        teamHealth: [],
        priorityRange: [],
        teamFilters: {
            overallHealth: [],
            healthIndicators: [],
            utilizationRange: { min: 0, max: 100 }
        }
    };
    
    searchState.isFiltering = false;
    
    // Clear visual effects
    clearAllHighlights();
    showAllElements();
    updateSearchUI(false);
    updateResultsCounter(0);
    
    // Update chip bar immediately
    updateFilterChipBar();
    // Show feedback to user
    updateFilterChipBar(); 
}

function openDrawer(type) {
    // Close other open drawers first
    const otherDrawerType = type === 'portfolio' ? 'team' : 'portfolio';
    const otherDrawer = document.getElementById(`${otherDrawerType}-filter-drawer`);
    
    if (otherDrawer && !otherDrawer.classList.contains('hidden')) {
        closeDrawer(otherDrawerType);
        // Add a small delay to allow the close animation to start
        setTimeout(() => {
            openSpecificDrawer(type);
        }, 100);
        return;
    }
    
    openSpecificDrawer(type);
}

function openSpecificDrawer(type) {
    const drawer = document.getElementById(`${type}-filter-drawer`);
    const overlay = document.getElementById('drawer-overlay');
    const toggleButton = document.getElementById(`${type}-filter-toggle`);
    
    drawer.classList.remove('hidden');
    
    const buttonRect = toggleButton.getBoundingClientRect();
    
    // Position directly below the button
    let left = buttonRect.left;
    let top = buttonRect.bottom + 5;
    
    const drawerWidth = 280;
    // Ensure drawer doesn't go off right edge
    if (left + drawerWidth > window.innerWidth) {
        left = window.innerWidth - drawerWidth - 10;
    }
    
    // Ensure drawer doesn't go off bottom edge
    if (top + 400 > window.innerHeight) {
        top = buttonRect.top - 400 - 5; // Position above button instead
        if (top < 10) {
            top = 10; // Fallback to top of screen
        }
    }
    
    drawer.style.position = 'fixed';
    drawer.style.left = left + 'px';
    drawer.style.top = top + 'px';
    drawer.style.right = 'auto';
    drawer.style.bottom = 'auto';
    
    setTimeout(() => {
        drawer.classList.add('filter-drawer-open');
    }, 10);
    
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeDrawer(type) {
    const drawer = document.getElementById(`${type}-filter-drawer`);
    const overlay = document.getElementById('drawer-overlay');
    
    drawer.classList.remove('filter-drawer-open');
    overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Hide drawer after animation
    setTimeout(() => {
        drawer.classList.add('hidden');
    }, 300);
}

function closeAllDrawers() {
    const portfolioDrawer = document.getElementById('portfolio-filter-drawer');
    const teamDrawer = document.getElementById('team-filter-drawer');
    
    if (portfolioDrawer) {
        portfolioDrawer.classList.remove('filter-drawer-open');
    }
    if (teamDrawer) {
        teamDrawer.classList.remove('filter-drawer-open');
    }
    
    document.getElementById('drawer-overlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Hide drawers after animation
    setTimeout(() => {
        if (portfolioDrawer) portfolioDrawer.classList.add('hidden');
        if (teamDrawer) teamDrawer.classList.add('hidden');
    }, 300);
}



// Placeholder functions for filter logic (will be implemented in Phase 2)
function updatePortfolioFilters() {
    // ONLY update portfolio-specific filters, preserve team filters
    searchState.filters.initiativeTypes = [];
    searchState.filters.validationStatus = [];
    searchState.filters.priorityRange = [];
    searchState.filters.progressRange = { min: 0, max: 100 };
    
    // Read portfolio filter checkboxes
    document.querySelectorAll('.portfolio-filter-checkbox:checked').forEach(checkbox => {
        const filterType = checkbox.dataset.filter;
        const filterValue = checkbox.dataset.value;
        
        switch(filterType) {
            case 'type':
                searchState.filters.initiativeTypes.push(filterValue);
                break;
            case 'validation':
                searchState.filters.validationStatus.push(filterValue);
                break;
            case 'priority':
                searchState.filters.priorityRange.push(filterValue);
                break;
        }
    });
 
    updateFilterChipBar();
    
    // Apply combined filtering
    applyCombinedFilters();
}

   
    // Filter Chip Management Functions
function updateFilterChipBar() {
    const chipBar = document.getElementById('filter-chip-bar');
    const portfolioSection = document.getElementById('portfolio-chips-section');
    const teamSection = document.getElementById('team-chips-section');
    const separator = document.getElementById('filter-separator');
    const clearAllBtn = document.getElementById('clear-all-chip');
    
    // Clear existing chips
    document.getElementById('portfolio-chips').innerHTML = '';
    document.getElementById('team-chips').innerHTML = '';
    
    let hasPortfolioFilters = false;
    let hasTeamFilters = false;
    
    // Generate portfolio chips
    hasPortfolioFilters = generatePortfolioChips();
    
    // Generate team health chips
    hasTeamFilters = generateTeamHealthChips();
    
    // Show/hide sections and separator
    portfolioSection.classList.toggle('hidden', !hasPortfolioFilters);
    teamSection.classList.toggle('hidden', !hasTeamFilters);
    separator.classList.toggle('hidden', !(hasPortfolioFilters && hasTeamFilters));
    
    // Handle clear search button
const clearSearchBtn = document.getElementById('clear-search-chip');
const hasActiveSearch = searchState.isFiltering && searchState.query;

if (clearSearchBtn) {
    clearSearchBtn.style.display = hasActiveSearch ? 'block' : 'none';
}

// Show/hide clear all button based on whether any filters are active
const hasAnyFilters = hasPortfolioFilters || hasTeamFilters;
clearAllBtn.style.display = hasAnyFilters ? 'block' : 'none';

// Show/hide entire chip bar
const shouldShowChipBar = hasAnyFilters || hasActiveSearch;
if (shouldShowChipBar) {
    chipBar.classList.remove('hidden');
    document.body.classList.add('chip-bar-active'); // Add body padding
    setTimeout(() => chipBar.classList.add('show'), 10);
} else {
    chipBar.classList.remove('show');
    setTimeout(() => {
        chipBar.classList.add('hidden');
        document.body.classList.remove('chip-bar-active'); // Remove body padding
    }, 300);
}
}

function generatePortfolioChips() {
    const portfolioContainer = document.getElementById('portfolio-chips');
    let hasFilters = false;
    
    // Initiative Type chips
    searchState.filters.initiativeTypes.forEach(type => {
        const displayName = type === 'ktlo' ? 'KTLO/Tech' : 
                           type.charAt(0).toUpperCase() + type.slice(1);
        portfolioContainer.appendChild(createFilterChip(displayName, 'portfolio', 'type', type));
        hasFilters = true;
    });
    
    // Validation Status chips
    searchState.filters.validationStatus.forEach(status => {
        const displayName = status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        portfolioContainer.appendChild(createFilterChip(displayName, 'portfolio', 'validation', status));
        hasFilters = true;
    });
    
    // Priority Range chips
    searchState.filters.priorityRange.forEach(priority => {
        const displayName = priority.charAt(0).toUpperCase() + priority.slice(1);
        portfolioContainer.appendChild(createFilterChip(displayName, 'portfolio', 'priority', priority));
        hasFilters = true;
    });
    
    
    
    return hasFilters;
}

function generateTeamHealthChips() {
    const teamContainer = document.getElementById('team-chips');
    let hasFilters = false;
    
    if (!searchState.filters.teamFilters) return hasFilters;
    
    // Overall Health chips
    searchState.filters.teamFilters.overallHealth.forEach(health => {
        const displayName = health.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        teamContainer.appendChild(createFilterChip(displayName, 'team', 'overall-health', health));
        hasFilters = true;
    });
    
    // Health Indicator chips
    searchState.filters.teamFilters.healthIndicators.forEach(indicator => {
        let displayName = indicator.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        // Simplify display names
        displayName = displayName.replace('Capacity Healthy', 'Capacity: Healthy')
                                 .replace('Skillset Healthy', 'Skillset: Healthy')
                                 .replace('Leadership Healthy', 'Leadership: Healthy')
                                 .replace('Capacity Risk', 'Capacity: At Risk')
                                 .replace('Skillset Risk', 'Skillset: At Risk')
                                 .replace('Leadership Risk', 'Leadership: At Risk');
        teamContainer.appendChild(createFilterChip(displayName, 'team', 'health-indicator', indicator));
        hasFilters = true;
    });
    
    return hasFilters;
}

function createFilterChip(displayName, section, filterType, filterValue) {
    const chip = document.createElement('div');
    chip.className = `filter-chip ${section}-chip`;
    chip.dataset.section = section;
    chip.dataset.filterType = filterType;
    chip.dataset.filterValue = filterValue;
    
    chip.innerHTML = `
        <span>${displayName}</span>
        <div class="filter-chip-remove" onclick="removeFilterChip('${section}', '${filterType}', '${filterValue}')" title="Remove filter">
            ×
        </div>
    `;
    
    return chip;
}

function removeFilterChip(section, filterType, filterValue) {
    // Find and animate out the chip
    const chip = document.querySelector(`[data-section="${section}"][data-filter-type="${filterType}"][data-filter-value="${filterValue}"]`);
    if (chip) {
        chip.classList.add('removing');
        setTimeout(() => chip.remove(), 200);
    }
    
    // Update filter state
    if (section === 'portfolio') {
        removePortfolioFilter(filterType, filterValue);
    } else if (section === 'team') {
        removeTeamFilter(filterType, filterValue);
    }
    
    // Update checkboxes in drawers
    updateFilterDrawerCheckboxes(section, filterType, filterValue, false);
    
    // Check if this was part of a quick filter and clear it
    clearQuickFiltersIfEmpty();
    
    // Re-apply filters and update chip bar
    applyCombinedFilters();
    updateFilterChipBar();
}
      
function clearQuickFiltersIfEmpty() {
    // Check if all filters are empty
    const hasActiveFilters = searchState.filters.initiativeTypes.length > 0 ||
                            searchState.filters.validationStatus.length > 0 ||
                            searchState.filters.priorityRange.length > 0 ||
                            (searchState.filters.progressRange.min > 0 || searchState.filters.progressRange.max < 100) ||
                            searchState.filters.teamFilters.overallHealth.length > 0 ||
                            searchState.filters.teamFilters.healthIndicators.length > 0;
    
    if (!hasActiveFilters) {
        // Clear quick filter active states
        document.querySelectorAll('.sidebar-nav-item[data-action="quick-filter"]').forEach(item => {
            item.classList.remove('quick-filter-active');
        });
    }
}

function removePortfolioFilter(filterType, filterValue) {
    switch(filterType) {
        case 'type':
            searchState.filters.initiativeTypes = searchState.filters.initiativeTypes.filter(t => t !== filterValue);
            break;
        case 'validation':
            searchState.filters.validationStatus = searchState.filters.validationStatus.filter(v => v !== filterValue);
            break;
        case 'priority':
            searchState.filters.priorityRange = searchState.filters.priorityRange.filter(p => p !== filterValue);
            break;
    }
}

function removeTeamFilter(filterType, filterValue) {
    if (!searchState.filters.teamFilters) return;
    
    switch(filterType) {
        case 'overall-health':
            searchState.filters.teamFilters.overallHealth = 
                searchState.filters.teamFilters.overallHealth.filter(h => h !== filterValue);
            break;
        case 'health-indicator':
            searchState.filters.teamFilters.healthIndicators = 
                searchState.filters.teamFilters.healthIndicators.filter(i => i !== filterValue);
            break;
    }
    
    // Uncheck the corresponding checkbox
    const checkbox = document.querySelector(`.team-filter-checkbox[data-filter="${filterType}"][data-value="${filterValue}"]`);
    if (checkbox) {
        checkbox.checked = false;
    }
}

function updateFilterDrawerCheckboxes(section, filterType, filterValue, checked) {
    // Update portfolio drawer checkboxes
    if (section === 'portfolio') {
        const selector = `.portfolio-filter-checkbox[data-filter="${filterType}"][data-value="${filterValue}"]`;
        const checkbox = document.querySelector(selector);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }
    
    // Update team drawer checkboxes
    if (section === 'team') {
        const selector = `.team-filter-checkbox[data-filter="${filterType}"][data-value="${filterValue}"]`;
        const checkbox = document.querySelector(selector);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }
}

function clearAllFiltersFromChips() {
    // Animate out all chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.add('removing');
    });
    
    // Clear all filters after animation
    setTimeout(() => {
        clearAllFiltersGlobally();
        updateFilterChipBar();
    }, 250);
  
// Clear all filters after animation
setTimeout(() => {
    clearAllFiltersGlobally();
    updateFilterChipBar();
    document.body.classList.remove('chip-bar-active'); // Ensure body class is removed
}, 250);  
  
}    
      
function clearSearchFromChips() {
    // Clear the search input
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear search state
    searchState.query = '';
    
    // Clear search results and visual effects
clearSearchResultsOnly();
    
    // Hide clear search button
    const clearSearchButton = document.getElementById('clear-search');
    if (clearSearchButton) {
        clearSearchButton.classList.add('hidden');
    }
    
    // Update chip bar to reflect cleared search
    updateFilterChipBar();
    
    // Hide search suggestions if visible
    hideSearchSuggestions();
  
  // Remove body padding class if no filters remain
setTimeout(() => {
    const hasAnyActiveFilters = searchState.filters.initiativeTypes.length > 0 || 
                               searchState.filters.validationStatus.length > 0 || 
                               searchState.filters.priorityRange.length > 0 ||
                               searchState.filters.teamFilters.overallHealth.length > 0 ||
                               searchState.filters.teamFilters.healthIndicators.length > 0;
    
    if (!hasAnyActiveFilters) {
        document.body.classList.remove('chip-bar-active');
    }
  }, 350);
}
      
  // Quick Filter Functions
function applyQuickFilter(filterType) {
    // Clear existing filters and highlights WITHOUT affecting chip bar
    clearSearchResultsOnly();
    
    // Clear existing filter state
    searchState.filters = {
        initiativeTypes: [],
        validationStatus: [],
        teamHealth: [],
        priorityRange: [],
        progressRange: { min: 0, max: 100 },
        blockedStoriesThreshold: null,
        teamFilters: {
            overallHealth: [],
            healthIndicators: [],
            utilizationRange: { min: 0, max: 100 },
            workloadThreshold: null
        }
    };
    
    // Set filter state based on quick filter type
    switch(filterType) {
        case 'high-risk-initiatives':
            searchState.filters.priorityRange = ['critical', 'high'];
            searchState.filters.teamFilters.overallHealth = ['at-risk', 'high-risk', 'critical'];
            break;
        case 'market-risk-exposure':
            searchState.filters.priorityRange = ['critical', 'high', 'medium'];
            searchState.filters.validationStatus = ['not-validated', 'in-validation'];
            break;
        case 'critically-overloaded-teams':
            searchState.filters.teamFilters.overallHealth = ['at-risk', 'high-risk', 'critical'];
            break;
        case 'blocked-initiatives':
            searchState.filters.progressRange = { min: 0, max: 25 };
            break;
    }
    
    // Set filtering state
    searchState.isFiltering = true;
    
    let matches = [];
    
    switch(filterType) {
        case 'high-risk-initiatives':
            matches = getHighRiskInitiatives();
            break;
        case 'market-risk-exposure':
            matches = getMarketRiskExposure();
            break;
        case 'critically-overloaded-teams':
            matches = getCriticallyOverloadedTeams();
            break;
        case 'blocked-initiatives':
            matches = getBlockedInitiatives();
            break;
    }
    
    displayQuickFilterResults(matches, filterType);
updateQuickFilterUI(filterType);

// Update the filter chip bar to show active filters
// Set filtering state first, then update chips
searchState.isFiltering = true;
updateFilterChipBar();
}

function getHighRiskInitiatives() {
    return boardData.initiatives.filter(initiative => {
        if (initiative.priority === "bullpen") return false;
        
        const row = getRowColFromSlot(initiative.priority).row;
        const isCriticalOrHigh = row <= 4; // Critical (1-2) or High (3-4)
        
        const hasHighRiskTeam = initiative.teams.some(teamName => {
            const team = boardData.teams[teamName];
            if (!team) return false;
            
            let atRiskCount = 0;
            if (team.capacity === 'at-risk') atRiskCount++;
            if (team.skillset === 'at-risk') atRiskCount++;
            if (team.leadership === 'at-risk') atRiskCount++;
            
            return atRiskCount >= 2; // High Risk (2) or Critical (3)
        });
        
        return isCriticalOrHigh && hasHighRiskTeam;
    });
}

function getMarketRiskExposure() {
    return boardData.initiatives.filter(initiative => {
        if (initiative.priority === "bullpen") return false;
        
        const row = getRowColFromSlot(initiative.priority).row;
        const isCriticalHighMedium = row <= 6; // Critical (1-2), High (3-4), Medium (5-6)
        
        const isUnvalidatedOrInValidation = initiative.validation === 'not-validated' || 
                                          initiative.validation === 'in-validation';
        
        return isCriticalHighMedium && isUnvalidatedOrInValidation;
    });
}

function getCriticallyOverloadedTeams() {
    const teamWorkloads = {};
    
    // Count initiatives per team
    boardData.initiatives.forEach(initiative => {
        if (initiative.priority !== "bullpen") {
            initiative.teams.forEach(teamName => {
                if (!teamWorkloads[teamName]) teamWorkloads[teamName] = [];
                teamWorkloads[teamName].push(initiative);
            });
        }
    });
    
    // Find teams with 4+ initiatives AND working on Critical/High priority
    const criticallyOverloadedTeams = Object.keys(teamWorkloads).filter(teamName => {
        const initiatives = teamWorkloads[teamName];
        if (initiatives.length < 4) return false;
        
        return initiatives.some(initiative => {
            const row = getRowColFromSlot(initiative.priority).row;
            return row <= 4; // Critical (1-2) or High (3-4)
        });
    });
    
    return criticallyOverloadedTeams.map(teamName => ({
        type: 'team',
        id: teamName,
        teamName: teamName,
        data: boardData.teams[teamName],
        workloadCount: teamWorkloads[teamName].length
    }));
}

function getBlockedInitiatives() {
    return boardData.initiatives.filter(initiative => {
        if (!initiative.jira) return false;
        
        const hasHighBlockers = initiative.jira.blocked > 10;
        const hasLowProgress = initiative.progress < 25;
        
        return hasHighBlockers && hasLowProgress;
    });
}

function displayQuickFilterResults(matches, filterType) {
    clearAllHighlights();
    hideAllElements();
    
    matches.forEach(match => {
        if (match.type === 'team') {
            showAndHighlightTeam(match);
        } else {
            showAndHighlightInitiative({ type: 'initiative', data: match, id: match.id });
        }
    });
    
    updateSearchUI(true);
    updateResultsCounter(matches.length);
    
    
}

function updateQuickFilterUI(activeFilterType) {
    // Remove active state from all quick filters
    document.querySelectorAll('.sidebar-nav-item[data-action="quick-filter"]').forEach(item => {
        item.classList.remove('quick-filter-active');
    });
    
    // Add active state to current filter
    const activeFilter = document.querySelector(`[data-filter-type="${activeFilterType}"]`);
    if (activeFilter) {
        activeFilter.classList.add('quick-filter-active');
    }
}

function clearQuickFilters() {
    document.querySelectorAll('.sidebar-nav-item[data-action="quick-filter"]').forEach(item => {
        item.classList.remove('quick-filter-active');
    });
    clearSearchResults();
    
    // Clear the filter state as well
    searchState.filters = {
        initiativeTypes: [],
        validationStatus: [],
        teamHealth: [],
        priorityRange: [],
        progressRange: { min: 0, max: 100 },
        teamFilters: {
            overallHealth: [],
            healthIndicators: [],
            utilizationRange: { min: 0, max: 100 }
        }
    };
    
    // Clear the filter state as well
searchState.filters = {
    initiativeTypes: [],
    validationStatus: [],
    teamHealth: [],
    priorityRange: [],
    progressRange: { min: 0, max: 100 },
    blockedStoriesThreshold: null,
    teamFilters: {
        overallHealth: [],
        healthIndicators: [],
        utilizationRange: { min: 0, max: 100 },
        workloadThreshold: null
    }
};

// Update chip bar to reflect cleared state with delay to prevent flicker
setTimeout(() => {
    updateFilterChipBar();
}, 10);
}
      
let currentEditingKPI = null;

function openKPIEditModal(kpiObject) {
    // Store the complete KPI object, not just the title
    currentEditingKPI = kpiObject;
    
    const modal = document.getElementById('kpi-edit-modal');
    const nameDisplay = document.getElementById('kpi-name-display');
    const description = document.getElementById('kpi-description');
    const targetDisplay = document.getElementById('kpi-target-display');
    const currentInput = document.getElementById('kpi-current-value');
    
    // Set the content using the KPI object
    nameDisplay.textContent = kpiObject.title;
    targetDisplay.textContent = kpiObject.targetValue + (kpiObject.unit || '');
    currentInput.value = parseFloat(kpiObject.currentValue.toString().replace(/[^\d.-]/g, ''));
    
    // Set descriptions based on KPI type
    const descriptions = {
        "Monthly Active Users": "Percentage increase in monthly active users compared to baseline",
        "System Uptime": "Overall system availability percentage across all services", 
        "Strategic Capabilities": "Number of new strategic product capabilities launched"
    };
    
    description.textContent = descriptions[kpiObject.title] || "Key performance indicator for organizational success";
    
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus and select the current value input
    setTimeout(() => {
        currentInput.focus();
        currentInput.select();
    }, 100);
}

// 2. UPDATE: Replace your saveKPIValue function with this:
async function saveKPIValue() {
    const currentValue = parseFloat(document.getElementById('kpi-current-value').value);
    
    if (isNaN(currentValue)) {
        alert('Please enter a valid number for the current value.');
        return;
    }
    
    const kpi = currentEditingKPI;
    if (!kpi) {
        alert('No KPI data available. Please close and reopen the modal.');
        return;
    }
    
    const saveButton = document.querySelector('#kpi-edit-modal button[onclick="saveKPIValue()"]');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Updating...';
    saveButton.disabled = true;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const updateResponse = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: `/rest/api/3/issue/${kpi.key}`,
                method: 'PUT',
                body: {
                    fields: {
                        "customfield_10048": parseFloat(currentValue),
                        "customfield_10159": today
                    }
                }
            })
        });
        
        // Since updates are working (you're getting Value History records), 
        // treat any response as success and don't try to parse empty responses
        console.log('Update response status:', updateResponse.status);
        
        // Update local data
        updateLocalKPIData(kpi, currentValue, today);
        
        // Close modal and show success
        closeKPIEditModal();
        alert(`✅ ${kpi.title} updated to ${currentValue}${kpi.unit || ''} and synced to Jira`);
        
        // Refresh displays
        if (typeof updateProgressCard === 'function') {
            updateProgressCard();
        }
        
    } catch (error) {
        console.error('Error updating KPI value:', error);
        alert(`❌ Failed to update ${kpi.title}: ${error.message}`);
        
        saveButton.textContent = originalText;
        saveButton.disabled = false;
    }
}

function closeKPIEditModal() {
    const modal = document.getElementById('kpi-edit-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    currentEditingKPI = null;
}



function updateLocalKPIData(kpiObject, newValue, changeDate) {
    // Update the local boardData if it exists
    if (window.boardData && window.boardData.okrs && window.boardData.okrs.issues) {
        const kpiIssue = window.boardData.okrs.issues.find(issue => issue.key === kpiObject.key);
        
        if (kpiIssue) {
            kpiIssue.fields.customfield_10048 = newValue;
            kpiIssue.fields.customfield_10159 = changeDate;
            console.log(`Updated local data for ${kpiObject.title} (${kpiObject.key})`);
        }
    }
    
    // Also update the KPI object itself
    kpiObject.currentValue = newValue.toString();
}

async function refreshKPIDisplays() {
    try {
        // Refresh the progress card
        if (typeof updateProgressCard === 'function') {
            updateProgressCard();
        }
        
        // If there's an open KPI detail modal, refresh its data
        const kpiDetailModal = document.getElementById('kpi-detail-modal');
        if (kpiDetailModal && kpiDetailModal.classList.contains('show')) {
            // Close and reopen with fresh data
            const currentKPI = currentEditingKPI; // The KPI object we just updated
            closeKPIDetailModal();
            
            // Wait a moment then reopen with fresh data
            setTimeout(async () => {
                try {
                    // Use the updated KPI object directly
                    if (currentKPI) {
                        openKPIDetailModal(currentKPI);
                    }
                } catch (error) {
                    console.error('Error refreshing KPI modal:', error);
                }
            }, 500);
        }
        
    } catch (error) {
        console.error('Error refreshing KPI displays:', error);
    }
}


      
  let currentKPIDetail = null;
      
function showOKRAlignmentModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Parse OKR data from Jira
    const { objectives, keyResults } = parseOKRData();
    
    // Only consider active board initiatives (exclude pipeline)
    const activeBoardInitiatives = boardData.initiatives.filter(init => init.priority !== "pipeline");
    const misalignedInitiatives = activeBoardInitiatives.filter(init => !isAlignedWithOKRs(init))
        .sort((a, b) => a.priority - b.priority); // Sort by priority (lowest number = highest priority first)
    
    const highPriorityMisaligned = misalignedInitiatives.filter(init => {
        return getRowColFromSlot(init.priority).row <= 4; // High priority rows 1-4
    });
    
    // Color logic (same as card)
    const alignmentPercentage = calculateOKRAlignment();
    let alignmentColor;
    if (alignmentPercentage >= 85) {
        alignmentColor = 'var(--accent-green)';
    } else if (alignmentPercentage >= 70) {
        alignmentColor = 'var(--accent-orange)';
    } else {
        alignmentColor = 'var(--accent-red)';
    }
    
    title.textContent = 'OKR Alignment Analysis';
    
    // Build OKRs display from Jira data
    let okrsDisplayHTML = '';
    
    if (objectives.length === 0) {
        // Fallback if no OKRs found in Jira
        okrsDisplayHTML = `
            <div class="p-6 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                <div class="text-center" style="color: var(--text-secondary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M16 12h-4v-4"/>
                        <path d="M12 16V8"/>
                    </svg>
                    <p>No OKRs found in Jira OKR project.<br>Please set up objectives and key results in Jira.</p>
                </div>
            </div>
        `;
    } else {
        // Display actual OKRs from Jira
        okrsDisplayHTML = objectives.map(objective => {
            const relatedKeyResults = keyResults
    .filter(kr => kr.parentKey === objective.key)
    .sort((a, b) => {
        // Extract number from OKR-2, OKR-3, OKR-4 etc.
        const numA = parseInt(a.key.split('-')[1]) || 0;
        const numB = parseInt(b.key.split('-')[1]) || 0;
        return numA - numB;
    });
            
            return `
                <div class="p-6 rounded-lg mb-4" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                    <div class="grid gap-6" style="grid-template-columns: 1fr 2fr;">
                        <div>
                            <div class="text-base font-bold mb-3 flex items-center justify-between" style="color: var(--text-primary);">
                                <span>Objective:</span>
                                <a href="https://alignvue.atlassian.net/browse/${objective.key}" target="_blank" title="Open in Jira" class="hover:opacity-75 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M15 3h6v6"/>
                                        <path d="M10 14 21 3"/>
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    </svg>
                                </a>
                            </div>
                            <p class="text-base font-medium leading-relaxed" style="color: var(--text-secondary);">${objective.summary}</p>
                            <div class="text-xs mt-2 opacity-75" style="color: var(--text-tertiary);">${objective.key}</div>
                        </div>
                        <div>
                            <div class="text-sm font-bold mb-3" style="color: var(--text-primary);">Key Results:</div>
                            <div class="space-y-3">
                                ${relatedKeyResults.length === 0 ? 
                                    '<div class="text-sm" style="color: var(--text-tertiary);">No key results defined for this objective.</div>' :
                                    relatedKeyResults.map((kr, index) => {
                                        const colors = ['var(--accent-green)', 'var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-orange)'];
                                        const color = colors[index % colors.length];
                                        return `
                                            <div class="flex items-start gap-3 p-3 rounded-md" style="background: ${color}20; border-left: 4px solid ${color};">
                                                <div class="flex-1">
                                                    <div class="text-sm font-semibold mb-1 flex items-center justify-between" style="color: var(--text-primary);">
                                                        <span>${kr.key}</span>
                                                        <a href="https://alignvue.atlassian.net/browse/${kr.key}" target="_blank" title="Open in Jira" class="hover:opacity-75 transition-opacity">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0052CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M15 3h6v6"/>
                                                                <path d="M10 14 21 3"/>
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                            </svg>
                                                        </a>
                                                    </div>
                                                    <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">${kr.summary}</p>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    content.innerHTML = 
        '<div class="space-y-6">' +
            // Header Section
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' +
                    '</svg>' +
                    'Current OKRs from Jira' +
                '</h3>' +
                okrsDisplayHTML +
            '</div>' +
            
            // Summary stats
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M11 13v4"/><path d="M15 5v4"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/><rect x="7" y="13" width="9" height="4" rx="1"/><rect x="7" y="5" width="12" height="4" rx="1"/>' +
                    '</svg>' +
                    'Portfolio Alignment Analysis' +
                '</h3>' +
                '<div class="grid gap-4 mb-6" style="grid-template-columns: 1fr 1fr 1fr;">' +
                    '<div class="p-4 rounded-lg text-center" style="background: ' + alignmentColor + '20; border: 1px solid ' + alignmentColor + ';">' +
                        '<div class="text-2xl font-bold" style="color: ' + alignmentColor + ';">' + alignmentPercentage + '%</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Aligned</div>' +
                    '</div>' +
                    '<div class="p-4 rounded-lg text-center" style="background: var(--accent-orange)20; border: 1px solid var(--accent-orange);">' +
                        '<div class="text-2xl font-bold" style="color: var(--accent-orange);">' + misalignedInitiatives.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">Need Review</div>' +
                    '</div>' +
                    '<div class="p-4 rounded-lg text-center" style="background: var(--accent-red)20; border: 1px solid var(--accent-red);">' +
                        '<div class="text-2xl font-bold" style="color: var(--accent-red);">' + highPriorityMisaligned.length + '</div>' +
                        '<div class="text-sm" style="color: var(--text-secondary);">High Priority</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            // Initiatives needing review (only if there are any)
            (misalignedInitiatives.length > 0 ? 
                '<div style="background: var(--status-warning-bg); border: 1px solid var(--accent-orange);" class="rounded-lg p-4">' +
                    '<h4 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-orange);">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                            '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 1.73-3Z"/>' +
                            '<path d="M12 9v4"/>' +
                            '<path d="M12 17h.01"/>' +
                        '</svg>' +
                        'Initiatives Without OKR Mapping (' + misalignedInitiatives.length + ') - Sorted by Priority' +
                    '</h4>' +
                    '<div class="text-sm mb-3" style="color: var(--text-secondary);">These initiatives need OKR alignment review or mapping in Jira (highest priority first)</div>' +
                    '<div class="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">' +
                        misalignedInitiatives.map(init => `
                            <div class="bento-pipeline-item" 
                                 onclick="showInitiativeModal(boardData.initiatives.find(init => init.id === ${init.id}))"
                                 style="position: relative; cursor: pointer;">
                                <div class="bento-pipeline-item-header">
                                    <div class="bento-pipeline-item-title">
                                        ${init.title}
                                        <span class="bento-type-badge bento-type-${init.type}">${init.type.toUpperCase()}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        ${getRowColFromSlot(init.priority).row <= 4 ? 
                                            '<span class="text-xs px-2 py-1 rounded" style="background: var(--accent-red); color: white;">HIGH PRIORITY</span>' : 
                                            ''
                                        }
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 1.73-3Z"/>
                                            <path d="M12 9v4"/>
                                            <path d="M12 17h.01"/>
                                        </svg>
                                        <span class="text-xs" style="color: var(--accent-orange);">Priority ${init.priority}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('') +
                    '</div>' +
                '</div>' : ''
            ) +
        '</div>';
    
    modal.classList.add('show');
}

function showTeamHealthModal(healthLevel) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    const matchingTeams = getTeamsByHealthLevel(healthLevel);
    
    const healthLabels = {
        'healthy': 'Healthy Teams',
        'low-risk': 'Low Risk Teams', 
        'high-risk': 'High Risk Teams',
        'critical': 'Critical Teams'
    };
    
    title.textContent = healthLabels[healthLevel];
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="text-center mb-6">
                <div class="text-4xl font-bold mb-2" style="color: ${getHealthLevelColor(healthLevel)};">
                    ${matchingTeams.length}
                </div>
                <p class="text-sm" style="color: var(--text-secondary);">
                    Teams with ${healthLevel.replace('-', ' ')} status
                </p>
            </div>
            
            <div class="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                ${matchingTeams.map(teamName => createMiniTeamCard(teamName)).join('')}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function showHealthIndicatorModal(indicator) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Get teams with this indicator at risk
    const matchingTeams = getTeamsByIndicator(indicator);
    
    const indicatorLabels = {
        'capacity': 'Teams with Capacity Risks',
        'skillset': 'Teams with Skillset Risks',
        'vision': 'Teams with Vision Risks',
        'support': 'Teams with Support Risks',
        'teamwork': 'Teams with Team Cohesion Risks',
        'autonomy': 'Teams with Autonomy Risks'
    };
    
    title.textContent = indicatorLabels[indicator];
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="text-center mb-6">
                <div class="text-4xl font-bold mb-2" style="color: var(--accent-red);">
                    ${matchingTeams.length}
                </div>
                <p class="text-sm" style="color: var(--text-secondary);">
                    Teams with ${indicator} at risk
                </p>
            </div>
            
            <div class="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                ${matchingTeams.map(teamName => createMiniTeamCard(teamName)).join('')}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}
      
// Updated function to get teams by health level
function getTeamsByHealthLevel(healthLevel) {
    return Object.keys(boardData.teams).filter(teamName => {
        const team = boardData.teams[teamName];
        const overallHealth = getTeamOverallHealth(team);
        return overallHealth === healthLevel;
    });
}

function getTeamsByIndicator(indicator) {
    return Object.keys(boardData.teams).filter(teamName => {
        const team = boardData.teams[teamName];
        return team[indicator] === 'at-risk';
    });
}

// Updated function to get health level color
function getHealthLevelColor(healthLevel) {
    const colors = {
        'healthy': 'var(--accent-green)',
        'low-risk': 'var(--accent-orange)', 
        'high-risk': '#FF5F1F',
        'critical': 'var(--accent-red)'
    };
    return colors[healthLevel] || 'var(--text-primary)';
}

// Updated function to create mini team cards with all 6 dimensions
function createMiniTeamCard(teamName) {
    const teamData = boardData.teams[teamName];
    const healthIcon = getHealthIcon(teamData);
    const healthStatus = getTeamOverallHealth(teamData);
    const pillStyle = getTeamHealthPillStyle(teamData);
    
    return `
        <div class="team-health-card-mini ${pillStyle.replace('hover:bg-', 'hover:scale-105 hover:bg-')} cursor-pointer transition-all duration-200"
             onclick="closeModal(); setTimeout(() => showTeamModal('${teamName}', boardData.teams['${teamName}']), 100);"
             style="padding: 10px; border-radius: 8px; min-height: 160px; max-width: 200px;">
            
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
                <div class="font-bold text-xs leading-tight pr-2" style="line-height: 1.2;">${teamName}</div>
                <div class="text-lg flex-shrink-0">${healthIcon}</div>
            </div>
            
            <!-- Health Status -->
            <div class="text-sm font-bold mb-3 text-center ${getHealthStatusTextColor(healthStatus)}">
                ${healthStatus.replace('-', ' ').toUpperCase()}
            </div>
            
            <!-- Health Indicators - All 6 Dimensions -->
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <span>Capacity</span>
                    ${getHealthIndicatorIcon(teamData.capacity)}
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span>Skillset</span>
                    ${getHealthIndicatorIcon(teamData.skillset)}
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span>Vision</span>
                    ${getHealthIndicatorIcon(teamData.vision)}
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span>Support</span>
                    ${getHealthIndicatorIcon(teamData.support)}
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span>Team Cohesion</span>
                    ${getHealthIndicatorIcon(teamData.teamwork)}
                </div>
                <div class="flex items-center justify-between text-xs">
                    <span>Autonomy</span>
                    ${getHealthIndicatorIcon(teamData.autonomy)}
                </div>
            </div>
        </div>
    `;
}

      
// Updated function for health status text colors
function getHealthStatusTextColor(healthStatus) {
    const colors = {
        'healthy': 'text-green-700',
        'low-risk': 'text-yellow-700', 
        'high-risk': 'text-orange-700',
        'critical': 'text-red-700'
    };
    return colors[healthStatus] || 'text-gray-700';
}

function getHealthIndicatorIcon(status) {
    if (status === 'healthy') {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49"/>
            <path d="M15 15h6"/>
            <path d="M18 12v6"/>
        </svg>`;
    } else {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m14.876 18.99-1.368 1.323a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.244 1.572"/>
            <path d="M15 15h6"/>
        </svg>`;
    }
}

function getTeamNotes(teamName, teamData) {
    const notes = [];
    
    // Check for at-risk conditions and add relevant notes
    if (isDimensionAtRisk(teamData.capacity)) {
        notes.push('Capacity Risk: Team operating at high utilization. Consider redistributing workload.');
    }
    
    if (isDimensionAtRisk(teamData.skillset)) {
        notes.push('Skillset Gap: Team may need training in emerging technologies.');
    }
    
    if (teamData.leadership === 'at-risk') {
        notes.push('Leadership Concern: Management transitions may be impacting effectiveness.');
    }
    
    // Add specific team notes (you can customize these based on your data)
    const specificNotes = {
        'Business Operations': ['Undergoing process transformation requiring change management support.'],
        'Developer Relations': ['High external engagement affecting internal project capacity.'],
        'Security': ['Increased compliance requirements requiring skill development.'],
        'Data Engineering': ['Critical infrastructure scaling causing capacity strain.'],
        'Machine Learning': ['Rapidly evolving ML landscape requiring continuous learning.'],
        'Mobile Development': ['Platform fragmentation creating technical challenges.']
    };
    
    if (specificNotes[teamName]) {
        notes.push(...specificNotes[teamName]);
    }
    
    return notes;
}

// Complete rewrite of KPI modal functions using Chart.js instead of SVG

// Updated KPI Detail Modal functions to use live Jira data

// Enhanced function to convert live Jira Value History to chart data
function convertJiraHistoryToChartData(kpi, valueHistory) {
    console.log(`Converting Jira history for KPI: ${kpi.title}`, kpi);
    
    // Find Value History records that match this KPI's parent Key Result
    const krHistoryRecords = valueHistory.filter(vh => {
        const parentOKR = getFieldValue(vh, 'customfield_10162');
        // Match by the KPI's key (assuming KPI object has the Jira key)
        return parentOKR === kpi.key;
    });
    
    console.log(`Found ${krHistoryRecords.length} Value History records for ${kpi.title}`);
    
    if (krHistoryRecords.length === 0) {
        // No history data - create a simple progression to current value
        console.log(`No history data for ${kpi.title}, creating fallback data`);
        return createFallbackChartData(kpi);
    }
    
    // Sort by change date and extract values
    const sortedHistory = krHistoryRecords
        .map(record => ({
            date: getFieldValue(record, 'customfield_10159'),
            value: parseFloat(getFieldValue(record, 'customfield_10158')) || 0
        }))
        .filter(record => record.date && !isNaN(record.value))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log(`Sorted ${sortedHistory.length} valid history points:`, sortedHistory);
    
    if (sortedHistory.length === 0) {
        return createFallbackChartData(kpi);
    }
    
    // Ensure we have current value as the latest point if not already there
    const currentValue = parseFloat(kpi.currentValue) || 0;
    const lastHistoryValue = sortedHistory[sortedHistory.length - 1]?.value || 0;
    
    // Add current value as today's data point if it's different from the last recorded value
    if (Math.abs(lastHistoryValue - currentValue) > 0.01) {
        const today = new Date().toISOString().slice(0, 10);
        sortedHistory.push({
            date: today,
            value: currentValue
        });
    }
    
    // Create 30-day chart data from the actual history
    const chartData = [];
    const endDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const chartDate = new Date(endDate);
        chartDate.setDate(chartDate.getDate() - i);
        const chartDateStr = chartDate.toISOString().slice(0, 10);
        
        // Find the most recent value up to this date
        let value = 0;
        for (const historyPoint of sortedHistory) {
            if (historyPoint.date <= chartDateStr) {
                value = historyPoint.value;
            } else {
                break;
            }
        }
        
        chartData.push({
            date: chartDateStr,
            value: value
        });
    }
    
    console.log(`Generated 30-day chart data:`, chartData.slice(-5)); // Log last 5 points
    return chartData;
}

// Fallback data creation when no Jira history exists
function createFallbackChartData(kpi) {
    const currentValue = parseFloat(kpi.currentValue) || 0;
    const targetValue = parseFloat(kpi.targetValue) || 100;
    
    // Create a realistic progression showing growth to current value
    const chartData = [];
    const endDate = new Date();
    const startValue = Math.max(0, currentValue * 0.6); // Start at 60% of current value
    
    for (let i = 29; i >= 0; i--) {
        const chartDate = new Date(endDate);
        chartDate.setDate(chartDate.getDate() - i);
        const chartDateStr = chartDate.toISOString().slice(0, 10);
        
        // Create gradual progression to current value
        const progress = (29 - i) / 29;
        const value = startValue + (progress * (currentValue - startValue));
        
        chartData.push({
            date: chartDateStr,
            value: Math.round(value * 100) / 100
        });
    }
    
    console.log(`Created fallback chart data ending at ${currentValue}`);
    return chartData;
}

// Add this function before your showKpiChart function
function calculateTrendline(data) {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((_, i) => slope * i + intercept);
}

function showKpiChart(kpi, chartData) {
    const container = document.getElementById('kpiModalBody');
    if (!container) {
        console.error('Missing container #kpiModalBody in your HTML.');
        return;
    }

    if (!window.Chart) {
        console.error('Chart.js not found. Include it before script.js.');
        return;
    }

    // Build the canvas (fresh each time)
    container.innerHTML = `
        <div style="position:relative; width:100%; height:200px;">
            <canvas id="kpiChartCanvas" style="width:100%; height:200px;"></canvas>
        </div>
    `;
    const canvas = document.getElementById('kpiChartCanvas');
    if (!canvas) return;

    // Normalize the data
    const { labels, values } = normalize30DaySeries(chartData);

    // Format values based on KPI unit
    const unit = (kpi && kpi.unit) ? String(kpi.unit) : '';
    const isPercent = unit === '%' || unit.toLowerCase().includes('percent');
    const format = (v) => {
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);
        return isPercent ? `${n.toFixed(1)}%` : n.toFixed(1);
    };

    // Destroy old chart if present
    if (window._kpiChart) {
        window._kpiChart.destroy();
        window._kpiChart = null;
    }

    // Create gradient that matches your color palette
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    
    // Use indigo gradient - sophisticated and matches your theme
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');

    // Calculate Y-axis range to include target
    const target = parseFloat(kpi.targetValue) || 0;
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const yMin = Math.min(dataMin - Math.abs(dataMin * 0.1), target - Math.abs(target * 0.1));
    const yMax = Math.max(dataMax + Math.abs(dataMax * 0.1), target + Math.abs(target * 0.1));
    console.log('Y-axis forced range:', yMin, 'to', yMax, '| target:', target);

    // Create the line chart with improved styling
    window._kpiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
    label: (kpi && kpi.title) || 'KPI',
    data: values,
    borderColor: '#6366f1',  // Indigo line
    backgroundColor: gradient,
    tension: 0.4,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: '#f59e0b',  // Orange data points
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointHoverBackgroundColor: '#f59e0b',
    pointHoverBorderColor: '#ffffff',
    pointHoverBorderWidth: 3
}, {
    label: 'Trend',
    data: calculateTrendline(values),
    borderColor: '#ef4444',  // Red trendline
    borderDash: [5, 5],      // Dotted pattern
    borderWidth: 2,
    fill: false,
    pointRadius: 0,          // No points on trendline
    pointHoverRadius: 0,
    tension: 0               // Straight line
}]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { 
                mode: 'nearest', 
                intersect: false,
                axis: 'x'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 35, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e5e7eb',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: (context) => {
                            if (chartData && chartData[context[0].dataIndex] && chartData[context[0].dataIndex].date) {
                                const date = new Date(chartData[context[0].dataIndex].date);
                                return date.toLocaleDateString(undefined, { 
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                            }
                            return context[0].label;
                        },
                        label: (ctx) => `Value: ${format(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.08)',
                        drawBorder: false
                    },
                    ticks: { 
                        autoSkip: true, 
                        maxTicksLimit: 6,
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.08)', 
                        drawBorder: false 
                    },
                    ticks: { 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        font: { size: 11 }, 
                        callback: (v) => format(v) 
                    },
                    border: { 
                        display: false 
                    }
                }
            }
        },
        plugins: [{
            id: 'annotationLine',
            afterDraw(chart) {
                console.log('PLUGIN IS RUNNING!');
                const target = parseFloat(kpi.targetValue) || 0;
                console.log('Plugin using live target:', target);
                const { ctx, chartArea, scales: { y } } = chart;
                const yPx = y.getPixelForValue(target);
                
                ctx.save();
                ctx.strokeStyle = '#10b981'; // Green target line
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, yPx);
                ctx.lineTo(chartArea.right, yPx);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = '#10b981';
                ctx.font = '11px sans-serif';
                ctx.fillText(`Target (${format(target)})`, chartArea.right - 110, yPx - 6);
                ctx.restore();
            }
        }]
    });
}



function calculateLiveKPIProjections(kpi, chartData) {
    console.log('Calculating projections for live KPI:', kpi.title);
    
    const currentValue = parseFloat(kpi.currentValue) || 0;
    const targetValue = parseFloat(kpi.targetValue) || 100;
    const unit = kpi.unit || '';
    
    // Q3 2025 ends on September 30, 2025
    const q3EndDate = new Date('2025-09-30');
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((q3EndDate - today) / (1000 * 60 * 60 * 24)));
    const weeksRemaining = Math.max(0.1, daysRemaining / 7); // Minimum 0.1 to avoid division by zero
    
    // If no chart data, return basic info
    if (!chartData || chartData.length < 2) {
        const requiredChange = targetValue - currentValue;
        const requiredWeeklyPace = daysRemaining > 0 ? requiredChange / weeksRemaining : 0;
        
        return {
            velocity: 'No trend data',
            projectedValue: `${currentValue}${unit}`,
            requiredPace: formatChange(requiredWeeklyPace, unit),
            onTrack: currentValue >= targetValue * 0.9,
            shortfall: currentValue < targetValue ? `${Math.abs(targetValue - currentValue).toFixed(1)}${unit} below target` : '',
            paceChange: 'Need more data points',
            daysRemaining: daysRemaining,
            lastUpdated: 'Just now',
            dataQuality: 75
        };
    }
    
    // Get the actual data points sorted by date
    const sortedData = chartData
        .filter(d => d.date && !isNaN(d.value))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedData.length < 2) {
        const requiredChange = targetValue - currentValue;
        const requiredWeeklyPace = daysRemaining > 0 ? requiredChange / weeksRemaining : 0;
        
        return {
            velocity: 'Insufficient data',
            projectedValue: `${currentValue}${unit}`,
            requiredPace: formatChange(requiredWeeklyPace, unit),
            onTrack: currentValue >= targetValue * 0.9,
            shortfall: '',
            paceChange: 'Collect more data points',
            daysRemaining: daysRemaining,
            lastUpdated: 'Just now',
            dataQuality: 50
        };
    }
    
    // Calculate ACTUAL velocity using linear regression on recent data points
    // Use last 5 data points for more accurate trend, or all if less than 5
    const recentData = sortedData.slice(-Math.min(5, sortedData.length));
    
    // Linear regression calculation
    const n = recentData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    recentData.forEach((point, index) => {
        const x = index; // Use array index as x-value for trend calculation
        const y = point.value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });
    
    // Calculate slope (daily rate of change)
    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
    
    // Convert to time-based rate
    const firstPoint = recentData[0];
    const lastPoint = recentData[recentData.length - 1];
    const daysBetween = Math.max(1, (new Date(lastPoint.date) - new Date(firstPoint.date)) / (1000 * 60 * 60 * 24));
    
    // Calculate actual daily rate from the data
    const actualDailyRate = slope * (n - 1) / Math.max(1, daysBetween);
    const weeklyRate = actualDailyRate * 7;
    
    // Calculate projection to Q3 end
    const projectedValue = currentValue + (actualDailyRate * daysRemaining);
    
    // Calculate required pace to hit target
    const requiredChange = targetValue - currentValue;
    const requiredWeeklyPace = daysRemaining > 0 ? requiredChange / weeksRemaining : 0;
    
    // Determine if on track - projected value must meet or exceed target
    // Only allow small buffer (1%) for rounding/measurement precision
    const onTrackThreshold = targetValue * 0.99;
    const isOnTrack = projectedValue >= targetValue;
    
    // Calculate data quality based on recency and consistency
    const lastUpdateDate = new Date(lastPoint.date);
    const daysSinceUpdate = Math.max(0, (today - lastUpdateDate) / (1000 * 60 * 60 * 24));
    
    // Data quality factors: recency (50%), consistency (30%), completeness (20%)
    const recencyScore = Math.max(0, 100 - (daysSinceUpdate * 10)); // Lose 10 points per day
    const consistencyScore = calculateConsistencyScore(recentData);
    const completenessScore = Math.min(100, (sortedData.length / 10) * 100); // Full score at 10+ points
    
    const dataQuality = Math.round(
        (recencyScore * 0.5) + (consistencyScore * 0.3) + (completenessScore * 0.2)
    );
    
    // Format last updated
    const lastUpdated = daysSinceUpdate < 1 ? 'Today' : 
                       daysSinceUpdate < 2 ? 'Yesterday' : 
                       `${Math.round(daysSinceUpdate)} days ago`;
    
    // Calculate pace change needed
    const paceGap = requiredWeeklyPace - weeklyRate;
    let paceChange;
    if (Math.abs(paceGap) < 0.01) {
        paceChange = 'Maintain current pace';
    } else if (paceGap > 0) {
        paceChange = `Increase by ${formatChange(paceGap, unit)} per week`;
    } else {
        paceChange = `Can reduce pace by ${formatChange(Math.abs(paceGap), unit)} per week`;
    }
    
    return {
        velocity: formatChange(weeklyRate, unit),
        projectedValue: `${Math.round(projectedValue * 100) / 100}${unit}`,
        requiredPace: formatChange(requiredWeeklyPace, unit),
        onTrack: isOnTrack,
        shortfall: !isOnTrack ? `${Math.abs(targetValue - projectedValue).toFixed(1)}${unit} projected shortfall` : '',
        paceChange: paceChange,
        daysRemaining: daysRemaining,
        lastUpdated: lastUpdated,
        dataQuality: Math.max(0, Math.min(100, dataQuality))
    };
}

// Helper function to format change values
function formatChange(value, unit) {
    if (!value || isNaN(value)) return '0';
    
    const absValue = Math.abs(value);
    const sign = value >= 0 ? '+' : '-';
    
    if (unit === '%') {
        return `${sign}${absValue.toFixed(1)}pp per week`;
    } else {
        return `${sign}${absValue.toFixed(1)} per week`;
    }
}

// Helper function to calculate consistency score based on data variance
function calculateConsistencyScore(data) {
    if (data.length < 3) return 70; // Default for limited data
    
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;
    
    // Lower coefficient of variation = higher consistency score
    // CV of 0-5% = 100 points, 5-15% = 80 points, 15-30% = 60 points, >30% = 40 points
    if (coefficientOfVariation <= 5) return 100;
    if (coefficientOfVariation <= 15) return 80;
    if (coefficientOfVariation <= 30) return 60;
    return 40;
}

// Function to show Data Quality explanation modal
function showDataQualityModal(dataQuality) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('data-quality-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'data-quality-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px;">
                <div class="modal-header" style="padding: 20px 24px 0; border-bottom: none;">
                    <h3 style="color: var(--text-primary); margin: 0; font-size: 18px; font-weight: 600;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 8px;">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                        </svg>
                        Data Quality Score: ${dataQuality}%
                    </h3>
                    <button onclick="closeDataQualityModal()" class="modal-close" style="position: absolute; top: 16px; right: 20px; background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18"/>
                            <path d="M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body" style="padding: 16px 24px 24px;">
                    <p style="color: var(--text-secondary); margin: 0 0 16px; line-height: 1.5;">
                        Data Quality measures how reliable our projections are based on three factors:
                    </p>
                    <div style="space-y: 12px;">
                        <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
                            <div style="background: var(--accent-primary); border-radius: 4px; padding: 2px 6px; font-size: 11px; color: white; font-weight: 500; min-width: 35px; text-align: center;">50%</div>
                            <div>
                                <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 2px;">Recency</div>
                                <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.4;">How recently was data last updated. Loses 10 points per day since last update.</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
                            <div style="background: var(--accent-green); border-radius: 4px; padding: 2px 6px; font-size: 11px; color: white; font-weight: 500; min-width: 35px; text-align: center;">30%</div>
                            <div>
                                <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 2px;">Consistency</div>
                                <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.4;">How stable the trend is. Lower variance in recent data points = higher score.</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <div style="background: var(--accent-blue); border-radius: 4px; padding: 2px 6px; font-size: 11px; color: white; font-weight: 500; min-width: 35px; text-align: center;">20%</div>
                            <div>
                                <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 2px;">Completeness</div>
                                <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.4;">Number of data points available. Full score at 10+ historical data points.</div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; padding: 12px; background: var(--surface-secondary); border-radius: 8px; border-left: 3px solid var(--accent-primary);">
                        <div style="color: var(--text-primary); font-weight: 500; font-size: 13px; margin-bottom: 4px;">Quality Ranges:</div>
                        <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.3;">
                            <strong>90-100%:</strong> Excellent - Very reliable projections<br>
                            <strong>70-89%:</strong> Good - Reasonably reliable<br>
                            <strong>50-69%:</strong> Fair - Use with caution<br>
                            <strong>Below 50%:</strong> Poor - Projections may be inaccurate
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target.id === 'data-quality-modal') {
                closeDataQualityModal();
            }
        });
    }
    
    // Show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
}

// Function to close Data Quality modal
function closeDataQualityModal() {
    const modal = document.getElementById('data-quality-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Fixed openKPIDetailModal function that handles errors gracefully
async function openKPIDetailModal(kpi) {
    console.log('Opening KPI Detail Modal with live data:', kpi);
    window.currentKPIForEdit = kpi;
    
    const modal = document.getElementById('kpi-detail-modal');
    const title = document.getElementById('kpi-detail-modal-title');
    const content = document.getElementById('kpi-detail-modal-content');
    
    if (!modal || !title || !content) {
        console.error('Modal elements not found');
        return;
    }
    
    title.textContent = kpi.title;
    
   
    
    // Try to fetch live Jira data, but don't block the modal if it fails
    let chartData = [];
    let dataSource = 'fallback';
    
    try {
        console.log('Attempting to fetch live Jira data...');
        const { valueHistory } = await fetchKeyResultsData();
        chartData = convertJiraHistoryToChartData(kpi, valueHistory);
        dataSource = 'live';
        console.log('Using live Jira data for chart:', chartData.length, 'data points');
    } catch (error) {
        console.error('Failed to fetch live data, using fallback:', error);
        chartData = createFallbackChartData(kpi);
        dataSource = 'fallback';
    }
    
     // First, calculate projection data (this was causing the error)
    const projectionData = calculateLiveKPIProjections(kpi, chartData);
    
    content.innerHTML = `
    <div class="space-y-6">
        <!-- Two Column Layout for Key Metrics and Projections -->
        <div class="grid gap-6 md:grid-cols-2">
            <!-- Left Column - Current State -->
            <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Current Performance
                </h3>
                
                <div class="space-y-4">
                    <div class="flex justify-between items-center p-4 rounded-lg" style="background: var(--bg-tertiary);">
                        <div>
                            <div class="text-sm" style="color: var(--text-secondary);">Current Value</div>
                            <div class="text-2xl font-bold" style="color: var(--text-primary);">${kpi.currentValue}${kpi.unit || ''}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm" style="color: var(--text-secondary);">Target</div>
                            <div class="text-2xl font-bold" style="color: var(--accent-primary);">${kpi.targetValue}${kpi.unit || ''}</div>
                        </div>
                    </div>
                    
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary);">
                        <div class="text-sm mb-2" style="color: var(--text-secondary);">Progress to Target</div>
                        <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
                            <div class="h-3 rounded-full transition-all duration-500" 
                                 style="width: ${Math.min(kpi.progress || 0, 100)}%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-primary-hover));"></div>
                        </div>
                        <div class="text-xl font-semibold" style="color: var(--text-primary);">${Math.round(kpi.progress || 0)}%</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-xs mb-2 flex items-center justify-center gap-1" style="color: var(--text-secondary);">
    <span>Data Quality: ${projectionData.dataQuality}%</span>
    <button onclick="showDataQualityModal(${projectionData.dataQuality})" 
            class="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
            title="How is Data Quality calculated?"
            style="color: var(--accent-primary);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="16" y2="12"/>
            <line x1="12" x2="12.01" y1="8" y2="8"/>
        </svg>
    </button>
    <span>• Last Updated: ${projectionData.lastUpdated}</span>
</div>
                        <button onclick="closeKPIDetailModal(); setTimeout(() => openKPIEditModal(window.currentKPIForEdit), 100);" 
                                class="px-3 py-1 rounded text-xs hover:bg-opacity-90 mt-3" 
                                style="background: var(--accent-primary); color: white;">
                            Update Current Key Result Value
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Right Column - Projections & Insights -->
            <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                        <path d="M7 11h8"/>
                        <path d="M7 16h12"/>
                        <path d="M7 6h16"/>
                    </svg>
                    Trajectory Analysis
                </h3>
                
                <div class="space-y-4">
                    <div class="p-4 rounded-lg" style="background: ${projectionData.onTrack ? 'var(--status-success-bg)' : 'rgba(239, 68, 68, 0.15)'}; border-left: 4px solid ${projectionData.onTrack ? 'var(--status-success)' : 'var(--accent-red)'};">
                        <div class="text-sm font-medium mb-1" style="color: var(--text-primary);">${projectionData.onTrack ? '✓ On Track' : '⚠ At Risk'}</div>
                        <div class="text-xs" style="color: var(--text-secondary);">${projectionData.onTrack ? projectionData.paceChange : projectionData.shortfall}</div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-center p-3 rounded-lg" style="background: var(--bg-tertiary);">
                            <div class="text-lg font-bold" style="color: var(--text-primary);">${projectionData.velocity}</div>
                            <div class="text-xs" style="color: var(--text-secondary);">Current Velocity</div>
                        </div>
                        <div class="text-center p-3 rounded-lg" style="background: var(--bg-tertiary);">
                            <div class="text-lg font-bold" style="color: var(--text-primary);">${projectionData.requiredPace}</div>
                            <div class="text-xs" style="color: var(--text-secondary);">Required Pace</div>
                        </div>
                    </div>
                    
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary);">
                        <div class="text-sm mb-2" style="color: var(--text-secondary);">Projected Final Value</div>
                        <div class="text-xl font-bold" style="color: var(--text-primary);">${projectionData.projectedValue}</div>
                        <div class="text-xs mt-1" style="color: var(--text-tertiary);">${projectionData.daysRemaining} days remaining</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Full-Width Trend Chart Section spanning both columns -->
        <div class="w-full" style="min-height: 280px;">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
                Performance Trend
                ${dataSource === 'live' ? 
                    '<span class="text-xs px-2 py-1 rounded" style="background: var(--status-success-bg); color: var(--status-success);">LIVE</span>' : 
                    '<span class="text-xs px-2 py-1 rounded" style="background: rgba(239, 68, 68, 0.15); color: var(--accent-red);">DEMO</span>'
                }
            </h3>
            
            <div class="p-4 rounded-lg w-full" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary); min-height: 220px;">
                <div id="kpiModalBody" style="position: relative; height: 200px; width: 100%;">
                    <canvas id="kpiChart" width="100%" height="200"></canvas>
                </div>
            </div>
            
            <div class="text-xs mt-2 text-center" style="color: var(--text-tertiary);">
                ${chartData.length} data points ${dataSource === 'live' ? 'from Jira Value History • Updated in real-time' : '• Demo data for presentation'}
            </div>
        </div>
    </div>
    `;
    
    // Increase modal height to accommodate chart
    modal.style.maxHeight = '95vh';
    modal.style.height = 'auto';
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflow = 'auto';
    }
    
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Now create the chart using the data (live or fallback)
    setTimeout(() => {
        try {
            showKpiChart(kpi, chartData);
        } catch (chartError) {
            console.error('Error creating chart:', chartError);
            // If chart fails, show a simple message
            const chartContainer = document.getElementById('kpiModalBody');
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div class="flex items-center justify-center h-full text-center" style="color: var(--text-secondary);">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 opacity-50">
                                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                            </svg>
                            <div class="text-sm">Chart temporarily unavailable</div>
                            <div class="text-xs mt-1">Data: ${kpi.currentValue}${kpi.unit || ''} → ${kpi.targetValue}${kpi.unit || ''}</div>
                        </div>
                    </div>
                `;
            }
        }
    }, 100);
    
    // Focus the close button
    setTimeout(() => {
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
    }, 200);
}

// Also add the helper function that might be missing
function createFallbackChartData(kpi) {
    const currentValue = parseFloat(kpi.currentValue) || 0;
    const targetValue = parseFloat(kpi.targetValue) || 100;
    
    // Create a realistic progression showing growth to current value
    const chartData = [];
    const endDate = new Date();
    const startValue = Math.max(0, currentValue * 0.6); // Start at 60% of current value
    
    for (let i = 29; i >= 0; i--) {
        const chartDate = new Date(endDate);
        chartDate.setDate(chartDate.getDate() - i);
        const chartDateStr = chartDate.toISOString().slice(0, 10);
        
        // Create gradual progression to current value
        const progress = (29 - i) / 29;
        const value = startValue + (progress * (currentValue - startValue));
        
        chartData.push({
            date: chartDateStr,
            value: Math.round(value * 100) / 100
        });
    }
    
    console.log(`Created fallback chart data ending at ${currentValue}`);
    return chartData;
}

// Complete Chart.js implementation with all missing functions

// Helper function to normalize 30-day data series
function normalize30DaySeries(series) {
    console.log('Normalizing data series:', series);
    
    if (Array.isArray(series) && series.length) {
        // Case A: objects with {date, value}
        if (typeof series[0] === 'object' && series[0] !== null && 'value' in series[0]) {
            const labels = series.map(d => labelFromDateString(d.date));
            const values = series.map(d => Number(d.value) || 0);
            console.log('Normalized object series:', { labels: labels.slice(-5), values: values.slice(-5) });
            return { labels, values };
        }
        // Case B: plain numbers
        if (typeof series[0] === 'number') {
            const labels = last30DayLabels();
            const values = series.map(v => Number(v) || 0);
            console.log('Normalized number series:', { labels: labels.slice(-5), values: values.slice(-5) });
            return { labels, values };
        }
    }
    
    // Fallback: generate demo data
    console.log('Using fallback data for chart');
    const labels = last30DayLabels();
    const values = Array.from({ length: 30 }, (_, i) => {
        // Create a realistic progression
        const progress = i / 29;
        return Math.round((50 + progress * 30 + Math.sin(i * 0.3) * 5) * 10) / 10;
    });
    return { labels, values };
}

// Generate last 30 day labels
function last30DayLabels() {
    return Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
}

// Convert date string to readable label
function labelFromDateString(s) {
    if (!s) return '';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Convert color to rgba with alpha
function withAlpha(color, alpha) {
    if (!color) return `rgba(139, 92, 246, ${alpha})`; // Default to accent-primary
    
    // Handle CSS variables
    if (color.includes('var(')) {
        // Map CSS variables to actual colors
        const colorMap = {
            'var(--accent-primary)': '#8b5cf6',
            'var(--accent-green)': '#10b981',
            'var(--accent-blue)': '#3b82f6',
            'var(--accent-orange)': '#f59e0b',
            'var(--accent-red)': '#ef4444'
        };
        color = colorMap[color] || '#8b5cf6';
    }
    
    // #rrggbb -> rgba(r,g,b,alpha)
    if (/^#([0-9a-f]{6})$/i.test(color)) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Already rgb/rgba – modify alpha
    if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (color.startsWith('rgba(')) {
        return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    
    // Fallback
    return `rgba(139, 92, 246, ${alpha})`;
}

// Note: targetLinePlugin already exists in your script.js, so we'll use that one

// Main chart creation function
// SIMPLE FIX: Replace these specific functions in your script.js



// 2. Fix convertJiraHistoryToChartData to return ONLY actual data points
function convertJiraHistoryToChartData(kpi, valueHistory) {
    console.log(`Converting Jira history for KPI: ${kpi.title}`);
    
    if (!valueHistory || valueHistory.length === 0) {
        console.log('No value history, returning minimal data');
        return createSimpleFallback(kpi);
    }
    
    // Find matching Value History records
    const krHistoryRecords = valueHistory.filter(vh => {
        const parentOKR = getFieldValue(vh, 'customfield_10162');
        return parentOKR === kpi.key;
    });
    
    console.log(`Found ${krHistoryRecords.length} Value History records`);
    
    if (krHistoryRecords.length === 0) {
        return createSimpleFallback(kpi);
    }
    
    // Convert to chart data - ACTUAL POINTS ONLY
    const chartData = krHistoryRecords
        .map(record => ({
            date: getFieldValue(record, 'customfield_10159'),
            value: parseFloat(getFieldValue(record, 'customfield_10158')) || 0
        }))
        .filter(record => record.date && !isNaN(record.value))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add current value if different from last
    const currentValue = parseFloat(kpi.currentValue) || 0;
    if (chartData.length === 0 || Math.abs(chartData[chartData.length - 1].value - currentValue) > 0.01) {
        chartData.push({
            date: new Date().toISOString().slice(0, 10),
            value: currentValue
        });
    }
    
    console.log(`Returning ${chartData.length} ACTUAL data points:`, chartData);
    return chartData;
}

// 3. Simple fallback that creates minimal realistic data
function createSimpleFallback(kpi) {
    const currentValue = parseFloat(kpi.currentValue) || 0;
    const today = new Date();
    
    return [
        {
            date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: Math.round(currentValue * 0.8 * 100) / 100
        },
        {
            date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: Math.round(currentValue * 0.9 * 100) / 100
        },
        {
            date: today.toISOString().slice(0, 10),
            value: currentValue
        }
    ];
}

function closeKPIDetailModal() {
    const modal = document.getElementById('kpi-detail-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    currentKPIDetail = null;
}
      
// ADD THE CLICK-OUTSIDE CODE HERE:
document.addEventListener('DOMContentLoaded', function() {
    const kpiDetailModal = document.getElementById('kpi-detail-modal');
    const kpiEditModal = document.getElementById('kpi-edit-modal');
    
    // KPI Detail Modal click outside to close
    if (kpiDetailModal) {
        kpiDetailModal.addEventListener('click', function(e) {
            if (e.target.id === 'kpi-detail-modal') {
                closeKPIDetailModal();
            }
        });
    }
    
    // KPI Edit Modal click outside to close
    if (kpiEditModal) {
        kpiEditModal.addEventListener('click', function(e) {
            if (e.target.id === 'kpi-edit-modal') {
                closeKPIEditModal();
            }
        });
    }
});


      
function incrementKPIValue() {
    const input = document.getElementById('kpi-current-value');
    const currentValue = parseInt(input.value) || 0;
    const step = parseInt(input.step) || 1;
    input.value = currentValue + step;
}

function decrementKPIValue() {
    const input = document.getElementById('kpi-current-value');
    const currentValue = parseInt(input.value) || 0;
    const step = parseInt(input.step) || 1;
    input.value = Math.max(0, currentValue - step);
}
       
async function init() {
    // Cache frequently accessed DOM elements
    const detailModal = document.getElementById('detail-modal');
    
    // Initialize accessibility features
    initKeyboardNavigation();
    
    // Set initial ARIA attributes
    detailModal.setAttribute('aria-hidden', 'true');
    detailModal.setAttribute('aria-labelledby', 'modal-title');
    detailModal.setAttribute('aria-describedby', 'modal-content');
    detailModal.setAttribute('role', 'dialog');
    detailModal.setAttribute('aria-modal', 'true');
    
    generatePyramid();
    generateTeamHealthMatrix();
    generateBentoGrid();
    ensureValidationCardStyles();
    initSearch();
    initSidebar();
    initFilterDrawers();
    initAccordions();
    initSidebarTooltips();
    
    // INITIALIZE SYNC OVERLAY FIRST (before any sync calls)
    await initializeSyncOverlay();
    removeFloatingManualSyncButton();
    setTimeout(addSyncButtonAnimation, 100);
    // NOW initialize smart sync (which will call syncWithJiraOnLoad)
    initSmartSync();
    initEssentialKeyboard();

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.initiative-card') && 
            !e.target.closest('.team-health-card') && 
            !e.target.closest('.modal-content') &&
            !e.target.closest('.clickable-item') &&
            !e.target.closest('.insight-card')) {
            clearHighlights();
        }
    });
    
    detailModal.addEventListener('click', function(e) {
        if (e.target.id === 'detail-modal') {
            closeModal();
        }
    });

    // Initialize chip bar positioning
handleChipBarResize();      
          
}

        document.addEventListener('click', function(e) {
            if (e.target.closest('.mendoza-line')) {
                const rect = e.target.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                // Check if click is in the approximate area of the ::before pseudo-element
                if (clickY >= -25 && clickY <= 5 && clickX >= rect.width/2 - 120 && clickX <= rect.width/2 + 120) {
                    window.open('https://en.wikipedia.org/wiki/Mendoza_Line#:~:text=The%20Mendoza%20Line%20is%20baseball,his%20nine%20big%20league%20seasons.', '_blank');
                }
            }
        });

        // Keyboard Navigation and Accessibility
let keyboardNavigationActive = false;
let currentFocusIndex = 0;
let focusableElements = [];
let currentFocusContext = 'pyramid'; // 'pyramid', 'teams', 'insights'

function initKeyboardNavigation() {
    // Removed temporarily - no keyboard navigation
}



function getCurrentFocusableElements() {
    return focusableElements[currentFocusContext] || [];
}

   
        // Search and Filter State
let searchState = {
    query: '',
    filters: {
        initiativeTypes: [],
        validationStatus: [],
        teamHealth: [],
        priorityRange: [],
        progressRange: { min: 0, max: 100 },
        teamFilters: {
            overallHealth: [],
            healthIndicators: [],
            utilizationRange: { min: 0, max: 100 }
        }
    },
    isFiltering: false
};

let searchIndex = [];

// Initialize Search Functionality
function initSearch() {
    buildSearchIndex();
    setupSearchEventListeners();
}

function buildSearchIndex() {
    searchIndex = [];
    
    // Index initiatives
boardData.initiatives.forEach(initiative => {
    searchIndex.push({
        type: 'initiative',
        id: initiative.id,
        title: initiative.title,
        searchText: `${initiative.title} ${initiative.type} ${initiative.validation} ${initiative.progress}% ${initiative.canvas?.outcome || ''} ${initiative.canvas?.problem || ''}`.toLowerCase(),  // Removed ${initiative.teams.join(' ')}
        data: initiative,
        priority: initiative.priority
    });
});
    
    // Index bullpen initiatives
boardData.bullpen.forEach((initiative, index) => {
    if (initiative) {
        searchIndex.push({
            type: 'initiative',
            id: initiative.id,
            title: initiative.title,
            searchText: `${initiative.title} ${initiative.type} ${initiative.validation} ${initiative.progress}% ${initiative.canvas?.outcome || ''} ${initiative.canvas?.problem || ''} bullpen`.toLowerCase(),  // Removed ${initiative.teams.join(' ')}
            data: initiative,
            priority: 'bullpen'
        });
    }
});
    
    // Index teams
    Object.keys(boardData.teams).forEach(teamName => {
        const team = boardData.teams[teamName];
        searchIndex.push({
            type: 'team',
            id: teamName,
            title: teamName,
            searchText: `${teamName} ${team.capacity} ${team.skillset} ${team.leadership} team`.toLowerCase(),
            data: team,
            teamName: teamName
        });
    });
    
    // Index completed initiatives
    boardData.recentlyCompleted.forEach(initiative => {
        searchIndex.push({
            type: 'completed',
            id: initiative.id,
            title: initiative.title,
            searchText: `${initiative.title} ${initiative.type} completed ${initiative.teams.join(' ')}`.toLowerCase(),
            data: initiative,
            completedDate: initiative.completedDate
        });
    });
}

function setupSearchEventListeners() {
    const searchInput = document.getElementById('global-search');
    const clearSearch = document.getElementById('clear-search');
    const suggestions = document.getElementById('search-suggestions');
    
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', handleSearchBlur);
    clearSearch.addEventListener('click', function() {
    document.getElementById('global-search').value = '';
    searchState.query = '';
    clearSearchResults();
    document.getElementById('clear-search').classList.add('hidden');
    hideSearchSuggestions();
});
    
    // Handle clicks outside suggestions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#global-search') && !e.target.closest('#search-suggestions')) {
            suggestions.classList.add('hidden');
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    searchState.query = query;
    
    const clearButton = document.getElementById('clear-search');
    if (query) {
        clearButton.classList.remove('hidden');
        showSearchSuggestions(query);
        performSearch();
    } else {
    clearButton.classList.add('hidden');
    hideSearchSuggestions();
    clearSearchResults();
    updateFilterChipBar(); // Update chip bar when search is cleared
}
}

function handleSearchFocus(e) {
    if (e.target.value.trim()) {
        showSearchSuggestions(e.target.value.trim());
    }
}

function handleSearchBlur(e) {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
        if (!document.querySelector('#search-suggestions:hover')) {
            hideSearchSuggestions();
        }
    }, 150);
}

function showSearchSuggestions(query) {
    const suggestions = document.getElementById('search-suggestions');
    const matches = searchForMatches(query, 8); // Limit to 8 suggestions
    
    if (matches.length === 0) {
        suggestions.classList.add('hidden');
        return;
    }
    
    // Add title header + suggestions
    suggestions.innerHTML = `
        <!-- Title Header -->
        <div class="px-4 py-3 border-b border-gray-200" style="background: var(--bg-elevated); border-bottom: 1px solid var(--border-primary);">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue);">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <span class="font-semibold text-sm" style="color: var(--text-primary);">Search Results</span>
                <span class="text-xs px-2 py-1 rounded" style="background: var(--accent-blue); color: white;">${matches.length}</span>
            </div>
        </div>
        
        <!-- Search Results -->
        ${matches.map(match => {
            // Get the appropriate label and color
            let typeLabel = match.type;
            let typeColor = getMatchTypeColor(match.type, match.data);
            
            if (match.type === 'initiative') {
                // Show initiative type instead of just "initiative"
                if (match.data && match.data.type) {
                    switch(match.data.type) {
                        case 'strategic': typeLabel = 'Strategic'; break;
                        case 'ktlo': typeLabel = 'KTLO/Tech'; break;
                        case 'emergent': typeLabel = 'Emergent'; break;
                        default: typeLabel = 'Initiative'; break;
                    }
                } else {
                    typeLabel = 'Initiative';
                }
            } else if (match.type === 'team') {
                typeLabel = 'Team';
            } else if (match.type === 'completed') {
                typeLabel = 'Completed';
            }
            
            return `
                <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                     onclick="selectSearchSuggestion('${match.type}', '${match.id}')">
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded font-medium ${typeColor}">${typeLabel}</span>
                        <span class="font-medium">${highlightMatch(match.title, query)}</span>
                    </div>
                    ${match.type === 'initiative' ? `<div class="text-xs text-gray-500 mt-1">Progress: ${match.data.progress}% • ${match.data.validation.replace('-', ' ')}</div>` : ''}
                    ${match.type === 'team' ? `<div class="text-xs text-gray-500 mt-1">Capacity: ${match.data.capacity} • Utilization: ${match.data.jira.utilization}%</div>` : ''}
                </div>
            `;
        }).join('')}
    `;
    
    suggestions.classList.remove('hidden');
}

function hideSearchSuggestions() {
    document.getElementById('search-suggestions').classList.add('hidden');
}

function searchForMatches(query, limit = 50) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const progressQuery = parseSearchQuery(query);
    
    return searchIndex
        .map(item => {
            let score = 0;
            let hasAllTerms = true;
            
            // Handle progress-specific searches
            if (progressQuery && item.type === 'initiative') {
                if (progressQuery.type === 'exact') {
                    if (Math.abs(item.data.progress - progressQuery.value) <= 5) {
                        score += 20; // High score for progress matches
                        hasAllTerms = true;
                    } else {
                        hasAllTerms = false;
                    }
                } else if (progressQuery.type === 'range') {
                    if (item.data.progress >= progressQuery.min && item.data.progress <= progressQuery.max) {
                        score += 20;
                        hasAllTerms = true;
                    } else {
                        hasAllTerms = false;
                    }
                }
            } else {
                // Regular text search
                searchTerms.forEach(term => {
                    if (item.searchText.includes(term)) {
                        // Exact match in title gets higher score
                        if (item.title.toLowerCase().includes(term)) {
                            score += 10;
                        } else {
                            score += 1;
                        }
                    } else {
                        hasAllTerms = false;
                    }
                });
            }
            
            return hasAllTerms ? { ...item, score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

function parseSearchQuery(query) {
    const progressMatch = query.match(/(\d+)%?/);
    const rangeMatch = query.match(/(\d+)-(\d+)%?/);
    
    if (rangeMatch) {
        return {
            type: 'range',
            min: parseInt(rangeMatch[1]),
            max: parseInt(rangeMatch[2])
        };
    } else if (progressMatch) {
        return {
            type: 'exact',
            value: parseInt(progressMatch[1])
        };
    }
    
    return null;
}        
        
function performSearch() {
    const query = searchState.query;
    if (!query) {
        clearSearchResults();
        return;
    }
    
    const matches = searchForMatches(query);
    displaySearchResults(matches);
    updateResultsCounter(matches.length);
    updateFilterChipBar(); // Update chip bar to show clear search option
}

function displaySearchResults(matches) {
    searchState.isFiltering = true;
    
    // Clear all highlights first
    clearAllHighlights();
    
    // Hide all elements initially
    hideAllElements();
    
    // Separate initiative matches from team matches
    const initiativeMatches = matches.filter(match => match.type === 'initiative');
    const teamMatches = matches.filter(match => match.type === 'team');
    
    // Show and highlight matching initiatives (this will highlight their team groups)
    initiativeMatches.forEach(match => {
        showAndHighlightInitiative(match);
    });
    
    // For team-only searches, highlight individual team cards without their initiatives
    if (teamMatches.length > 0 && initiativeMatches.length === 0) {
        // Pure team search - only highlight individual team cards
        teamMatches.forEach(match => {
            const teamName = match.teamName || match.id;
            document.querySelectorAll('.team-health-card').forEach(card => {
                if (card.dataset.teamName === teamName) {
                    card.classList.remove('search-dimmed');
                    card.classList.add('search-highlight');
                }
            });
        });
    }
    
    updateSearchUI(true);
}

function clearSearchResults() {
    searchState.isFiltering = false;
    searchState.query = '';
    
    // Clear all highlights and dims
    clearAllHighlights();
    showAllElements();
    updateSearchUI(false);
    updateResultsCounter(0);
    // DON'T update chip bar here - let the calling function handle it
}
      
function clearSearchResultsOnly() {
    // This version only clears search-related state, not filter chips
    searchState.isFiltering = false;
    searchState.query = '';
    
    // Clear all highlights and dims
    clearAllHighlights();
    showAllElements();
    updateSearchUI(false);
    updateResultsCounter(0);
    // Explicitly do NOT call updateFilterChipBar()
}

function clearAllHighlights() {
    let highlightedCount = 0;
    let dimmedCount = 0;
    
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
        highlightedCount++;
    });
    
    document.querySelectorAll('.search-dimmed').forEach(el => {
        el.classList.remove('search-dimmed');
        dimmedCount++;
    });
    
    // Also clear any other highlight classes that might interfere
    document.querySelectorAll('.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });
}

function hideAllElements() {
    // Dim all initiative cards
    let initiativeCards = 0;
    document.querySelectorAll('.initiative-card').forEach(card => {
        card.classList.add('search-dimmed');
        initiativeCards++;
    });
    
    // Dim all team cards
    let teamCards = 0;
    document.querySelectorAll('.team-health-card').forEach(card => {
        card.classList.add('search-dimmed');
        teamCards++;
    });
}

function showAllElements() {
    let restoredCount = 0;
    
    // Remove search-dimmed class from all elements
    document.querySelectorAll('.search-dimmed').forEach(el => {
        el.classList.remove('search-dimmed');
        restoredCount++;
    });
    
    // Remove search-highlight class from all elements
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
    });
}

function showAndHighlightInitiative(match) {
    const cards = document.querySelectorAll(`[data-initiative-id="${match.id}"]`);
    cards.forEach(card => {
        card.classList.remove('search-dimmed');
        card.classList.add('search-highlight');
    });
}

function showAndHighlightTeam(match) {
    const teamName = match.teamName || match.data?.teamName || match.id;
    const teamData = boardData.teams[teamName];
    
    if (!teamData) return;
    
    // FIXED: Only highlight individual team cards that match the search, not entire team groups
    document.querySelectorAll('.team-health-card').forEach(card => {
        const cardTeamName = card.dataset.teamName;
        
        // Only highlight this specific team card, regardless of which initiative group it's in
        if (cardTeamName === teamName) {
            card.classList.remove('search-dimmed');
            card.classList.add('search-highlight');
        }
    });
}

function selectSearchSuggestion(type, id) {
    hideSearchSuggestions();
    
    if (type === 'initiative') {
        const initiative = boardData.initiatives.find(init => init.id == id) || 
                          boardData.bullpen.find(init => init && init.id == id) ||
                          boardData.recentlyCompleted.find(init => init.id == id);
        if (initiative) {
            highlightInitiativeAndTeam(initiative.id);
            showInitiativeModal(initiative);
        }
    } else if (type === 'team') {
        const teamData = boardData.teams[id];
        if (teamData) {
            highlightTeamAndInitiatives(id);
            showTeamModal(id, teamData);
        }
    }
}

function updateResultsCounter(count) {
    // Also update any visible counter elements if they exist
    const counterElements = document.querySelectorAll('[data-results-counter]');
    counterElements.forEach(element => {
        element.textContent = count;
    });
}

function updateSearchUI(isSearching) {
    // Add visual indication of filtering state if needed
    const filteringIndicators = document.querySelectorAll('[data-filtering-indicator]');
    filteringIndicators.forEach(indicator => {
        if (isSearching) {
            indicator.classList.add('filtering-active');
        } else {
            indicator.classList.remove('filtering-active');
        }
    });
}

function clearSearch() {
    document.getElementById('global-search').value = '';
    searchState.query = '';
    clearSearchResults();
    document.getElementById('clear-search').classList.add('hidden');
}

function getMatchTypeColor(type, data = null) {
    switch(type) {
        case 'initiative':
            if (data && data.type) {
                // Use initiative type colors
                switch(data.type) {
                    case 'strategic': return 'bg-teal-500 text-white';
                    case 'ktlo': return 'bg-violet-500 text-white';
                    case 'emergent': return 'bg-pink-500 text-white';
                    default: return 'bg-blue-500 text-white';
                }
            }
            return 'bg-blue-500 text-white';
        case 'team':
            if (data) {
                // Use team health colors
                let atRiskCount = 0;
                if (data.capacity === 'at-risk') atRiskCount++;
                if (data.skillset === 'at-risk') atRiskCount++;
                if (data.leadership === 'at-risk') atRiskCount++;
                
                switch(atRiskCount) {
                    case 0: return 'bg-green-500 text-white';   // Healthy
                    case 1: return 'bg-yellow-500 text-white';  // At Risk
                    case 2: return 'bg-orange-500 text-white';  // High Risk
                    case 3: return 'bg-red-500 text-white';     // Critical
                    default: return 'bg-green-500 text-white';
                }
            }
            return 'bg-green-500 text-white';
        case 'completed': 
            return 'bg-gray-500 text-white';
        default: 
            return 'bg-gray-500 text-white';
    }
}

function highlightMatch(text, query) {
    const terms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    terms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
}
    
// Sidebar Navigation Functionality
// Add this entire function right before your existing init() function
// ADD THIS LINE BEFORE the initSidebar function
let sidebarExpanded = false;

function initSidebar() {
    const sidebar = document.getElementById('sidebar-nav');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainContent = document.getElementById('main-content');
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    
    // Set initial toggle icon
setTimeout(() => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle && !sidebarExpanded) {
        sidebarToggle.innerHTML = `
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
        `;
    }
}, 100);
    
    // Toggle sidebar
    function toggleSidebar() {
        sidebarExpanded = !sidebarExpanded;
        
        if (sidebarExpanded) {
    sidebar.classList.add('expanded');
    sidebarOverlay.classList.add('active');
    mainContent.classList.add('sidebar-expanded');
    
    // Immediate blur enforcement
    const enforceBlur = () => {
        const blurValue = 'blur(24px) saturate(180%)';
        sidebar.style.setProperty('backdrop-filter', blurValue, 'important');
        sidebar.style.setProperty('-webkit-backdrop-filter', blurValue, 'important');
        sidebar.style.setProperty('filter', 'none', 'important');
        sidebar.style.setProperty('transform-style', 'preserve-3d', 'important');
    };
    
    // Apply blur multiple times with different delays
    enforceBlur();
    setTimeout(enforceBlur, 10);
    setTimeout(enforceBlur, 50);
    setTimeout(enforceBlur, 100);
    setTimeout(enforceBlur, 200);
            
            // For expanded state (left arrow)
sidebarToggle.innerHTML = `
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/>
    </svg>
`;
        } else {
            sidebar.classList.remove('expanded');
            sidebarOverlay.classList.remove('active');
            mainContent.classList.remove('sidebar-expanded');
            
            // For collapsed state (right arrow)  
sidebarToggle.innerHTML = `
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>
    </svg>
`;
        }
    // Update chip bar position based on sidebar state
setTimeout(() => {
    handleChipBarResize();
}, 50); // Small delay to ensure sidebar animation starts
    }
    
    function closeSidebar() {
        if (sidebarExpanded) {
            toggleSidebar();
        }
    }
    function expandSidebarFromIcon() {
    // Find the existing toggle button and simulate its click
    const toggleButton = document.getElementById('sidebar-toggle');
    if (toggleButton) {
        // Create and dispatch a click event
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        toggleButton.dispatchEvent(clickEvent);
    }
}
    
    // Event listeners
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Handle Add Initiative action
            if (this.dataset.action === 'add-initiative') {
                showAddInitiativeModal(1, 1);
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
                return;
            }
            
            if (this.dataset.action === 'manual-sync') {
    console.log('Manual sync triggered from sidebar');
    closeSidebar();
    triggerManualSync();
    return;
}
            
            // Handle filter drawer actions - now with navigation and sidebar collapse
if (this.dataset.action === 'open-portfolio-filter') {
    scrollToSection('initiatives'); // Navigate to initiatives section
    setTimeout(() => {
        openDrawer('portfolio'); // Open filter drawer after navigation
    }, 500); // Delay to allow scroll to complete
    closeSidebar(); // Always collapse sidebar after opening filter drawer
    return;
}

if (this.dataset.action === 'open-team-filter') {
    scrollToSection('teams'); // Navigate to team health section
    setTimeout(() => {
        openDrawer('team'); // Open filter drawer after navigation
    }, 500); // Delay to allow scroll to complete
    closeSidebar(); // Always collapse sidebar after opening filter drawer
    return;
}
          
    // Handle quick filter actions
if (this.dataset.action === 'quick-filter') {
    const filterType = this.dataset.filterType;
    const isActive = this.classList.contains('quick-filter-active');
    
    if (isActive) {
        // If already active, clear the filter
        clearQuickFilters();
    } else {
        // Apply the new filter
        applyQuickFilter(filterType);
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    return;
}

if (this.dataset.action === 'toggle-quick-filters') {
    // Expand sidebar to show quick filters
    if (!sidebarExpanded) {
        toggleSidebar();
    }
    return;
}
            
            // Remove active class from all items except add-initiative
            navItems.forEach(nav => {
                if (!nav.dataset.action) {
                    nav.classList.remove('active');
                }
            });
            
            // Add active class to clicked item
            if (!this.dataset.action) {
                this.classList.add('active');
            }
            
            // Get section and scroll to it
            const section = this.dataset.section;
            if (this.dataset.section) document.body.classList.add('show-board');
if (this.dataset.view === 'portfolio-pulse') document.body.classList.remove('show-board');
scrollToSection(section);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarExpanded) {
            closeSidebar();
        }
    });
    
}

// Scroll to sections function
function scrollToSection(section) {
    if (section === 'portfolio-pulse') return;
    
    // ... rest of existing function
    let targetElement = null;
    let highlightElement = null;
    
    switch(section) {
        case 'portfolio-pulse':
            targetElement = document.querySelector('.bento-container');
            highlightElement = targetElement;
            break;
            
        case 'initiatives':
            targetElement = document.querySelector('.pyramid-section');
            highlightElement = targetElement;
            break;
            
        case 'teams':
            targetElement = document.querySelector('.team-section');
            highlightElement = targetElement;
            break;
    }
    
    if (targetElement) {
        scrollToElement(targetElement, section === 'teams' || section === 'initiatives');
        
        // Add highlight animation
        if (highlightElement) {
            highlightSection(highlightElement);
        }
    }
}

function scrollToElement(element, alignLeft = false) {
    if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - 100; // 100px offset from top
        const scrollLeft = alignLeft ? window.pageXOffset + rect.left - 80 : 0; // 80px offset from left
        
        window.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
}
        
// Highlight animation for sections
function highlightSection(element) {
    // Remove any existing highlights
    document.querySelectorAll('.section-highlight').forEach(el => {
        el.classList.remove('section-highlight');
    });
    
    // Add highlight class
    element.classList.add('section-highlight');
    
    // Remove highlight after animation
    setTimeout(() => {
        element.classList.remove('section-highlight');
    }, 2000);
}
        
function expandSidebarForSearch() {
    const sidebar = document.getElementById('sidebar-nav');
    
    if (sidebar && !sidebar.classList.contains('expanded')) {
        if (typeof toggleSidebar === 'function') {
            toggleSidebar();
        } else {
        }
    } else {
    }
}
        
// Fix search expansion
// Fix search expansion
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('focus', function() {
                const sidebar = document.getElementById('sidebar-nav');
                const mainContent = document.getElementById('main-content');
                const sidebarToggle = document.getElementById('sidebar-toggle');
                
                if (sidebar && !sidebar.classList.contains('expanded')) {
                    // Update global state
                    sidebarExpanded = true;
                    
                    sidebar.classList.add('expanded');
                    mainContent.classList.add('sidebar-expanded');
                    document.getElementById('sidebar-overlay').classList.add('active');
                    
                    // Update caret to close state
                    if (sidebarToggle) {
                        sidebarToggle.innerHTML = `
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/>
                            </svg>
                        `;
                    }
                }
            });
        }
    }, 1000);
    
    // Initialize smart sync
    initSmartSync();
});
      
// Handle window resize for chip bar responsiveness
function handleChipBarResize() {
    const chipBar = document.getElementById('filter-chip-bar');
    if (!chipBar) return;
    
    // Recalculate width based on current sidebar state
    const sidebar = document.getElementById('sidebar-nav');
    const isExpanded = sidebar && sidebar.classList.contains('expanded');
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        chipBar.style.left = '45px';
        chipBar.style.width = 'calc(100vw - 45px)';
    } else {
        chipBar.style.left = '70px';
        chipBar.style.width = 'calc(100vw - 70px)';
    }
}

// Add resize listener
window.addEventListener('resize', handleChipBarResize);      

// Essential keyboard event handling (simplified version)
// Essential keyboard event handling (simplified version)
function initEssentialKeyboard() {
    document.addEventListener('keydown', function(e) {
        // Handle Escape key for closing overlays and modals
        if (e.key === 'Escape') {
            // Check modals in priority order (most specific first)
            const kpiDetailModal = document.getElementById('kpi-detail-modal');
            const kpiEditModal = document.getElementById('kpi-edit-modal');
            const detailModal = document.getElementById('detail-modal');
            const accountModal = document.getElementById('account-modal');
            const sidebar = document.getElementById('sidebar-nav');
            const portfolioDrawer = document.getElementById('portfolio-filter-drawer');
            const teamDrawer = document.getElementById('team-filter-drawer');
            const searchSuggestions = document.getElementById('search-suggestions');
            
            // Close modals first (highest priority)
            if (kpiDetailModal && kpiDetailModal.classList.contains('show')) {
                closeKPIDetailModal();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            if (kpiEditModal && kpiEditModal.classList.contains('show')) {
                closeKPIEditModal();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            if (accountModal && accountModal.classList.contains('show')) {
                closeAccountModal();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Close filter drawers
            if (portfolioDrawer && !portfolioDrawer.classList.contains('hidden')) {
                closeDrawer('portfolio');
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            if (teamDrawer && !teamDrawer.classList.contains('hidden')) {
                closeDrawer('team');
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Close search suggestions
            if (searchSuggestions && !searchSuggestions.classList.contains('hidden')) {
                hideSearchSuggestions();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Close expanded sidebar
            if (sidebar && sidebar.classList.contains('expanded')) {
                closeSidebar();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
    });
}


// =============================================================================
// JIRA INTEGRATION AND SMART SYNC SYSTEM
// Add this entire block to the end of your script.js file
// =============================================================================

// Updated updateBoardWithLiveData function to include Key Results
function updateBoardWithLiveData(newData) {
    console.log('=== UPDATE BOARD DEBUG ===');
    console.log('Updating boardData with live data from Jira...');
    console.log('New data includes OKRs:', !newData.okrs);
    console.log('OKR issues count:', newData.okrs?.issues?.length || 0);
    
    // Update the global boardData object
    boardData.initiatives = newData.initiatives || [];
    boardData.bullpen = newData.bullpen || [];
    boardData.okrs = newData.okrs || { issues: [] };
    boardData.recentlyCompleted = newData.recentlyCompleted || [];
    
    // NEW: Cache the live completion data for next page load
    const initiativesWithLiveData = boardData.initiatives.filter(init => init.jira?.hasLiveData);
    if (initiativesWithLiveData.length > 0) {
        cacheCompletionData(boardData.initiatives);
    }
    
    // Keep existing teams data (don't replace)
    if (newData.teams) {
        boardData.teams = { ...boardData.teams, ...newData.teams };
    }
    
    console.log(`Updated with ${boardData.initiatives.length} initiatives, ${boardData.bullpen.length} bullpen items, and ${boardData.okrs.issues.length} OKR items`);
    
    // Regenerate the UI with new data
    try {
        generatePyramid();
        generateTeamHealthMatrix();
        
        // Ensure KR badge styles are loaded
        ensureKRTypeBadgeStyles();
        
        // Update progress card with Key Results data
        updateProgressCard();
        
        // Update pipeline if the function exists
        if (typeof updatePipelineCard === 'function') {
            updatePipelineCard();
        }
        
        // Update OKR card with new data
        if (typeof updateOKRCard === 'function') {
            updateOKRCard();
        }
        
        // Refresh search index with new data
        if (typeof buildSearchIndex === 'function') {
            buildSearchIndex();
        }
        
    } catch (error) {
        console.error('Error updating UI with live data:', error);
    }

    // Update the Recently Completed card with fresh data
    if (typeof updateRecentlyCompletedCard === 'function') {
        updateRecentlyCompletedCard();
    }
        
    // Update validation cards with live Jira data
    if (typeof updateValidationCard === 'function') {
        updateValidationCard();
    }
    
    if (typeof updateAtRiskCard === 'function') {
        updateAtRiskCard();
    }  
    
    // Update Mendoza card with live efficiency calculation
    if (typeof updateMendozaCard === 'function') {
        updateMendozaCard();
    }
    
}

// Smart Bidirectional Sync State
let syncState = {
    isActive: true,
    isPaused: false,
    lastSyncData: null,
    lastSyncTime: null,
    syncInterval: null,
    updateQueue: []
    
};

// Helper function for extracting text from Jira doc format
function extractTextFromDoc(docField) {
    if (!docField || !docField.content) return null;
    
    let text = '';
    function extractText(content) {
        content.forEach(item => {
            if (item.type === 'text') {
                text += item.text;
            } else if (item.content) {
                extractText(item.content);
            }
        });
    }
    
    extractText(docField.content);
    return text.trim() || null;
}

// Make sure getFieldValue handles the object format properly
function getFieldValue(issue, fieldId) {
    const fieldValue = issue.fields[fieldId];
    
    // Handle custom field objects with value property (most Jira custom fields)
    if (fieldValue && typeof fieldValue === 'object' && fieldValue.value !== undefined) {
        return fieldValue.value;
    }
    
    // Handle arrays of objects with value property (multi-select fields)
    if (Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue[0]?.value !== undefined) {
        return fieldValue.map(item => item.value);
    }
    
    // Return as-is for simple values
    return fieldValue;
}

// Update formatMarketSize to handle proper field IDs
function formatMarketSize(issue) {
    const tam = getFieldValue(issue, 'customfield_10056');
    const sam = getFieldValue(issue, 'customfield_10057'); 
    const som = getFieldValue(issue, 'customfield_10058');
    
    if (tam || sam || som) {
        const parts = [];
        if (tam) parts.push(`TAM: $${tam}M`);
        if (sam) parts.push(`SAM: $${sam}M`);
        if (som) parts.push(`SOM: $${som}M`);
        return parts.join(', ');
    }
    return 'Market size TBD';
}

// Find OKR alignment function
function findOKRAlignment(issue, okrIssues) {
    if (!issue.fields.issuelinks || issue.fields.issuelinks.length === 0) {
        return null;
    }
    
    for (const link of issue.fields.issuelinks) {
        const linkedIssue = link.outwardIssue || link.inwardIssue;
        if (linkedIssue && linkedIssue.key.startsWith('OKR-')) {
            const okrTask = okrIssues.find(okr => okr.key === linkedIssue.key);
            if (okrTask) {
                return okrTask.fields.summary;
            }
        }
    }
    
    return null;
}

// Transform Jira data to board format
function transformJiraData(initiativesResponse, okrsResponse, completedInitiatives) {
    console.log('Transforming Jira data with child issues for activity tracking...');
    
    const transformedInitiatives = initiativesResponse.issues.map((issue, index) => {
        const project = issue.fields.project.key;
        const typeMapping = { 'STRAT': 'strategic', 'KTLO': 'ktlo', 'EMRG': 'emergent' };
        
        const matrixSlot = getFieldValue(issue, 'customfield_10091');
        const validationStatus = getFieldValue(issue, 'customfield_10052');
        const teamsAssigned = getFieldValue(issue, 'customfield_10053');
        const initiativeType = getFieldValue(issue, 'customfield_10051');
        const activityType = getFieldValue(issue, 'customfield_10190');
        
        // Handle numeric Matrix Position
        let priority;
        if (matrixSlot === 0 || matrixSlot === null || matrixSlot === undefined) {
            priority = 'pipeline';
        } else if (typeof matrixSlot === 'number' && matrixSlot >= 1 && matrixSlot <= 36) {
            priority = matrixSlot;
        } else {
            priority = 'pipeline';
        }
        
        // Process teams correctly
        let processedTeams;
        if (Array.isArray(teamsAssigned)) {
            processedTeams = teamsAssigned.map(team => {
                let teamValue;
                if (typeof team === 'object' && team.value) {
                    teamValue = team.value;
                } else {
                    teamValue = team;
                }
                
                if (teamValue && teamValue.includes(';')) {
                    return teamValue.split(';').map(t => t.trim());
                }
                return teamValue;
            }).flat();
        } else if (teamsAssigned && typeof teamsAssigned === 'object' && teamsAssigned.value) {
            const teamValue = teamsAssigned.value;
            if (teamValue.includes(';')) {
                processedTeams = teamValue.split(';').map(t => t.trim());
            } else {
                processedTeams = [teamValue];
            }
        } else if (teamsAssigned) {
            if (teamsAssigned.includes(';')) {
                processedTeams = teamsAssigned.split(';').map(t => t.trim());
            } else {
                processedTeams = [teamsAssigned];
            }
        } else {
            processedTeams = ['Core Platform'];
        }
        
        processedTeams = processedTeams.filter(team => team && team.trim());

        // Calculate completion data with caching support
        const liveCompletion = calculateLiveCompletion(issue.childIssues);
        const hasChildIssues = liveCompletion.total > 0;
        
        // Check if we have existing cached data for this initiative
        const existingInitiative = boardData.initiatives?.find(init => init.jira?.key === issue.key);
        const hasCachedData = existingInitiative && existingInitiative.jira?.hasLiveData;
        
        let finalCompletion;
        if (hasChildIssues) {
            // Use fresh live data from child issues
            finalCompletion = liveCompletion;
        } else if (hasCachedData) {
            // Preserve cached data instead of generating new mock data
            finalCompletion = {
                total: existingInitiative.jira.stories,
                completed: existingInitiative.jira.completed,
                inProgress: existingInitiative.jira.inProgress,
                blocked: existingInitiative.jira.blocked,
                progress: existingInitiative.progress,
                velocity: existingInitiative.jira.velocity
            };
        } else {
            // Only generate mock data if no cached data exists
            finalCompletion = {
                total: Math.floor(Math.random() * 30) + 10,
                completed: Math.floor(Math.random() * 15) + 5,
                inProgress: Math.floor(Math.random() * 10) + 3,
                blocked: Math.floor(Math.random() * 5),
                progress: Math.floor(Math.random() * 80) + 10,
                velocity: Math.floor(Math.random() * 15) + 5
            };
        }
        
        return {
            id: parseInt(issue.id),
            title: issue.fields.summary,
            type: initiativeType || typeMapping[project] || 'strategic',
            validation: mapJiraValidationStatus(validationStatus),
            priority: priority,
            teams: processedTeams,
            progress: finalCompletion.progress,
            activityType: activityType,
            jira: {
                key: issue.key,
                stories: finalCompletion.total,
                completed: finalCompletion.completed,
                inProgress: finalCompletion.inProgress,
                blocked: finalCompletion.blocked,
                flagged: calculateFlaggedCount(issue.childIssues),
                velocity: finalCompletion.velocity,
                status: issue.fields.status.name,
                assignee: issue.fields.assignee?.displayName || 'Unassigned',
                updated: issue.fields.updated,
                hasLiveData: hasChildIssues || hasCachedData,
                activityType: activityType,
                // IMPORTANT: Store child issues for activity breakdown
                childIssues: issue.childIssues || []
            },
            canvas: {
                outcome: extractTextFromDoc(getFieldValue(issue, 'customfield_10054')) || 'Outcome to be defined',
                measures: extractTextFromDoc(getFieldValue(issue, 'customfield_10055')) || 'Success measures TBD',
                keyResult: findOKRAlignment(issue, okrsResponse.issues) || 'No OKR',
                marketSize: formatMarketSize(issue),
                customer: getFieldValue(issue, 'customfield_10059') || 'Customer segment TBD',
                problem: extractTextFromDoc(getFieldValue(issue, 'customfield_10060')) || 'Problem statement needed',
                solution: extractTextFromDoc(getFieldValue(issue, 'customfield_10061')) || 'Solution to be defined',
                bigPicture: extractTextFromDoc(getFieldValue(issue, 'customfield_10062')) || 'Vision to be articulated',
                alternatives: extractTextFromDoc(getFieldValue(issue, 'customfield_10063')) || 'Alternatives to be researched'
            }
        };
    });

    const activeInitiatives = transformedInitiatives.filter(i => i.priority !== 'pipeline');
    const pipelineInitiatives = transformedInitiatives.filter(i => i.priority === 'pipeline');
    
    // Log child issues statistics
    let totalChildIssues = 0;
    let initiativesWithChildIssues = 0;
    
    activeInitiatives.forEach(init => {
        if (init.jira.childIssues && init.jira.childIssues.length > 0) {
            totalChildIssues += init.jira.childIssues.length;
            initiativesWithChildIssues++;
        }
    });
    
    console.log(`Child Issues Summary:`);
    console.log(`  - Total child issues: ${totalChildIssues}`);
    console.log(`  - Initiatives with child issues: ${initiativesWithChildIssues}/${activeInitiatives.length}`);
    
    return {
        initiatives: activeInitiatives,
        bullpen: pipelineInitiatives,
        teams: boardData.teams,
        okrs: { issues: okrsResponse?.issues || [] },
        recentlyCompleted: completedInitiatives || []
    };
}

function calculateFlaggedCount(childIssues) {
    if (!childIssues || childIssues.length === 0) {
        return 0;
    }
    
    return childIssues.filter(issue => {
        const flaggedValue = issue.fields.customfield_10021;
        // Flagged field returns array like [{"value": "Impediment"}] or null/empty
        return flaggedValue && Array.isArray(flaggedValue) && flaggedValue.length > 0;
    }).length;
}

// Updated fetchJiraData function to include Key Results
async function fetchJiraData() {
    console.log('Fetching Jira data with paginated batch child queries...');
    
    // Get all epics first
    const initiativesResponse = await fetch('/api/jira', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        endpoint: '/rest/api/3/search/jql',
        method: 'POST',
        jql: 'project IN (STRAT, KTLO, EMRG) AND issuetype = Epic ORDER BY project ASC',
        fields: ['*navigable'],
        maxResults: 100
    })
});

    if (!initiativesResponse.ok) {
        const error = await initiativesResponse.json();
        throw new Error(error.error || `HTTP ${initiativesResponse.status}`);
    }

    const initiatives = await initiativesResponse.json();
    console.log(`Found ${initiatives.issues.length} epics`);

    // Get child issue counts for each epic (fast - no actual issue fetching)
if (initiatives.issues.length > 0) {
    console.log('Fetching child issue counts for epics...');
    
    try {
        for (const epic of initiatives.issues) {
    let allChildIssues = [];
    let startAt = 0;
    const batchSize = 100;
    let hasMore = true;
    let safetyCounter = 0;
    const maxPages = 20; // Safety: max 2000 issues per epic
    
    while (hasMore && safetyCounter < maxPages) {
        const countResponse = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/rest/api/3/search/jql',
                method: 'POST',
                jql: `parent = ${epic.key}`,
                fields: ['key', 'customfield_10190', 'status'],
                startAt: startAt,
                maxResults: batchSize
            })
        });

        if (countResponse.ok) {
            const countData = await countResponse.json();
            const issues = countData.issues || [];
            allChildIssues = allChildIssues.concat(issues);
            
            // Check if there are more results
            hasMore = issues.length === batchSize;
            startAt += batchSize;
            safetyCounter++;
        } else {
            hasMore = false;
        }
    }
    
    epic.childIssues = allChildIssues;
    epic.childIssueCount = allChildIssues.length;
}
        
        console.log(`Fetched counts for ${initiatives.issues.length} epics`);
        
    } catch (error) {
        console.error('Error fetching child issue counts:', error);
    }
}

            
    
    // Fetch OKRs data
    let okrs;
    try {
        const okrsResponse = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/rest/api/3/search/jql',
                method: 'POST', 
                    jql: 'project = "OKRs" ORDER BY key ASC',
                    fields: ['*navigable'],
                    maxResults: 100
            })
        });

        if (okrsResponse.ok) {
            okrs = await okrsResponse.json();
            console.log(`Found ${okrs.issues.length} OKR issues`);
        } else {
            console.error('Failed to fetch OKRs');
            okrs = { issues: [] };
        }
    } catch (error) {
        console.error('Error fetching OKRs:', error);
        okrs = { issues: [] };
    }
    
    // NEW: Fetch Key Results data
    let keyResultsData = { keyResults: [], valueHistory: [] };
    try {
        keyResultsData = await fetchKeyResultsData();
        
        // Transform and store Key Results data
        if (keyResultsData.keyResults.length > 0) {
            liveKeyResultsData = transformKeyResultsData(keyResultsData.keyResults, keyResultsData.valueHistory);
            console.log(`✅ Loaded ${liveKeyResultsData.length} live Key Results`);
        }
    } catch (error) {
        console.error('Error fetching Key Results:', error);
    }
    
    // Fetch completed initiatives
    let transformedCompleted = [];
    try {
        const completedInitiatives = await fetchCompletedInitiativesFromJira();
        transformedCompleted = transformJiraCompletedInitiatives(completedInitiatives);
        console.log('Completed Initiatives Found:', transformedCompleted.length);
    } catch (error) {
        console.error('Error fetching completed initiatives:', error);
        transformedCompleted = [];
    }

    // CHANGE: Pass the completed initiatives instead of empty array
    return transformJiraData(initiatives, okrs, transformedCompleted);
}

// Helper function to calculate completion from child issues
function calculateLiveCompletion(childIssues) {
    if (!childIssues || childIssues.length === 0) {
        return {
            total: 0,
            completed: 0,
            inProgress: 0,
            blocked: 0,
            progress: 0,
            velocity: 5 // Default velocity
        };
    }

    const total = childIssues.length;
    let completed = 0;
    let inProgress = 0;
    let toDo = 0;

    childIssues.forEach(child => {
        const statusCategory = child.fields.status.statusCategory.key;
        const statusName = child.fields.status.name.toLowerCase();

        if (statusCategory === 'done' || statusName.includes('done') || statusName.includes('closed') || statusName.includes('resolved')) {
            completed++;
        } else if (statusCategory === 'indeterminate' || statusName.includes('progress') || statusName.includes('review')) {
            inProgress++;
        } else {
            toDo++;
        }
    });

    const progressPercentage = Math.round((completed / total) * 100);
    const velocity = Math.max(1, Math.round(progressPercentage / 10)); // Simple velocity calculation

    return {
        total,
        completed,
        inProgress,
        blocked: toDo, // Using toDo as "blocked" for consistency with existing structure
        progress: progressPercentage,
        velocity
    };
}

// Initialize smart sync on page load
function initSmartSync() {
    // Initial sync
    syncWithJiraOnLoad();
    
    // Track user activity
    let lastActivity = Date.now();
    
    const updateActivity = () => lastActivity = Date.now();
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('scroll', updateActivity);
    
    // Smart polling - only when recently active
    syncState.syncInterval = setInterval(() => {
        const isRecentlyActive = Date.now() - lastActivity < 120000; // Active in last 2 minutes
        
        if (syncState.isActive && !syncState.isPaused && isRecentlyActive) {
            console.log('Auto-syncing due to recent user activity');
            syncWithJira();
        }
    }, 180000); // Check every 3 minutes, sync only if active in last 2 minutes
    
    // Setup pause handlers
    setupSyncPauseHandlers();
    
    
}



// Enhanced sync function with change detection
// Make sure your syncWithJira function looks like this (the original):
async function syncWithJira() {
    if (syncState.isPaused) return;
    
    try {
        showSyncIndicator('syncing');
        
        // Get current data from Jira
        const newData = await fetchJiraData();
        
        // Check if data actually changed
        if (hasDataChanged(newData)) {
            updateBoardWithLiveData(newData);
            syncState.lastSyncData = newData;
            syncState.lastSyncTime = Date.now();
            
            showSyncIndicator('success');
        } else {
            showSyncIndicator('no-change');
        }
        
        // Process any pending updates to Jira
        await processPendingUpdates();
        
    } catch (error) {
        console.error('Smart sync failed:', error);
        showSyncIndicator('error');
    }
}

// Full-Screen Sync Overlay System
class SyncOverlay {
    constructor() {
        this.overlay = document.getElementById('syncOverlay');
        this.icon = document.getElementById('syncIcon');
        this.title = document.getElementById('syncTitle');
        this.subtitle = document.getElementById('syncSubtitle');
        this.isActive = false;
    }

    show(options = {}) {
    // Re-query elements if they weren't available during construction
    if (!this.overlay) this.overlay = document.getElementById('syncOverlay');
    if (!this.icon) this.icon = document.getElementById('syncIcon');
    if (!this.title) this.title = document.getElementById('syncTitle');
    if (!this.subtitle) this.subtitle = document.getElementById('syncSubtitle');
    
    if (!this.title || !this.subtitle || !this.icon || !this.overlay) {
        console.error('❌ Sync overlay elements still not available');
        return;
    }

    const {
        title = 'Syncing with Jira',
        subtitle = 'Updating initiative data...',
        showProgress = true
    } = options;

    this.title.textContent = title;
    this.subtitle.textContent = subtitle;
    
    // Use spinning AlignVue compass icon
    this.icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    `;
    this.icon.className = 'sync-icon'; // This keeps the spinning animation

    this.overlay.classList.add('active');
    this.isActive = true;
    
    console.log('🔄 Sync overlay shown:', title);
}

    showSuccess(options = {}) {
        const {
            title = 'Updated Successfully',
            subtitle = 'All data is now current',
            duration = 1500
        } = options;

        this.title.textContent = title;
        this.subtitle.textContent = subtitle;
        
        // Show success checkmark
        this.icon.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" class="checkmark-circle"/>
                <path d="m9 12 2 2 4-4"/>
            </svg>
        `;
        this.icon.className = 'sync-icon success';

        console.log('✅ Sync overlay success:', title);

        // Auto-hide after duration
        setTimeout(() => {
            this.hide();
        }, duration);
    }

    showError(options = {}) {
        const {
            title = 'Sync Failed',
            subtitle = 'Please try again',
            duration = 2000
        } = options;

        this.title.textContent = title;
        this.subtitle.textContent = subtitle;
        
        // Show error X icon
        this.icon.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/>
                <path d="m9 9 6 6"/>
            </svg>
        `;
        this.icon.className = 'sync-icon';
        this.icon.style.color = '#ef4444';

        console.log('❌ Sync overlay error:', title);

        // Auto-hide after duration
        setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.overlay.classList.remove('active');
        this.isActive = false;
        
        // Reset icon color in case it was changed for error state
        this.icon.style.color = '';
        
        console.log('👁️ Sync overlay hidden');
    }

    // Method to integrate with your existing sync system
    async syncWithProgress(syncFunction, options = {}) {
        try {
            this.show(options);
            
            // Execute the actual sync function
            const result = await syncFunction();
            
            // Show success state
            this.showSuccess({
                title: options.successTitle || 'Updated Successfully',
                subtitle: options.successSubtitle || 'All data is now current',
                duration: options.successDuration || 1500
            });
            
            return result;
        } catch (error) {
            console.error('Sync failed:', error);
            
            // Show error state
            this.showError({
                title: options.errorTitle || 'Sync Failed',
                subtitle: options.errorSubtitle || 'Please try again',
                duration: options.errorDuration || 2000
            });
            
            throw error;
        }
    }
}

// Initialize the sync overlay system
let syncOverlay;

async function initializeSyncOverlay() {
    // Add a small delay to ensure DOM is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    syncOverlay = new SyncOverlay();
    console.log('🚀 Full-screen sync overlay system initialized');
}

// NEW function for manual sync from sidebar
async function triggerManualSync() {
    try {
        await syncOverlay.syncWithProgress(async () => {
            console.log('=== MANUAL SYNC TRIGGERED FROM SIDEBAR ===');
            
            // Force a fresh sync regardless of pause state
            const previousPauseState = syncState.isPaused;
            syncState.isPaused = false;
            
            const newData = await fetchJiraData();
            updateBoardWithLiveData(newData);
            syncState.lastSyncData = newData;
            syncState.lastSyncTime = Date.now();
            
            // Restore previous pause state
            syncState.isPaused = previousPauseState;
            
            return { synced: true };
        }, {
            title: 'Manual Sync',
            subtitle: 'Refreshing all data...',
            successTitle: 'Sync Complete',
            successSubtitle: 'Data refreshed successfully',
            errorTitle: 'Manual Sync Failed',
            errorSubtitle: 'Please check your connection'
        });
        
        // Process any pending updates to Jira
        await processPendingUpdates();
        
    } catch (error) {
        console.error('Manual sync from sidebar failed:', error);
    }
}

// NEW function for initial app load with overlay
async function syncWithJiraOnLoad() {
    try {
        await syncOverlay.syncWithProgress(async () => {
            console.log('=== INITIAL LOAD SYNC ===');
            
            // Your existing initial load logic
            const initialData = await fetchJiraData();
            updateBoardWithLiveData(initialData);
            syncState.lastSyncData = initialData;
            syncState.lastSyncTime = Date.now();
            
            return { loaded: true };
        }, {
            title: 'Loading Dashboard',
            subtitle: 'Fetching data from Jira...',
            successTitle: 'Dashboard Ready',
            successSubtitle: 'Welcome to your strategic dashboard',
            errorTitle: 'Load Failed',
            errorSubtitle: 'Could not load dashboard data'
        });
        
    } catch (error) {
        console.error('Initial load failed:', error);
        // Fallback to cached data or show error message
    }
}

// Function to remove old floating manual sync button
function removeFloatingManualSyncButton() {
    const existingButton = document.getElementById('manual-sync-btn');
    if (existingButton) {
        existingButton.remove();
        console.log('Removed floating manual sync button');
    }
}

// Function to add sync button animation
function addSyncButtonAnimation() {
    const syncButton = document.getElementById('sidebar-sync-btn');
    if (!syncButton) return;
    
    const syncIcon = syncButton.querySelector('.sidebar-nav-icon');
    if (!syncIcon) return;
    
    // Store original syncWithProgress method
    const originalSyncWithProgress = syncOverlay.syncWithProgress;
    
    // Override to add animation
    syncOverlay.syncWithProgress = async function(syncFunction, options = {}) {
        try {
            // Add spinning animation
            syncIcon.style.animation = 'spin 2s linear infinite';
            syncButton.style.opacity = '0.7';
            
            const result = await originalSyncWithProgress.call(this, syncFunction, options);
            
            // Remove animation on success
            syncIcon.style.animation = '';
            syncButton.style.opacity = '';
            
            return result;
        } catch (error) {
            // Remove animation on error
            syncIcon.style.animation = '';
            syncButton.style.opacity = '';
            throw error;
        }
    };
}

// Detect if data has actually changed
function hasDataChanged(newData) {
    if (!syncState.lastSyncData) return true;
    
    const oldData = syncState.lastSyncData;
    
    // Quick checks for changes
    if (newData.initiatives.length !== oldData.initiatives.length) return true;
    if (newData.bullpen.length !== oldData.bullpen.length) return true;
    
    // Deep check initiative changes (priority, teams, progress, validation)
    for (let i = 0; i < newData.initiatives.length; i++) {
        const newInit = newData.initiatives[i];
        const oldInit = oldData.initiatives.find(init => init.id === newInit.id);
        
        if (!oldInit) return true;
        
        // Check key fields that matter for the UI
        if (newInit.priority !== oldInit.priority) return true;
        if (newInit.progress !== oldInit.progress) return true;
        if (newInit.validation !== oldInit.validation) return true;
        if (JSON.stringify(newInit.teams) !== JSON.stringify(oldInit.teams)) return true;
    }
    
    return false;
}

// Pause sync during user interactions
function setupSyncPauseHandlers() {
    let pauseTimeout;
    
    // Pause during drag operations
    document.addEventListener('dragstart', () => {
        syncState.isPaused = true;
        clearTimeout(pauseTimeout);
    });
    
    document.addEventListener('dragend', () => {
        // Resume sync 2 seconds after drag ends
        pauseTimeout = setTimeout(() => {
            syncState.isPaused = false;
        }, 2000);
    });
    
    // Pause during modal interactions
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-content')) {
            syncState.isPaused = true;
            clearTimeout(pauseTimeout);
            
            // Resume 5 seconds after modal interaction
            pauseTimeout = setTimeout(() => {
                syncState.isPaused = false;
            }, 5000);
        }
    });
}

// Delayed batch update system
let pendingMoveTimeout = null;

function queueJiraUpdate(initiative, changes) {
    // Clear any existing timeout to reset the delay
    clearTimeout(pendingMoveTimeout);
    
    console.log(`Queuing update for ${initiative.jira?.key}, will batch sync in 7 seconds...`);
    
    // Set a new timeout for 7 seconds from now
    pendingMoveTimeout = setTimeout(() => {
        batchSyncAllPositions();
    }, 7000);
}

async function batchSyncAllPositions() {
    console.log('Starting batch sync of all positions to Jira...');
    showSyncIndicator('syncing');
    
    try {
        // Get current state of all initiatives with Jira keys
        const allUpdates = [];
        
        boardData.initiatives.forEach(init => {
            if (init.jira?.key && typeof init.priority === 'number') {
                allUpdates.push({
                    key: init.jira.key,
                    position: init.priority,
                    title: init.title
                });
            }
        });
        
        console.log(`Batch syncing ${allUpdates.length} initiatives to Jira...`);
        
        // Send updates sequentially with delays to avoid conflicts
        for (const update of allUpdates) {
            try {
                console.log(`Updating ${update.key} to position ${update.position}`);
                
                await writeToJira(
                    { jira: { key: update.key } }, 
                    { priority: update.position }
                );
                
                // Small delay between updates
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Failed to update ${update.key} (${update.title}):`, error);
            }
        }
        
        console.log('Batch sync completed successfully');
        showSyncIndicator('success');
        
    } catch (error) {
        console.error('Batch sync failed:', error);
        showSyncIndicator('error');
    }
}

// Process pending updates to Jira
async function processPendingUpdates() {
    if (syncState.updateQueue.length === 0) return;
    
    const updates = [...syncState.updateQueue];
    syncState.updateQueue = [];
    
    for (const update of updates) {
        try {
            await writeToJira(update.initiative, update.changes);
        } catch (error) {
            console.error('Failed to write to Jira:', error);
            // Re-queue failed updates
            syncState.updateQueue.push(update);
        }
    }
}

// Write changes back to Jira
async function writeToJira(initiative, changes) {
    console.log('=== WRITING TO JIRA ===');
    console.log('Initiative Key:', initiative.jira?.key);
    console.log('Changes:', changes);
    
    const fields = {};
    
    // Map changes to Jira custom fields
    if (changes.priority !== undefined) {
        // IMPORTANT: Make sure the value is a number, not string
        fields.customfield_10091 = Number(changes.priority);
        console.log('Setting Matrix Position to:', Number(changes.priority));
    }
    
    try {
        const requestBody = {
            endpoint: `/rest/api/3/issue/${initiative.jira.key}`,
            method: 'PUT',
            body: {
                fields: fields
            }
        };
        
        console.log('Request:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('/api/jira', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        
        // Handle empty responses properly
        let responseText = '';
        try {
            responseText = await response.text();
        } catch (e) {
            console.log('No response body');
        }
        
        if (!response.ok) {
            console.error('❌ Jira update failed:', response.status, responseText);
            throw new Error(`HTTP ${response.status}: ${responseText || 'No response body'}`);
        } else {
            console.log('✅ Jira update successful');
        }
        
    } catch (error) {
        console.error('❌ Error in writeToJira:', error);
        throw error;
    }
}

// Subtle sync indicator
function showSyncIndicator(type) {
    let indicator = document.getElementById('sync-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'sync-indicator';
        indicator.style.cssText = `
            position: fixed; top: 10px; right: 10px; 
            padding: 6px 12px; border-radius: 4px; 
            font-size: 12px; z-index: 9999;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    // Clear any existing timeout
    clearTimeout(indicator.timeout);
    
    switch (type) {
        case 'syncing':
            indicator.style.background = 'rgba(59, 130, 246, 0.9)';
            indicator.style.color = 'white';
            indicator.textContent = '⟳ Syncing...';
            break;
        case 'success':
            indicator.style.background = 'rgba(34, 197, 94, 0.9)';
            indicator.style.color = 'white';
            indicator.textContent = '✓ Updated';
            break;
        case 'no-change':
            indicator.style.background = 'rgba(107, 114, 128, 0.7)';
            indicator.style.color = 'white';
            indicator.textContent = '○ Current';
            break;
        case 'error':
            indicator.style.background = 'rgba(239, 68, 68, 0.9)';
            indicator.style.color = 'white';
            indicator.textContent = '✗ Error';
            break;
    }
    
    // Fade out after 3 seconds
    indicator.timeout = setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.style.opacity === '0') {
                indicator.style.display = 'none';
            }
        }, 300);
    }, 3000);
    
    // Show indicator
    indicator.style.display = 'block';
    indicator.style.opacity = '1';
}

// ===============================================================================
// PERMANENT TEAM HEALTH INTEGRATION - ADD TO END OF YOUR EXISTING SCRIPT.JS
// This will make team health integration happen automatically on every page load
// ===============================================================================

// REPLACE your existing team health functions (if any) with this permanent version:

async function fetchTeamHealthData() {
    console.log('🏥 Fetching team health data from Jira TH project...');
    
    try {
        const response = await fetch('/api/jira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/rest/api/3/search/jql',
                method: 'POST',
                
                    jql: 'project = TH AND issuetype = Team ORDER BY summary ASC',
                    fields: [
                        "summary",
                        "key", 
                        "customfield_10264", // Utilization
                        "customfield_10257", // Capacity
                        "customfield_10258", // Skillset
                        "customfield_10259", // Vision
                        "customfield_10260", // Support
                        "customfield_10261", // Team Cohesion
                        "customfield_10262", // Autonomy
                        "customfield_10263"  // Comments
                    ]
                
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('🏥 Raw team health response:', data);

        if (!data.issues || data.issues.length === 0) {
            console.warn('⚠️ No teams found in TH project');
            return {
                success: true,
                data: {},
                errors: ['No teams found in TH project']
            };
        }

        // Value mapping function
        function mapJiraValueToAppFormat(jiraValue) {
            if (!jiraValue || !jiraValue.value) return null;
            
            const value = jiraValue.value.toLowerCase();
            switch (value) {
                case 'healthy': return 'Healthy';
                case 'at-risk': 
                case 'at risk': return 'At Risk';
                case 'critical': return 'Critical';
                default: 
                    console.warn(`⚠️ Unknown health state: "${jiraValue.value}"`);
                    return jiraValue.value;
            }
        }

        // Parse team health data
        const teamHealthMap = {};
        let validationErrors = [];

        data.issues.forEach(issue => {
            const teamName = issue.fields.summary;
            const fields = issue.fields;

            console.log(`🔍 Processing team: ${teamName}`);

            // Validate required fields exist
            const requiredFields = [
                { id: 'customfield_10257', name: 'Capacity' },
                { id: 'customfield_10258', name: 'Skillset' },
                { id: 'customfield_10259', name: 'Vision' },
                { id: 'customfield_10260', name: 'Support' },
                { id: 'customfield_10261', name: 'Team Cohesion' },
                { id: 'customfield_10262', name: 'Autonomy' },
                { id: 'customfield_10264', name: 'Utilization' }
            ];

            requiredFields.forEach(field => {
                if (!fields.hasOwnProperty(field.id)) {
                    validationErrors.push(`❌ Team "${teamName}": Missing field ${field.name} (${field.id})`);
                }
            });

            // Map to our 4-state format
            teamHealthMap[teamName] = {
                capacity: mapJiraValueToAppFormat(fields.customfield_10257),
                skillset: mapJiraValueToAppFormat(fields.customfield_10258),
                vision: mapJiraValueToAppFormat(fields.customfield_10259),
                support: mapJiraValueToAppFormat(fields.customfield_10260),
                teamwork: mapJiraValueToAppFormat(fields.customfield_10261),
                autonomy: mapJiraValueToAppFormat(fields.customfield_10262),
                
                // Additional Jira data
                jira: {
                    key: issue.key,
                    utilization: fields.customfield_10264 || 0,
                    comments: fields.customfield_10263 || null,
                    sprint: null,
                    velocity: null,
                    stories: null,
                    bugs: null,
                    blockers: null
                }
            };
        });

        // Log validation results
        if (validationErrors.length > 0) {
            console.warn('⚠️ Team Health Field Validation Errors:');
            validationErrors.forEach(error => console.warn(error));
        } else {
            console.log('✅ All team health fields validated successfully');
        }

        console.log('🏥 Processed team health data:', teamHealthMap);
        console.log(`📊 Successfully processed ${Object.keys(teamHealthMap).length} teams from TH project`);

        return {
            success: true,
            data: teamHealthMap,
            errors: validationErrors
        };

    } catch (error) {
        console.error('❌ Error fetching team health data:', error.message);
        return {
            success: false,
            data: {},
            error: error.message
        };
    }
}

async function integrateTeamHealthData() {
    console.log('🔗 Starting team health data integration...');
    
    const teamHealthResult = await fetchTeamHealthData();

    if (teamHealthResult.success) {
        console.log('✅ Team health fetch successful, merging data...');
        
        // Ensure boardData.teams exists
        if (!boardData.teams) {
            console.log('📝 Initializing boardData.teams object');
            boardData.teams = {};
        }
        
        // Merge team health data with existing teams
        Object.keys(teamHealthResult.data).forEach(teamName => {
            if (boardData.teams[teamName]) {
                // Update existing team with Jira health data
                console.log(`🔄 Updating existing team: ${teamName}`);
                boardData.teams[teamName] = {
                    ...boardData.teams[teamName],
                    ...teamHealthResult.data[teamName]
                };
            } else {
                // Add new team from Jira
                console.log(`➕ Adding new team from Jira: ${teamName}`);
                boardData.teams[teamName] = teamHealthResult.data[teamName];
            }
        });

        // Log teams that exist in app but not in Jira TH project
        Object.keys(boardData.teams).forEach(teamName => {
            if (!teamHealthResult.data[teamName]) {
                console.log(`⚠️ Team "${teamName}" exists in app but not in Jira TH project - will need to create`);
            }
        });

        console.log('🎯 Final merged team data:', boardData.teams);
        return true;
    } else {
        console.error('❌ Team health integration failed:', teamHealthResult.error);
        console.log('🔄 Continuing with existing team data...');
        return false;
    }
}

// PERMANENT INTEGRATION: Auto-enhance fetchJiraData on page load
function installPermanentTeamHealthIntegration() {
    console.log('🔧 Installing permanent team health integration...');
    
    // Store reference to original fetchJiraData
    const originalFetchJiraData = window.fetchJiraData;
    
    if (!originalFetchJiraData) {
        console.error('❌ Original fetchJiraData not found - retrying in 1 second...');
        setTimeout(installPermanentTeamHealthIntegration, 1000);
        return;
    }
    
    // Create permanently enhanced version
    window.fetchJiraData = async function(...args) {
        console.log('🔄 Enhanced fetchJiraData called (permanent integration)...');
        
        try {
            // Call original function first
            const result = await originalFetchJiraData.apply(this, args);
            
            // Then automatically add team health integration
            console.log('🏥 Auto-integrating team health data...');
            await integrateTeamHealthData();
            
            return result;
        } catch (error) {
            console.error('❌ Enhanced sync error (falling back to original):', error);
            // Return original result even if team health fails
            return await originalFetchJiraData.apply(this, args);
        }
    };
    
    console.log('✅ Permanent team health integration installed!');
    console.log('📋 Team health data will now be automatically integrated on every data sync');
}

// AUTO-INSTALL on page load (this makes it permanent)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Auto-installing team health integration...');
    
    // Wait a bit for other scripts to load, then install
    setTimeout(() => {
        installPermanentTeamHealthIntegration();
    }, 2000); // 2 second delay to ensure fetchJiraData exists
});

// Backup: Install when fetchJiraData becomes available
let installAttempts = 0;
const maxAttempts = 10;

function attemptInstall() {
    if (window.fetchJiraData && typeof window.fetchJiraData === 'function') {
        installPermanentTeamHealthIntegration();
    } else if (installAttempts < maxAttempts) {
        installAttempts++;
        console.log(`⏳ Waiting for fetchJiraData... (attempt ${installAttempts}/${maxAttempts})`);
        setTimeout(attemptInstall, 1000);
    } else {
        console.error('❌ Could not find fetchJiraData after 10 attempts');
    }
}

// Start attempting installation immediately
attemptInstall();

// Validation and testing functions (keep these for manual testing)
function validateTeamHealthFields() {
    console.log('🔍 Validating team health field values...');
    
    const expectedValues = ['Healthy', 'At Risk', 'Critical'];
    
    if (!boardData.teams) {
        console.warn('⚠️ No team data available to validate');
        return;
    }
    
    Object.keys(boardData.teams).forEach(teamName => {
        const team = boardData.teams[teamName];
        const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
        
        console.log(`\n📋 Team: ${teamName}`);
        dimensions.forEach(dimension => {
            const value = team[dimension];
            if (value !== null && !expectedValues.includes(value)) {
                console.warn(`⚠️ Unexpected value for ${dimension}: "${value}" (expected: ${expectedValues.join(', ')}, or null)`);
            } else {
                console.log(`✅ ${dimension}: ${value || 'null'}`);
            }
        });
    });
}

function verifyTeamHealthInUI() {
    console.log('🔍 Verifying team health data in UI...');
    
    if (boardData && boardData.teams) {
        let teamsWithJiraHealth = 0;
        let teamsWithOldHealth = 0;
        
        Object.keys(boardData.teams).forEach(teamName => {
            const team = boardData.teams[teamName];
            
            // Check if it has the new format (title case values)
            const hasNewFormat = team.capacity === 'Healthy' || 
                                team.capacity === 'At Risk' || 
                                team.capacity === 'Critical';
                                
            const hasOldFormat = team.capacity === 'healthy' || 
                                team.capacity === 'at-risk';
            
            if (hasNewFormat) teamsWithJiraHealth++;
            if (hasOldFormat) teamsWithOldHealth++;
        });
        
        console.log(`✅ Teams with Jira health data: ${teamsWithJiraHealth}`);
        console.log(`⚠️ Teams with old format data: ${teamsWithOldHealth}`);
        
        if (teamsWithJiraHealth > 0) {
            console.log('🎉 Team health integration is working!');
            return true;
        } else {
            console.log('❌ Team health integration not detected');
            return false;
        }
    } else {
        console.log('❌ No team data found');
        return false;
    }
}

console.log('🏥 PERMANENT TEAM HEALTH INTEGRATION LOADED');
console.log('📋 Team health will be automatically integrated on every page load');
console.log('🔧 Manual commands still available:');
console.log('   - validateTeamHealthFields()');  
console.log('   - verifyTeamHealthInUI()');

// ===============================================================================
// END OF PERMANENT TEAM HEALTH INTEGRATION
// ===============================================================================

// ============================================================================
// PHASE 3: INTERACTIVE TEAM HEALTH MODAL - COMPLETE IMPLEMENTATION
// ============================================================================

// ============================================================================
// UTILIZATION CHART FUNCTIONS
// ============================================================================

function getUtilizationChartColor(utilization) {
    if (utilization < 50) return '#ea580c';        // Orange - Underutilized
    if (utilization <= 70) return '#ca8a04';       // Yellow - Low utilization  
    if (utilization <= 85) return '#16a34a';       // Green - Optimal
    if (utilization <= 95) return '#ca8a04';       // Yellow - High
    if (utilization <= 100) return '#ea580c';      // Orange - Overloaded
    return '#dc2626';                              // Red - Critical (>100%)
}

function initializeUtilizationChart(utilization, containerId = 'utilization-chart') {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const utilizationValue = Math.min(Math.max(utilization || 0, 0), 100);
    const remainderValue = Math.max(0, 100 - utilizationValue);
    
    // Get color based on utilization value
    const utilizationColor = getUtilizationChartColor(utilizationValue);
    const remainderColor = '#374151'; // Grey for remainder
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [utilizationValue, remainderValue],
                backgroundColor: [utilizationColor, remainderColor],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%', // Makes it a donut instead of pie
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        },
        plugins: [{
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                ctx.font = 'bold 18px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${utilizationValue}%`, width/2, height/2);
                ctx.save();
            }
        }]
    });
}

// ============================================================================
// ENHANCED TEAM MODAL WITH EDIT-IN-PLACE
// ============================================================================

function showTeamModal(teamName, teamData) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    if (!teamData) {
        console.error('Team not found:', teamName);
        return;
    }
    
    // Set modal title
    title.innerHTML = `${teamName} <span class="ml-2 text-xs font-normal opacity-75" style="color: var(--text-secondary);">Team Health Details</span>`;
    
    // Calculate overall health
    const healthStatus = getTeamOverallHealth(teamData);
    
    content.innerHTML = `
        <div class="space-y-6">
        <div class="space-y-6">
            <!-- Top Row: Risk Status + Performance Metrics -->
            <div class="grid grid-cols-4 gap-6">
                
                <!-- Left: Overall Health Status -->
                <div class="p-4 rounded-lg text-white" style="background: ${getHealthStatusColor(healthStatus.level)};">
                    <div class="text-2xl font-bold">${healthStatus.text}</div>
                    <div class="text-sm opacity-90">${getHealthStatusDescription(healthStatus.level, teamData)}</div>
                </div>
                
                <!-- Right: Performance Metrics Grid -->
                <div class="grid grid-cols-1 gap-3">
                    <!-- Utilization Chart -->
                    <div id="utilization-container" class="p-4 rounded-lg text-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                        <div style="width: 120px; height: 120px; margin: 0 auto;">
                            <canvas id="utilization-chart" width="120" height="120"></canvas>
                        </div>
                        <div class="text-base mt-2" style="color: var(--text-secondary);">Utilization</div>
                    </div>
                </div>
                
                <!-- Active Stories -->
                <div class="p-4 rounded-lg text-center flex flex-col items-center justify-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                    <div class="text-3xl font-bold" style="color: var(--text-primary);">${teamData.jira?.stories || 'null'}</div>
                   <div class="text-base" style="color: var(--text-secondary);">Active Stories</div>
                </div>
                
                <!-- Blockers -->
                <div class="p-4 rounded-lg text-center flex flex-col items-center justify-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                    <div class="text-3xl font-bold" style="color: var(--text-primary);">${teamData.jira?.blockers || 'null'}</div>
                    <div class="text-base" style="color: var(--text-secondary);">Blockers</div>
                </div>
            </div>
            
            <!-- Health Dimensions Section -->
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold flex items-center gap-3" style="color: var(--text-primary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l11 11z"/>
                        </svg>
                        Health Dimensions
                    </h3>
                    <button 
                        id="edit-health-btn" 
                        onclick="toggleHealthEditMode('${teamName}')"
                        class="flex items-center gap-2 px-3 py-1 text-sm rounded border hover:bg-gray-50 transition-colors"
                        style="border-color: var(--border-primary); color: var(--text-secondary);"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
                        </svg>
                        Edit
                    </button>
                </div>
                
                <!-- Health Dimensions Grid (2x3) -->
                <div id="health-dimensions-container" class="grid grid-cols-2 gap-3">
                    ${renderHealthDimensionsGrid(teamData, false)}
                </div>
            </div>
            
            
            </div>
            
            <!-- NEW: Team Comments Section -->
            <div id="team-comments-section">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                    </svg>
                    Team Comments
                </h3>
                <div id="team-comments-display" class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                    ${renderTeamComments(teamData)}
                </div>
            </div>
            
            <!-- Health Insights Section -->
            <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    Health Insights
                </h3>
                <div class="space-y-3" style="color: var(--text-secondary);">
                    ${generateHealthInsights(teamData)}
                </div>
            </div>
        </div>
    `;
    
    // Initialize the utilization chart
    setTimeout(() => {
        initializeUtilizationChart(teamData.jira?.utilization || 0);
    }, 100);
    
    modal.classList.add('show');
    
    // Make modal scrollable for smaller resolutions
    modal.style.maxHeight = '85vh';
    modal.style.overflow = 'auto';
}

// ============================================================================
// TEAM HEALTH COMMENTS RENDERING
// ============================================================================
function renderTeamComments(teamData) {
    const comments = teamData.jira?.comments ? extractTextFromADF(teamData.jira.comments) : null;
    
    if (!comments || comments.trim() === '') {
        return `
            <div class="text-center py-8" style="color: var(--text-secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-3" style="color: var(--border-primary);">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                    <path d="M8 12h8"/>
                    <path d="M8 8h8"/>
                </svg>
                <p class="text-sm">No team health comments yet</p>
                <p class="text-xs mt-1">Click Edit to add notes about this team's health</p>
            </div>
        `;
    }
    
    return `
        <div class="prose prose-sm max-w-none" style="color: var(--text-primary);">
            <div class="whitespace-pre-wrap">${escapeHtml(comments)}</div>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// HEALTH DIMENSIONS RENDERING
// ============================================================================

function renderHealthDimensionsGrid(teamData, isEditMode = false) {
    const dimensions = [
        { key: 'capacity', label: 'Capacity', desc: 'Workload & Resources', icon: 'clock' },
        { key: 'support', label: 'Support', desc: 'Tools & Org Backing', icon: 'life-buoy' },
        { key: 'skillset', label: 'Skillset', desc: 'Technical Capabilities', icon: 'graduation-cap' },
        { key: 'teamwork', label: 'Team Cohesion', desc: 'Collaboration & Communication', icon: 'users' },
        { key: 'vision', label: 'Vision', desc: 'Clarity & Alignment', icon: 'eye' },
        { key: 'autonomy', label: 'Autonomy', desc: 'Decision-making Independence', icon: 'layers' }
    ];
    
    if (isEditMode) {
        return renderHealthDimensionsEditor(teamData, dimensions);
    } else {
        return renderHealthDimensionsDisplay(teamData, dimensions);
    }
}

function renderHealthDimensionsDisplay(teamData, dimensions) {
    return dimensions.map(dim => {
        const value = teamData[dim.key];
        const colorClass = getDimensionColorClass(value);
        const borderColor = getDimensionBorderColor(value);
        
        return `
            <div class="p-4 rounded-lg border" style="background: var(--bg-tertiary); border-color: ${borderColor};">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${getDimensionIcon(dim.icon, borderColor)}
                        <div>
                            <div class="text-sm font-bold" style="color: var(--text-primary);">${dim.label}</div>
                            <div class="text-xs" style="color: var(--text-secondary);">${dim.desc}</div>
                        </div>
                    </div>
                    <div class="text-lg font-bold capitalize ${colorClass}">
                        ${value || 'Not Set'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderHealthDimensionsEditor(teamData, dimensions) {
    return dimensions.map(dim => {
        const value = teamData[dim.key];
        const colorClass = getDimensionColorClass(value);
        const borderColor = getDimensionBorderColor(value);
        
        return `
            <div class="p-4 rounded-lg border" style="background: var(--bg-tertiary); border-color: ${borderColor};">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${getDimensionIcon(dim.icon, borderColor)}
                        <div>
                            <div class="text-sm font-bold" style="color: var(--text-primary);">${dim.label}</div>
                            <div class="text-xs" style="color: var(--text-secondary);">${dim.desc}</div>
                        </div>
                    </div>
                    <select 
                        id="${dim.key}" 
                        class="px-3 py-1 rounded border text-sm"
                        style="background: var(--bg-secondary); border-color: var(--border-primary); color: var(--text-primary);"
                    >
                        <option value="">Not Set</option>
                        <option value="Healthy" ${value === 'Healthy' ? 'selected' : ''}>Healthy</option>
                        <option value="At Risk" ${value === 'At Risk' ? 'selected' : ''}>At Risk</option>
                        <option value="Critical" ${value === 'Critical' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
            </div>
        `;
    }).join('') + `
        
        <!-- Comments Section in Edit Mode -->
        <div style="grid-column: 1 / -1; margin-top: 16px;">
            <label for="team-comments" class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
                Team Health Comments
            </label>
            <textarea 
                id="team-comments" 
                rows="4"
                class="w-full px-3 py-2 border rounded-md resize-vertical" 
                style="background: var(--bg-secondary); border-color: var(--border-primary); color: var(--text-primary);"
                placeholder="Add team health notes, concerns, updates, or observations..."
            >${teamData.jira?.comments ? extractTextFromADF(teamData.jira.comments) : ''}</textarea>
            <div class="text-xs mt-1" style="color: var(--text-secondary);">
                These comments will be saved to Jira and visible to team members
            </div>
        </div>
        
        <!-- Buttons -->
        <div style="display: flex; justify-content: center; gap: 16px; margin-top: 24px; width: 100%;">
            <button 
                type="button" 
                onclick="exitEditMode()"
                class="px-6 py-2 text-sm rounded transition-colors"
                style="background: var(--bg-tertiary); border: 1px solid var(--border-primary); color: var(--accent-red); min-width: 120px;"
            >
                Cancel
            </button>
            <button 
                type="button" 
                onclick="submitHealthChanges()"
                class="px-6 py-2 text-sm rounded text-white transition-colors"
                style="background: var(--accent-blue); min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 6px;"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                    <path d="M16 16h5v5"/>
                </svg>
                <span>Sync Changes</span>
            </button>
        </div>
    `;
}

function renderUtilizationEditor(teamData) {
    return `
        <div class="p-4 rounded-lg text-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
            <div class="mb-2">
                <input 
                    type="number" 
                    id="utilization-input"
                    min="0" 
                    max="150" 
                    value="${teamData.jira?.utilization || ''}"
                    class="w-20 text-center text-xl font-bold border-2 rounded focus:outline-none focus:ring-2 transition-all"
                    style="background: var(--bg-primary); color: var(--text-primary); border-color: var(--accent-blue); focus:border-color: var(--accent-blue); focus:ring-color: rgba(59, 130, 246, 0.3);"
                    placeholder="--"
                />
                <div class="text-sm mt-1" style="color: var(--text-secondary);">%</div>
            </div>
            <div class="text-sm" style="color: var(--text-secondary);">Utilization</div>
        </div>
    `;
}
// ============================================================================
// EDIT MODE TOGGLE FUNCTIONALITY
// ============================================================================

function toggleHealthEditMode(teamName) {
    const container = document.getElementById('health-dimensions-container');
    const utilizationContainer = document.getElementById('utilization-container');
    const button = document.getElementById('edit-health-btn');
    const teamData = boardData.teams[teamName];
    const modal = document.getElementById('detail-modal');
    
    // Store teamName globally for button access
    window.currentEditingTeam = teamName;
    
    const isEditing = button.innerHTML.includes('Cancel');
    
    if (isEditing) {
        // Exit edit mode - restore original displays
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a .5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
            </svg>
            Edit
        `;
        container.innerHTML = renderHealthDimensionsGrid(teamData, false);
        utilizationContainer.innerHTML = `
            <div style="width: 80px; height: 80px; margin: 0 auto;">
                <canvas id="utilization-chart" width="80" height="80"></canvas>
            </div>
            <div class="text-white text-sm mt-2">Utilization</div>
        `;
        
        // Reinitialize chart
        setTimeout(() => {
            initializeUtilizationChart(teamData.jira?.utilization || 0);
        }, 100);
        
        // Refresh comments display
        document.getElementById('team-comments-display').innerHTML = renderTeamComments(teamData);
        document.getElementById('team-comments-section').style.display = 'block';
        
        // Show Health Insights section
        const healthInsightsSection = Array.from(modal.querySelectorAll('div')).find(div => 
            div.querySelector('h3') && 
            div.querySelector('h3').textContent.includes('Health Insights')
        );
        if (healthInsightsSection) {
            healthInsightsSection.style.display = 'block';
        }
        
        // Remove blur and darken from the top sections
        const topSectionBoxes = modal.querySelectorAll('.grid-cols-4 > div, .grid > div');
        topSectionBoxes.forEach(box => {
            if (box && (box.textContent.includes('CRITICAL') || box.textContent.includes('Active Stories') || box.textContent.includes('Blockers'))) {
                box.style.filter = '';
                box.style.opacity = '';
                box.style.pointerEvents = '';
            }
        });
        
    } else {
        // Enter edit mode
        button.style.display = 'none';
        container.innerHTML = renderHealthDimensionsGrid(teamData, true);
        utilizationContainer.innerHTML = renderUtilizationEditor(teamData);
        document.getElementById('team-comments-section').style.display = 'none';
        
        // Hide Health Insights section
        const healthInsightsSection = Array.from(modal.querySelectorAll('div')).find(div => 
            div.querySelector('h3') && 
            div.querySelector('h3').textContent.includes('Health Insights')
        );
        if (healthInsightsSection) {
            healthInsightsSection.style.display = 'none';
        }
        
        // Blur and darken the top sections
        const topSectionBoxes = modal.querySelectorAll('.grid-cols-4 > div, .grid > div');
        topSectionBoxes.forEach(box => {
            if (box && (box.textContent.includes('CRITICAL') || box.textContent.includes('Active Stories') || box.textContent.includes('Blockers'))) {
                box.style.filter = 'blur(2px)';
                box.style.opacity = '0.4';
                box.style.pointerEvents = 'none';
            }
        });
    }
}

// ============================================================================
// FORM SUBMISSION & JIRA SYNC
// ============================================================================

async function handleHealthUpdate(event, teamName) {
    event.preventDefault();
    
    const formData = {
        capacity: document.getElementById('capacity').value || null,
        skillset: document.getElementById('skillset').value || null,
        vision: document.getElementById('vision').value || null,
        support: document.getElementById('support').value || null,
        teamwork: document.getElementById('teamwork').value || null,
        autonomy: document.getElementById('autonomy').value || null,
        utilization: parseInt(document.getElementById('utilization-input').value) || 0,
        comments: document.getElementById('team-comments').value || null
    };
    
    try {
        console.log('🔍 Debug: Updating team health for:', teamName);
        console.log('🔍 Debug: Form data:', formData);
        console.log('🔍 Debug: Team data before update:', boardData.teams[teamName]);
        
        // Check if updateTeamHealthInJira function exists
        if (typeof updateTeamHealthInJira === 'function') {
            console.log('🔍 Debug: updateTeamHealthInJira function exists, calling it...');
            await updateTeamHealthInJira(teamName, formData);
            console.log('✅ Debug: Jira update completed');
        } else {
            console.warn('⚠️ Debug: updateTeamHealthInJira function does not exist');
            console.log('💡 Debug: Available functions:', Object.getOwnPropertyNames(window).filter(name => name.includes('update') || name.includes('jira') || name.includes('health')));
        }
        
        // Update local data
        const teamData = boardData.teams[teamName];
        if (teamData) {
            console.log('🔍 Debug: Updating local team data...');
            Object.assign(teamData, formData);
            if (teamData.jira) {
                teamData.jira.utilization = formData.utilization;
                teamData.jira.comments = formData.comments;
            }
            console.log('🔍 Debug: Team data after update:', teamData);
        } else {
            console.error('❌ Debug: Team not found in boardData.teams:', teamName);
        }
        
        // Refresh UI
        if (typeof updateUIWithLiveData === 'function') {
            console.log('🔍 Debug: Refreshing UI...');
            await updateUIWithLiveData();
        } else {
            console.warn('⚠️ Debug: updateUIWithLiveData function does not exist');
        }
        
        // Exit edit mode
        console.log('🔍 Debug: Exiting edit mode...');
        toggleHealthEditMode(teamName);
        
        console.log('✅ Team health updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating team health:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Show a more specific error message
        if (error.message.includes('updateTeamHealthInJira')) {
            alert('Error syncing to Jira. Changes saved locally but may not be synced to Jira.');
        } else {
            alert('Error saving changes: ' + error.message);
        }
    }
}
async function updateTeamHealthInJira(teamName, data) {
    const teamData = boardData.teams[teamName];
    
    if (!teamData?.jira?.key) {
        throw new Error('Team not found in Jira');
    }
    
    console.log('Updating team health in Jira:', teamName, data);
    
    const fields = {
        customfield_10264: data.utilization,
        customfield_10257: data.capacity ? { value: data.capacity } : null,
        customfield_10258: data.skillset ? { value: data.skillset } : null,
        customfield_10259: data.vision ? { value: data.vision } : null,
        customfield_10260: data.support ? { value: data.support } : null,
        customfield_10261: data.teamwork ? { value: data.teamwork } : null,
        customfield_10262: data.autonomy ? { value: data.autonomy } : null,
        customfield_10263: convertTextToADF(data.comments)
    };
    
    console.log('Sending to Jira:', fields);
    
    const response = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: `/rest/api/3/issue/${teamData.jira.key}`,
            method: 'PUT',
            body: { fields }
        })
    });
    
    // Check if the response was successful (200-299 status codes)
    if (response.ok) {
        console.log('Jira update response was successful (status:', response.status, ')');
        
        try {
            // Try to parse JSON response
            const result = await response.json();
            console.log('Jira response parsed successfully:', result);
        } catch (jsonError) {
            // JSON parsing failed, but HTTP status was OK
            console.warn('Jira update succeeded but response JSON was malformed:', jsonError.message);
            console.log('This is usually fine - the update likely worked despite the JSON error');
            // Don't throw error here since the update probably succeeded
        }
        
        console.log('Team health updated successfully in Jira');
        return; // Success
    }
    
    // If we get here, the HTTP status was not OK
    console.error('Jira update failed with status:', response.status);
    
    try {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
    } catch (jsonError) {
        // Could not parse error response either
        throw new Error(`Jira update failed with status ${response.status} (could not parse error details)`);
    }
}

async function createTeamInJira(teamName, healthData) {
    const response = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: '/rest/api/3/issue',
            method: 'POST',
            body: {
                fields: {
                    project: { key: 'TH' },
                    issuetype: { name: 'Teams' },
                    summary: teamName,
                    // Initialize all health dimensions
                    'customfield_10257': healthData.capacity ? { value: healthData.capacity } : null,
                    'customfield_10258': healthData.skillset ? { value: healthData.skillset } : null,
                    'customfield_10259': healthData.vision ? { value: healthData.vision } : null,
                    'customfield_10260': healthData.support ? { value: healthData.support } : null,
                    'customfield_10261': healthData.teamwork ? { value: healthData.teamwork } : null,
                    'customfield_10262': healthData.autonomy ? { value: healthData.autonomy } : null,
                    'customfield_10264': healthData.utilization
                }
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to create team in Jira');
    }
    
    const result = await response.json();
    return { key: result.key, id: result.id };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDimensionColorClass(value) {
    switch(value) {
        case 'Healthy': return 'text-green-600';
        case 'At Risk': return 'text-yellow-600';
        case 'Critical': return 'text-red-600';
        default: return 'text-gray-500';
    }
}

function getDimensionBorderColor(value) {
    switch(value) {
        case 'Healthy': return 'var(--accent-green)';
        case 'At Risk': return 'var(--accent-orange)';
        case 'Critical': return 'var(--accent-red)';
        default: return 'var(--border-primary)';
    }
}

function getDimensionIcon(iconType, color) {
    const icons = {
        'clock': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
        'life-buoy': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95"/><path d="m2 15 6 6"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91"/></svg>`,
        'graduation-cap': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
        'users': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>`,
        'eye': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
        'layers': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`
    };
    return icons[iconType] || '';
}

function getHealthStatusColor(level) {
    switch(level) {
        case 'healthy': return 'var(--accent-green)';
        case 'low-risk': return '#f59e0b'; // Amber
        case 'high-risk': return 'var(--accent-orange)';
        case 'critical': return 'var(--accent-red)';
        default: return '#6b7280'; // Grey
    }
}

function getHealthStatusDescription(level, teamData) {
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    const atRiskCount = dimensions.filter(dim => teamData[dim] === 'At Risk').length;
    const criticalCount = dimensions.filter(dim => teamData[dim] === 'Critical').length;
    
    if (criticalCount > 0) {
        return `${criticalCount} dimension${criticalCount > 1 ? 's' : ''} critical, ${atRiskCount} at risk`;
    }
    if (atRiskCount > 0) {
        return `${atRiskCount} of 6 dimensions at risk`;
    }
    return 'All dimensions healthy';
}

function generateHealthInsights(teamData) {
    const insights = [];
    
    // Check utilization
    const utilization = teamData.jira?.utilization;
    if (utilization) {
        if (utilization > 95) {
            insights.push('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg><strong>Capacity Risk:</strong> Team operating at high utilization. Consider redistributing workload or adding resources.');
        } else if (utilization < 50) {
            insights.push('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg><strong>Utilization Note:</strong> Team has available capacity for additional work.');
        }
    }
    
    // Check critical dimensions
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    dimensions.forEach(dim => {
        if (teamData[dim] === 'Critical') {
            const insights_text = {
                'capacity': 'Team critically overloaded. Immediate workload reduction needed.',
                'skillset': 'Missing critical skills. Consider training or hiring.',
                'vision': 'Lack of clear direction. Leadership alignment needed.',
                'support': 'Team lacks necessary tools or organizational support.',
                'teamwork': 'Serious collaboration issues. Team building recommended.',
                'autonomy': 'Team blocked by dependencies. Process improvement needed.'
            };
            insights.push(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2"><path d="m14.876 18.99-1.368 1.323a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.244 1.572"/><path d="M15 15h6"/></svg><strong>${dim.charAt(0).toUpperCase() + dim.slice(1)} Issues:</strong> ${insights_text[dim]}`);
        }
    });
    
    if (insights.length === 0) {
        insights.push('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2"><path d="m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49"/><path d="M15 15h6"/><path d="M18 12v6"/></svg><strong>Team Status:</strong> No immediate health concerns identified.');
    }
    
    return insights.map(insight => `<div class="flex items-start gap-2"><div>${insight}</div></div>`).join('');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300`;
    
    if (type === 'success') {
        notification.style.background = 'var(--accent-green)';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.background = 'var(--accent-red)';
        notification.style.color = 'white';
    } else {
        notification.style.background = 'var(--accent-blue)';
        notification.style.color = 'white';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ============================================================================
// ENHANCED TEAM HEALTH CALCULATION (4-STATE SUPPORT)
// ============================================================================

function getTeamOverallHealth(teamData) {
    let atRiskCount = 0;
    let criticalCount = 0;
    
    const dimensions = ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'];
    
    // Count non-null dimensions only
    const validDimensions = dimensions.filter(dim => teamData[dim] != null);
    
    validDimensions.forEach(dim => {
        if (teamData[dim] === 'At Risk') atRiskCount++;
        if (teamData[dim] === 'Critical') criticalCount++;
    });
    
    // Priority: Critical takes precedence
    if (criticalCount > 0) {
        return {
            text: 'CRITICAL',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>',
            color: 'text-red-700',
            level: 'critical'
        };
    }
    
    // Standard at-risk counting
    if (atRiskCount === 0) {
        return {
            text: 'HEALTHY',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>',
            color: 'text-green-700',
            level: 'healthy'
        };
    }
    
    if (atRiskCount <= 2) {
        return {
            text: 'LOW RISK',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
            color: 'text-amber-700',
            level: 'low-risk'
        };
    }
    
    if (atRiskCount <= 4) {
        return {
            text: 'HIGH RISK',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>',
            color: 'text-orange-700',
            level: 'high-risk'
        };
    }
    
    return {
        text: 'CRITICAL',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>',
        color: 'text-red-700',
        level: 'critical'
    };
}

// ==============================================================================
// ADF (Atlassian Document Format) TEXT EXTRACTION
// Add this to your script.js
// ==============================================================================

/**
 * Extract plain text from Atlassian Document Format (ADF) objects
 * Used for custom field 10263 (Team Health Comments)
 */
function extractTextFromADF(adfObject) {
    if (!adfObject || typeof adfObject !== 'object') {
        return null;
    }
    
    // Handle direct text
    if (adfObject.type === 'text' && adfObject.text) {
        return adfObject.text;
    }
    
    // Handle content arrays
    if (adfObject.content && Array.isArray(adfObject.content)) {
        return adfObject.content
            .map(item => extractTextFromADF(item))
            .filter(text => text !== null)
            .join(' ');
    }
    
    return null;
}

/**
 * Enhanced getFieldValue function that handles ADF for comments
 * REPLACE your existing getFieldValue function with this one
 */
function getFieldValue(issue, fieldId) {
    const fieldValue = issue.fields[fieldId];
    
    // Special handling for comments field (10263) - extract text from ADF
    if (fieldId === 'customfield_10263' && fieldValue && typeof fieldValue === 'object') {
        const extractedText = extractTextFromADF(fieldValue);
        return extractedText && extractedText.trim() ? extractedText.trim() : null;
    }
    
    // Handle custom field objects with value property (most Jira custom fields)
    if (fieldValue && typeof fieldValue === 'object' && fieldValue.value !== undefined) {
        return fieldValue.value;
    }
    
    // Handle arrays of objects with value property (multi-select fields)
    if (Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue[0]?.value !== undefined) {
        return fieldValue.map(item => item.value);
    }
    
    // Return as-is for simple values
    return fieldValue;
}

function exitEditMode() {
    const teamName = window.currentEditingTeam;
    if (teamName) {
        toggleHealthEditMode(teamName);
    }
}

async function submitHealthChanges() {
    const teamName = window.currentEditingTeam;
    if (!teamName) {
        alert('No team selected for editing');
        return;
    }
    
    try {
        // Collect form data
        const formData = {
            capacity: document.getElementById('capacity').value || null,
            skillset: document.getElementById('skillset').value || null,
            vision: document.getElementById('vision').value || null,
            support: document.getElementById('support').value || null,
            teamwork: document.getElementById('teamwork').value || null,
            autonomy: document.getElementById('autonomy').value || null,
            utilization: parseInt(document.getElementById('utilization-input').value) || 0,
            comments: document.getElementById('team-comments').value || null
        };
        
        console.log('Submitting health changes for:', teamName, formData);
        
        // Store the original values for validation later
        const originalData = JSON.parse(JSON.stringify(formData));
        
        // Update local data immediately for responsive UI
        const teamData = boardData.teams[teamName];
        if (teamData) {
            Object.assign(teamData, formData);
            if (teamData.jira) {
                teamData.jira.utilization = formData.utilization;
                teamData.jira.comments = formData.comments;
            }
        }
        
        // Exit edit mode immediately for better UX
        toggleHealthEditMode(teamName);
        
        // Now do the full sync with overlay
        await syncOverlay.syncWithProgress(async () => {
            console.log('=== TEAM HEALTH UPDATE SYNC ===');
            
            // Step 1: Send the update to Jira
            if (typeof updateTeamHealthInJira === 'function') {
                console.log('Syncing team health changes to Jira...');
                await updateTeamHealthInJira(teamName, formData);
                console.log('Team health changes synced to Jira successfully');
            }
            
            // Step 2: Force complete refresh of ALL data from Jira
            console.log('Fetching all fresh data from Jira...');
            const newData = await fetchJiraData();
            
            // Step 3: Update the entire board with fresh data
            console.log('Updating board with fresh Jira data...');
            updateBoardWithLiveData(newData);
            syncState.lastSyncData = newData;
            syncState.lastSyncTime = Date.now();
            
            // Step 4: Validate that our changes actually synced
            const updatedTeamData = newData.teams ? newData.teams[teamName] : boardData.teams[teamName];
            
            if (updatedTeamData) {
                console.log('Validating synced data...');
                console.log('Original form data:', originalData);
                console.log('Synced team data:', updatedTeamData);
                
                // Check if key changes are reflected
                let changesValidated = true;
                const validationResults = [];
                
                // Validate health dimensions
                ['capacity', 'skillset', 'vision', 'support', 'teamwork', 'autonomy'].forEach(dim => {
                    const formValue = originalData[dim];
                    const syncedValue = updatedTeamData[dim];
                    const isValid = formValue === syncedValue;
                    
                    validationResults.push({
                        field: dim,
                        expected: formValue,
                        actual: syncedValue,
                        valid: isValid
                    });
                    
                    if (!isValid) changesValidated = false;
                });
                
                // Validate utilization
                const utilizationValid = originalData.utilization === (updatedTeamData.jira?.utilization || 0);
                validationResults.push({
                    field: 'utilization',
                    expected: originalData.utilization,
                    actual: updatedTeamData.jira?.utilization || 0,
                    valid: utilizationValid
                });
                
                if (!utilizationValid) changesValidated = false;
                
                // Validate comments (extract text for comparison)
                const syncedComments = updatedTeamData.jira?.comments ? 
                    extractTextFromADF(updatedTeamData.jira.comments) : null;
                const commentsValid = (originalData.comments || null) === (syncedComments || null);
                
                validationResults.push({
                    field: 'comments',
                    expected: originalData.comments || null,
                    actual: syncedComments || null,
                    valid: commentsValid
                });
                
                if (!commentsValid) changesValidated = false;
                
                console.log('Validation results:', validationResults);
                
                return {
                    synced: true,
                    validated: changesValidated,
                    teamName: teamName,
                    validationResults: validationResults
                };
            } else {
                throw new Error('Team data not found after sync');
            }
            
        }, {
            title: 'Syncing Team Health',
            subtitle: `Saving ${teamName} changes to Jira...`,
            successTitle: 'Team Health Updated',
            successSubtitle: 'Changes synced and validated successfully',
            errorTitle: 'Sync Failed',
            errorSubtitle: 'Changes may not have been saved'
        });
        
        console.log('Team health update and validation complete!');
        
    } catch (error) {
        console.error('Error in team health sync process:', error);
        
        // DON'T show the awkward "sync failed" dialog to user
        // Instead, automatically run the manual sync in the background
        console.log('Initial sync had issues, automatically running validation sync...');
        
        try {
            // Update the sync overlay to show validation
            if (syncOverlay && syncOverlay.updateMessages) {
                syncOverlay.updateMessages({
                    title: 'Validating Changes',
                    subtitle: 'Ensuring data was saved correctly...'
                });
            }
            
            // Run the manual sync automatically - no user interaction needed
            await triggerManualSync();
            
            // Success! Show success message
            console.log('✅ Validation sync completed successfully');
            
            // If there's an active modal, close it
            const modal = document.getElementById('team-modal');
            if (modal && modal.classList.contains('show')) {
                closeModal();
            }
            
            // Show success feedback
            showTemporarySuccess(`${teamName} health updated successfully!`);
            
        } catch (refreshError) {
            console.error('Both sync and manual refresh failed:', refreshError);
            // Only show error dialog for truly critical failures
            alert('Unable to sync changes to Jira. Please check your connection and try again.');
        }
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function showTemporarySuccess(message) {
    // Create temporary success toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-green);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function exitEditMode() {
    const teamName = window.currentEditingTeam;
    if (teamName) {
        toggleHealthEditMode(teamName);
    }
}
// ==============================================================================
// HELPER FUNCTION: Enhanced validation with user feedback
// ==============================================================================

function showValidationResults(results) {
    const failures = results.validationResults.filter(r => !r.valid);
    
    if (failures.length === 0) {
        // All changes validated successfully
        showTemporarySuccess(`All ${teamName} changes validated in Jira!`);
    } else {
        // Some changes may not have synced
        const failedFields = failures.map(f => f.field).join(', ');
        showTemporaryWarning(`Some changes may not have synced: ${failedFields}. Please check manually.`);
    }
}

function convertTextToADF(text) {
    if (!text || text.trim() === '') {
        return null;
    }
    
    return {
        type: "doc",
        version: 1,
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: text.trim()
                    }
                ]
            }
        ]
    };
}

function showTemporarySuccess(message) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showTemporaryWarning(message) {
    const notification = createNotification(message, 'warning');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function createNotification(message, type) {
    const div = document.createElement('div');
    const bgColor = type === 'success' ? 'var(--accent-green)' : 'var(--accent-orange)';
    
    div.innerHTML = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    return div;
}

// ============================================================================
// PIPELINE TO BOARD - QUICK PRIORITIZE MODAL
// Add these functions to script copy 2.js
// ============================================================================

// 1. OPEN THE MODAL
function openQuickPrioritizeModal(initiative) {
    console.log('Opening quick prioritize modal for:', initiative);
    
    const modal = document.getElementById('quick-prioritize-modal');
    const nameElement = document.getElementById('prioritize-initiative-name');
    const gridElement = document.getElementById('quick-prioritize-grid');
    
    if (!modal || !nameElement || !gridElement) {
        console.error('Modal elements not found!');
        return;
    }
    
    nameElement.textContent = initiative.title;
    
    // Render the priority grid
    renderPriorityGrid(gridElement);
    
    // Show the modal
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.zIndex = '10000';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    
    // Store the current initiative for when a slot is clicked
    modal.dataset.initiativeId = initiative.id;
}

// 2. RENDER THE MINI PYRAMID GRID
function renderPriorityGrid(gridElement) {
    gridElement.innerHTML = '';
    
    const rowConfigs = [
        { row: 1, count: 1, label: 'NOW', color: '#dc2626' },
        { row: 2, count: 2, label: 'NOW', color: '#dc2626' },
        { row: 3, count: 3, label: 'NOW', color: '#dc2626' },
        { row: 4, count: 4, label: 'NEXT', color: '#ea580c' },
        { row: 5, count: 5, label: 'NEXT', color: '#ea580c' },
        { row: 6, count: 6, label: 'LATER', color: '#d97706' },
        { row: 7, count: 7, label: 'LATER', color: '#d97706' },
        { row: 8, count: 8, label: 'LATER', color: '#6b7280' }
    ];
    
    rowConfigs.forEach(config => {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'priority-row-container';
        
        // Show label only for first row of each section
        const showLabel = (config.row === 1 || config.row === 4 || config.row === 6);
        if (showLabel) {
            const label = document.createElement('div');
            label.className = `priority-row-label row-${config.label.toLowerCase()}`;
            label.textContent = config.label;
            rowContainer.appendChild(label);
        } else {
            const spacer = document.createElement('div');
            spacer.style.width = '60px';
            rowContainer.appendChild(spacer);
        }
        
        // Create slots container
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'priority-row-slots';
        
        // Create slots from right to left (col 1 = rightmost = lowest slot number in row)
        for (let col = config.count; col >= 1; col--) {
            const slotNumber = getSlotFromRowCol(config.row, col);
            const slot = createPrioritySlot(slotNumber);
            slotsContainer.appendChild(slot);
        }
        
        rowContainer.appendChild(slotsContainer);
        
        // Row number circle
        const rowNumber = document.createElement('div');
        rowNumber.className = 'priority-row-number';
        rowNumber.style.background = config.color;
        rowNumber.textContent = config.row;
        rowContainer.appendChild(rowNumber);
        
        gridElement.appendChild(rowContainer);
    });
}

// 3. CREATE INDIVIDUAL PRIORITY SLOT
function createPrioritySlot(slotNumber) {
    const slot = document.createElement('div');
    slot.className = 'priority-slot';
    
    // Find if this slot has an initiative
    const existingInitiative = boardData.initiatives.find(init => init.priority === slotNumber);
    
    if (existingInitiative) {
        slot.classList.add('occupied');
        slot.innerHTML = `
            <div class="slot-number">${slotNumber}</div>
            <div class="slot-initiative-title">${existingInitiative.title}</div>
        `;
    } else {
        slot.innerHTML = `
            <div class="slot-number">${slotNumber}</div>
            <div class="slot-empty-text">Empty</div>
        `;
    }
    
    slot.onclick = () => handleSlotClick(slotNumber);
    
    return slot;
}

// 4. HANDLE SLOT CLICK - MOVE INITIATIVE
function handleSlotClick(slotNumber) {
    console.log('Slot clicked:', slotNumber);
    
    const modal = document.getElementById('quick-prioritize-modal');
    const initiativeId = parseInt(modal.dataset.initiativeId);
    
    // Find the initiative in the bullpen
    const initiative = boardData.bullpen.find(init => init && init.id === initiativeId);
    
    if (!initiative) {
        console.error('Initiative not found in bullpen:', initiativeId);
        alert('Error: Initiative not found');
        return;
    }
    
    console.log('Moving initiative to slot:', slotNumber, initiative);
    
    // Close the modal first
    closeQuickPrioritizeModal();
    
    // Use your existing function to move from bullpen to matrix
    handleBullpenToMatrix(initiative, slotNumber);
    
    // Refresh the board and other views
    generatePyramid();
    generateTeamHealthMatrix();
    refreshMendozaState();
    updatePipelineCard(); // This will update the pipeline count
    
    // Show success notification
    showSuccessNotification(`✅ "${initiative.title}" moved to Priority ${slotNumber}`);
}

// 5. SUCCESS NOTIFICATION
function showSuccessNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        z-index: 10001;
        font-weight: 600;
        font-size: 0.875rem;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 6. CLOSE MODAL
function closeQuickPrioritizeModal() {
    const modal = document.getElementById('quick-prioritize-modal');
    modal.style.display = 'none';
}

        init();