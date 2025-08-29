
        let currentZoom = 1;
        let selectedInitiativeId = null;
        let draggedInitiative = null;

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
            
            if (draggedInitiative.priority === "bullpen") {
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

function showAtRiskAnalysisModal(initiative) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Calculate risk factors for this initiative
    const riskAnalysis = analyzeInitiativeRisk(initiative);
    
    // Get risk level and colors based on score
    const riskLevel = getRiskLevel(riskAnalysis.riskScore);
    
    title.textContent = `At-Risk Analysis: ${initiative.title}`;
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Risk Overview Header -->
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, ${riskLevel.bgColor} 0%, ${riskLevel.bgColorLight} 100%); border: 1px solid ${riskLevel.borderColor};">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: ${riskLevel.color}; color: white;">
                            ${riskLevel.icon}
                        </div>
                        <div>
                            <div class="font-bold text-lg" style="color: ${riskLevel.color};">${riskLevel.label}</div>
                            <div class="text-sm" style="color: var(--text-secondary);">Priority ${initiative.priority} • ${initiative.type.toUpperCase()}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold" style="color: ${riskLevel.color};">${riskAnalysis.riskScore}/10</div>
                        <div class="text-xs" style="color: var(--text-secondary);">Risk Score</div>
                        <button onclick="showRiskScoreInfoModal()" class="text-xs underline mt-1 hover:opacity-75 transition-opacity" style="color: var(--accent-blue); background: none; border: none; padding: 0; cursor: pointer;">
                            How is this calculated?
                        </button>
                    </div>
                </div>
                <div class="text-sm" style="color: var(--text-secondary);">
                    ${riskLevel.description} ${riskAnalysis.primaryRiskFactors.length > 0 ? `Primary concerns: ${riskAnalysis.primaryRiskFactors.join(', ')}.` : ''}
                </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
                <!-- Left Column: Risk Factors -->
                <div class="space-y-4">
                    <h3 class="font-semibold text-lg flex items-center gap-2" style="color: var(--text-primary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            <path d="M12 17h.01"/>
                        </svg>
                        Risk Factors
                    </h3>

                    ${riskAnalysis.riskFactors.map(factor => `
                        <div class="p-3 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${factor.color};">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full" style="background: ${factor.color};"></div>
                                    <span class="font-medium text-sm" style="color: var(--text-primary);">${factor.name}</span>
                                </div>
                                <span class="text-xs font-bold px-2 py-1 rounded" style="background: ${factor.color}; color: white;">${factor.severity}</span>
                            </div>
                            <div class="text-xs leading-relaxed" style="color: var(--text-secondary);">${factor.description}</div>
                            <div class="text-xs mt-1" style="color: ${factor.color}; font-weight: 600;">Impact: ${factor.impact}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Right Column: Team Analysis & Actions -->
                <div class="space-y-4">
                    <h3 class="font-semibold text-lg flex items-center gap-2" style="color: var(--text-primary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Impacted Teams (${riskAnalysis.impactedTeams.length})
                    </h3>

                    <div class="space-y-2 max-h-32 overflow-y-auto">
                        ${riskAnalysis.impactedTeams.map(team => `
                            <div class="p-2 rounded cursor-pointer hover:bg-opacity-90 transition-all" 
                                 style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);"
                                 onclick="closeModal(); setTimeout(() => showTeamModal('${team.name}', boardData.teams['${team.name}']), 100);">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="text-lg">${getHealthIcon(boardData.teams[team.name])}</div>
                                        <span class="font-medium text-sm" style="color: var(--text-primary);">${team.name}</span>
                                    </div>
                                    <div class="text-xs" style="color: ${team.riskColor}; font-weight: 600;">${team.riskFactors.join(', ')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Recommended Actions -->
                    <div class="mt-6">
                        <h4 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-blue);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                            Recommended Actions
                        </h4>
                        
                        <div class="space-y-2">
                            ${riskAnalysis.recommendations.map((rec, index) => `
                                <div class="flex items-start gap-2 p-2 rounded" style="background: rgba(59, 130, 246, 0.05);">
                                    <span class="text-xs font-bold px-1.5 py-0.5 rounded-full" style="background: var(--accent-blue); color: white; min-width: 20px; text-align: center;">${index + 1}</span>
                                    <div class="text-xs leading-relaxed" style="color: var(--text-secondary);">${rec}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Actions -->
            <div class="pt-4 border-t" style="border-color: var(--border-primary);">
                <button onclick="showInitiativeModal(boardData.initiatives.find(i => i.id === ${initiative.id}))" 
                        class="w-full px-4 py-2 rounded font-medium transition-colors" 
                        style="background: var(--accent-primary); color: white;">
                    View Full Initiative Details
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function analyzeInitiativeRisk(initiative) {
    const analysis = {
        riskScore: 0,
        riskFactors: [],
        impactedTeams: [],
        primaryRiskFactors: [],
        recommendations: []
    };

    // Analyze teams working on this initiative
    initiative.teams.forEach(teamName => {
        const team = boardData.teams[teamName];
        if (!team) return;

        const teamRiskFactors = [];
        let teamRiskColor = 'var(--accent-green)';

        // Check capacity risk
        if (team.capacity === 'at-risk') {
            teamRiskFactors.push('Capacity');
            analysis.riskScore += 2;
        }

        // Check skillset risk  
        if (team.skillset === 'at-risk') {
            teamRiskFactors.push('Skillset');
            analysis.riskScore += 2;
        }

        // Check leadership risk
        if (team.leadership === 'at-risk') {
            teamRiskFactors.push('Leadership');
            analysis.riskScore += 2;
        }

        // Check utilization
        if (team.jira && team.jira.utilization > 95) {
            teamRiskFactors.push('Over-utilized');
            analysis.riskScore += 1;
        }

        // Determine team risk color
        if (teamRiskFactors.length >= 3) teamRiskColor = 'var(--accent-red)';
        else if (teamRiskFactors.length >= 2) teamRiskColor = '#f97316';
        else if (teamRiskFactors.length >= 1) teamRiskColor = 'var(--accent-orange)';

        if (teamRiskFactors.length > 0) {
            analysis.impactedTeams.push({
                name: teamName,
                riskFactors: teamRiskFactors,
                riskColor: teamRiskColor
            });
        }
    });

    // Add specific risk factors based on analysis
    const capacityIssues = analysis.impactedTeams.filter(t => t.riskFactors.includes('Capacity')).length;
    const skillsetIssues = analysis.impactedTeams.filter(t => t.riskFactors.includes('Skillset')).length;
    const leadershipIssues = analysis.impactedTeams.filter(t => t.riskFactors.includes('Leadership')).length;

    if (capacityIssues > 0) {
        analysis.riskFactors.push({
            name: 'Team Capacity',
            severity: capacityIssues > 1 ? 'CRITICAL' : 'HIGH',
            color: capacityIssues > 1 ? 'var(--accent-red)' : 'var(--accent-orange)',
            description: `${capacityIssues} team(s) are operating at or beyond capacity, risking burnout and delivery delays.`,
            impact: 'Potential delivery delays and team burnout'
        });
        analysis.primaryRiskFactors.push('capacity');
    }

    if (skillsetIssues > 0) {
        analysis.riskFactors.push({
            name: 'Skillset Gaps',
            severity: skillsetIssues > 1 ? 'CRITICAL' : 'HIGH',
            color: skillsetIssues > 1 ? 'var(--accent-red)' : 'var(--accent-orange)',
            description: `${skillsetIssues} team(s) lack required skills, potentially impacting delivery quality and timelines.`,
            impact: 'Quality issues and extended development time'
        });
        analysis.primaryRiskFactors.push('skillset');
    }

    if (leadershipIssues > 0) {
        analysis.riskFactors.push({
            name: 'Leadership Issues',
            severity: leadershipIssues > 1 ? 'CRITICAL' : 'HIGH', 
            color: leadershipIssues > 1 ? 'var(--accent-red)' : 'var(--accent-orange)',
            description: `${leadershipIssues} team(s) have leadership concerns affecting decision-making and coordination.`,
            impact: 'Poor coordination and delayed decisions'
        });
        analysis.primaryRiskFactors.push('leadership');
    }

    // Priority-based risk factors
    const row = getRowColFromSlot(initiative.priority).row;
    if (row <= 2 && analysis.riskScore > 4) {
        analysis.riskFactors.push({
            name: 'Critical Priority Risk',
            severity: 'CRITICAL',
            color: 'var(--accent-red)',
            description: 'High-risk factors on a critical priority initiative pose significant organizational risk.',
            impact: 'Major impact on strategic objectives'
        });
        analysis.riskScore += 2;
    }

    // Generate recommendations
    if (capacityIssues > 0) {
        analysis.recommendations.push('Consider redistributing workload or bringing in additional resources to overloaded teams.');
        analysis.recommendations.push('Implement capacity management strategies and monitor team utilization closely.');
    }

    if (skillsetIssues > 0) {
        analysis.recommendations.push('Arrange targeted training or pair programming to address skill gaps.');
        analysis.recommendations.push('Consider bringing in specialists or consultants for critical skill areas.');
    }

    if (leadershipIssues > 0) {
        analysis.recommendations.push('Provide additional leadership support and clear decision-making frameworks.');
        analysis.recommendations.push('Consider assigning an experienced technical lead or project manager.');
    }

    if (row <= 4 && analysis.riskScore > 6) {
        analysis.recommendations.push('Given the high priority and risk level, consider whether this initiative should be delayed or descoped.');
        analysis.recommendations.push('Establish daily check-ins and escalation procedures to monitor progress closely.');
    }

    // Ensure risk score doesn't exceed 10
    analysis.riskScore = Math.min(analysis.riskScore, 10);

    return analysis;
}

function getRiskLevel(riskScore) {
    if (riskScore <= 2) {
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
    } else if (riskScore <= 4) {
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
    } else if (riskScore <= 7) {
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
            description: 'This initiative has critical risk factors that pose serious threats to delivery and may require escalation or major intervention.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v4"/>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 17h.01"/>
                <circle cx="12" cy="12" r="10"/>
            </svg>`
        };
    }
}

function showRiskScoreInfoModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    title.textContent = 'How is Risk Score Calculated?';
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid var(--accent-blue);">
                <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">
                    The risk score is calculated by analyzing team health factors and initiative priority to provide an objective measure of delivery risk.
                </p>
            </div>
            
            <div class="space-y-3">
                <h3 class="font-semibold text-lg" style="color: var(--text-primary);">Scoring Breakdown:</h3>
                
                <div class="space-y-2">
                    <div class="flex justify-between items-center p-3 rounded" style="background: var(--bg-tertiary);">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" style="background: var(--accent-red);"></div>
                            <span class="text-sm font-medium" style="color: var(--text-primary);">Team Capacity At-Risk</span>
                        </div>
                        <span class="text-sm font-bold" style="color: var(--accent-red);">+2 points</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 rounded" style="background: var(--bg-tertiary);">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" style="background: var(--accent-orange);"></div>
                            <span class="text-sm font-medium" style="color: var(--text-primary);">Team Skillset At-Risk</span>
                        </div>
                        <span class="text-sm font-bold" style="color: var(--accent-orange);">+2 points</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 rounded" style="background: var(--bg-tertiary);">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" style="background: var(--accent-red);"></div>
                            <span class="text-sm font-medium" style="color: var(--text-primary);">Team Leadership At-Risk</span>
                        </div>
                        <span class="text-sm font-bold" style="color: var(--accent-red);">+2 points</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 rounded" style="background: var(--bg-tertiary);">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" style="background: var(--accent-orange);"></div>
                            <span class="text-sm font-medium" style="color: var(--text-primary);">Team Over-Utilization (>95%)</span>
                        </div>
                        <span class="text-sm font-bold" style="color: var(--accent-orange);">+1 point</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 rounded" style="background: var(--bg-tertiary);">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full" style="background: var(--accent-red);"></div>
                            <span class="text-sm font-medium" style="color: var(--text-primary);">Critical Priority + High Risk</span>
                        </div>
                        <span class="text-sm font-bold" style="color: var(--accent-red);">+2 bonus</span>
                    </div>
                </div>
            </div>
            
            <div class="p-3 rounded" style="background: rgba(59, 130, 246, 0.05); border: 1px solid var(--accent-blue);">
                <div class="text-sm" style="color: var(--text-secondary);">
                    <strong style="color: var(--accent-blue);">Note:</strong> Scores are calculated per team working on the initiative. Multiple teams with issues will compound the risk score. Maximum score is capped at 10.
                </div>
            </div>
            
            <div class="pt-4 border-t" style="border-color: var(--border-primary);">
                <button onclick="history.back(); showAtRiskAnalysisModal(boardData.initiatives.find(i => i.id === ${JSON.stringify('${initiative.id}')})); return false;" 
                        class="w-full px-4 py-2 rounded font-medium transition-colors" 
                        style="background: var(--accent-primary); color: white;">
                    Back to Risk Analysis
                </button>
            </div>
        </div>
    `;
}


        function showInitiativeModal(initiative) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Store the element that opened the modal for focus restoration
    modal.dataset.previousFocus = document.activeElement ? document.activeElement.dataset.initiativeId || 'unknown' : 'unknown';
    
    title.textContent = initiative.title;
    content.innerHTML = 
        '<div class="space-y-6">' +
            // Initiative Overview Section
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="m3 8 4-4 4 4"/>' +
                        '<path d="M7 4v16"/>' +
                        '<path d="M11 12h4"/>' +
                        '<path d="M11 16h7"/>' +
                        '<path d="M11 20h10"/>' +
                    '</svg>' +
                    'Initiative Overview' +
                '</h3>' +
                
                '<div class="grid gap-4" style="grid-template-columns: 1fr 1fr 1fr;">' +
                    // Type & Validation
                    '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                        '<div class="text-center">' +
                            '<div class="text-sm font-bold mb-2" style="color: var(--text-secondary);">Type</div>' +
                            '<div class="mb-2">' +
                                '<span class="bento-type-badge bento-type-' + initiative.type + '">' + 
                                    (initiative.type === 'ktlo' ? 'KTLO/TECH' : initiative.type.toUpperCase()) + 
                                '</span>' +
                            '</div>' +
                            '<div class="text-xs" style="color: var(--text-tertiary);">Initiative Classification</div>' +
                        '</div>' +
                    '</div>' +
                    
                    // Progress
                    '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                        '<div class="text-center">' +
                            '<div class="text-sm font-bold mb-2" style="color: var(--text-secondary);">Progress</div>' +
                            '<div class="text-3xl font-bold mb-2" style="color: ' + (initiative.progress >= 70 ? 'var(--accent-green)' : initiative.progress >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)') + ';">' + initiative.progress + '%</div>' +
                            '<div class="progress-bar-container" style="width: 100%; height: 6px; background: var(--bg-quaternary); border-radius: 3px; overflow: hidden; margin: 0 auto;">' +
                                '<div class="progress-bar ' + getProgressClass(initiative.progress) + '" style="width: ' + initiative.progress + '%; height: 100%; border-radius: 3px;"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    // Validation Status
                    '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                        '<div class="text-center">' +
                            '<div class="text-sm font-bold mb-2" style="color: var(--text-secondary);">Validation</div>' +
                            '<div class="flex justify-center mb-2">' + 
                                getValidationIndicator(initiative.validation).replace('absolute top-1 right-1', 'inline-block').replace('width="20" height="20"', 'width="32" height="32"') + 
                            '</div>' +
                            '<div class="text-xs capitalize" style="color: var(--text-tertiary);">' + initiative.validation.replace('-', ' ') + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            // Main Content - Two Columns
            '<div class="grid gap-6" style="grid-template-columns: 1fr 1fr;">' +
                // Left Column - Opportunity Canvas
                '<div>' +
                    '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
                            '<polyline points="14,2 14,8 20,8"/>' +
                            '<line x1="16" y1="13" x2="8" y2="13"/>' +
                            '<line x1="16" y1="17" x2="8" y2="17"/>' +
                            '<polyline points="10,9 9,9 8,9"/>' +
                        '</svg>' +
                        'Opportunity Canvas' +
                    '</h3>' +
                    
                    '<div class="space-y-4">' +
                        // Outcome
                        '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--accent-blue);">' +
                            '<div class="text-sm font-bold mb-2" style="color: var(--accent-blue);">Outcome</div>' +
                            '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">' + (initiative.canvas ? initiative.canvas.outcome : 'N/A') + '</p>' +
                        '</div>' +
                        
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
                        // Jira Analytics
                        '<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--accent-green);">' +
                            '<div class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--accent-green);">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                    '<path d="M3 6h18"/>' +
                                    '<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>' +
                                    '<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>' +
                                    '<line x1="10" x2="10" y1="11" y2="17"/>' +
                                    '<line x1="14" x2="14" y1="11" y2="17"/>' +
                                '</svg>' +
                                'Jira Analytics' +
                            '</div>' +
                            '<div class="grid gap-3" style="grid-template-columns: 1fr 1fr;">' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Epic Key</div>' +
                                    '<div class="text-sm font-bold" style="color: var(--text-primary);">' + (initiative.jira ? initiative.jira.key : 'N/A') + '</div>' +
                                '</div>' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Velocity</div>' +
                                    '<div class="text-sm font-bold" style="color: var(--text-primary);">' + (initiative.jira ? initiative.jira.velocity : 'N/A') + '</div>' +
                                '</div>' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Stories</div>' +
                                    '<div class="text-sm font-bold" style="color: var(--text-primary);">' + (initiative.jira ? initiative.jira.completed + '/' + initiative.jira.stories : 'N/A') + '</div>' +
                                '</div>' +
                                '<div>' +
                                    '<div class="text-xs font-medium" style="color: var(--text-secondary);">Blocked</div>' +
                                    '<div class="text-sm font-bold" style="color: ' + (initiative.jira && initiative.jira.blocked > 5 ? 'var(--accent-red)' : 'var(--text-primary)') + ';">' + (initiative.jira ? initiative.jira.blocked : 'N/A') + '</div>' +
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

        // Updated team modal function with new health dimensions and status levels
function showTeamModal(teamName, teamData) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    const teamHealthIcon = getHealthIcon(teamData);
    let atRiskCount = 0;
    
    // Count all 6 dimensions that are at-risk
    if (teamData.capacity === 'at-risk') atRiskCount++;
    if (teamData.skillset === 'at-risk') atRiskCount++;
    if (teamData.vision === 'at-risk') atRiskCount++;
    if (teamData.support === 'at-risk') atRiskCount++;
    if (teamData.teamwork === 'at-risk') atRiskCount++;
    if (teamData.autonomy === 'at-risk') atRiskCount++;

    // New health status mapping
    let healthText = 'HEALTHY';
    let healthColor = 'var(--accent-green)';
    
    if (atRiskCount === 0) { 
        healthText = 'HEALTHY'; 
        healthColor = 'var(--accent-green)'; 
    } else if (atRiskCount <= 2) { 
        healthText = 'LOW RISK'; 
        healthColor = 'var(--accent-orange)'; 
    } else if (atRiskCount <= 4) { 
        healthText = 'HIGH RISK'; 
        healthColor = '#FF5F1F'; 
    } else { 
        healthText = 'CRITICAL'; 
        healthColor = 'var(--accent-red)'; 
    }

    title.innerHTML = teamName;
    
    // Generate notes for at-risk teams - updated for new dimensions
    const generateTeamNotes = (teamName, teamData) => {
        const notes = [];
        
        if (teamData.capacity === 'at-risk') {
            notes.push('<div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0" style="color: var(--accent-orange);"><path d="M12 6v6l1.56.78"/><circle cx="12" cy="12" r="10"/></svg><span>Capacity Risk: Team is operating at ' + teamData.jira.utilization + '% utilization. Consider redistributing workload or adding resources.</span></div>');
        }
        
        if (teamData.skillset === 'at-risk') {
            notes.push('<div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0" style="color: var(--accent-blue);"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><span>Skillset Gap: Team may need training or expertise in emerging technologies relevant to their initiatives.</span></div>');
        }
        
        if (teamData.vision === 'at-risk') {
            notes.push('<div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0" style="color: var(--accent-purple);"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><span>Vision Gap: Team may lack clarity on goals and strategic direction. Consider alignment sessions with leadership.</span></div>');
        }
        
        if (teamData.support === 'at-risk') {
            notes.push('<div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0" style="color: var(--accent-teal);"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg><span>Support Issues: Team may need better tools, resources, or organizational backing to be effective.</span></div>');
        }
        
        if (teamData.teamwork === 'at-risk') {
            notes.push('<div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0" style="color: var(--accent-pink);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Teamwork Concerns: Communication and collaboration may need improvement. Consider team building or process changes.</span></div>');
        }
        
        if (teamData.autonomy === 'at-risk') {
            notes.push('<div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0" style="color: var(--accent-indigo);"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg><span>Autonomy Issues: Team may have limited decision-making authority. Consider empowering team leads or reducing approval bottlenecks.</span></div>');
        }
        
        return notes;
    };
    
    const teamNotes = generateTeamNotes(teamName, teamData);
    
    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column - Health Dimensions -->
            <div>
                <!-- Overall Health Status -->
                <div class="mb-6 p-4 rounded-lg text-center" style="background: linear-gradient(135deg, ${healthColor}, ${healthColor}); border: 1px solid ${healthColor};">
                    <div class="flex items-center justify-center gap-3 mb-2">
                        <div class="text-2xl">${teamHealthIcon}</div>
                        <div class="text-2xl font-bold text-white">${healthText}</div>
                    </div>
                    <div class="text-sm text-white opacity-90">${atRiskCount} of 6 dimensions at risk</div>
                </div>
                
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49"/>
                        <path d="M15 15h6"/>
                        <path d="M18 12v6"/>
                    </svg>
                    Health Dimensions
                </h3>
                
                <!-- All 6 Health Dimensions -->
                <div class="space-y-3">
                    <!-- Capacity -->
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${teamData.capacity === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${teamData.capacity === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 6v6l1.56.78"/>
                                    <circle cx="12" cy="12" r="10"/>
                                </svg>
                                <div>
                                    <div class="text-sm font-bold" style="color: var(--text-primary);">Capacity</div>
                                    <div class="text-xs" style="color: var(--text-secondary);">Workload & Resources</div>
                                </div>
                            </div>
                            <div class="text-lg font-bold capitalize" style="color: ${teamData.capacity === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">${teamData.capacity.replace('-', ' ')}</div>
                        </div>
                    </div>
                    
                    <!-- Skillset -->
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${teamData.skillset === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${teamData.skillset === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                                <div>
                                    <div class="text-sm font-bold" style="color: var(--text-primary);">Skillset</div>
                                    <div class="text-xs" style="color: var(--text-secondary);">Technical Capabilities</div>
                                </div>
                            </div>
                            <div class="text-lg font-bold capitalize" style="color: ${teamData.skillset === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">${teamData.skillset.replace('-', ' ')}</div>
                        </div>
                    </div>
                    
                    <!-- Vision -->
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${teamData.vision === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${teamData.vision === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <div>
                                    <div class="text-sm font-bold" style="color: var(--text-primary);">Vision</div>
                                    <div class="text-xs" style="color: var(--text-secondary);">Clarity & Alignment</div>
                                </div>
                            </div>
                            <div class="text-lg font-bold capitalize" style="color: ${teamData.vision === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">${teamData.vision.replace('-', ' ')}</div>
                        </div>
                    </div>
                    
                    <!-- Support -->
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${teamData.support === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${teamData.support === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M7 10v12"/>
                                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                                </svg>
                                <div>
                                    <div class="text-sm font-bold" style="color: var(--text-primary);">Support</div>
                                    <div class="text-xs" style="color: var(--text-secondary);">Tools & Org Backing</div>
                                </div>
                            </div>
                            <div class="text-lg font-bold capitalize" style="color: ${teamData.support === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">${teamData.support.replace('-', ' ')}</div>
                        </div>
                    </div>
                    
                    <!-- Teamwork -->
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${teamData.teamwork === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${teamData.teamwork === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <div>
                                    <div class="text-sm font-bold" style="color: var(--text-primary);">Teamwork</div>
                                    <div class="text-xs" style="color: var(--text-secondary);">Collaboration & Communication</div>
                                </div>
                            </div>
                            <div class="text-lg font-bold capitalize" style="color: ${teamData.teamwork === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">${teamData.teamwork.replace('-', ' ')}</div>
                        </div>
                    </div>
                    
                    <!-- Autonomy -->
                    <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid ${teamData.autonomy === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${teamData.autonomy === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                                <div>
                                    <div class="text-sm font-bold" style="color: var(--text-primary);">Autonomy</div>
                                    <div class="text-xs" style="color: var(--text-secondary);">Decision-making Independence</div>
                                </div>
                            </div>
                            <div class="text-lg font-bold capitalize" style="color: ${teamData.autonomy === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)'};">${teamData.autonomy.replace('-', ' ')}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Column - Team Metrics & Notes -->
            <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                        <path d="M7 11h8"/>
                        <path d="M7 16h12"/>
                        <path d="M7 6h16"/>
                    </svg>
                    Performance Metrics
                </h3>
                
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="text-center p-3 rounded-lg" style="background: var(--bg-tertiary);">
                        <div class="text-2xl font-bold" style="color: var(--text-primary);">${teamData.jira.velocity}</div>
                        <div class="text-xs" style="color: var(--text-secondary);">Sprint Velocity</div>
                    </div>
                    <div class="text-center p-3 rounded-lg" style="background: var(--bg-tertiary);">
                        <div class="text-2xl font-bold" style="color: var(--text-primary);">${teamData.jira.utilization}%</div>
                        <div class="text-xs" style="color: var(--text-secondary);">Utilization</div>
                    </div>
                    <div class="text-center p-3 rounded-lg" style="background: var(--bg-tertiary);">
                        <div class="text-2xl font-bold" style="color: var(--text-primary);">${teamData.jira.stories}</div>
                        <div class="text-xs" style="color: var(--text-secondary);">Active Stories</div>
                    </div>
                    <div class="text-center p-3 rounded-lg" style="background: var(--bg-tertiary);">
                        <div class="text-2xl font-bold" style="color: var(--text-primary);">${teamData.jira.blockers}</div>
                        <div class="text-xs" style="color: var(--text-secondary);">Blockers</div>
                    </div>
                </div>
                
                ${teamNotes.length > 0 ? `
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 8v4"/>
                        <path d="M12 16h.01"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9"/>
                    </svg>
                    Health Insights
                </h3>
                <div class="space-y-3">
                    ${teamNotes.join('')}
                </div>` : ''}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus the close button for immediate keyboard navigation
    setTimeout(() => {
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
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
    clearHighlights();
    selectedInitiativeId = initiativeId;
    
    const initiative = boardData.initiatives.find(init => init.id === initiativeId);
    if (!initiative) return;
    
    // Highlight the initiative card
    document.querySelectorAll('.initiative-card').forEach(card => {
        if (parseInt(card.dataset.initiativeId) === initiativeId) {
            card.classList.add('highlighted');
        }
    });
    
    // Only highlight team cards on the same row as the initiative
    initiative.teams.forEach(teamName => {
        document.querySelectorAll('.team-health-card').forEach(card => {
            if (card.dataset.teamName === teamName && 
                parseInt(card.dataset.initiativeId) === initiativeId) {
                card.classList.add('highlighted');
            }
        });
    });
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
    if (teamData.capacity === 'at-risk') atRiskCount++;
    if (teamData.skillset === 'at-risk') atRiskCount++;
    if (teamData.vision === 'at-risk') atRiskCount++;
    if (teamData.support === 'at-risk') atRiskCount++;
    if (teamData.teamwork === 'at-risk') atRiskCount++;
    if (teamData.autonomy === 'at-risk') atRiskCount++;
    
    if (atRiskCount === 0) return 'team-health-white'; // Healthy
    if (atRiskCount <= 2) return 'team-health-yellow'; // Low Risk  
    if (atRiskCount <= 4) return 'team-health-high-risk'; // High Risk
    return 'team-health-red'; // Critical
}
        
        // Updated function to get health icon (keeping same Lucide icons)
function getHealthIcon(teamData) {
    let atRiskCount = 0;
    if (teamData.capacity === 'at-risk') atRiskCount++;
    if (teamData.skillset === 'at-risk') atRiskCount++;
    if (teamData.vision === 'at-risk') atRiskCount++;
    if (teamData.support === 'at-risk') atRiskCount++;
    if (teamData.teamwork === 'at-risk') atRiskCount++;
    if (teamData.autonomy === 'at-risk') atRiskCount++;
    
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
    if (teamData.capacity === 'at-risk') atRiskCount++;
    if (teamData.skillset === 'at-risk') atRiskCount++;
    if (teamData.vision === 'at-risk') atRiskCount++;
    if (teamData.support === 'at-risk') atRiskCount++;
    if (teamData.teamwork === 'at-risk') atRiskCount++;
    if (teamData.autonomy === 'at-risk') atRiskCount++;
    
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
    if (teamData.capacity === 'at-risk') atRiskCount++;
    if (teamData.skillset === 'at-risk') atRiskCount++;
    if (teamData.vision === 'at-risk') atRiskCount++;
    if (teamData.support === 'at-risk') atRiskCount++;
    if (teamData.teamwork === 'at-risk') atRiskCount++;
    if (teamData.autonomy === 'at-risk') atRiskCount++;
    
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
                    '<div class="dimension-cell ' + (teamData.capacity === 'at-risk' ? 'at-risk' : 'healthy') + '" title="Capacity - Workload & Resources">C</div>' +
                    '<div class="dimension-cell ' + (teamData.support === 'at-risk' ? 'at-risk' : 'healthy') + '" title="Support - Tools & Organizational Backing">Su</div>' +
                '</div>' +
                // Second column: S, T  
                '<div class="grid-column">' +
                    '<div class="dimension-cell ' + (teamData.skillset === 'at-risk' ? 'at-risk' : 'healthy') + '" title="Skillset - Technical Capabilities">S</div>' +
                    '<div class="dimension-cell ' + (teamData.teamwork === 'at-risk' ? 'at-risk' : 'healthy') + '" title="Teamwork - Collaboration & Communication">T</div>' +
                '</div>' +
                // Third column: V, A
                '<div class="grid-column">' +
                    '<div class="dimension-cell ' + (teamData.vision === 'at-risk' ? 'at-risk' : 'healthy') + '" title="Vision - Clarity & Alignment">V</div>' +
                    '<div class="dimension-cell ' + (teamData.autonomy === 'at-risk' ? 'at-risk' : 'healthy') + '" title="Autonomy - Decision-making Independence">A</div>' +
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
    // Manually specify misaligned initiatives for demo
    const misalignedInitiativeIds = [2, 13, 17]; // RMC Call Queue (high priority), Backup Strategy (low priority), Compliance Automation (low priority)
    
    if (misalignedInitiativeIds.includes(initiative.id)) {
        return false;
    }
    
    const okrKeywords = [
        'user', 'customer', 'onboarding', 'experience', 'engagement', 'mobile', // User growth KR
        'uptime', 'reliability', 'incident', 'monitoring', 'backup', 'disaster', 'security', 'performance', // System uptime KR
        'product', 'capability', 'feature', 'api', 'platform', 'analytics', 'recommendation', 'pricing' // New capabilities KR
    ];
    
    const searchText = (initiative.title + ' ' + 
    (initiative.canvas ? initiative.canvas.outcome || '' : '') + ' ' + 
    (initiative.canvas ? initiative.canvas.keyResult || '' : '')).toLowerCase();
    
    return okrKeywords.some(keyword => searchText.includes(keyword));
}
  
       
        //BENTO GRID CREATION FUNCTIONS
        
    function generateBentoGrid() {
    updatePipelineCard();
    updateOKRCard();
    updateProgressCard();
    updateHealthCard();
    updateAtRiskCard();
    updateResourceCard();
    updateDeliveryConfidenceCard();
    updateCriticalTeamStatusCard();
    updateCompletedCard();
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
    <div class="bento-pipeline-item-title">
        ${initiative.title}
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
        <span class="bento-type-badge bento-type-${initiative.type}">${initiative.type.toUpperCase()}</span>
        <div class="bento-pipeline-validation">
            ${getValidationIcon(initiative.validation)}
            <span class="bento-validation-text">${getValidationText(initiative.validation)}</span>
        </div>
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
    
    // Calculate misaligned initiatives count
    const misalignedCount = boardData.initiatives.filter(init => !isAlignedWithOKRs(init)).length;
    
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
        <div class="h-full flex flex-col items-center justify-center text-center space-y-2 kpi-gauge-card">
            <div class="text-sm font-bold" style="color: var(--text-secondary);">Aligned Initiatives</div>
            <div class="kpi-current-value" style="color: ${color};">${alignmentPercentage}%</div>
            <div class="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1" 
                 onclick="event.stopPropagation(); showMisalignedInitiativesModal()"
                 title="View initiatives needing review">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/>
                    <path d="M12 17h.01"/>
                </svg>
                <span class="text-sm font-bold"" style="color: var(--accent-orange);">${misalignedCount} initiatives need review</span>
            </div>
        </div>
    `;
    
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

function showMendozaAnalysisModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    // Calculate team distribution for impact analysis (keep existing)
    const highPriorityOnlyTeams = getTeamsWorkingOnlyOnHighPriority();
    const lowPriorityOnlyTeams = getTeamsWorkingOnlyOnLowPriority();
    const mixedTeams = getTeamsWorkingOnMixed();
    
    // Mock data for below-line work breakdown
    const activityBreakdown = {
        validation: 60,
        prototyping: 25,
        planning: 10,
        fullDevelopment: 5
    };
    
    const appropriateWork = [
        { team: 'Design/UX', activity: 'User research, prototyping', hours: 40 },
        { team: 'Product Management', activity: 'Market validation, discovery', hours: 25 },
        { team: 'Analytics', activity: 'Data exploration', hours: 15 }
    ];
    
    const borderlineWork = [
        { team: 'Engineering', activity: 'Architecture design', hours: 8 },
        { team: 'DevOps', activity: 'Infrastructure planning', hours: 4 }
    ];
    
    const considerPromotion = [
        { team: 'Engineering - Mobile App MVP', activity: 'Full feature development', hours: 20 },
        { team: 'Core Platform', activity: 'Production work', hours: 8 }
    ];
    
    title.textContent = 'Impact Analysis';
    content.innerHTML = 
        '<div class="space-y-6">' +
            // Keep existing impact analysis boxes
            '<div class="grid grid-cols-3 gap-4">' +
                '<div class="p-4 rounded-lg text-center" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%); border: 1px solid var(--accent-green);">' +
                    '<div class="text-3xl font-bold" style="color: var(--accent-green);">' + highPriorityOnlyTeams.length + '</div>' +
                    '<div class="text-sm font-medium mt-1" style="color: var(--accent-green);">Teams</div>' +
                    '<div class="text-xs mt-2" style="color: var(--text-secondary);">working ONLY on high-priority initiatives</div>' +
                '</div>' +
                
                '<div class="p-4 rounded-lg text-center" style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%); border: 1px solid var(--accent-red);">' +
                    '<div class="text-3xl font-bold" style="color: var(--accent-red);">' + lowPriorityOnlyTeams.length + '</div>' +
                    '<div class="text-sm font-medium mt-1" style="color: var(--accent-red);">Teams</div>' +
                    '<div class="text-xs mt-2" style="color: var(--text-secondary);">working ONLY on low-priority initiatives</div>' +
                '</div>' +
                
                '<div class="p-4 rounded-lg text-center" style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%); border: 1px solid var(--accent-orange);">' +
                    '<div class="text-3xl font-bold" style="color: var(--accent-orange);">' + mixedTeams.length + '</div>' +
                    '<div class="text-sm font-medium mt-1" style="color: var(--accent-orange);">Teams</div>' +
                    '<div class="text-xs mt-2" style="color: var(--text-secondary);">working on both high and low priority initiatives</div>' +
                '</div>' +
            '</div>' +
            
            // Keep existing Mendoza Line info box
            '<div class="p-4 rounded-lg" style="background: var(--status-info-bg); border: 1px solid var(--accent-blue);">' +
                '<h5 class="font-medium mb-2 flex items-center gap-2" style="color: var(--accent-blue);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<circle cx="12" cy="12" r="10"/>' +
                        '<path d="M12 16v-4"/>' +
                        '<path d="M12 8h.01"/>' +
                    '</svg>' +
                    'Mendoza Line Concept' +
                '</h5>' +
                '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">Named after baseball\'s .200 batting average threshold in baseball, the Mendoza Line represents the minimum acceptable performance level. In portfolio management, initiatives below this line may not justify organizational resources and attention.</p>' +
            '</div>' +
            
            // NEW: Below-Line Work Analysis
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M3 3v5h5"/>' +
                        '<path d="M6 17a9 9 0 1 0 6-15"/>' +
                    '</svg>' +
                    'Below-Line Work Analysis' +
                '</h3>' +
                
                // Activity Breakdown Chart
                '<div class="grid gap-4" style="grid-template-columns: 200px 1fr;">' +
                    '<div class="flex justify-center">' +
                        '<svg width="180" height="180" viewBox="0 0 180 180">' +
                            '<!-- Validation (60%) - Green -->' +
                            '<circle cx="90" cy="90" r="70" fill="transparent" stroke="var(--accent-green)" stroke-width="20" stroke-dasharray="264 440" stroke-dashoffset="0" transform="rotate(-90 90 90)"/>' +
                            '<!-- Prototyping (25%) - Green -->' +
                            '<circle cx="90" cy="90" r="70" fill="transparent" stroke="var(--accent-green)" stroke-width="20" stroke-dasharray="110 440" stroke-dashoffset="-264" transform="rotate(-90 90 90)"/>' +
                            '<!-- Planning (10%) - Yellow -->' +
                            '<circle cx="90" cy="90" r="70" fill="transparent" stroke="var(--accent-orange)" stroke-width="20" stroke-dasharray="44 440" stroke-dashoffset="-374" transform="rotate(-90 90 90)"/>' +
                            '<!-- Full Development (5%) - Red -->' +
                            '<circle cx="90" cy="90" r="70" fill="transparent" stroke="var(--accent-red)" stroke-width="20" stroke-dasharray="22 440" stroke-dashoffset="-418" transform="rotate(-90 90 90)"/>' +
                            '<text x="90" y="95" text-anchor="middle" style="fill: var(--text-primary); font-size: 14px; font-weight: bold;">Activity</text>' +
                            '<text x="90" y="110" text-anchor="middle" style="fill: var(--text-secondary); font-size: 12px;">Breakdown</text>' +
                        '</svg>' +
                    '</div>' +
                    
                    // Legend and Details
                    '<div class="space-y-4">' +
                        // Legend
                        '<div class="grid grid-cols-2 gap-2 text-sm">' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded" style="background: var(--accent-green);"></div>' +
                                '<span>Validation (60%)</span>' +
                            '</div>' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded" style="background: var(--accent-green);"></div>' +
                                '<span>Prototyping (25%)</span>' +
                            '</div>' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded" style="background: var(--accent-orange);"></div>' +
                                '<span>Planning (10%)</span>' +
                            '</div>' +
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded" style="background: var(--accent-red);"></div>' +
                                '<span>Full Development (5%)</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                // Resource Allocation Details
                '<div class="mt-6 space-y-4">' +
                    '<h4 class="font-medium" style="color: var(--text-primary);">Resource Allocation Review:</h4>' +
                    
                    // Appropriate Work
                    '<div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%); border: 1px solid var(--accent-green);">' +
                        '<h5 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-green);">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                '<path d="m9 12 2 2 4-4"/>' +
                                '<path d="M21 12c.552 0 1-.448 1-1V5l-8-3-8 3v6c0 .552.448 1 1 1z"/>' +
                            '</svg>' +
                            'APPROPRIATE WORK (85%)' +
                        '</h5>' +
                        '<div class="space-y-2">' +
                            appropriateWork.map(item => `
                                <div class="flex justify-between items-center text-sm">
                                    <span style="color: var(--text-primary);">• ${item.team}: ${item.activity}</span>
                                    <span style="color: var(--text-tertiary);">(${item.hours} hrs)</span>
                                </div>
                            `).join('') +
                        '</div>' +
                    '</div>' +
                    
                    // Borderline Work
                    (borderlineWork.length > 0 ? 
                        '<div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%); border: 1px solid var(--accent-orange);">' +
                            '<h5 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-orange);">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                    '<path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>' +
                                    '<path d="M12 17h.01"/>' +
                                '</svg>' +
                                'REVIEW RECOMMENDED (10%)' +
                            '</h5>' +
                            '<div class="space-y-2">' +
                                borderlineWork.map(item => `
                                    <div class="flex justify-between items-center text-sm">
                                        <span style="color: var(--text-primary);">• ${item.team}: ${item.activity}</span>
                                        <span style="color: var(--text-tertiary);">(${item.hours} hrs)</span>
                                    </div>
                                `).join('') +
                            '</div>' +
                        '</div>' : ''
                    ) +
                    
                    // Consider Promotion
                    (considerPromotion.length > 0 ? 
                        '<div class="p-4 rounded-lg" style="background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%); border: 1px solid var(--accent-red);">' +
                            '<h5 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-red);">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                    '<path d="M16 3h5v5"/>' +
                                    '<path d="M8 3H3v5"/>' +
                                    '<path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/>' +
                                    '<path d="m15 9 6-6"/>' +
                                '</svg>' +
                                'CONSIDER PROMOTION (5%)' +
                            '</h5>' +
                            '<div class="space-y-2 mb-3">' +
                                considerPromotion.map(item => `
                                    <div class="flex justify-between items-center text-sm">
                                        <span style="color: var(--text-primary);">• ${item.team}: ${item.activity}</span>
                                        <span style="color: var(--text-tertiary);">(${item.hours} hrs)</span>
                                    </div>
                                `).join('') +
                            '</div>' +
                            '<p class="text-sm" style="color: var(--text-secondary);">Suggestion: Consider promoting these initiatives above the Mendoza line for full development resources.</p>' +
                        '</div>' : ''
                    ) +
                '</div>' +
            '</div>' +
        '</div>';
    
    modal.classList.add('show');
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
      
  function updateProgressCard() {
   const content = document.getElementById('progress-overview-content');
   
   // Calculate KPI values
   const kpis = calculateOKRProgress();
   
   content.innerHTML = `
       <div class="grid grid-cols-3 gap-2 h-full">
           ${kpis.map((kpi, index) => `
               <div class="kpi-gauge-card">
                   <div class="kpi-gauge-header" style="min-height: 4.5em; display: flex; align-items: flex-start; justify-content: flex-start; text-align: left; padding-top: 0.5rem;">${kpi.title}</div>
                   
                   <!-- Centered content group - moved up -->
                   <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; flex: 1; margin-top:  -1.3rem; margin-bottom: 0.25rem; padding-top: 0;">
                       
                       <div style="color: white; font-size: clamp(0.75rem, 1vw, 0.875rem); text-align: center; margin-bottom: 0.25rem;">Target: ${kpi.targetValue}</div>
                       
                       <div class="kpi-current-value" style="color: ${kpi.color};">${kpi.currentValue}</div>
                       
                       <div class="kpi-gauge-chart" style="margin-bottom: 6px;">
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
                       
                       <div class="kpi-trend-chart" style="margin-bottom: 0.25rem;">
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
                               <polygon points="${index === 2 ? 
                                // For Strategic Capabilities (index 2), show progression from 0 to 1
                                "0,35 20,35 40,35 60,28 80,28 100,28 120,28 120,35 0,35" :
                                   // For other KPIs, create fill area from trend line to X-axis
                                   kpi.trendPoints.split(' ').map((point, pointIndex) => {
                                       const [x, y] = point.split(',');
                                       return `${pointIndex * 20},${35 - (parseInt(y) * 1.2)}`;
                                   }).join(' ') + ' 120,35 0,35'
                               }" 
                                         fill="url(#trendGradient${index})" stroke="none"/>
                               
                               <!-- Trend line - Special handling for Strategic Capabilities -->
                                <polyline points="${index === 2 ? 
                                // For Strategic Capabilities (index 2), show progression from 0 to 1
                                "0,35 20,35 40,35 60,28 80,28 100,28 120,28" :
                                   // For other KPIs, use normal calculation
                                   kpi.trendPoints.split(' ').map((point, pointIndex) => {
                                       const [x, y] = point.split(',');
                                       return `${pointIndex * 20},${35 - (parseInt(y) * 1.2)}`;
                                   }).join(' ')
                               }" 
                                         fill="none" stroke="${kpi.color}" stroke-width="2" stroke-linecap="round"/>
                               <!-- Current data point -->
                                <circle cx="120" cy="${index === 2 ? 28 : 35 - (parseInt(kpi.trendPoints.split(' ').pop().split(',')[1]) * 1.2)}" r="2" fill="${kpi.color}"/>
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
   const kpis = calculateOKRProgress();
   
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
        
        <!-- Teamwork -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
            <div style="flex: 1; display: flex; align-items: end; width: 100%;">
                <div class="cursor-pointer kpi-gauge-card"
                     onclick="showHealthIndicatorModal('teamwork')"
                     title="Teamwork Issues: ${indicatorCounts.teamwork} teams"
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
            <div style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; margin-top: 0.25rem; text-align: center;">Teamwork</div>
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
    const atRiskInitiatives = getTopAtRiskInitiatives().slice(0, 3);
    
    content.innerHTML = '<div class="flex gap-3 h-full">' + 
        atRiskInitiatives.map(initiative => {
            // Get the dynamic priority number from the initiative's position
            const priorityText = initiative.priority === 'bullpen' ? 'Bullpen' : initiative.priority;
            
            // Calculate risk level and get colors (simplified version for cards)
            const riskScore = calculateSimpleRiskScore(initiative);
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
                        
                        <!-- Priority text -->
                        <div class="text-xs opacity-90 mb-2" style="font-weight: 500;">
                            Priority: ${priorityText}
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

// Simplified risk calculation for cards (doesn't need full analysis object)
function calculateSimpleRiskScore(initiative) {
    let riskScore = 0;
    
    // Analyze teams working on this initiative
    initiative.teams.forEach(teamName => {
        const team = boardData.teams[teamName];
        if (!team) return;

        // Check capacity risk
        if (team.capacity === 'at-risk') riskScore += 2;
        // Check skillset risk  
        if (team.skillset === 'at-risk') riskScore += 2;
        // Check leadership risk
        if (team.leadership === 'at-risk') riskScore += 2;
        // Check utilization
        if (team.jira && team.jira.utilization > 95) riskScore += 1;
    });

    // Priority-based risk factors
    const row = getRowColFromSlot(initiative.priority).row;
    if (row <= 2 && riskScore > 4) riskScore += 2;

    return Math.min(riskScore, 10);
}

// Get risk color based on score
function getRiskLevelColor(riskScore) {
    if (riskScore <= 2) return 'var(--accent-green)';
    if (riskScore <= 4) return 'var(--accent-orange)';
    if (riskScore <= 7) return '#f97316';
    return 'var(--accent-red)';
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
    const content = document.getElementById('critical-team-status-content');
    
    // TODO: Implement critical team status logic
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

function updateCompletedCard() {
    const content = document.getElementById('completed-content');
    
    content.innerHTML = boardData.recentlyCompleted.slice(-2).map(initiative => `
        <div class="bento-pipeline-item validation-${initiative.validation}" 
             data-initiative-id="${initiative.id}"
             onclick="showInitiativeModal(boardData.recentlyCompleted.find(init => init.id === ${initiative.id}))"
             style="position: relative;">
            <div class="bento-pipeline-item-header">
                <div class="bento-pipeline-item-title">
                    ${initiative.title}
                </div>
            </div>
        </div>
    `).join('');
}

function updateValidationCard() {
    const content = document.getElementById('validation-pipeline-content');
    
    // Count totals for the main numbers
    const totalInValidation = boardData.initiatives.filter(init => init.validation === 'in-validation').length;
    const totalNotValidated = boardData.initiatives.filter(init => init.validation === 'not-validated').length;
    
    content.innerHTML = `
    <div class="h-full flex items-center justify-center gap-6">
        <!-- In Validation - Left -->
        <div class="validation-metric-card cursor-pointer hover:scale-105 transition-all duration-200" onclick="showInValidationModal()">
            <div class="kpi-current-value" style="color: #f59e0b;">${totalInValidation}</div>
            <div class="text-xs font-medium text-center" style="color: var(--text-secondary);">Initiatives<br>In Validation</div>
        </div>
        
        <!-- Not Validated - Right -->
        <div class="validation-metric-card cursor-pointer hover:scale-105 transition-all duration-200" onclick="showNotValidatedModal()">
            <div class="kpi-current-value" style="color: #ef4444;">${totalNotValidated}</div>
            <div class="text-xs font-medium text-center" style="color: var(--text-secondary);">Initiatives<br>Not Validated</div>
        </div>
    </div>
    `;
}

// Add this CSS to your styles.css file
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

function showInValidationModal() {
   const modal = document.getElementById('detail-modal');
   const title = document.getElementById('modal-title');
   const content = document.getElementById('modal-content');
   
   const inValidationInitiatives = boardData.initiatives
       .filter(init => init.validation === 'in-validation')
       .sort((a, b) => {
           // Sort by priority order (lower number = higher priority)
           if (a.priority === "bullpen" && b.priority === "bullpen") return 0;
           if (a.priority === "bullpen") return 1;
           if (b.priority === "bullpen") return -1;
           return a.priority - b.priority;
       });
   
   const highPriorityInValidation = inValidationInitiatives.filter(init => {
       if (init.priority === "bullpen") return false;
       return getRowColFromSlot(init.priority).row <= 4;
   });
   
   title.textContent = 'Initiatives In Validation';
   content.innerHTML = 
       '<div class="space-y-6">' +
           // Header Section
           '<div>' +
               '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                   '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                       '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>' +
                   '</svg>' +
                   'Validation Pipeline Overview - ' + inValidationInitiatives.length + ' Initiatives In Validation' +
               '</h3>' +
               
               // Initiatives List - Full Width
               '<div style="background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%); border: 1px solid var(--accent-orange);" class="rounded-lg p-4">' +
                   '<h4 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-orange);">' +
                       '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                           '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>' +
                           '<path d="m9.5 14.5 5-5"/>' +
                       '</svg>' +
                       'Initiatives Currently Being Validated' +
                   '</h4>' +
                   '<div class="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">' +
                       inValidationInitiatives.map(init => `
                           <div class="bento-pipeline-item" 
                                onclick="closeModal(); setTimeout(() => showInitiativeModal(boardData.initiatives.find(i => i.id === ${init.id})), 100);"
                                style="position: relative; cursor: pointer;">
                               <div class="bento-pipeline-item-header">
                                   <div class="bento-pipeline-item-title">
                                       ${init.title}
                                       <span class="bento-type-badge bento-type-${init.type}">${init.type.toUpperCase()}</span>
                                   </div>
                                   <div class="flex items-center gap-2">
                                       ${getRowColFromSlot(init.priority).row <= 4 && init.priority !== 'bullpen' ? 
                                           '<span class="text-xs px-2 py-1 rounded" style="background: #dc2626; color: white;">High Priority</span>' : 
                                           ''
                                       }
                                   </div>
                               </div>
                           </div>
                       `).join('') +
                   '</div>' +
               '</div>' +
           '</div>' +
           
           // Action Items Section
           '<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid var(--accent-blue);" class="p-4 rounded-lg">' +
               '<h5 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-blue);">' +
                   '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                       '<path d="M9 12l2 2 4-4"/>' +
                       '<path d="M21 12c.552 0 1-.448 1-1V5l-8-3-8 3v6c0 .552.448 1 1 1z"/>' +
                   '</svg>' +
                   'Next Actions' +
               '</h5>' +
               '<div class="grid grid-cols-3 gap-4 text-sm" style="color: var(--text-secondary);">' +
                   '<div class="space-y-2">' +
                       '<div>• Review validation criteria</div>' +
                       '<div>• Complete stakeholder feedback</div>' +
                   '</div>' +
                   '<div class="space-y-2">' +
                       '<div>• Finalize business case</div>' +
                       '<div>• Document success metrics</div>' +
                   '</div>' +
                   '<div class="space-y-2">' +
                       '<div>• Schedule validation review</div>' +
                       '<div>• Update initiative status</div>' +
                   '</div>' +
               '</div>' +
               (highPriorityInValidation.length > 0 ? 
                   '<div class="mt-3 p-3 rounded text-sm" style="background: #fbbf24; color: #92400e;"><strong>Priority Alert:</strong> ' + highPriorityInValidation.length + ' high-priority initiatives need expedited validation to prevent delivery delays</div>' : 
                   ''
               ) +
           '</div>' +
       '</div>';
   
   modal.classList.add('show');
}
      
      function showNotValidatedModal() {
   const modal = document.getElementById('detail-modal');
   const title = document.getElementById('modal-title');
   const content = document.getElementById('modal-content');
   
   const notValidatedInitiatives = boardData.initiatives
       .filter(init => init.validation === 'not-validated')
       .sort((a, b) => {
           // Sort by priority order (lower number = higher priority)
           if (a.priority === "bullpen" && b.priority === "bullpen") return 0;
           if (a.priority === "bullpen") return 1;
           if (b.priority === "bullpen") return -1;
           return a.priority - b.priority;
       });
   
   const highPriorityNotValidated = notValidatedInitiatives.filter(init => {
       if (init.priority === "bullpen") return false;
       return getRowColFromSlot(init.priority).row <= 4;
   });
   
   title.textContent = 'Not Validated Initiatives';
   content.innerHTML = 
       '<div class="space-y-6">' +
           // Header Section
           '<div>' +
               '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                   '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                       '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>' +
                   '</svg>' +
                   'Validation Pipeline Overview - ' + notValidatedInitiatives.length + ' Initiatives Requiring Validation' +
               '</h3>' +
               
               // Initiatives List - Full Width (toned down red)
               '<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%); border: 1px solid rgba(239, 68, 68, 0.3);" class="rounded-lg p-4">' +
                   '<h4 class="font-medium mb-3 flex items-center gap-2" style="color: #dc2626;">' +
                       '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                           '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>' +
                           '<path d="m9.5 14.5 5-5"/>' +
                           '<path d="m9.5 9.5 5 5"/>' +
                       '</svg>' +
                       'Initiatives Needing Validation' +
                   '</h4>' +
                   '<div class="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">' +
                       notValidatedInitiatives.map(init => `
                           <div class="bento-pipeline-item" 
                                onclick="closeModal(); setTimeout(() => showInitiativeModal(boardData.initiatives.find(i => i.id === ${init.id})), 100);"
                                style="position: relative; cursor: pointer;">
                               <div class="bento-pipeline-item-header">
                                   <div class="bento-pipeline-item-title">
                                       ${init.title}
                                       <span class="bento-type-badge bento-type-${init.type}">${init.type.toUpperCase()}</span>
                                   </div>
                                   <div class="flex items-center gap-2">
                                       ${getRowColFromSlot(init.priority).row <= 4 && init.priority !== 'bullpen' ? 
                                           '<span class="text-xs px-2 py-1 rounded" style="background: #dc2626; color: white;">High Priority</span>' : 
                                           ''
                                       }
                                   </div>
                               </div>
                           </div>
                       `).join('') +
                   '</div>' +
               '</div>' +
           '</div>' +
           
           // Actions Section (styled like blue with toned down red accents)
           '<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%); border: 1px solid var(--accent-blue);" class="p-4 rounded-lg">' +
               '<h5 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-blue);">' +
                   '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                       '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>' +
                       '<path d="M12 9v4"/>' +
                       '<path d="M12 17h.01"/>' +
                   '</svg>' +
                   'Urgent Actions Required' +
               '</h5>' +
               '<div class="grid grid-cols-3 gap-4 text-sm" style="color: var(--text-secondary);">' +
                   '<div class="space-y-2">' +
                       '<div>• Start validation process</div>' +
                       '<div>• Gather stakeholder input</div>' +
                   '</div>' +
                   '<div class="space-y-2">' +
                       '<div>• Define success criteria</div>' +
                       '<div>• Assess market opportunity</div>' +
                   '</div>' +
                   '<div class="space-y-2">' +
                       '<div>• Create business case</div>' +
                       '<div>• Schedule review meetings</div>' +
                   '</div>' +
               '</div>' +
               (highPriorityNotValidated.length > 0 ? 
                   '<div class="mt-3 p-3 rounded text-sm" style="background: #fca5a5; color: #7f1d1d;"><strong>CRITICAL ALERT:</strong> ' + highPriorityNotValidated.length + ' high-priority initiatives lack validation and may significantly impact delivery timelines and organizational objectives</div>' : 
                   ''
               ) +
           '</div>' +
       '</div>';
   
   modal.classList.add('show');
}

function updateMendozaCard() {
    const content = document.getElementById('mendoza-impact-content');
    
    // Calculate below-line activity breakdown (mock data for now)
    const activityBreakdown = {
        validation: 60,
        prototyping: 25,
        planning: 10,
        fullDevelopment: 5
    };
    
    const needsReview = activityBreakdown.planning + activityBreakdown.fullDevelopment;
    
    content.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center kpi-gauge-card" id="mendoza-clickable">
            <div class="text-sm font-bold mb-2" style="color: var(--text-secondary);">Below-Line Activity</div>
            
            <!-- Simple Pie Chart -->
            <!-- Improved Pie Chart with labels -->
<div class="relative mb-3">
    <svg width="120" height="120" viewBox="0 0 120 120">
        <!-- Validation (60%) - Green -->
        <circle cx="60" cy="60" r="40" fill="transparent" stroke="var(--accent-green)" 
                stroke-width="20" stroke-dasharray="151 251" stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
        
        <!-- Prototyping (25%) - Green -->
        <circle cx="60" cy="60" r="40" fill="transparent" stroke="var(--accent-green)" 
                stroke-width="20" stroke-dasharray="63 251" stroke-dashoffset="-151" transform="rotate(-90 60 60)"/>
        
        <!-- Planning (10%) - Yellow -->
        <circle cx="60" cy="60" r="40" fill="transparent" stroke="var(--accent-orange)" 
                stroke-width="20" stroke-dasharray="25 251" stroke-dashoffset="-214" transform="rotate(-90 60 60)"/>
        
        <!-- Full Development (5%) - Red -->
        <circle cx="60" cy="60" r="40" fill="transparent" stroke="var(--accent-red)" 
                stroke-width="20" stroke-dasharray="13 251" stroke-dashoffset="-239" transform="rotate(-90 60 60)"/>
        
        <!-- Labels -->
        <text x="60" y="30" text-anchor="middle" style="fill: var(--text-primary); font-size: 10px; font-weight: 600;">Validation</text>
        <text x="60" y="42" text-anchor="middle" style="fill: var(--accent-green); font-size: 9px;">60%</text>
        
        <text x="90" y="65" text-anchor="middle" style="fill: var(--text-primary); font-size: 10px; font-weight: 600;">Proto</text>
        <text x="90" y="75" text-anchor="middle" style="fill: var(--accent-green); font-size: 9px;">25%</text>
        
        <text x="75" y="95" text-anchor="middle" style="fill: var(--text-primary); font-size: 10px; font-weight: 600;">Plan</text>
        <text x="75" y="105" text-anchor="middle" style="fill: var(--accent-orange); font-size: 9px;">10%</text>
        
        <text x="40" y="95" text-anchor="middle" style="fill: var(--text-primary); font-size: 10px; font-weight: 600;">Dev</text>
        <text x="40" y="105" text-anchor="middle" style="fill: var(--accent-red); font-size: 9px;">5%</text>
    </svg>
</div>
            
            ${needsReview > 0 ? `
                <div class="text-xs flex items-center gap-1" style="color: var(--accent-orange);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        <path d="M12 17h.01"/>
                    </svg>
                    ${needsReview}% Needs Review
                </div>
            ` : `
                <div class="text-xs" style="color: var(--accent-green);">
                    ✓ Optimal Allocation
                </div>
            `}
        </div>
    `;
    
    // Add click handler via JavaScript
    setTimeout(() => {
        const clickableElement = document.getElementById('mendoza-clickable');
        if (clickableElement) {
            clickableElement.style.cursor = 'pointer';
            clickableElement.addEventListener('click', function() {
                showMendozaAnalysisModal();
            });
        }
    }, 100);
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
    const alignedCount = boardData.initiatives.filter(init => isAlignedWithOKRs(init)).length;
    return Math.round((alignedCount / boardData.initiatives.length) * 100);
}

function calculateOKRProgress() {
   // Calculate MAU progress based on user engagement initiatives
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
   const mauCurrent = 35; // Changed from 25 + calculation to fixed 35%
   
   // Rest of the function stays the same...
   const infrastructureInits = boardData.initiatives.filter(init => 
       init.canvas && (
           init.canvas.outcome.toLowerCase().includes('uptime') ||
           init.canvas.outcome.toLowerCase().includes('reliability') ||
           init.canvas.outcome.toLowerCase().includes('monitoring') ||
           init.title.toLowerCase().includes('security') ||
           init.title.toLowerCase().includes('backup')
       )
   );
   const uptimeProgress = infrastructureInits.reduce((sum, init) => sum + init.progress, 0) / infrastructureInits.length;
   const uptimeCurrent = 92 + (uptimeProgress / 100) * 3;
   
   const strategicInits = boardData.initiatives.filter(init => 
       init.type === 'strategic' && init.progress >= 80
   );
   const capabilitiesCurrent = 1; // Changed from Math.min(strategicInits.length, 3) to fixed 1
   const capabilitiesProgress = (capabilitiesCurrent / 3) * 100;
   
   return [
       {
           title: "Monthly Active Users",
           currentValue: `${mauCurrent}%`,
           targetValue: "40%",
           progress: (mauCurrent / 40) * 100, // This will put it in green zone (87.5%)
           color: 'var(--accent-green)',
           trend: 'up',
           trendText: "3 days ago",
           trendPoints: "0,10 20,12 40,15 60,18 80,20 100,22 120,25"
       },
       {
           title: "System Uptime",
           currentValue: `${Math.round(uptimeCurrent)}%`,
           targetValue: "95%",
           progress: ((uptimeCurrent - 92) / 3) * 100,
           color: uptimeCurrent >= 94.5 ? 'var(--accent-green)' : uptimeCurrent >= 93.5 ? 'var(--accent-orange)' : 'var(--accent-red)',
           trend: uptimeCurrent >= 94 ? 'up' : uptimeCurrent >= 93 ? 'stable' : 'down',
           trendText: "1 day ago",
           trendPoints: "0,15 20,16 40,14 60,15 80,13 100,14 120,12"
       },
       {
           title: "Strategic Capabilities",
           currentValue: `${capabilitiesCurrent}`,
           targetValue: "3",
           progress: capabilitiesProgress,
           color: capabilitiesCurrent >= 3 ? 'var(--accent-green)' : capabilitiesCurrent >= 2 ? 'var(--accent-orange)' : 'var(--accent-red)',
           trend: capabilitiesCurrent >= 2 ? 'up' : capabilitiesCurrent >= 1 ? 'stable' : 'down',
           trendText: "5 days ago",
           trendPoints: "0,28 20,28 40,28 60,28 80,28 100,28 120,28" // Moved up to first grid line (Y=28)
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
    return boardData.initiatives
        .filter(init => {
            if (init.priority === "bullpen") return false;
            const row = getRowColFromSlot(init.priority).row;
            return row <= 5 && init.teams.some(teamName => {
                const team = boardData.teams[teamName];
                if (!team) return false;
                
                // Check if team is High Risk or Critical based on overall health
                const overallHealth = getTeamOverallHealth(team);
                return overallHealth === 'high-risk' || overallHealth === 'critical';
            });
        })
        .sort((a, b) => a.priority - b.priority);
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

function getValidationCounts() {
    return {
        notValidated: boardData.initiatives.filter(init => init.validation === 'not-validated').length,
        inValidation: boardData.initiatives.filter(init => init.validation === 'in-validation').length,
        validated: boardData.initiatives.filter(init => init.validation === 'validated').length
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
        
        
        //Pipeline Drag and Drop
        function enablePipelineDragDrop(item) {
    const initiative = boardData.bullpen.find(init => init && init.id == item.dataset.initiativeId);
    if (!initiative) return;
    
    // Make the item draggable
    item.draggable = true;
    
    item.addEventListener('dragstart', function(e) {
        draggedInitiative = initiative;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.outerHTML);
    });

    item.addEventListener('dragend', function() {
        item.classList.remove('dragging');
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
                case 'capacity-risk': return teamData.capacity === 'at-risk';
                case 'skillset-risk': return teamData.skillset === 'at-risk';
                case 'vision-risk': return teamData.vision === 'at-risk';
                case 'support-risk': return teamData.support === 'at-risk';
                case 'teamwork-risk': return teamData.teamwork === 'at-risk';
                case 'autonomy-risk': return teamData.autonomy === 'at-risk';
                default: return false;
            }
        });
        if (!hasMatchingIndicator) return false;
    }
    
    return true;
}

// Main function to calculate overall team health based on new 6-dimension system
function getTeamOverallHealth(teamData) {
    let atRiskCount = 0;
    
    // Count all 6 dimensions that are "at-risk"
    if (teamData.capacity === 'at-risk') atRiskCount++;
    if (teamData.skillset === 'at-risk') atRiskCount++;
    if (teamData.vision === 'at-risk') atRiskCount++;
    if (teamData.support === 'at-risk') atRiskCount++;
    if (teamData.teamwork === 'at-risk') atRiskCount++;
    if (teamData.autonomy === 'at-risk') atRiskCount++;
    
    // New health status mapping:
    // 0 at-risk = "Healthy" (green)
    // 1-2 at-risk = "Low Risk" (amber) 
    // 3-4 at-risk = "High Risk" (orange)
    // 5-6 at-risk = "Critical" (red)
    if (atRiskCount === 0) return 'healthy';
    if (atRiskCount <= 2) return 'low-risk';
    if (atRiskCount <= 4) return 'high-risk';
    return 'critical'; // 5-6 at-risk
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

function openKPIEditModal(kpiName, currentValue, targetValue) {
    currentEditingKPI = kpiName;
    
    const modal = document.getElementById('kpi-edit-modal');
    const nameDisplay = document.getElementById('kpi-name-display');
    const description = document.getElementById('kpi-description');
    const targetDisplay = document.getElementById('kpi-target-display');
    const currentInput = document.getElementById('kpi-current-value');
    const unitDisplay = document.getElementById('kpi-unit');
    
    // Set the content
    nameDisplay.textContent = kpiName;
    targetDisplay.textContent = targetValue;
    currentInput.value = parseFloat(currentValue.toString().replace(/[^\d.]/g, ''));
    
    // Set descriptions based on KPI type
    const descriptions = {
        "Monthly Active Users": "Percentage increase in monthly active users compared to baseline",
        "System Uptime": "Overall system availability percentage across all services",
        "Strategic Capabilities": "Number of new strategic product capabilities launched"
    };
    
    description.textContent = descriptions[kpiName] || "Key performance indicator for organizational success";
    
    
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus and select the current value input
    setTimeout(() => {
        currentInput.focus();
        currentInput.select();
    }, 100);
}

function closeKPIEditModal() {
    const modal = document.getElementById('kpi-edit-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    currentEditingKPI = null;
}

function saveKPIValue() {
    const currentValue = parseFloat(document.getElementById('kpi-current-value').value);
    
    if (isNaN(currentValue)) {
        alert('Please enter a valid number for the current value.');
        return;
    }
    
    // Update the KPI data based on which one is being edited
    if (currentEditingKPI === 'Monthly Active Users') {
        // Update MAU data - you can customize this logic
    } else if (currentEditingKPI === 'System Uptime') {
        // Update uptime data
    } else if (currentEditingKPI === 'Strategic Capabilities') {
        // Update capabilities data
    }
    
    // Refresh the progress card to show new values
    updateProgressCard();
    
    // Close the modal
    closeKPIEditModal();
    
    // Show success message
alert('Key Result current value would be updated here. This is a demo - no actual data is saved.');
}
      
  let currentKPIDetail = null;
      
function showOKRAlignmentModal() {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    const misalignedInitiatives = boardData.initiatives.filter(init => !isAlignedWithOKRs(init));
    const highPriorityMisaligned = misalignedInitiatives.filter(init => {
        if (init.priority === "bullpen") return false;
        return getRowColFromSlot(init.priority).row <= 4;
    });
    
    title.textContent = 'OKR Alignment Analysis';
    content.innerHTML = 
        '<div class="space-y-6">' +
            // Top Section - Current OKRs (Full Width)
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' +
                    '</svg>' +
                    'Current OKRs' +
                '</h3>' +
                
                // Objective and Key Results in horizontal layout
                '<div class="p-6 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
                    '<div class="grid gap-6" style="grid-template-columns: 1fr 2fr;">' +
                        // Objective Column
                        '<div>' +
                            '<div class="text-base font-bold mb-3" style="color: var(--text-primary);">Objective:</div>' +
                            '<p class="text-base font-medium leading-relaxed" style="color: var(--text-secondary);">Accelerate Product-Market Fit and Scale Operations</p>' +
                        '</div>' +
                        
                        // Key Results Column
                        '<div>' +
                            '<div class="text-sm font-bold mb-3" style="color: var(--text-primary);">Key Results:</div>' +
                            '<div class="space-y-3">' +
                                '<div class="flex items-start gap-3 p-3 rounded-md" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid var(--accent-green);">' +
                                    '<div>' +
                                        '<div class="text-sm font-semibold mb-1" style="color: var(--text-primary);">User Growth</div>' +
                                        '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">Increase monthly active users by 40% through improved onboarding and user experience</p>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="flex items-start gap-3 p-3 rounded-md" style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid var(--accent-blue);">' +
                                    '<div>' +
                                        '<div class="text-sm font-semibold mb-1" style="color: var(--text-primary);">System Reliability</div>' +
                                        '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">Achieve 95% system uptime and reduce critical incident response time by 75%</p>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="flex items-start gap-3 p-3 rounded-md" style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid var(--accent-purple);">' +
                                    '<div>' +
                                        '<div class="text-sm font-semibold mb-1" style="color: var(--text-primary);">Product Innovation</div>' +
                                        '<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">Launch 3 new strategic product capabilities that drive measurable customer value</p>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            // Bottom Section - Analysis (Full Width)
            '<div>' +
                '<h3 class="text-lg font-semibold mb-4 flex items-center gap-3" style="color: var(--text-primary);">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M11 13v4"/><path d="M15 5v4"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/><rect x="7" y="13" width="9" height="4" rx="1"/><rect x="7" y="5" width="12" height="4" rx="1"/>' +
                    '</svg>' +
                    'Alignment Analysis' +
                '</h3>' +
                
                '<div class="grid gap-4" style="grid-template-columns: 1fr 2fr 1fr;">' +
                    // Portfolio Alignment Status
'<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">' +
    '<div class="text-center">' +
        '<div class="text-base font-bold mb-2" style="color: var(--text-secondary);">Portfolio Alignment</div>' +
        '<div class="text-4xl font-bold mb-2" style="color: var(--accent-green);">' + calculateOKRAlignment() + '%</div>' +
        '<div class="text-xs mb-2" style="color: var(--text-tertiary);">of initiatives aligned to current OKRs</div>' +
        '<div class="text-center">' +
            '<div class="text-lg font-bold" style="color: var(--accent-green);">' + boardData.initiatives.filter(init => isAlignedWithOKRs(init)).length + '/' + boardData.initiatives.length + '</div>' +
            '<div class="text-xs" style="color: var(--text-tertiary);">aligned</div>' +
        '</div>' +
    '</div>' +
'</div>' +
                    
                    // Misaligned Initiatives - Center column - Pipeline-style items
                    '<div style="background: var(--status-warning-bg); border: 1px solid var(--accent-orange);" class="rounded-lg p-4">' +
                        '<h4 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-orange);">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>' +
                            '</svg>' +
                            'Potentially Misaligned Initiatives (' + misalignedInitiatives.length + ')' +
                        '</h4>' +
                        '<div class="space-y-2 max-h-48 overflow-y-auto">' +
                            misalignedInitiatives.map(init => `
                                <div class="bento-pipeline-item" 
                                     onclick="closeModal(); setTimeout(() => showInitiativeModal(boardData.initiatives.find(i => i.id === ${init.id})), 100);"
                                     style="position: relative; cursor: pointer;">
                                    <div class="bento-pipeline-item-header">
                                        <div class="bento-pipeline-item-title">
                                            ${init.title}
                                            <span class="bento-type-badge bento-type-${init.type}">${init.type.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('') +
                        '</div>' +
                    '</div>' +
                    
                    /// Recommendation - Right column
(highPriorityMisaligned.length > 0 ? 
    '<div style="background: var(--status-info-bg); border: 1px solid var(--accent-blue);" class="p-4 rounded-lg h-full flex flex-col">' +
        '<h5 class="font-medium mb-3 flex items-center gap-2" style="color: var(--accent-blue);">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/><path d="M12 17h.01"/>' +
            '</svg>' +
            'Recommendation' +
        '</h5>' +
        '<p class="text-sm leading-relaxed mb-3" style="color: var(--text-secondary);">' + highPriorityMisaligned.length + ' high-priority initiatives may need OKR alignment review or deprioritization.</p>' +
        '<div class="mt-auto">' +
            '<div class="bento-pipeline-item" style="min-height: 60px; padding: 8px; margin-bottom: 0; cursor: pointer;" onclick="closeModal(); setTimeout(() => showInitiativeModal(boardData.initiatives.find(i => i.id === ' + highPriorityMisaligned[0].id + ')), 100);">' +
                '<div class="bento-pipeline-item-header">' +
                    '<div class="bento-pipeline-item-title" style="font-size: 11px;">' +
                        highPriorityMisaligned[0].title +
                        '<span class="bento-type-badge bento-type-' + highPriorityMisaligned[0].type + '" style="font-size: 7px; padding: 1px 3px;">' + highPriorityMisaligned[0].type.toUpperCase() + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' : 
    '<div></div>' // Empty div to maintain grid structure
) +
                '</div>' +
            '</div>' +
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
        'teamwork': 'Teams with Teamwork Risks',
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
                    <span>Teamwork</span>
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
    if (teamData.capacity === 'at-risk') {
        notes.push('Capacity Risk: Team operating at high utilization. Consider redistributing workload.');
    }
    
    if (teamData.skillset === 'at-risk') {
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

function openKPIDetailModal(kpi) {
    currentKPIDetail = kpi;
    
    const modal = document.getElementById('kpi-detail-modal');
    const title = document.getElementById('kpi-detail-modal-title');
    const content = document.getElementById('kpi-detail-modal-content');
    
    title.textContent = kpi.title;
    
    // Calculate projection data
    const projectionData = calculateKPIProjections(kpi);
    
    content.innerHTML = `
    <div class="grid gap-6" style="grid-template-columns: 1fr 1.5fr;">
        <!-- Key Metrics Column -->
        <div class="space-y-4">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m12 14 4-4"/>
                        <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
                    </svg>
                    Key Metrics
                </h3>
                
                <!-- Current Value -->
<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
    <div class="flex justify-between items-end">
        <div class="text-lg font-bold leading-tight" style="color: var(--text-secondary);">Current<br>Value</div>
        <div class="text-4xl font-bold text-right" style="color: ${kpi.color};">${kpi.currentValue}</div>
    </div>
</div>
                
                <!-- Target Value -->
<div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
    <div class="flex justify-between items-end">
        <div class="text-lg font-bold leading-tight" style="color: var(--text-secondary);">Target<br>Value</div>
        <div class="text-4xl font-bold text-right" style="color: var(--text-primary);">${kpi.targetValue}</div>
    </div>
</div>
                
                <!-- Progress Metric -->
                <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                    <div class="text-base font-bold mb-2" style="color: var(--text-secondary);">Progress</div>
                    <div class="mb-2">
                        <div class="flex justify-between text-sm mb-1">
                            <span style="color: var(--text-primary);">${Math.round(kpi.progress)}% Complete</span>
                            <span style="color: var(--text-tertiary);">${projectionData.daysRemaining} days left</span>
                        </div>
                        <div class="progress-bar-container" style="height: 12px;">
                            <div class="progress-bar ${getKPIProgressClass(kpi.progress)}" style="width: ${kpi.progress}%; height: 100%;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Trend & Velocity -->
<div class="grid grid-cols-2 gap-3">
    <div class="p-3 rounded-lg text-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
        <div class="text-base font-bold mb-1" style="color: var(--text-secondary);">Trend</div>
        <div class="text-2xl flex justify-center">${getTrendIcon(kpi.trend)}</div>
    </div>
    <div class="p-3 rounded-lg text-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
        <div class="text-base font-bold mb-1" style="color: var(--text-secondary);">Velocity</div>
        <div class="text-3xl font-bold" style="color: ${kpi.color};">${projectionData.velocity}</div>
        <div class="text-xs" style="color: var(--text-tertiary);">per week</div>
    </div>
</div>
            </div>
            
            <!-- Projection Analysis Column -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: var(--text-primary);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-telescope-icon lucide-telescope">
        <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/>
        <path d="m13.56 11.747 4.332-.924"/>
        <path d="m16 21-3.105-6.21"/>
        <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/>
        <path d="m6.158 8.633 1.114 4.456"/>
        <path d="m8 21 3.105-6.21"/>
        <circle cx="12" cy="13" r="2"/>
    </svg>
    Projection Analysis
</h3>
                
                <!-- Current Pace Projection -->
<div class="${projectionData.onTrack ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30' : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30'} rounded-lg p-6">
    <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
            ${projectionData.onTrack ? 
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="M20 6 9 17l-5-5"/></svg>' : 
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
            }
            <h3 class="text-lg font-bold text-white">Q4 Projection at Current Pace</h3>
        </div>
        <div class="text-4xl font-bold ${projectionData.onTrack ? 'text-green-400' : 'text-orange-400'}">${projectionData.projectedValue}</div>
    </div>
    <p class="${projectionData.onTrack ? 'text-green-200' : 'text-orange-200'} text-base font-medium">${projectionData.onTrack ? 'On track to meet target' : 'May miss target by ' + projectionData.shortfall}</p>
</div>
                
                <!-- Required Pace -->
<div class="${projectionData.onTrack ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30' : 'bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30'} rounded-lg p-6">
    <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
            ${projectionData.onTrack ? 
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M9 12l2 2 4-4"/><path d="M21 12c.552 0 1-.448 1-1V5l-8-3-8 3v6c0 .552.448 1 1 1z"/></svg>' : 
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></svg>'
            }
            <h3 class="text-lg font-bold text-white">To Hit Target</h3>
        </div>
        <div class="text-4xl font-bold ${projectionData.onTrack ? 'text-blue-400' : 'text-red-400'}">${projectionData.requiredPace}</div>
    </div>
    <p class="${projectionData.onTrack ? 'text-blue-200' : 'text-red-200'} text-base font-medium">${projectionData.paceChange}</p>
</div>
                
                <!-- Trend Chart -->
                <div class="p-4 rounded-lg" style="background: var(--bg-tertiary); border: 1px solid var(--border-primary);">
                    <div class="text-sm font-medium mb-3" style="color: var(--text-primary);">30-Day Trend</div>
                    <div style="height: 80px;">
                        <svg width="100%" height="80" viewBox="0 0 300 120" style="background: rgba(255,255,255,0.02); border-radius: 4px;">
                            <!-- Grid lines -->
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)"/>
                            
                            <!-- Y-axis -->
                            <line x1="20" y1="10" x2="20" y2="110" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                            
                            <!-- X-axis -->
                            <line x1="20" y1="110" x2="290" y2="110" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                            
                            <!-- Trend line -->
<polyline points="${kpi.title === 'Strategic Capabilities' ? 
    '20,110 65,110 110,110 155,80 200,80 245,80 290,80' :
    kpi.trendPoints.split(' ').map((point, index) => {
        const [x, y] = point.split(',');
        return `${20 + (index * 45)},${110 - (parseInt(y) * 3)}`;
    }).join(' ')
}" 
          fill="none" stroke="${kpi.color}" stroke-width="3" stroke-linecap="round"/>
                            
                            <!-- Data points -->
${kpi.title === 'Strategic Capabilities' ? 
    '<circle cx="20" cy="110" r="3" fill="' + kpi.color + '"/>' +
    '<circle cx="65" cy="110" r="3" fill="' + kpi.color + '"/>' +
    '<circle cx="110" cy="110" r="3" fill="' + kpi.color + '"/>' +
    '<circle cx="155" cy="80" r="3" fill="' + kpi.color + '"/>' +
    '<circle cx="200" cy="80" r="3" fill="' + kpi.color + '"/>' +
    '<circle cx="245" cy="80" r="3" fill="' + kpi.color + '"/>' +
    '<circle cx="290" cy="80" r="3" fill="' + kpi.color + '"/>' :
    kpi.trendPoints.split(' ').map((point, index) => {
        const [x, y] = point.split(',');
        return `<circle cx="${20 + (index * 45)}" cy="${110 - (parseInt(y) * 3.5)}" r="3" fill="${kpi.color}"/>`;
    }).join('')
}
                            
                            <!-- Target line -->
                            <line x1="20" y1="40" x2="290" y2="40" stroke="var(--accent-green)" stroke-width="2" stroke-dasharray="5,5"/>
                            <text x="295" y="45" fill="var(--accent-green)" font-size="10">Target</text>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer Analytics -->
        <div class="mt-6 pt-4 border-t" style="border-color: var(--border-primary);">
            <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span style="color: var(--text-secondary);">Last updated ${projectionData.lastUpdated}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c.552 0 1-.448 1-1V5l-8-3-8 3v6c0 .552.448 1 1 1z"/>
                        </svg>
                        <span style="color: var(--text-secondary);">Data quality: ${projectionData.dataQuality}% complete</span>
                    </div>
                </div>
                <button onclick="closeKPIDetailModal(); setTimeout(() => openKPIEditModal('${kpi.title}', '${kpi.currentValue}', '${kpi.targetValue}'), 100);" 
        class="px-3 py-1 rounded text-xs hover:bg-opacity-90" 
        style="background: var(--accent-primary); color: white;">
    Update Current Key Result Value
</button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus the close button
    setTimeout(() => {
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
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

function calculateKPIProjections(kpi) {
    const currentNumeric = parseFloat(kpi.currentValue.replace(/[^\d.]/g, ''));
    const targetNumeric = parseFloat(kpi.targetValue.replace(/[^\d.]/g, ''));
    const progress = kpi.progress;
    
    // Calculate velocity and projections based on KPI type
    let velocity, projectedValue, requiredPace, daysRemaining, lastUpdated, dataQuality;
    
    switch(kpi.title) {
        case 'Monthly Active Users':
    velocity = '+0.8%';
    projectedValue = '40.1%';
    requiredPace = '+0.8% per week';
    daysRemaining = 45;
    lastUpdated = '3 minutes ago';
    dataQuality = 96;
    
    // Corrected projection results for MAU
    return {
        velocity,
        projectedValue,
        requiredPace,
        onTrack: true,
        shortfall: '',
        paceChange: 'Maintain current pace to exceed target',
        daysRemaining,
        lastUpdated,
        dataQuality
    };
        case 'System Uptime':
    velocity = '+0.2%';
    projectedValue = '95.7%';
    requiredPace = '+0.2% per week';
    daysRemaining = 60;
    lastUpdated = '1 minute ago';
    dataQuality = 99;
    break;
        case 'Strategic Capabilities':
            velocity = '+0.3';
            projectedValue = '2.8';
            requiredPace = '+0.4 per week';
            daysRemaining = 75;
            lastUpdated = '2 hours ago';
            dataQuality = 92;
            break;
        default:
            velocity = '+1.2%';
            projectedValue = currentNumeric + '%';
            requiredPace = '+1.5% per week';
            daysRemaining = 30;
            lastUpdated = '5 minutes ago';
            dataQuality = 95;
    }
    
  // Calculate if on track based on projection vs target
    let onTrack, shortfall, paceChange;

    if (kpi.title === 'System Uptime') {
        onTrack = true; // 95.7% exceeds 95% target
        shortfall = '';
        paceChange = 'On track to exceed target';
    } else if (kpi.title === 'Monthly Active Users') {
        onTrack = true; // 40.1% exceeds 40% target  
        shortfall = '';
        paceChange = 'On track to exceed target';
    } else {
    // Strategic Capabilities: 2.8/3.0 = 93.3% of target (missing 6.7%)
    onTrack = false; // 2.8 is short of 3.0 target
    shortfall = '6.7%'; // (3.0 - 2.8) / 3.0 * 100 = 6.7%
    paceChange = 'Increase pace by 7%'; // Need slight increase, not 20%
}

    return {
        velocity,
        projectedValue,
        requiredPace,
        onTrack,
        shortfall,
        paceChange,
        daysRemaining,
        lastUpdated,
        dataQuality
    };
}

function getKPIProgressClass(progress) {
    if (progress >= 80) return 'high-progress';
    if (progress >= 60) return 'medium-progress';
    return 'low-progress';
}

function getTrendIcon(trend) {
    switch(trend) {
        case 'up': 
            return '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>';
        case 'stable': 
            return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8L22 12L18 16"/><path d="M2 12H22"/></svg>';
        case 'down': 
            return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></svg>';
        default: 
            return '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>';
    }
}
      
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
       
        function init() {
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
    //initKeyboardNavigation();
    // Initialize essential keyboard handling
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
// Enhanced scroll to sections with highlighting
// Scroll to sections function
// Enhanced scroll to sections with highlighting
function scrollToSection(section) {
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
            
            if (detailModal && detailModal.classList.contains('show')) {
                closeModal();
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
            
            // Close expanded sidebar (lowest priority)
            if (sidebar && sidebar.classList.contains('expanded')) {
                const sidebarToggle = document.getElementById('sidebar-toggle');
                if (sidebarToggle) {
                    sidebarToggle.click();
                }
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
        
        // Handle Enter key for search suggestions
        if (e.key === 'Enter') {
            const searchInput = document.getElementById('global-search');
            if (document.activeElement === searchInput) {
                const suggestions = document.getElementById('search-suggestions');
                if (suggestions && !suggestions.classList.contains('hidden')) {
                    // Get first suggestion and click it
                    const firstSuggestion = suggestions.querySelector('.hover\\:bg-gray-100');
                    if (firstSuggestion) {
                        firstSuggestion.click();
                        e.preventDefault();
                    }
                }
            }
        }
    });
}      
        init();