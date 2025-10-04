/**
 * AI Knowledge Base Loader - Master Integration System
 * Loads and combines all 5 knowledge base volumes
 * Provides intelligent loading strategies (complete, essential, relevant, howto)
 */

class AIKnowledgeLoader {
  constructor() {
    this.volumes = {
      core: null,           // Volume 1: Core Foundation
      strategic: null,      // Volume 2: Strategic Frameworks
      analysis: null,       // Volume 3: Analysis & Operations
      reference: null,      // Volume 4: Reference & Quality
      userguide: null       // Volume 5: User Guide & FAQ
    };
    
    this.loadStatus = {
      vol1: false,
      vol2: false,
      vol3: false,
      vol4: false,
      vol5: false
    };
    
    this.init();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  init() {
    this.loadAllVolumes();
    this.verifyIntegrity();
  }

  loadAllVolumes() {
    // Load Volume 1: Core Foundation
    if (typeof window.AI_KB_VOL1_CORE !== 'undefined') {
      this.volumes.core = window.AI_KB_VOL1_CORE;
      this.loadStatus.vol1 = true;
      console.log('✅ Volume 1 (Core Foundation) loaded');
    } else {
      console.error('❌ Volume 1 not found - load ai-knowledge-base-vol1-core.js first');
    }

    // Load Volume 2: Strategic Frameworks
    if (typeof window.AI_KB_VOL2_STRATEGIC !== 'undefined') {
      this.volumes.strategic = window.AI_KB_VOL2_STRATEGIC;
      this.loadStatus.vol2 = true;
      console.log('✅ Volume 2 (Strategic Frameworks) loaded');
    } else {
      console.error('❌ Volume 2 not found - load ai-knowledge-base-vol2-strategic.js first');
    }

    // Load Volume 3: Analysis & Operations
    if (typeof window.AI_KB_VOL3_ANALYSIS !== 'undefined') {
      this.volumes.analysis = window.AI_KB_VOL3_ANALYSIS;
      this.loadStatus.vol3 = true;
      console.log('✅ Volume 3 (Analysis & Operations) loaded');
    } else {
      console.error('❌ Volume 3 not found - load ai-knowledge-base-vol3-analysis.js first');
    }

    // Load Volume 4: Reference & Quality
    if (typeof window.AI_KB_VOL4_REFERENCE !== 'undefined') {
      this.volumes.reference = window.AI_KB_VOL4_REFERENCE;
      this.loadStatus.vol4 = true;
      console.log('✅ Volume 4 (Reference & Quality) loaded');
    } else {
      console.error('❌ Volume 4 not found - load ai-knowledge-base-vol4-reference.js first');
    }

    // Load Volume 5: User Guide & FAQ
    if (typeof window.AI_KB_VOL5_USERGUIDE !== 'undefined') {
      this.volumes.userguide = window.AI_KB_VOL5_USERGUIDE;
      this.loadStatus.vol5 = true;
      console.log('✅ Volume 5 (User Guide & FAQ) loaded');
    } else {
      console.error('❌ Volume 5 not found - load ai-knowledge-base-vol5-userguide.js first');
    }
  }

  verifyIntegrity() {
    const allLoaded = Object.values(this.loadStatus).every(status => status === true);
    
    if (allLoaded) {
      console.log('✅ All 5 volumes successfully loaded');
      console.log('📊 Total knowledge base size:', this.getKnowledgeBaseSize());
    } else {
      console.warn('⚠️  Some volumes failed to load:');
      if (!this.loadStatus.vol1) console.warn('   - Volume 1 (Core Foundation)');
      if (!this.loadStatus.vol2) console.warn('   - Volume 2 (Strategic Frameworks)');
      if (!this.loadStatus.vol3) console.warn('   - Volume 3 (Analysis & Operations)');
      if (!this.loadStatus.vol4) console.warn('   - Volume 4 (Reference & Quality)');
      if (!this.loadStatus.vol5) console.warn('   - Volume 5 (User Guide & FAQ)');
    }
  }

  // ============================================================================
  // KNOWLEDGE LOADING STRATEGIES
  // ============================================================================
  
  getAIKnowledge(strategy = 'complete') {
    switch(strategy) {
      case 'complete':
        // All 5 volumes for comprehensive understanding
        return this.getCompleteKnowledge();
      
      case 'essential':
        // Vol 1 + 4 for basic operation
        return this.getEssentialKnowledge();
      
      case 'essential-plus':
        // Vol 1 + 4 + 5 for operations with user guide
        return this.getEssentialPlusKnowledge();
        
      case 'howto':
        // Just Vol 5 for "How do I?" questions
        return this.getHowToKnowledge();
      
      case 'core':
        return this.volumes.core || '';
      
      case 'strategic':
        return this.volumes.strategic || '';
      
      case 'analysis':
        return this.volumes.analysis || '';
      
      case 'reference':
        return this.volumes.reference || '';
        
      case 'userguide':
        return this.volumes.userguide || '';
      
      default:
        return this.getCompleteKnowledge();
    }
  }

  getCompleteKnowledge() {
    const sections = [];
    if (this.volumes.core) sections.push(this.volumes.core);
    if (this.volumes.strategic) sections.push(this.volumes.strategic);
    if (this.volumes.analysis) sections.push(this.volumes.analysis);
    if (this.volumes.reference) sections.push(this.volumes.reference);
    if (this.volumes.userguide) sections.push(this.volumes.userguide);
    return sections.join('\n\n');
  }

  getEssentialKnowledge() {
    const sections = [];
    if (this.volumes.core) sections.push(this.volumes.core);
    if (this.volumes.reference) sections.push(this.volumes.reference);
    return sections.join('\n\n');
  }

  getEssentialPlusKnowledge() {
    const sections = [];
    if (this.volumes.core) sections.push(this.volumes.core);
    if (this.volumes.reference) sections.push(this.volumes.reference);
    if (this.volumes.userguide) sections.push(this.volumes.userguide);
    return sections.join('\n\n');
  }

  getHowToKnowledge() {
    return this.volumes.userguide || '';
  }

  // ============================================================================
  // SMART LOADING BASED ON QUERY
  // ============================================================================
  
  getRelevantKnowledge(query) {
    const lowerQuery = query.toLowerCase();
    
    // Check for "how to" questions - use Volume 5
    if (lowerQuery.includes('how do i') || 
        lowerQuery.includes('how to') || 
        lowerQuery.includes('where is') ||
        lowerQuery.includes('where do i') ||
        lowerQuery.includes('can i') ||
        lowerQuery.includes('click') ||
        lowerQuery.includes('drag') ||
        lowerQuery.includes('button') ||
        lowerQuery.includes('modal') ||
        lowerQuery.includes('edit') ||
        lowerQuery.includes('update') ||
        lowerQuery.includes('save')) {
      // Return Vol 1 (core) + Vol 5 (how to)
      const sections = [];
      if (this.volumes.core) sections.push(this.volumes.core);
      if (this.volumes.userguide) sections.push(this.volumes.userguide);
      return sections.join('\n\n');
    }
    
    // Check for calculation/scoring questions - use Vol 1
    if (lowerQuery.includes('calculat') || 
        lowerQuery.includes('score') || 
        lowerQuery.includes('formula') ||
        lowerQuery.includes('risk') ||
        lowerQuery.includes('confidence') ||
        lowerQuery.includes('efficiency') ||
        lowerQuery.includes('mendoza')) {
      return this.getEssentialKnowledge(); // Vol 1 + 4
    }
    
    // Check for strategic framework questions - use Vol 2
    if (lowerQuery.includes('okr') || 
        lowerQuery.includes('objective') ||
        lowerQuery.includes('key result') ||
        lowerQuery.includes('four square') ||
        lowerQuery.includes('ost') ||
        lowerQuery.includes('opportunity solution') ||
        lowerQuery.includes('validation') ||
        lowerQuery.includes('canvas') ||
        lowerQuery.includes('horizon')) {
      const sections = [];
      if (this.volumes.core) sections.push(this.volumes.core);
      if (this.volumes.strategic) sections.push(this.volumes.strategic);
      if (this.volumes.reference) sections.push(this.volumes.reference);
      return sections.join('\n\n');
    }
    
    // Check for analysis questions - use Vol 3
    if (lowerQuery.includes('pattern') || 
        lowerQuery.includes('trend') ||
        lowerQuery.includes('forecast') ||
        lowerQuery.includes('market') ||
        lowerQuery.includes('capability') ||
        lowerQuery.includes('bullpen') ||
        lowerQuery.includes('pipeline')) {
      const sections = [];
      if (this.volumes.core) sections.push(this.volumes.core);
      if (this.volumes.analysis) sections.push(this.volumes.analysis);
      if (this.volumes.reference) sections.push(this.volumes.reference);
      return sections.join('\n\n');
    }
    
    // Default: provide complete knowledge for complex questions
    return this.getCompleteKnowledge();
  }

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================
  
  searchKnowledgeBase(searchTerm) {
    const results = [];
    const lowerSearch = searchTerm.toLowerCase();
    
    const volumeNames = {
      core: 'Volume 1: Core Foundation',
      strategic: 'Volume 2: Strategic Frameworks',
      analysis: 'Volume 3: Analysis & Operations',
      reference: 'Volume 4: Reference & Quality',
      userguide: 'Volume 5: User Guide & FAQ'
    };
    
    for (const [key, content] of Object.entries(this.volumes)) {
      if (!content) continue;
      
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(lowerSearch)) {
          results.push({
            volume: volumeNames[key],
            lineNumber: index + 1,
            content: line.trim(),
            context: lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).join('\n')
          });
        }
      });
    }
    
    return results;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  getLoadStatus() {
    const loadedCount = Object.values(this.loadStatus).filter(status => status).length;
    return {
      vol1: this.loadStatus.vol1,
      vol2: this.loadStatus.vol2,
      vol3: this.loadStatus.vol3,
      vol4: this.loadStatus.vol4,
      vol5: this.loadStatus.vol5,
      allLoaded: loadedCount === 5,
      loadedCount: loadedCount,
      totalVolumes: 5
    };
  }

  getKnowledgeBaseSize() {
    let totalSize = 0;
    for (const content of Object.values(this.volumes)) {
      if (content) {
        totalSize += content.length;
      }
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  getKnowledgeBaseInfo() {
    return {
      volume1: {
        loaded: this.loadStatus.vol1,
        size: this.volumes.core ? `${(this.volumes.core.length / 1024).toFixed(2)} KB` : '0 KB',
        contains: 'Core Foundation, Scoring Models, Mendoza Line'
      },
      volume2: {
        loaded: this.loadStatus.vol2,
        size: this.volumes.strategic ? `${(this.volumes.strategic.length / 1024).toFixed(2)} KB` : '0 KB',
        contains: 'OKRs, Four Square, OST, Validation'
      },
      volume3: {
        loaded: this.loadStatus.vol3,
        size: this.volumes.analysis ? `${(this.volumes.analysis.length / 1024).toFixed(2)} KB` : '0 KB',
        contains: 'Pattern Detection, Forecasting, Analysis'
      },
      volume4: {
        loaded: this.loadStatus.vol4,
        size: this.volumes.reference ? `${(this.volumes.reference.length / 1024).toFixed(2)} KB` : '0 KB',
        contains: 'Examples, Quality Standards, Glossary'
      },
      volume5: {
        loaded: this.loadStatus.vol5,
        size: this.volumes.userguide ? `${(this.volumes.userguide.length / 1024).toFixed(2)} KB` : '0 KB',
        contains: 'User Guide, How-To Instructions, FAQ'
      }
    };
  }

  runIntegrityCheck() {
    console.log('🔍 Running Knowledge Base Integrity Check...');
    
    const checks = {
      volumesLoaded: Object.values(this.loadStatus).every(s => s),
      vol1HasFormulas: this.volumes.core && this.volumes.core.includes('SCORING'),
      vol2HasOKRs: this.volumes.strategic && this.volumes.strategic.includes('OKR'),
      vol3HasPatterns: this.volumes.analysis && this.volumes.analysis.includes('PATTERN'),
      vol4HasGlossary: this.volumes.reference && this.volumes.reference.includes('GLOSSARY'),
      vol5HasHowTo: this.volumes.userguide && this.volumes.userguide.includes('How do I'),
      canLoadComplete: this.getCompleteKnowledge().length > 0,
      canLoadEssential: this.getEssentialKnowledge().length > 0,
      canLoadHowTo: this.getHowToKnowledge().length > 0,
      canLoadRelevant: this.getRelevantKnowledge('test query').length > 0
    };
    
    console.log('🔍 Integrity Check Results:');
    for (const [check, result] of Object.entries(checks)) {
      console.log(`  ${check}: ${result ? '✅' : '❌'}`);
    }
    
    const allPassed = Object.values(checks).every(result => result);
    console.log(allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED');
    
    return checks;
  }
}

// ============================================================================
// INITIALIZE AND EXPOSE
// ============================================================================

// Create the loader instance
window.AIKnowledgeLoader = new AIKnowledgeLoader();

// Create backward-compatible global variable
window.AI_KNOWLEDGE_BASE = window.AIKnowledgeLoader.getCompleteKnowledge();

// ============================================================================
// HELPER FUNCTIONS (Global Access)
// ============================================================================

window.getAIKnowledge = function(strategy = 'complete') {
  return window.AIKnowledgeLoader.getAIKnowledge(strategy);
};

window.getRelevantKnowledge = function(query) {
  return window.AIKnowledgeLoader.getRelevantKnowledge(query);
};

window.searchKnowledgeBase = function(term) {
  return window.AIKnowledgeLoader.searchKnowledgeBase(term);
};

window.getKBStatus = function() {
  return window.AIKnowledgeLoader.getLoadStatus();
};

window.getKBInfo = function() {
  return window.AIKnowledgeLoader.getKnowledgeBaseInfo();
};

window.verifyKB = function() {
  return window.AIKnowledgeLoader.runIntegrityCheck();
};

// ============================================================================
// CONSOLE HELP
// ============================================================================

console.log('');
console.log('📚 AI Knowledge Base Loader Ready!');
console.log('');
console.log('Quick Commands:');
console.log('  getAIKnowledge("complete")  - Get all 5 volumes');
console.log('  getAIKnowledge("essential") - Get Vol 1 + 4 only');
console.log('  getAIKnowledge("howto")     - Get Vol 5 only (user guide)');
console.log('  getRelevantKnowledge(query) - Smart context loading');
console.log('  searchKnowledgeBase(term)   - Search all volumes');
console.log('  getKBStatus()               - Check load status');
console.log('  getKBInfo()                 - Volume information');
console.log('  verifyKB()                  - Run integrity check');
console.log('');