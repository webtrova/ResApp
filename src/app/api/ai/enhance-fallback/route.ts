import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, context = {} } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    // Rule-based enhancement as fallback
    const enhancedText = enhanceTextWithRules(text, context);

    return NextResponse.json({
      success: true,
      original: text,
      enhanced: enhancedText,
      context: context,
      fallback: true
    });

  } catch (error) {
    console.error('Fallback Enhancement Error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    );
  }
}

function enhanceTextWithRules(text: string, context: any): string {
  let enhanced = text.trim();
  const { jobTitle, type } = context;

  // Basic professional language improvements
  const improvements = [
    // Replace weak verbs with strong action verbs
    { pattern: /\bhelped\b/gi, replacement: 'assisted' },
    { pattern: /\bworked on\b/gi, replacement: 'developed' },
    { pattern: /\bworked with\b/gi, replacement: 'collaborated with' },
    { pattern: /\bmade\b/gi, replacement: 'created' },
    { pattern: /\bdid\b/gi, replacement: 'executed' },
    { pattern: /\bused\b/gi, replacement: 'utilized' },
    { pattern: /\bgot\b/gi, replacement: 'achieved' },
    { pattern: /\bfixed\b/gi, replacement: 'resolved' },
    { pattern: /\bmanaged\b/gi, replacement: 'supervised' },
    { pattern: /\bwas responsible for\b/gi, replacement: 'spearheaded' },
    { pattern: /\btook care of\b/gi, replacement: 'maintained' },
    { pattern: /\bdealt with\b/gi, replacement: 'handled' },
    
    // Improve casual language
    { pattern: /\ba lot of\b/gi, replacement: 'numerous' },
    { pattern: /\bstuff\b/gi, replacement: 'materials' },
    { pattern: /\bthings\b/gi, replacement: 'tasks' },
    { pattern: /\bguys\b/gi, replacement: 'team members' },
    { pattern: /\bokay\b/gi, replacement: 'satisfactory' },
    { pattern: /\bgood\b/gi, replacement: 'effective' },
    { pattern: /\bbad\b/gi, replacement: 'suboptimal' },
  ];

  // Apply improvements
  improvements.forEach(({ pattern, replacement }) => {
    enhanced = enhanced.replace(pattern, replacement);
  });

  // Add quantification if missing
  if (!hasQuantification(enhanced)) {
    enhanced = addQuantification(enhanced, jobTitle, type);
  }

  // Ensure it starts with a strong action verb
  enhanced = ensureStrongStart(enhanced);

  // Add professional polish
  enhanced = addProfessionalPolish(enhanced, context);

  return enhanced;
}

function hasQuantification(text: string): boolean {
  const quantifiers = [
    /\d+%/,           // percentages
    /\d+\+/,          // numbers with plus
    /\$\d+/,          // dollar amounts
    /\d+\s*(hours|days|weeks|months|years)/i,  // time periods
    /\d+\s*(people|members|clients|customers)/i, // quantities
    /\d+\s*(projects|tasks|cases)/i              // work items
  ];
  
  return quantifiers.some(pattern => pattern.test(text));
}

function addQuantification(text: string, jobTitle: string = '', type: string = ''): string {
  const role = jobTitle.toLowerCase();
  
  // Add realistic metrics based on role and context
  if (type === 'achievement' || text.includes('team') || text.includes('manage')) {
    if (!hasQuantification(text)) {
      if (role.includes('senior') || role.includes('lead')) {
        text += ', leading team of 8+ members';
      } else if (role.includes('manager')) {
        text += ', overseeing 12+ direct reports';
      } else {
        text += ', collaborating with 5+ team members';
      }
    }
  }
  
  if (text.includes('improve') || text.includes('increase') || text.includes('optimize')) {
    if (!hasQuantification(text)) {
      text += ', resulting in 25% efficiency improvement';
    }
  }
  
  if (text.includes('customer') || text.includes('client')) {
    if (!hasQuantification(text)) {
      text += ', maintaining 95% satisfaction rate';
    }
  }
  
  if (text.includes('project') && !hasQuantification(text)) {
    text += ', completing 3+ concurrent projects';
  }
  
  return text;
}

function ensureStrongStart(text: string): string {
  const strongVerbs = [
    'spearheaded', 'developed', 'implemented', 'optimized', 'streamlined',
    'orchestrated', 'executed', 'delivered', 'achieved', 'enhanced',
    'collaborated', 'supervised', 'coordinated', 'facilitated', 'analyzed'
  ];
  
  const firstWord = text.split(' ')[0].toLowerCase();
  
  // If it doesn't start with a strong verb, add one
  if (!strongVerbs.includes(firstWord)) {
    // Choose appropriate verb based on context
    if (text.includes('team') || text.includes('people')) {
      text = 'Collaborated with ' + text.toLowerCase();
    } else if (text.includes('project') || text.includes('develop')) {
      text = 'Spearheaded ' + text.toLowerCase();
    } else if (text.includes('system') || text.includes('process')) {
      text = 'Optimized ' + text.toLowerCase();
    } else {
      text = 'Executed ' + text.toLowerCase();
    }
  }
  
  return text;
}

function addProfessionalPolish(text: string, context: any): string {
  // Ensure proper capitalization
  text = text.charAt(0).toUpperCase() + text.slice(1);
  
  // Add professional terminology
  if (context.type === 'summary') {
    text = addSummaryPolish(text, context);
  } else if (context.type === 'achievement') {
    text = addAchievementPolish(text);
  }
  
  return text;
}

function addSummaryPolish(text: string, context: any): string {
  const { yearsExperience } = context;
  
  if (yearsExperience && yearsExperience > 0) {
    if (!text.includes('experience') && !text.includes('years')) {
      const expText = yearsExperience > 5 ? `${yearsExperience}+ years` : `${yearsExperience} years`;
      text = `${expText} experienced professional with ` + text.toLowerCase();
    }
  }
  
  return text;
}

function addAchievementPolish(text: string): string {
  // Ensure achievements are quantified and impactful
  if (!text.includes('resulting in') && !text.includes('achieving') && hasQuantification(text)) {
    text += ', demonstrating measurable impact on organizational goals';
  }
  
  return text;
}