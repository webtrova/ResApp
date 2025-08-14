// Enhanced Template System
// Advanced rule-based enhancement with industry-specific patterns

interface TemplatePattern {
  pattern: RegExp;
  replacements: string[];
  industry?: string;
  context?: string;
}

interface IndustryTemplate {
  name: string;
  patterns: TemplatePattern[];
  vocabulary: string[];
  metrics: string[];
  actionVerbs: string[];
}

// Advanced action verb transformations with context
const ADVANCED_VERB_MAPPINGS: Record<string, string[]> = {
  // Leadership actions
  'led': ['Spearheaded', 'Orchestrated', 'Championed', 'Steered', 'Directed'],
  'managed': ['Supervised', 'Oversaw', 'Coordinated', 'Administered', 'Governed'],
  'supervised': ['Mentored', 'Guided', 'Coached', 'Developed', 'Nurtured'],
  
  // Achievement actions
  'improved': ['Enhanced', 'Optimized', 'Streamlined', 'Refined', 'Upgraded'],
  'increased': ['Boosted', 'Elevated', 'Amplified', 'Expanded', 'Accelerated'],
  'decreased': ['Reduced', 'Minimized', 'Lowered', 'Cut', 'Decreased'],
  'saved': ['Reduced costs by', 'Cut expenses by', 'Optimized spending by', 'Minimized overhead by'],
  
  // Technical actions
  'developed': ['Architected', 'Engineered', 'Built', 'Created', 'Implemented'],
  'designed': ['Crafted', 'Formulated', 'Devised', 'Conceived', 'Planned'],
  'tested': ['Validated', 'Verified', 'Assessed', 'Evaluated', 'Analyzed'],
  
  // Communication actions
  'presented': ['Delivered', 'Showcased', 'Demonstrated', 'Exhibited', 'Presented'],
  'communicated': ['Conveyed', 'Articulated', 'Expressed', 'Transmitted', 'Relayed'],
  'trained': ['Educated', 'Instructed', 'Mentored', 'Coached', 'Developed'],
  
  // Problem-solving actions
  'solved': ['Resolved', 'Troubleshot', 'Rectified', 'Fixed', 'Corrected'],
  'identified': ['Discovered', 'Uncovered', 'Detected', 'Located', 'Found'],
  'analyzed': ['Evaluated', 'Assessed', 'Examined', 'Investigated', 'Studied']
};

// Industry-specific templates
const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  'software_engineering': {
    name: 'Software Engineering',
    patterns: [
      {
        pattern: /\b(wrote|created|made)\s+(code|software|app|program)/gi,
        replacements: ['Developed', 'Architected', 'Engineered', 'Built', 'Implemented'],
        context: 'technical_development'
      },
      {
        pattern: /\b(fixed|solved)\s+(bugs|problems|issues)/gi,
        replacements: ['Resolved', 'Troubleshot', 'Debugged', 'Rectified', 'Corrected'],
        context: 'problem_solving'
      },
      {
        pattern: /\b(worked\s+with|used)\s+(team|developers|engineers)/gi,
        replacements: ['Collaborated with', 'Partnered with', 'Coordinated with', 'Teamed with'],
        context: 'collaboration'
      }
    ],
    vocabulary: [
      'API development', 'microservices', 'cloud infrastructure', 'CI/CD pipelines',
      'agile methodology', 'code review', 'unit testing', 'database optimization',
      'performance optimization', 'system architecture', 'full-stack development'
    ],
    metrics: [
      '25% performance improvement', '40% faster deployment', '30% reduction in bugs',
      '99.9% uptime', '50% faster response time', '100% test coverage'
    ],
    actionVerbs: ['Developed', 'Architected', 'Implemented', 'Optimized', 'Debugged', 'Deployed']
  },
  
  'sales': {
    name: 'Sales',
    patterns: [
      {
        pattern: /\b(sold|sold\s+to)\s+(customers|clients)/gi,
        replacements: ['Generated revenue from', 'Secured contracts with', 'Drove sales to', 'Acquired customers'],
        context: 'revenue_generation'
      },
      {
        pattern: /\b(called|contacted)\s+(customers|prospects|leads)/gi,
        replacements: ['Reached out to', 'Engaged with', 'Connected with', 'Prospected'],
        context: 'prospecting'
      },
      {
        pattern: /\b(met|exceeded)\s+(targets|goals|quotas)/gi,
        replacements: ['Surpassed', 'Achieved', 'Exceeded', 'Outperformed'],
        context: 'goal_achievement'
      }
    ],
    vocabulary: [
      'CRM management', 'lead generation', 'pipeline management', 'client relationship',
      'sales cycle', 'prospecting', 'negotiation', 'account management'
    ],
    metrics: [
      '$2.3M in new business', '30% revenue increase', 'exceeded quota by 25%',
      '50+ new clients', '40% conversion rate', '95% client retention'
    ],
    actionVerbs: ['Generated', 'Secured', 'Closed', 'Negotiated', 'Developed', 'Expanded']
  },
  
  'marketing': {
    name: 'Marketing',
    patterns: [
      {
        pattern: /\b(created|made)\s+(ads|campaigns|content)/gi,
        replacements: ['Developed', 'Executed', 'Launched', 'Produced', 'Crafted'],
        context: 'campaign_creation'
      },
      {
        pattern: /\b(ran|managed)\s+(social\s+media|campaigns)/gi,
        replacements: ['Oversaw', 'Coordinated', 'Managed', 'Directed', 'Orchestrated'],
        context: 'campaign_management'
      },
      {
        pattern: /\b(increased|grew)\s+(followers|engagement|leads)/gi,
        replacements: ['Boosted', 'Amplified', 'Expanded', 'Accelerated', 'Elevated'],
        context: 'growth'
      }
    ],
    vocabulary: [
      'campaign management', 'digital marketing', 'SEO optimization', 'social media strategy',
      'content creation', 'analytics', 'brand awareness', 'lead generation'
    ],
    metrics: [
      '10K+ audience engagement', '25% increase in leads', '40% higher conversion rate',
      '300% ROI', '500+ qualified leads', '50% brand awareness increase'
    ],
    actionVerbs: ['Developed', 'Executed', 'Optimized', 'Analyzed', 'Created', 'Managed']
  },
  
  'customer_service': {
    name: 'Customer Service',
    patterns: [
      {
        pattern: /\b(helped|assisted)\s+(customers|clients)/gi,
        replacements: ['Supported', 'Assisted', 'Aided', 'Guided', 'Served'],
        context: 'customer_support'
      },
      {
        pattern: /\b(answered|responded\s+to)\s+(calls|emails|tickets)/gi,
        replacements: ['Processed', 'Handled', 'Addressed', 'Resolved', 'Managed'],
        context: 'communication'
      },
      {
        pattern: /\b(solved|fixed)\s+(problems|issues)/gi,
        replacements: ['Resolved', 'Troubleshot', 'Rectified', 'Corrected', 'Fixed'],
        context: 'problem_resolution'
      }
    ],
    vocabulary: [
      'customer support', 'ticket management', 'knowledge base', 'customer satisfaction',
      'resolution time', 'service quality', 'first-call resolution'
    ],
    metrics: [
      '100+ daily interactions', '95% customer satisfaction', '98% first-call resolution',
      '4.8/5 average rating', '30% faster resolution time', '500+ tickets processed'
    ],
    actionVerbs: ['Resolved', 'Assisted', 'Supported', 'Addressed', 'Processed', 'Managed']
  },
  
  'project_management': {
    name: 'Project Management',
    patterns: [
      {
        pattern: /\b(led|managed)\s+(projects|teams)/gi,
        replacements: ['Spearheaded', 'Orchestrated', 'Directed', 'Supervised', 'Coordinated'],
        context: 'leadership'
      },
      {
        pattern: /\b(planned|organized)\s+(tasks|schedules)/gi,
        replacements: ['Strategized', 'Coordinated', 'Structured', 'Arranged', 'Systematized'],
        context: 'planning'
      },
      {
        pattern: /\b(delivered|completed)\s+(projects|deliverables)/gi,
        replacements: ['Successfully delivered', 'Completed', 'Achieved', 'Accomplished', 'Finalized'],
        context: 'delivery'
      }
    ],
    vocabulary: [
      'project planning', 'stakeholder management', 'risk assessment', 'budget management',
      'timeline coordination', 'resource allocation', 'agile methodology'
    ],
    metrics: [
      'managed 8 concurrent projects', 'delivered 15 projects on time', 'oversaw $2M budget',
      'led cross-functional team of 12', 'coordinated 20+ stakeholders', '100% on-time delivery'
    ],
    actionVerbs: ['Led', 'Managed', 'Coordinated', 'Oversaw', 'Delivered', 'Executed']
  }
};

// Smart quantification with industry context
function generateSmartQuantification(text: string, industry: string): string {
  const template = INDUSTRY_TEMPLATES[industry];
  if (!template) return 'significant improvement';
  
  const lowerText = text.toLowerCase();
  
  // Choose appropriate metrics based on content
  if (lowerText.includes('team') || lowerText.includes('manage') || lowerText.includes('lead')) {
    return template.metrics.find(m => m.includes('team') || m.includes('stakeholder')) || 'cross-functional team';
  }
  
  if (lowerText.includes('improve') || lowerText.includes('better') || lowerText.includes('optimize')) {
    return template.metrics.find(m => m.includes('%') && m.includes('improvement')) || '25% improvement';
  }
  
  if (lowerText.includes('sell') || lowerText.includes('revenue') || lowerText.includes('money')) {
    return template.metrics.find(m => m.includes('$') || m.includes('revenue')) || '20% revenue increase';
  }
  
  if (lowerText.includes('customer') || lowerText.includes('support') || lowerText.includes('help')) {
    return template.metrics.find(m => m.includes('satisfaction') || m.includes('resolution')) || '95% satisfaction rate';
  }
  
  if (lowerText.includes('project') || lowerText.includes('deliver') || lowerText.includes('complete')) {
    return template.metrics.find(m => m.includes('project') || m.includes('delivery')) || 'successful project delivery';
  }
  
  // Return a random metric from the industry template
  return template.metrics[Math.floor(Math.random() * template.metrics.length)] || 'significant improvement';
}

// Enhanced text transformation with industry-specific patterns
export function enhanceTextWithTemplates(text: string, context: any = {}): string {
  const industry = context.industry || 'project_management';
  const template = INDUSTRY_TEMPLATES[industry];
  
  if (!template) {
    return text; // Return original if no template found
  }
  
  let enhancedText = text;
  
  // Apply industry-specific patterns
  for (const pattern of template.patterns) {
    if (pattern.pattern.test(enhancedText)) {
      const replacement = pattern.replacements[Math.floor(Math.random() * pattern.replacements.length)];
      enhancedText = enhancedText.replace(pattern.pattern, replacement);
    }
  }
  
  // Apply advanced verb mappings
  for (const [weakVerb, strongVerbs] of Object.entries(ADVANCED_VERB_MAPPINGS)) {
    const regex = new RegExp(`\\b${weakVerb}\\b`, 'gi');
    if (regex.test(enhancedText)) {
      const strongVerb = strongVerbs[Math.floor(Math.random() * strongVerbs.length)];
      enhancedText = enhancedText.replace(regex, strongVerb);
    }
  }
  
  // Add industry-specific vocabulary if appropriate
  const lowerText = enhancedText.toLowerCase();
  if (!lowerText.includes('using') && !lowerText.includes('through')) {
    const vocab = template.vocabulary[Math.floor(Math.random() * template.vocabulary.length)];
    if (!lowerText.includes(vocab.toLowerCase())) {
      enhancedText = enhancedText.replace(/(\w+)/, `$1 using ${vocab}`);
    }
  }
  
  // Add quantification
  const quantification = generateSmartQuantification(enhancedText, industry);
  
  // Structure as PAR
  if (!enhancedText.includes('%') && !enhancedText.includes('$') && !enhancedText.match(/\d+/)) {
    enhancedText = `${enhancedText}, resulting in ${quantification}`;
  }
  
  // Ensure professional formatting
  enhancedText = enhancedText.charAt(0).toUpperCase() + enhancedText.slice(1);
  
  return enhancedText;
}

// Generate industry-specific skill suggestions
export function generateIndustrySkills(industry: string): string[] {
  const template = INDUSTRY_TEMPLATES[industry];
  if (!template) {
    return ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'];
  }
  
  const technicalSkills = template.vocabulary.slice(0, 4);
  const actionSkills = template.actionVerbs.slice(0, 2);
  
  return [...technicalSkills, ...actionSkills, 'Leadership', 'Communication'];
}

// Get available industries
export function getAvailableIndustries(): string[] {
  return Object.keys(INDUSTRY_TEMPLATES);
}

// Get industry template details
export function getIndustryTemplate(industry: string): IndustryTemplate | null {
  return INDUSTRY_TEMPLATES[industry] || null;
}
