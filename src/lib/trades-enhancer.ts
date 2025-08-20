// Specialized enhancement system for skilled trades
// Focuses on plumbing, HVAC, electrical, and related fields

interface TradeEnhancement {
  original: string;
  enhanced: string;
  improvements: string[];
  metrics: string[];
}

export class TradesEnhancer {
  private tradeTemplates = {
    plumbing: {
      verbs: ['installed', 'repaired', 'diagnosed', 'maintained', 'retrofitted', 'inspected'],
      skills: ['pipe fitting', 'leak detection', 'water pressure systems', 'drain cleaning', 'fixture installation'],
      metrics: ['reduced service calls by X%', 'completed X jobs per day', 'achieved X% customer satisfaction'],
      certifications: ['licensed plumber', 'backflow prevention', 'gas line certified']
    },
    hvac: {
      verbs: ['calibrated', 'serviced', 'optimized', 'troubleshot', 'commissioned', 'balanced'],
      skills: ['HVAC systems', 'refrigeration', 'ductwork', 'thermostats', 'air quality systems'],
      metrics: ['improved efficiency by X%', 'reduced energy costs by $X', 'maintained X units'],
      certifications: ['EPA 608 certified', 'NATE certified', 'refrigeration license']
    },
    electrical: {
      verbs: ['wired', 'installed', 'tested', 'troubleshot', 'upgraded', 'inspected'],
      skills: ['electrical systems', 'circuit analysis', 'motor controls', 'panel installation', 'code compliance'],
      metrics: ['completed X installations', 'passed X% of inspections', 'reduced downtime by X hours'],
      certifications: ['licensed electrician', 'OSHA 10', 'electrical code certified']
    },
    construction: {
      verbs: ['constructed', 'renovated', 'demolished', 'framed', 'finished', 'coordinated'],
      skills: ['blueprints', 'project management', 'safety protocols', 'quality control', 'material ordering'],
      metrics: ['completed projects X% under budget', 'finished X weeks ahead of schedule', 'zero safety incidents'],
      certifications: ['OSHA certified', 'project management', 'safety training']
    }
  };

  enhanceTradeDescription(text: string, trade: string = 'general'): TradeEnhancement {
    const template = this.tradeTemplates[trade as keyof typeof this.tradeTemplates] || this.tradeTemplates.construction;
    
    let enhanced = text;
    const improvements: string[] = [];
    const metrics: string[] = [];

    // Replace weak verbs with strong trade-specific ones
    const weakVerbMap = {
      'fixed': template.verbs[1], // repaired/serviced/tested
      'worked on': template.verbs[0], // installed/calibrated/wired
      'helped': 'assisted customers with',
      'did': template.verbs[0],
      'made': 'created',
      'handled': 'managed'
    };

    Object.entries(weakVerbMap).forEach(([weak, strong]) => {
      if (enhanced.toLowerCase().includes(weak)) {
        enhanced = enhanced.replace(new RegExp(weak, 'gi'), strong);
        improvements.push(`Changed "${weak}" to "${strong}"`);
      }
    });

    // Add trade-specific context (only if not already enhanced)
    if (enhanced.toLowerCase().includes('customer') && !enhanced.toLowerCase().includes('professional service')) {
      enhanced = enhanced.replace(/\bcustomer[s]?\b/gi, 'clients');
      enhanced = enhanced.replace(/assisted clients/gi, 'provided professional service to clients');
      improvements.push('Added professional service context');
    }

    // Add quantification suggestions
    if (enhanced.toLowerCase().includes('daily') || enhanced.toLowerCase().includes('every day')) {
      metrics.push('completed 8-12 service calls daily');
    }
    
    if (enhanced.toLowerCase().includes('install') || enhanced.toLowerCase().includes('repair')) {
      metrics.push(`maintained 95%+ customer satisfaction rating`);
    }

    // Add trade-specific achievements
    if (trade === 'plumbing' && enhanced.toLowerCase().includes('pipe')) {
      metrics.push('specialized in residential and commercial plumbing systems');
    }
    
    if (trade === 'hvac' && enhanced.toLowerCase().includes('system')) {
      metrics.push('certified in multiple HVAC system types');
    }
    
    if (trade === 'electrical' && enhanced.toLowerCase().includes('wire')) {
      metrics.push('compliant with NEC electrical codes');
    }

    // Ensure professional tone
    enhanced = this.improveTone(enhanced);

    return {
      original: text,
      enhanced,
      improvements,
      metrics
    };
  }

  private improveTone(text: string): string {
    // Capitalize first letter
    let improved = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Add professional endings if missing
    if (!improved.endsWith('.') && !improved.endsWith('!')) {
      improved += '.';
    }

    // Replace casual language
    const professionalReplacements = {
      'stuff': 'equipment',
      'things': 'components',
      'a lot': 'numerous',
      'really good': 'highly effective',
      'pretty much': 'primarily'
    };

    Object.entries(professionalReplacements).forEach(([casual, professional]) => {
      improved = improved.replace(new RegExp(casual, 'gi'), professional);
    });

    return improved;
  }

  getTradeSpecificSuggestions(trade: string): { skills: string[], certifications: string[] } {
    const template = this.tradeTemplates[trade as keyof typeof this.tradeTemplates];
    if (!template) {
      return { skills: [], certifications: [] };
    }

    return {
      skills: template.skills,
      certifications: template.certifications
    };
  }

  generateMetricsOptions(trade: string, context: string): string[] {
    const template = this.tradeTemplates[trade as keyof typeof this.tradeTemplates];
    if (!template) return [];

    return template.metrics.map(metric => {
      // Replace X with realistic numbers based on trade
      if (trade === 'plumbing') {
        return metric.replace('X%', '95%').replace('X jobs', '8-12 jobs').replace('$X', '$200-500');
      }
      if (trade === 'hvac') {
        return metric.replace('X%', '15-25%').replace('X units', '50+ units').replace('$X', '$300-800');
      }
      if (trade === 'electrical') {
        return metric.replace('X installations', '5-8 installations').replace('X%', '98%').replace('X hours', '4-6 hours');
      }
      return metric.replace('X%', '20%').replace('X weeks', '2-3 weeks');
    });
  }
}

// Simple API-compatible function
export function enhanceTradeText(text: string, trade: string = 'general'): {
  success: boolean;
  original: string;
  enhanced: string;
  suggestions: {
    improvements: string[];
    metrics: string[];
    skills: string[];
    certifications: string[];
  };
} {
  try {
    const enhancer = new TradesEnhancer();
    const result = enhancer.enhanceTradeDescription(text, trade);
    const suggestions = enhancer.getTradeSpecificSuggestions(trade);
    const metrics = enhancer.generateMetricsOptions(trade, text);

    return {
      success: true,
      original: result.original,
      enhanced: result.enhanced,
      suggestions: {
        improvements: result.improvements,
        metrics,
        skills: suggestions.skills,
        certifications: suggestions.certifications
      }
    };
  } catch (error) {
    console.error('Trade enhancement error:', error);
    return {
      success: false,
      original: text,
      enhanced: text,
      suggestions: {
        improvements: [],
        metrics: [],
        skills: [],
        certifications: []
      }
    };
  }
}
