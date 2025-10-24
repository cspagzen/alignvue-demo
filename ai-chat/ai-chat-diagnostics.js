/**
 * AI Chat Diagnostics - Check Data Structure
 * Run this in the browser console to see what data the AI is actually receiving
 */

function diagnoseAIData() {
  console.log('=== AI CHAT DATA DIAGNOSTICS ===\n');
  
  // Check if boardData exists
  if (!window.boardData) {
    console.error('❌ window.boardData is not defined!');
    return;
  }
  
  console.log('✅ window.boardData exists');
  console.log('Teams count:', Object.keys(window.boardData.teams || {}).length);
  console.log('Initiatives count:', (window.boardData.initiatives || []).length);
  console.log('\n=== TEAM DATA STRUCTURE SAMPLE ===\n');
  
  // Get first team to inspect structure
  const teams = window.boardData.teams || {};
  const teamNames = Object.keys(teams);
  
  if (teamNames.length === 0) {
    console.error('❌ No teams found in boardData!');
    return;
  }
  
  const firstTeamName = teamNames[0];
  const firstTeam = teams[firstTeamName];
  
  console.log('Sample team:', firstTeamName);
  console.log('Full team object:', JSON.stringify(firstTeam, null, 2));
  
  console.log('\n=== UTILIZATION CHECK ===\n');
  
  // Check all teams for utilization
  const utilizationCheck = teamNames.map(name => {
    const team = teams[name];
    const hasJira = !!team.jira;
    const utilization = team.jira?.utilization;
    
    return {
      name,
      hasJira,
      utilization: utilization !== undefined ? utilization : 'MISSING',
      fullPath: hasJira ? 'team.jira.utilization' : 'team.jira is undefined'
    };
  });
  
  console.table(utilizationCheck);
  
  // Test the preparePortfolioContext function
  console.log('\n=== TESTING preparePortfolioContext ===\n');
  
  if (typeof preparePortfolioContext === 'function') {
    const context = preparePortfolioContext(window.boardData);
    console.log('Context prepared:', !!context);
    
    if (context && context.teams && context.teams.length > 0) {
      console.log('\nFirst team in context:');
      console.log(JSON.stringify(context.teams[0], null, 2));
      
      console.log('\n=== UTILIZATION IN CONTEXT ===');
      console.table(context.teams.map(t => ({
        name: t.name,
        utilization: t.utilization,
        capacity: t.capacity
      })));
    }
  } else {
    console.error('❌ preparePortfolioContext function not found!');
  }
  
  // Check what the AI engine builds
  console.log('\n=== TESTING AI ENGINE ===\n');
  
  if (window.aiEngine && typeof window.aiEngine.buildSystemMessage === 'function') {
    const systemMessage = window.aiEngine.buildSystemMessage();
    
    // Extract just the team data from the system message
    const teamDataMatch = systemMessage.match(/TEAMS \(\d+ total\):\n([\s\S]*?)\n\nINITIATIVES/);
    if (teamDataMatch) {
      try {
        const teamData = JSON.parse(teamDataMatch[1]);
        console.log('Teams in AI system message:', teamData.length);
        if (teamData.length > 0) {
          console.log('\nFirst team sent to AI:');
          console.log(JSON.stringify(teamData[0], null, 2));
          
          console.log('\n=== UTILIZATION SENT TO AI ===');
          console.table(teamData.map(t => ({
            name: t.name,
            utilization: t.utilization,
            capacity: t.capacity,
            issues: t.issues.join(', ')
          })));
        }
      } catch (e) {
        console.error('Failed to parse team data from system message:', e);
      }
    }
  } else {
    console.error('❌ aiEngine or buildSystemMessage not found!');
  }
  
  console.log('\n=== DIAGNOSIS COMPLETE ===\n');
  console.log('Next steps:');
  console.log('1. Check if all teams have jira.utilization defined');
  console.log('2. Verify data structure matches expected format');
  console.log('3. Run this again after loading data from server');
}

// Auto-run when script loads
diagnoseAIData();

// Make it available globally for manual testing
window.diagnoseAIData = diagnoseAIData;
console.log('💡 Diagnostics complete! Run diagnoseAIData() again anytime to recheck.');
