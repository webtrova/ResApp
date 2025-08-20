import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobDetails, tone = 'professional', focus = 'balanced', length = 'standard' } = await request.json();
    
    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
    }
    
    // Generate cover letter using a simple template approach
    const coverLetter = await generateCoverLetter(resumeData, jobDetails, tone, focus, length);
    
    // Parse the generated cover letter into the expected structure
    const paragraphs = coverLetter.split('\n\n').filter(p => p.trim());
    const opening = paragraphs[0] || '';
    const bodyContent = paragraphs[1] || '';
    const closing = paragraphs[2] || '';
    const signature = paragraphs[3] || '';
    
    return NextResponse.json({
      success: true,
      coverLetter: {
        jobDetails: jobDetails || {},
        personalInfo: resumeData.personal || {},
        opening: opening.replace('Dear Hiring Manager,', '').trim(),
        body: [
          {
            id: '1',
            type: 'experience' as const,
            content: bodyContent,
            order: 1
          }
        ],
        closing: closing,
        signature: signature
      }
    });
    
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: 'Cover letter generation failed' }, 
      { status: 500 }
    );
  }
}

async function generateCoverLetter(
  resumeData: any, 
  jobDetails: any, 
  tone: string, 
  focus: string, 
  length: string
): Promise<string> {
  const personalInfo = resumeData.personal || {};
  const experience = resumeData.experience || [];
  const skills = resumeData.skills || [];
  const education = resumeData.education || [];
  
  // Extract key information
  const name = personalInfo.fullName || '[Your Name]';
  const email = personalInfo.email || '[Your Email]';
  const phone = personalInfo.phone || '[Your Phone]';
  const location = personalInfo.location || '[Your Location]';
  
  const targetCompany = jobDetails?.companyName || '[Company Name]';
  const targetPosition = jobDetails?.jobTitle || '[Position Title]';
  
  // Get recent experience
  const recentExperience = experience[0] || {};
  const keySkills = skills.slice(0, 5).map((s: any) => s.name).join(', ');
  
  // Create a simple, professional cover letter template
  let opening = `I am writing to express my strong interest in the ${targetPosition} position at ${targetCompany}.`;
  
  if (recentExperience.jobTitle && recentExperience.companyName) {
    opening += ` With my experience as ${recentExperience.jobTitle} at ${recentExperience.companyName}, I am confident I can contribute effectively to your team.`;
  } else if (keySkills) {
    opening += ` With my skills in ${keySkills}, I am confident I can contribute effectively to your team.`;
  } else {
    opening += ` I am confident I can contribute effectively to your team.`;
  }
  
  // Generate body paragraph based on focus
  let body = '';
  switch (focus) {
    case 'experience':
      if (recentExperience.jobDescription) {
        body = `In my current role, ${recentExperience.jobDescription.toLowerCase()}. This experience has equipped me with the skills and knowledge necessary to excel in the ${targetPosition} position.`;
      } else {
        body = `My professional experience has equipped me with the skills and knowledge necessary to excel in the ${targetPosition} position.`;
      }
      break;
    case 'skills':
      if (keySkills) {
        body = `My key skills include ${keySkills}. These qualifications align well with the requirements for the ${targetPosition} role and would enable me to make immediate contributions to ${targetCompany}.`;
      } else {
        body = `My qualifications align well with the requirements for the ${targetPosition} role and would enable me to make immediate contributions to ${targetCompany}.`;
      }
      break;
    case 'achievements':
      body = `Throughout my career, I have consistently demonstrated the ability to deliver results and exceed expectations. I am excited about the opportunity to bring my proven track record of success to ${targetCompany}.`;
      break;
    default:
      if (recentExperience.jobDescription && keySkills) {
        body = `In my current role, ${recentExperience.jobDescription.toLowerCase()}. My key skills include ${keySkills}, which align well with the requirements for the ${targetPosition} position.`;
      } else if (recentExperience.jobDescription) {
        body = `In my current role, ${recentExperience.jobDescription.toLowerCase()}. This experience has equipped me with the skills necessary to excel in the ${targetPosition} position.`;
      } else if (keySkills) {
        body = `My key skills include ${keySkills}, which align well with the requirements for the ${targetPosition} role and would enable me to make immediate contributions to ${targetCompany}.`;
      } else {
        body = `My qualifications align well with the requirements for the ${targetPosition} role and would enable me to make immediate contributions to ${targetCompany}.`;
      }
  }
  
  // Generate closing paragraph
  const closing = `I am excited about the opportunity to contribute to ${targetCompany} and would welcome the chance to discuss how my background, skills, and enthusiasm would make me a valuable addition to your team. Thank you for considering my application. I look forward to hearing from you.`;
  
  // Combine paragraphs based on length preference
  let content = '';
  switch (length) {
    case 'brief':
      content = `${opening} ${closing}`;
      break;
    case 'detailed':
      content = `${opening}\n\n${body}\n\n${closing}`;
      break;
    default: // standard
      content = `${opening}\n\n${body}\n\n${closing}`;
  }
  
  // Format as proper cover letter
  const coverLetter = `Dear Hiring Manager,

${content}

Sincerely,
${name}
${email}
${phone}
${location}`;

  return coverLetter;
}