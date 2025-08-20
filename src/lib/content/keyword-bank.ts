// Comprehensive Keyword Bank System
// Provides industry-specific keywords, action verbs, and content templates

export interface IndustryKeywords {
  actionVerbs: string[];
  skills: string[];
  responsibilities: string[];
  achievements: string[];
  certifications: string[];
  tools: string[];
  metrics: string[];
}

export interface ContentTemplate {
  pattern: RegExp;
  templates: string[];
  industry: string[];
  level: string[];
}

export class KeywordBank {
  private industries: Record<string, IndustryKeywords> = {
    technology: {
      actionVerbs: [
        'developed', 'implemented', 'architected', 'optimized', 'automated', 
        'deployed', 'designed', 'engineered', 'programmed', 'integrated',
        'debugged', 'tested', 'maintained', 'scaled', 'refactored'
      ],
      skills: [
        'software development', 'web development', 'mobile development', 
        'database design', 'API development', 'cloud computing', 'DevOps',
        'machine learning', 'data analysis', 'cybersecurity', 'UI/UX design'
      ],
      responsibilities: [
        'code review', 'sprint planning', 'technical documentation', 
        'mentoring junior developers', 'system architecture', 'performance optimization',
        'security implementation', 'quality assurance', 'project management'
      ],
      achievements: [
        'reduced load time by {X}%', 'increased user engagement by {X}%',
        'decreased bug reports by {X}%', 'improved system performance by {X}%',
        'saved ${X} in operational costs', 'delivered project {X} weeks ahead of schedule'
      ],
      certifications: [
        'AWS Certified', 'Google Cloud Certified', 'Microsoft Azure Certified',
        'Certified Scrum Master', 'PMP', 'CISSP', 'CompTIA Security+'
      ],
      tools: [
        'JavaScript', 'Python', 'React', 'Node.js', 'Docker', 'Kubernetes',
        'AWS', 'Git', 'Jenkins', 'MongoDB', 'PostgreSQL', 'Redis'
      ],
      metrics: [
        'users served', 'uptime percentage', 'response time', 'code coverage',
        'deployment frequency', 'bug fix rate', 'feature delivery time'
      ]
    },

    healthcare: {
      actionVerbs: [
        'administered', 'assessed', 'diagnosed', 'treated', 'monitored',
        'documented', 'coordinated', 'educated', 'collaborated', 'implemented',
        'evaluated', 'supervised', 'maintained', 'ensured', 'provided'
      ],
      skills: [
        'patient care', 'medical records', 'clinical procedures', 'patient education',
        'infection control', 'medication administration', 'vital signs monitoring',
        'emergency response', 'care planning', 'interdisciplinary collaboration'
      ],
      responsibilities: [
        'patient assessment', 'treatment planning', 'medication management',
        'documentation', 'patient education', 'quality improvement',
        'infection prevention', 'emergency response', 'staff supervision'
      ],
      achievements: [
        'improved patient satisfaction by {X}%', 'reduced readmission rates by {X}%',
        'achieved {X}% compliance with safety protocols', 'decreased wait times by {X} minutes',
        'managed caseload of {X} patients', 'maintained {X}% accuracy in documentation'
      ],
      certifications: [
        'RN', 'LPN', 'CNA', 'BLS', 'ACLS', 'PALS', 'CCRN', 'CMA', 'HIPAA Certified'
      ],
      tools: [
        'EMR systems', 'Epic', 'Cerner', 'medical devices', 'diagnostic equipment',
        'HIPAA compliance tools', 'patient monitoring systems'
      ],
      metrics: [
        'patient satisfaction scores', 'infection rates', 'medication errors',
        'patient outcomes', 'response times', 'compliance rates'
      ]
    },

    finance: {
      actionVerbs: [
        'analyzed', 'forecasted', 'budgeted', 'audited', 'reconciled',
        'managed', 'optimized', 'evaluated', 'reported', 'assessed',
        'calculated', 'projected', 'monitored', 'advised', 'structured'
      ],
      skills: [
        'financial analysis', 'budget management', 'risk assessment', 'investment analysis',
        'financial modeling', 'regulatory compliance', 'tax preparation', 'auditing',
        'portfolio management', 'financial reporting', 'due diligence'
      ],
      responsibilities: [
        'financial reporting', 'budget preparation', 'variance analysis',
        'compliance monitoring', 'risk management', 'investment oversight',
        'client advisory', 'process improvement', 'team leadership'
      ],
      achievements: [
        'reduced costs by ${X}', 'increased revenue by {X}%', 'improved ROI by {X}%',
        'managed portfolio worth ${X}', 'achieved {X}% accuracy in forecasting',
        'completed audits {X}% under deadline', 'saved ${X} through process optimization'
      ],
      certifications: [
        'CPA', 'CFA', 'FRM', 'CIA', 'CISA', 'Series 7', 'Series 66', 'PMP'
      ],
      tools: [
        'Excel', 'SAP', 'QuickBooks', 'Bloomberg Terminal', 'Tableau',
        'Power BI', 'SQL', 'Python', 'R', 'GAAP', 'IFRS'
      ],
      metrics: [
        'portfolio performance', 'cost savings', 'revenue growth', 'ROI',
        'accuracy rates', 'compliance scores', 'processing time'
      ]
    },

    sales: {
      actionVerbs: [
        'achieved', 'exceeded', 'generated', 'closed', 'prospected',
        'negotiated', 'converted', 'built', 'maintained', 'expanded',
        'identified', 'cultivated', 'secured', 'delivered', 'maximized'
      ],
      skills: [
        'relationship building', 'lead generation', 'sales presentations', 'negotiation',
        'CRM management', 'market analysis', 'customer retention', 'pipeline management',
        'territory management', 'consultative selling', 'account management'
      ],
      responsibilities: [
        'lead qualification', 'client presentations', 'proposal development',
        'contract negotiation', 'relationship management', 'territory planning',
        'market research', 'sales reporting', 'team collaboration'
      ],
      achievements: [
        'exceeded quota by {X}%', 'generated ${X} in new revenue',
        'closed {X} deals worth ${X}', 'achieved {X}% conversion rate',
        'expanded territory by {X}%', 'retained {X}% of client base'
      ],
      certifications: [
        'Salesforce Certified', 'HubSpot Certified', 'Challenger Sale Certified',
        'SPIN Selling Certified', 'Miller Heiman Certified'
      ],
      tools: [
        'Salesforce', 'HubSpot', 'Pipedrive', 'LinkedIn Sales Navigator',
        'Outreach', 'ZoomInfo', 'Gong', 'Chorus', 'Tableau'
      ],
      metrics: [
        'quota attainment', 'conversion rates', 'deal size', 'sales cycle length',
        'pipeline value', 'customer retention', 'revenue growth'
      ]
    },

    // Skilled Trades
    plumbing: {
      actionVerbs: [
        'installed', 'repaired', 'diagnosed', 'maintained', 'retrofitted',
        'inspected', 'tested', 'replaced', 'upgraded', 'troubleshot',
        'calibrated', 'serviced', 'assembled', 'fabricated', 'restored'
      ],
      skills: [
        'pipe fitting', 'leak detection', 'water pressure systems', 'drain cleaning',
        'fixture installation', 'backflow prevention', 'gas line installation',
        'sewer repair', 'water heater service', 'plumbing codes', 'blueprint reading'
      ],
      responsibilities: [
        'emergency repairs', 'preventive maintenance', 'system installation',
        'customer service', 'code compliance', 'safety protocols',
        'quality control', 'material ordering', 'project coordination'
      ],
      achievements: [
        'completed {X} service calls daily', 'achieved {X}% customer satisfaction',
        'reduced callback rate by {X}%', 'completed projects {X}% under budget',
        'maintained {X}% safety record', 'passed {X}% of inspections on first try'
      ],
      certifications: [
        'Licensed Plumber', 'Backflow Prevention Certified', 'Gas Line Certified',
        'OSHA 10', 'Green Plumber Certified', 'Medical Gas Certified'
      ],
      tools: [
        'pipe wrenches', 'drain snakes', 'pressure testing equipment',
        'welding equipment', 'pipe threading machines', 'leak detection equipment'
      ],
      metrics: [
        'service calls completed', 'customer satisfaction rating', 'callback rate',
        'project completion time', 'safety incidents', 'inspection pass rate'
      ]
    },

    'customer-service': {
      actionVerbs: [
        'managed', 'coordinated', 'resolved', 'assisted', 'supported',
        'facilitated', 'streamlined', 'optimized', 'enhanced', 'improved',
        'maintained', 'developed', 'implemented', 'monitored', 'evaluated'
      ],
      skills: [
        'customer relationship management', 'conflict resolution', 'problem solving',
        'communication skills', 'team leadership', 'process improvement',
        'quality assurance', 'training and development', 'performance management',
        'data analysis', 'customer satisfaction', 'service delivery'
      ],
      responsibilities: [
        'customer support', 'team supervision', 'quality control', 'process optimization',
        'staff training', 'performance monitoring', 'service delivery', 'complaint resolution',
        'reporting and analytics', 'continuous improvement', 'stakeholder communication'
      ],
      achievements: [
        'improved customer satisfaction by {X}%', 'reduced response time by {X}%',
        'increased team productivity by {X}%', 'resolved {X}+ customer issues monthly',
        'achieved {X}% first-call resolution rate', 'maintained {X}% service quality score'
      ],
      certifications: [
        'Customer Service Professional', 'Six Sigma Green Belt', 'Lean Management',
        'Project Management Professional', 'Quality Management', 'Leadership Training'
      ],
      tools: [
        'CRM systems', 'Help Desk software', 'Analytics platforms', 'Communication tools',
        'Quality monitoring systems', 'Training platforms', 'Performance tracking tools'
      ],
      metrics: [
        'customer satisfaction scores', 'response times', 'resolution rates',
        'team productivity', 'service quality', 'employee retention'
      ]
    },

    hvac: {
      actionVerbs: [
        'installed', 'serviced', 'calibrated', 'diagnosed', 'repaired',
        'maintained', 'optimized', 'commissioned', 'balanced', 'tested',
        'retrofitted', 'upgraded', 'monitored', 'adjusted', 'replaced'
      ],
      skills: [
        'HVAC systems', 'refrigeration', 'heat pumps', 'ductwork design',
        'air quality systems', 'energy efficiency', 'control systems',
        'preventive maintenance', 'system commissioning', 'troubleshooting'
      ],
      responsibilities: [
        'system installation', 'preventive maintenance', 'emergency repairs',
        'energy audits', 'customer service', 'quality control',
        'safety compliance', 'equipment testing', 'technical documentation'
      ],
      achievements: [
        'improved energy efficiency by {X}%', 'reduced service calls by {X}%',
        'maintained {X}+ units annually', 'achieved {X}% uptime',
        'completed installations {X} days ahead of schedule', 'saved customers ${X} annually'
      ],
      certifications: [
        'EPA 608 Certified', 'NATE Certified', 'HVAC Excellence Certified',
        'Refrigeration License', 'OSHA 10', 'Energy Star Certified'
      ],
      tools: [
        'refrigerant recovery equipment', 'pressure gauges', 'multimeters',
        'combustion analyzers', 'ductwork tools', 'brazing equipment'
      ],
      metrics: [
        'energy efficiency improvement', 'system uptime', 'maintenance schedules',
        'customer satisfaction', 'emergency response time', 'equipment lifespan'
      ]
    },

    electrical: {
      actionVerbs: [
        'wired', 'installed', 'tested', 'troubleshot', 'upgraded',
        'maintained', 'inspected', 'repaired', 'designed', 'commissioned',
        'calibrated', 'programmed', 'configured', 'integrated', 'restored'
      ],
      skills: [
        'electrical systems', 'circuit analysis', 'motor controls', 'panel installation',
        'code compliance', 'power distribution', 'lighting systems', 'safety systems',
        'industrial controls', 'renewable energy', 'data/communication systems'
      ],
      responsibilities: [
        'electrical installation', 'system maintenance', 'code compliance',
        'safety inspections', 'troubleshooting', 'customer service',
        'project management', 'quality assurance', 'documentation'
      ],
      achievements: [
        'completed {X} installations monthly', 'achieved {X}% inspection pass rate',
        'reduced downtime by {X} hours', 'improved efficiency by {X}%',
        'maintained zero safety incidents', 'completed projects {X}% under budget'
      ],
      certifications: [
        'Licensed Electrician', 'OSHA 10', 'NECA Certified', 'IES Certified',
        'Solar Installation Certified', 'Electrical Code Certified'
      ],
      tools: [
        'multimeters', 'oscilloscopes', 'wire strippers', 'conduit benders',
        'power tools', 'testing equipment', 'PLCs', 'motor drives'
      ],
      metrics: [
        'installations completed', 'inspection pass rate', 'downtime reduction',
        'safety record', 'project completion time', 'customer satisfaction'
      ]
    }
  };

  // Content templates for common scenarios
  private contentTemplates: ContentTemplate[] = [
    {
      pattern: /I (fixed|repaired|worked on) (.+)/i,
      templates: [
        'Diagnosed and repaired {item} to restore optimal functionality',
        'Successfully troubleshot and resolved {item} issues',
        'Performed comprehensive maintenance on {item} systems'
      ],
      industry: ['plumbing', 'hvac', 'electrical', 'automotive'],
      level: ['entry', 'mid', 'senior']
    },
    {
      pattern: /I (helped|assisted) customers/i,
      templates: [
        'Provided professional customer service to {X}+ clients daily',
        'Delivered exceptional technical support to residential and commercial customers',
        'Maintained {X}% customer satisfaction through expert problem resolution'
      ],
      industry: ['all'],
      level: ['entry', 'mid']
    },
    {
      pattern: /I (managed|led) (a team|people|staff)/i,
      templates: [
        'Led cross-functional team of {X} professionals to achieve project objectives',
        'Supervised and mentored {X} team members while maintaining operational efficiency',
        'Managed team performance and development resulting in {X}% productivity increase'
      ],
      industry: ['all'],
      level: ['mid', 'senior', 'executive']
    },
    {
      pattern: /I (developed|built|created) (.+)/i,
      templates: [
        'Developed and implemented {item} resulting in improved operational efficiency',
        'Engineered innovative {item} solutions to address complex business challenges',
        'Created comprehensive {item} framework that enhanced organizational capabilities'
      ],
      industry: ['technology', 'engineering', 'finance'],
      level: ['mid', 'senior']
    }
  ];

  getIndustryKeywords(industry: string): IndustryKeywords | null {
    return this.industries[industry.toLowerCase()] || null;
  }

  getAllIndustries(): string[] {
    return Object.keys(this.industries);
  }

  enhanceText(text: string, industry: string, level: string = 'entry'): {
    enhanced: string;
    suggestions: {
      actionVerbs: string[];
      skills: string[];
      achievements: string[];
      certifications: string[];
    };
    improvements: string[];
  } {
    const keywords = this.getIndustryKeywords(industry);
    if (!keywords) {
      return {
        enhanced: text,
        suggestions: { actionVerbs: [], skills: [], achievements: [], certifications: [] },
        improvements: []
      };
    }

    let enhanced = text;
    const improvements: string[] = [];

    // Apply content templates (check both "I" patterns and direct patterns)
    for (const template of this.contentTemplates) {
      if (template.pattern.test(text) && 
          (template.industry.includes('all') || template.industry.includes(industry)) &&
          template.level.includes(level)) {
        
        const match = text.match(template.pattern);
        if (match) {
          const randomTemplate = template.templates[Math.floor(Math.random() * template.templates.length)];
          enhanced = randomTemplate.replace('{item}', match[2] || 'systems');
          improvements.push(`Applied ${industry} industry template`);
          break;
        }
      }
    }

    // If no template was applied, enhance the existing text
    if (enhanced === text) {
      enhanced = this.enhanceExistingText(text, industry, level, keywords, improvements);
    }

    // Replace weak verbs with strong industry-specific ones
    const weakVerbs = ['did', 'worked', 'helped', 'made', 'got', 'had', 'fix', 'do', 'work', 'handle'];
    weakVerbs.forEach(weakVerb => {
      const regex = new RegExp(`\\b${weakVerb}(ed|ing|s)?\\b`, 'gi');
      if (regex.test(enhanced)) {
        const strongVerb = keywords.actionVerbs[Math.floor(Math.random() * keywords.actionVerbs.length)];
        enhanced = enhanced.replace(regex, strongVerb);
        improvements.push(`Replaced "${weakVerb}" with "${strongVerb}"`);
      }
    });

    // Add quantification placeholders strategically
    enhanced = this.addQuantificationOpportunities(enhanced, industry, improvements);

    // Add industry-specific details
    enhanced = this.addIndustryContext(enhanced, industry, keywords, improvements);

    return {
      enhanced,
      suggestions: {
        actionVerbs: keywords.actionVerbs.slice(0, 8),
        skills: keywords.skills.slice(0, 10),
        achievements: keywords.achievements.slice(0, 6),
        certifications: keywords.certifications.slice(0, 5)
      },
      improvements
    };
  }

  private enhanceExistingText(text: string, industry: string, level: string, keywords: IndustryKeywords, improvements: string[]): string {
    let enhanced = text;

    // Add professional context based on industry
    if (industry === 'plumbing') {
      if (text.includes('install') || text.includes('repair') || text.includes('maintain')) {
        enhanced = enhanced + ' in compliance with local plumbing codes and safety standards';
        improvements.push('Added code compliance context');
      }
      if (text.includes('pipes') || text.includes('plumbing systems')) {
        enhanced = enhanced.replace(/plumbing systems/gi, 'residential and commercial plumbing systems');
        enhanced = enhanced.replace(/pipes/gi, 'water supply and drainage pipes');
        improvements.push('Added system specification details');
      }
    } else if (industry === 'hvac') {
      if (text.includes('system') || text.includes('hvac')) {
        enhanced = enhanced.replace(/systems?/gi, 'HVAC systems and equipment');
        enhanced = enhanced + ' while ensuring optimal energy efficiency and performance';
        improvements.push('Added efficiency and performance context');
      }
    } else if (industry === 'electrical') {
      if (text.includes('electrical') || text.includes('wire') || text.includes('install')) {
        enhanced = enhanced + ' in accordance with NEC electrical codes and safety protocols';
        improvements.push('Added electrical code compliance');
      }
    } else if (industry === 'technology') {
      if (text.includes('develop') || text.includes('build') || text.includes('create')) {
        enhanced = enhanced + ' using industry best practices and modern development methodologies';
        improvements.push('Added development methodology context');
      }
    } else if (industry === 'customer-service') {
      if (text.includes('customer') || text.includes('service') || text.includes('support')) {
        enhanced = enhanced + ' while maintaining high quality standards and customer satisfaction';
        improvements.push('Added quality and satisfaction context');
      }
      if (text.includes('team') || text.includes('lead') || text.includes('manage')) {
        enhanced = enhanced + ' to ensure efficient service delivery and team productivity';
        improvements.push('Added service delivery context');
      }
      if (text.includes('handle') || text.includes('resolve') || text.includes('complaint')) {
        enhanced = enhanced + ' with professionalism and attention to detail';
        improvements.push('Added professionalism context');
      }
    }

    // Add experience level appropriate language
    if (level === 'senior' || level === 'executive') {
      enhanced = enhanced.replace(/^(\w)/, match => `Led and ${match.toLowerCase()}`);
      improvements.push('Added leadership context for senior level');
    }

    return enhanced;
  }

  private addQuantificationOpportunities(text: string, industry: string, improvements: string[]): string {
    let enhanced = text;
    
    // Look for opportunities to add metrics based on content
    if (!enhanced.includes('{X}')) {
      if (enhanced.includes('customers') || enhanced.includes('clients')) {
        enhanced = enhanced.replace(/customers?|clients?/gi, '{X}+ customers');
        improvements.push('Added customer volume quantification');
      } else if (enhanced.includes('projects')) {
        enhanced = enhanced.replace(/projects?/gi, '{X} projects');
        improvements.push('Added project count quantification');
      } else if (enhanced.includes('systems') && industry.match(/plumbing|hvac|electrical/)) {
        enhanced = enhanced.replace(/systems?/gi, '{X}+ systems');
        improvements.push('Added system count quantification');
      } else if (enhanced.includes('daily') || enhanced.includes('per day')) {
        // Already has frequency, add volume
        if (!enhanced.match(/\d+|\{X\}/)) {
          enhanced = enhanced.replace(/(daily|per day)/gi, '{X} times $1');
          improvements.push('Added frequency quantification');
        }
      } else {
        // Add general completion metrics
        enhanced = enhanced + ' achieving {X}% completion rate and customer satisfaction';
        improvements.push('Added performance metrics');
      }
    }

    return enhanced;
  }

  private addIndustryContext(text: string, industry: string, keywords: IndustryKeywords, improvements: string[]): string {
    let enhanced = text;

    // Add relevant industry skills/tools when appropriate
    if (industry === 'plumbing' && !text.includes('fitting') && text.includes('pipes')) {
      enhanced = enhanced.replace(/pipes?/gi, 'pipes using professional fitting techniques');
      improvements.push('Added technical skill detail');
    } else if (industry === 'hvac' && text.includes('maintain') && !text.includes('preventive')) {
      enhanced = enhanced.replace(/maintain/gi, 'perform preventive maintenance on');
      improvements.push('Added maintenance methodology');
    } else if (industry === 'electrical' && text.includes('install') && !text.includes('test')) {
      enhanced = enhanced.replace(/install/gi, 'install and test');
      improvements.push('Added testing procedure');
    }

    return enhanced;
  }

  getQuantificationSuggestions(industry: string, context: string): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};

    // Industry-specific quantification
    switch (industry.toLowerCase()) {
      case 'technology':
        suggestions.users = ['1K+', '10K+', '100K+', '1M+'];
        suggestions.performance = ['15%', '25%', '40%', '60%'];
        suggestions.time = ['2 weeks', '1 month', '3 months'];
        break;
      case 'sales':
        suggestions.percentage = ['110%', '125%', '150%', '200%'];
        suggestions.revenue = ['$50K', '$100K', '$500K', '$1M'];
        suggestions.deals = ['5', '10', '25', '50'];
        break;
      case 'plumbing':
        suggestions.calls = ['8-12', '10-15', '15-20'];
        suggestions.satisfaction = ['95%', '98%', '99%'];
        suggestions.projects = ['5', '10', '15', '25'];
        break;
      case 'hvac':
        suggestions.efficiency = ['15%', '20%', '25%', '30%'];
        suggestions.units = ['25', '50', '100', '200'];
        suggestions.uptime = ['95%', '98%', '99%', '99.5%'];
        break;
      case 'electrical':
        suggestions.installations = ['5', '8', '12', '20'];
        suggestions.passRate = ['95%', '98%', '100%'];
        suggestions.downtime = ['2', '4', '6', '8'];
        break;
      default:
        suggestions.general = ['10%', '25%', '50%'];
        suggestions.projects = ['3', '5', '10', '15'];
    }

    return suggestions;
  }

  searchKeywords(query: string, industry?: string): {
    actionVerbs: string[];
    skills: string[];
    tools: string[];
  } {
    const results = { actionVerbs: [], skills: [], tools: [] };
    const searchTerm = query.toLowerCase();

    const industriesToSearch = industry ? [industry] : Object.keys(this.industries);

    for (const ind of industriesToSearch) {
      const keywords = this.industries[ind];
      if (!keywords) continue;

      results.actionVerbs.push(...keywords.actionVerbs.filter(verb => 
        verb.toLowerCase().includes(searchTerm)
      ));
      results.skills.push(...keywords.skills.filter(skill => 
        skill.toLowerCase().includes(searchTerm)
      ));
      results.tools.push(...keywords.tools.filter(tool => 
        tool.toLowerCase().includes(searchTerm)
      ));
    }

    // Remove duplicates and limit results
    results.actionVerbs = [...new Set(results.actionVerbs)].slice(0, 10);
    results.skills = [...new Set(results.skills)].slice(0, 15);
    results.tools = [...new Set(results.tools)].slice(0, 10);

    return results;
  }
}
