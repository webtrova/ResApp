// Rule-based resume enhancement system
// No API keys required - works entirely offline

interface EnhancementContext {
  jobTitle?: string;
  industry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior';
  companySize?: 'startup' | 'small' | 'medium' | 'large';
}

// Action verb transformations
const ACTION_VERB_MAPPINGS = {
  'helped': ['Facilitated', 'Supported', 'Enabled', 'Empowered', 'Assisted'],
  'worked with': ['Collaborated with', 'Partnered with', 'Coordinated with', 'Teamed with'],
  'managed': ['Led', 'Supervised', 'Oversaw', 'Directed', 'Orchestrated'],
  'made': ['Developed', 'Created', 'Built', 'Implemented', 'Established'],
  'did': ['Executed', 'Performed', 'Delivered', 'Completed', 'Achieved'],
  'was responsible for': ['Spearheaded', 'Championed', 'Drove', 'Owned', 'Steered'],
  'handled': ['Managed', 'Processed', 'Coordinated', 'Administered', 'Oversaw'],
  'answered': ['Responded to', 'Addressed', 'Resolved', 'Handled', 'Processed'],
  'called': ['Contacted', 'Reached out to', 'Communicated with', 'Engaged with'],
  'wrote': ['Authored', 'Composed', 'Developed', 'Created', 'Produced'],
  'talked to': ['Consulted with', 'Advised', 'Counseled', 'Mentored', 'Guided'],
  'fixed': ['Resolved', 'Troubleshot', 'Rectified', 'Corrected', 'Repaired'],
  'found': ['Identified', 'Discovered', 'Located', 'Uncovered', 'Detected'],
  'kept track of': ['Monitored', 'Tracked', 'Maintained', 'Oversaw', 'Supervised'],
  'organized': ['Coordinated', 'Structured', 'Arranged', 'Systematized', 'Streamlined'],
  'planned': ['Strategized', 'Designed', 'Developed', 'Architected', 'Orchestrated'],
  'sold': ['Generated revenue', 'Secured contracts', 'Drove sales', 'Closed deals', 'Acquired customers'],
  'taught': ['Trained', 'Educated', 'Mentored', 'Instructed', 'Developed'],
  'learned': ['Mastered', 'Acquired expertise in', 'Developed proficiency in', 'Became skilled in'],
  'started': ['Initiated', 'Launched', 'Established', 'Founded', 'Created'],
  'improved': ['Enhanced', 'Optimized', 'Upgraded', 'Refined', 'Streamlined'],
  'increased': ['Boosted', 'Elevated', 'Amplified', 'Expanded', 'Grew'],
  'decreased': ['Reduced', 'Minimized', 'Lowered', 'Decreased', 'Cut'],
  'saved': ['Reduced costs by', 'Cut expenses by', 'Optimized spending by', 'Minimized overhead by'],
  'made money': ['Generated revenue of', 'Secured contracts worth', 'Drove sales of', 'Achieved revenue of'],
  'got better': ['Improved by', 'Enhanced by', 'Optimized by', 'Upgraded by'],
  'made faster': ['Accelerated by', 'Expedited by', 'Streamlined by', 'Optimized by'],
  'made easier': ['Simplified', 'Streamlined', 'Facilitated', 'Eased', 'Optimized']
};

// Industry-specific vocabulary
const INDUSTRY_VOCABULARY: Record<string, any> = {
  'software_engineering': {
    technical: ['API', 'microservices', 'cloud infrastructure', 'CI/CD', 'agile methodology', 'code review', 'unit testing', 'database optimization'],
    metrics: ['deployment frequency', 'code quality', 'bug reduction', 'performance improvement', 'system uptime', 'response time'],
    actions: ['Developed', 'Architected', 'Implemented', 'Optimized', 'Debugged', 'Refactored', 'Deployed', 'Maintained']
  },
  'sales': {
    technical: ['CRM', 'lead generation', 'pipeline management', 'client relationship', 'sales cycle', 'prospecting', 'negotiation'],
    metrics: ['revenue growth', 'deal size', 'conversion rate', 'quota achievement', 'client acquisition', 'sales velocity'],
    actions: ['Generated', 'Secured', 'Closed', 'Negotiated', 'Developed', 'Expanded', 'Acquired', 'Maintained']
  },
  'marketing': {
    technical: ['campaign management', 'digital marketing', 'SEO', 'social media', 'content creation', 'analytics', 'brand awareness'],
    metrics: ['engagement rate', 'conversion rate', 'lead generation', 'brand awareness', 'ROI', 'click-through rate'],
    actions: ['Developed', 'Executed', 'Optimized', 'Analyzed', 'Created', 'Managed', 'Increased', 'Generated']
  },
  'customer_service': {
    technical: ['customer support', 'ticket management', 'knowledge base', 'customer satisfaction', 'resolution time', 'service quality'],
    metrics: ['customer satisfaction', 'response time', 'resolution rate', 'first-call resolution', 'customer retention'],
    actions: ['Resolved', 'Assisted', 'Supported', 'Addressed', 'Processed', 'Managed', 'Improved', 'Enhanced']
  },
  'project_management': {
    technical: ['project planning', 'stakeholder management', 'risk assessment', 'budget management', 'timeline coordination', 'resource allocation'],
    metrics: ['on-time delivery', 'budget adherence', 'stakeholder satisfaction', 'project success rate', 'team productivity'],
    actions: ['Led', 'Managed', 'Coordinated', 'Oversaw', 'Delivered', 'Executed', 'Planned', 'Implemented']
  }
};

// Quantification patterns
const QUANTIFICATION_PATTERNS: Record<string, any> = {
  'software_engineering': {
    teamSize: ['5-8 team members', 'cross-functional team of 6', 'development team of 10'],
    efficiency: ['25% performance improvement', '40% faster deployment', '30% reduction in bugs'],
    scope: ['multiple features', 'full-stack applications', 'microservices architecture'],
    timeframe: ['quarterly', '6-month project', 'agile sprints']
  },
  'sales': {
    revenue: ['$2.3M in new business', '30% revenue increase', 'exceeded quota by 25%'],
    clients: ['50+ new clients', 'expanded client base by 40%', 'maintained 95% retention'],
    deals: ['closed 15 major deals', 'average deal size of $50K', 'conversion rate of 35%']
  },
  'marketing': {
    reach: ['10K+ audience engagement', '25% increase in leads', '40% higher conversion rate'],
    campaigns: ['launched 12 successful campaigns', 'achieved 300% ROI', 'generated 500+ qualified leads']
  },
  'customer_service': {
    volume: ['100+ daily interactions', 'processed 500+ tickets', 'handled 200+ customer inquiries'],
    satisfaction: ['95% customer satisfaction', '98% first-call resolution', '4.8/5 average rating']
  },
  'project_management': {
    projects: ['managed 8 concurrent projects', 'delivered 15 projects on time', 'oversaw $2M budget'],
    teams: ['led cross-functional team of 12', 'coordinated 20+ stakeholders', 'managed 5 vendor relationships']
  }
};

// Smart quantification based on context
function generateQuantification(text: string, context: EnhancementContext): string {
  const industry = getIndustryFromContext(context);
  const patterns = QUANTIFICATION_PATTERNS[industry] || QUANTIFICATION_PATTERNS['project_management'];
  
  // Extract key words to determine appropriate quantification
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('team') || lowerText.includes('manage') || lowerText.includes('lead')) {
    return patterns.teamSize?.[Math.floor(Math.random() * patterns.teamSize.length)] || 'cross-functional team';
  }
  
  if (lowerText.includes('improve') || lowerText.includes('better') || lowerText.includes('optimize')) {
    return patterns.efficiency?.[Math.floor(Math.random() * patterns.efficiency.length)] || '25% improvement';
  }
  
  if (lowerText.includes('sell') || lowerText.includes('revenue') || lowerText.includes('money')) {
    return patterns.revenue?.[Math.floor(Math.random() * patterns.revenue.length)] || '20% revenue increase';
  }
  
  if (lowerText.includes('customer') || lowerText.includes('support') || lowerText.includes('help')) {
    return patterns.satisfaction?.[Math.floor(Math.random() * patterns.satisfaction.length)] || '95% satisfaction rate';
  }
  
  if (lowerText.includes('project') || lowerText.includes('deliver') || lowerText.includes('complete')) {
    return patterns.projects?.[Math.floor(Math.random() * patterns.projects.length)] || 'successful project delivery';
  }
  
  // Default quantification
  return 'significant improvement';
}

function getIndustryFromContext(context: EnhancementContext): string {
  if (!context.industry && !context.jobTitle) return 'project_management';
  
  const industry = context.industry?.toLowerCase() || '';
  const jobTitle = context.jobTitle?.toLowerCase() || '';
  
  if (industry.includes('software') || industry.includes('tech') || 
      jobTitle.includes('developer') || jobTitle.includes('engineer')) {
    return 'software_engineering';
  }
  
  if (industry.includes('sales') || jobTitle.includes('sales')) {
    return 'sales';
  }
  
  if (industry.includes('marketing') || jobTitle.includes('marketing')) {
    return 'marketing';
  }
  
  if (industry.includes('customer') || industry.includes('support') ||
      jobTitle.includes('customer') || jobTitle.includes('support')) {
    return 'customer_service';
  }
  
  if (industry.includes('project') || jobTitle.includes('project')) {
    return 'project_management';
  }
  
  return 'project_management';
}

function enhanceActionVerbs(text: string): string {
  let enhancedText = text;
  
  for (const [weakVerb, strongVerbs] of Object.entries(ACTION_VERB_MAPPINGS)) {
    const regex = new RegExp(`\\b${weakVerb}\\b`, 'gi');
    if (regex.test(enhancedText)) {
      const strongVerb = strongVerbs[Math.floor(Math.random() * strongVerbs.length)];
      enhancedText = enhancedText.replace(regex, strongVerb);
    }
  }
  
  return enhancedText;
}

function addIndustryVocabulary(text: string, context: EnhancementContext): string {
  const industry = getIndustryFromContext(context);
  const vocabulary = INDUSTRY_VOCABULARY[industry];
  
  if (!vocabulary) return text;
  
  // Add relevant technical terms if they fit the context
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('code') || lowerText.includes('develop') || lowerText.includes('program')) {
    const techTerm = vocabulary.technical[Math.floor(Math.random() * vocabulary.technical.length)];
    if (!lowerText.includes(techTerm.toLowerCase())) {
      return text.replace(/(\w+)/, `$1 using ${techTerm}`);
    }
  }
  
  return text;
}

function structureAsPAR(text: string, context: EnhancementContext): string {
  // Convert simple statements into Problem-Action-Result format
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('improved') || lowerText.includes('increased') || lowerText.includes('reduced')) {
    // Already has a result, just need to add context
    return text;
  }
  
  // Add quantification if missing
  const quantification = generateQuantification(text, context);
  
  // Structure as PAR
  if (lowerText.includes('managed') || lowerText.includes('led') || lowerText.includes('supervised')) {
    return `${text}, resulting in ${quantification}`;
  }
  
  if (lowerText.includes('developed') || lowerText.includes('created') || lowerText.includes('built')) {
    return `${text}, achieving ${quantification}`;
  }
  
  if (lowerText.includes('resolved') || lowerText.includes('fixed') || lowerText.includes('solved')) {
    return `${text}, leading to ${quantification}`;
  }
  
  // Default enhancement
  return `${text}, resulting in ${quantification}`;
}

export function enhanceText(text: string, context: EnhancementContext = {}): string {
  if (!text || text.trim().length === 0) {
    return text;
  }
  
  let enhancedText = text.trim();
  
  // Step 1: Enhance action verbs
  enhancedText = enhanceActionVerbs(enhancedText);
  
  // Step 2: Add industry-specific vocabulary
  enhancedText = addIndustryVocabulary(enhancedText, context);
  
  // Step 3: Structure as PAR with quantification
  enhancedText = structureAsPAR(enhancedText, context);
  
  // Step 4: Ensure professional formatting
  enhancedText = enhancedText.charAt(0).toUpperCase() + enhancedText.slice(1);
  
  // Step 5: Add final polish
  if (!enhancedText.includes('%') && !enhancedText.includes('$') && !enhancedText.match(/\d+/)) {
    // Add a generic improvement metric if no numbers present
    const improvements = ['significant improvement', 'measurable results', 'positive outcomes', 'tangible benefits'];
    const improvement = improvements[Math.floor(Math.random() * improvements.length)];
    enhancedText = enhancedText.replace(/\.$/, `, achieving ${improvement}.`);
  }
  
  return enhancedText;
}

// Bulk enhancement function
export function enhanceMultipleTexts(texts: string[], context: EnhancementContext = {}): string[] {
  return texts.map(text => enhanceText(text, context));
}

// Generate skill suggestions based on job title and industry
export function generateSkillSuggestions(jobTitle: string, industry: string): string[] {
  const industryVocab = INDUSTRY_VOCABULARY[getIndustryFromContext({ jobTitle, industry })];
  
  if (!industryVocab) {
    return ['Project Management', 'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'];
  }
  
  const technicalSkills = industryVocab.technical.slice(0, 3);
  const actionSkills = industryVocab.actions.slice(0, 2);
  
  return [...technicalSkills, ...actionSkills, 'Leadership', 'Communication'];
}

// Generate career summary
export function generateCareerSummary(
  jobTitle: string, 
  yearsExperience: number, 
  keySkills: string[], 
  industry: string = ''
): string {
  const level = yearsExperience < 2 ? 'entry-level' : yearsExperience < 5 ? 'mid-level' : 'senior';
  const industryContext = industry ? ` in the ${industry} industry` : '';
  
  return `Results-driven ${jobTitle} with ${yearsExperience} years of experience${industryContext}. Proven track record of ${keySkills.slice(0, 3).join(', ')} and ${keySkills.slice(3, 5).join(', ')}. Seeking opportunities to leverage expertise in ${industry || 'professional'} environments to drive organizational success and achieve measurable results.`;
}
