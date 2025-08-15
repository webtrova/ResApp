import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import { ResumeData, WorkExperience } from '@/types/resume';
import mammoth from 'mammoth';
import EnhancedResumeParser from '@/lib/ai/enhanced-parser';
import AIParsingService from '@/lib/ai/ai-parsing-service';
import { SmartResumeParser } from '@/lib/ai/smart-resume-parser';

// Dynamic import for pdf-parse to avoid build issues
let pdfParse: any;
if (typeof window === 'undefined') {
  try {
    pdfParse = require('pdf-parse');
  } catch (error) {
    console.log('pdf-parse not available:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    
    console.log('File type detected:', file.type);
    console.log('File name:', file.name);
    
    // Check if file type is in allowed types OR if file extension is allowed
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    console.log('File extension:', fileExtension);
    console.log('Is valid type:', isValidType);
    
    if (!isValidType) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Please upload PDF, Word, or text files.` },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create a basic resume structure based on file content
    const fileName = file.name;
    const fileType = file.type;
    
    // Create a basic resume structure based on file content
    const resumeData: ResumeData = {
      personal: {
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        portfolio: '',
        location: ''
      },
      summary: {
        currentTitle: '',
        yearsExperience: 0,
        keySkills: [],
        careerObjective: ''
      },
      experience: [],
      education: [],
      skills: []
    };

    // Extract text from file
    const text = await extractTextFromFile(file);
    console.log('Extracted text:', text.substring(0, 500) + '...'); // Log first 500 chars for debugging
    
    // Use the enhanced parser for better accuracy
    const parser = EnhancedResumeParser.getInstance();
    const parsingResult = await parser.parseResume(text, fileType, fileName);
    
    // Use smart parser as backup/supplement
    const smartParser = SmartResumeParser.getInstance();
    const smartResult = await smartParser.parseResume(text);
    
    // Use AI to enhance the parsed data
    const aiParsingService = AIParsingService.getInstance();
    const aiResult = await aiParsingService.enhanceParsedData(text, parsingResult.extractedData, fileType);
    
    // Combine parsing results - prioritize enhanced parser results
    Object.assign(resumeData, parsingResult.extractedData);
    
    // Supplement with smart parser results where data is missing
    if (!resumeData.personal.fullName && smartResult.extractedData.personal.fullName) {
      resumeData.personal.fullName = smartResult.extractedData.personal.fullName;
    }
    if (!resumeData.personal.email && smartResult.extractedData.personal.email) {
      resumeData.personal.email = smartResult.extractedData.personal.email;
    }
    if (!resumeData.personal.phone && smartResult.extractedData.personal.phone) {
      resumeData.personal.phone = smartResult.extractedData.personal.phone;
    }
    
    // Supplement with AI enhancements where data is missing
    if (!resumeData.personal.fullName && aiResult.enhancedData.personal?.fullName) {
      resumeData.personal.fullName = aiResult.enhancedData.personal.fullName;
    }
    if (!resumeData.summary.careerObjective && aiResult.enhancedData.summary?.careerObjective) {
      resumeData.summary.careerObjective = aiResult.enhancedData.summary.careerObjective;
    }
    
    // Log parsing results for debugging
    console.log('Smart parser confidence:', smartResult.confidence);
    console.log('Enhanced parser confidence:', parsingResult.confidence);
    console.log('AI enhancement confidence:', aiResult.confidence);
    console.log('Total suggestions:', [...smartResult.suggestions, ...parsingResult.suggestions, ...aiResult.suggestions].length);

    // Save the uploaded file info and parsed data to database
    const result = await executeQuery(
      'INSERT INTO resume_uploads (user_id, original_filename, file_type, extracted_text, parsed_data, optimization_results, confidence_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId, 
        fileName, 
        fileType, 
        text, 
        JSON.stringify(resumeData),
        JSON.stringify({
          smartParserConfidence: smartResult.confidence,
          parsingConfidence: parsingResult.confidence,
          aiConfidence: aiResult.confidence,
          enhancements: aiResult.enhancements,
          suggestions: [...smartResult.suggestions, ...parsingResult.suggestions, ...aiResult.suggestions]
        }),
        Math.max(smartResult.confidence, parsingResult.confidence, aiResult.confidence)
      ]
    ) as any;

    const uploadId = result.insertId;

    // Also save as a resume
    const resumeResult = await executeQuery(
      'INSERT INTO resumes (user_id, title, resume_data, is_complete) VALUES (?, ?, ?, ?)',
      [userId, `Resume from ${fileName}`, JSON.stringify(resumeData), false]
    ) as any;

    const resumeId = resumeResult.insertId;

    return NextResponse.json({
      success: true,
      uploadId,
      resumeId,
      resumeData,
      smartParserConfidence: smartResult.confidence,
      parsingConfidence: parsingResult.confidence,
      aiConfidence: aiResult.confidence,
      suggestions: [...smartResult.suggestions, ...parsingResult.suggestions, ...aiResult.suggestions],
      enhancements: aiResult.enhancements,
      message: 'Resume uploaded and parsed successfully with AI enhancement'
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

function parseResumeText(text: string): Partial<ResumeData> {
  const lines = text.split('\n').filter(line => line.trim());
  const lowerText = text.toLowerCase();
  
  const parsedData: Partial<ResumeData> = {
    personal: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      portfolio: '',
      location: ''
    },
    summary: {
      currentTitle: '',
      yearsExperience: 0,
      keySkills: [],
      careerObjective: ''
    },
    experience: [],
    education: [],
    skills: []
  };

  // Enhanced name extraction - look for first line that looks like a name
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    // Check if it looks like a name: alphabetic chars, spaces, hyphens, and common name patterns
    if (line.length >= 3 && line.length <= 50 && 
        /^[A-Za-z][A-Za-z\s\-\'\.]+[A-Za-z]$/.test(line) &&
        !line.toLowerCase().includes('resume') && 
        !line.toLowerCase().includes('cv') &&
        !line.toLowerCase().includes('curriculum') &&
        !line.includes('@') && !line.includes('phone') && !line.includes('email')) {
      // Additional check: should have at least 2 words for first and last name
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        parsedData.personal!.fullName = line;
        break;
      }
    }
  }

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    parsedData.personal!.email = emailMatch[0];
  }

  // Extract phone (various formats)
  const phonePatterns = [
    /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      parsedData.personal!.phone = phoneMatch[0];
      break;
    }
  }

  // Enhanced LinkedIn extraction
  const linkedinPatterns = [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
    /linkedin:\s*(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
    /linkedin:\s*linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
    /linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
    /linkedin:\s*([a-zA-Z0-9-_]+)(?!\@)/i  // Simple format but not email
  ];
  
  for (const pattern of linkedinPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Validate username (not too short, not an email)
      const username = match[1];
      if (username.length >= 3 && !username.includes('@') && !username.includes('.com')) {
        parsedData.personal!.linkedin = `https://linkedin.com/in/${username}`;
        break;
      }
    }
  }
  
  // Extract portfolio/website
  const portfolioPatterns = [
    /(?:portfolio|website):\s*(https?:\/\/[^\s]+)/i,
    /(?:portfolio|website):\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /(https?:\/\/(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g
  ];
  
  for (const pattern of portfolioPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && !match[1].includes('linkedin')) {
      let url = match[1];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      parsedData.personal!.portfolio = url;
      break;
    }
  }

  // Extract location
  const locationPatterns = [
    /(?:location|address|city|state):\s*([^\n]+)/i,
    /([A-Z][a-z]+,\s*[A-Z]{2})/,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/
  ];
  
  for (const pattern of locationPatterns) {
    const locationMatch = text.match(pattern);
    if (locationMatch) {
      parsedData.personal!.location = locationMatch[1];
      break;
    }
  }

  // Extract summary/objective
  const summaryPatterns = [
    /(?:summary|objective|profile):\s*([^\n]+(?:\n[^\n]+)*)/i,
    /(?:about|overview):\s*([^\n]+(?:\n[^\n]+)*)/i
  ];
  
  for (const pattern of summaryPatterns) {
    const summaryMatch = text.match(pattern);
    if (summaryMatch) {
      parsedData.summary!.careerObjective = summaryMatch[1].trim();
      break;
    }
  }
  
  // If no summary found with patterns, try to extract from lines after "SUMMARY" header
  if (!parsedData.summary!.careerObjective) {
    const summarySectionMatch = text.match(/summary\s*\n([^\n]+(?:\n[^\n]+)*)/i);
    if (summarySectionMatch) {
      parsedData.summary!.careerObjective = summarySectionMatch[1].trim();
    }
  }

  // Extract current title from summary or experience sections
  const titlePatterns = [
    /(?:current title|position|role):\s*([^\n]+)/i,
    /(senior|junior|lead|principal|staff)?\s*(software engineer|developer|programmer|analyst|manager|director|consultant|designer|architect|cook|server|cashier|assistant|coordinator|specialist)/i,
    /(?:working as|currently|position:)\s*([^\n]+)/i
  ];
  
  for (const pattern of titlePatterns) {
    const titleMatch = text.match(pattern);
    if (titleMatch) {
      const title = titleMatch[1] || titleMatch[0];
      // Clean up the title (remove extra whitespace and newlines)
      parsedData.summary!.currentTitle = title.replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // Extract years of experience
  const experienceMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
  if (experienceMatch) {
    parsedData.summary!.yearsExperience = parseInt(experienceMatch[1]);
  }

  // Extract skills more comprehensively
  const skillKeywords = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
    // Web Technologies
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Laravel', 'Spring', 'ASP.NET',
    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite', 'Cassandra',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'GitHub', 'CI/CD',
    // Tools & Frameworks
    'Git', 'HTML', 'CSS', 'Sass', 'Less', 'Webpack', 'Babel', 'npm', 'yarn',
    // Soft Skills
    'Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Agile', 'Scrum', 'Project Management',
    // Other Technical Skills
    'REST', 'GraphQL', 'API', 'Microservices', 'Machine Learning', 'AI', 'Data Analysis', 'Testing', 'JUnit', 'Jest',
    // Additional skills that might be in resumes
    'Customer Service', 'Food Safety', 'Kitchen Operations', 'Teamwork', 'Microsoft Office', 'Excel', 'Word', 'PowerPoint',
    'Sales', 'Marketing', 'Administration', 'Data Entry', 'Research', 'Analysis', 'Documentation', 'Training',
    'Quality Assurance', 'Compliance', 'Safety', 'Inventory Management', 'Budget Management', 'Event Planning'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    lowerText.includes(skill.toLowerCase())
  );
  
  // Also look for skills in specific sections
  const skillsSectionMatch = text.match(/(?:skills|technical skills|competencies):\s*([^\n]+(?:\n[^\n]+)*)/i);
  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1].toLowerCase();
    const additionalSkills = skillKeywords.filter(skill => 
      skillsText.includes(skill.toLowerCase())
    );
    foundSkills.push(...additionalSkills);
  }
  
  // Remove duplicates and limit
  const uniqueSkills = [...new Set(foundSkills)].slice(0, 20);
  parsedData.summary!.keySkills = uniqueSkills;
  parsedData.skills = uniqueSkills.map(skill => ({
    name: skill,
    category: 'technical' as const,
    level: 'intermediate' as const
  }));

  // Extract experience sections more comprehensively
  const experienceSections = extractExperienceSections(text);
  if (experienceSections.length > 0) {
    parsedData.experience = experienceSections;
  } else {
    // Fallback: create basic experience entry if we found a title
    if (parsedData.summary!.currentTitle) {
      parsedData.experience = [{
        companyName: 'Extracted from resume',
        jobTitle: parsedData.summary!.currentTitle.trim(),
        startDate: '',
        jobDescription: 'Experience details extracted from uploaded resume. Please review and update.',
        achievements: ['Please add specific achievements and responsibilities']
      }];
    }
  }

  // Extract education sections
  const educationSections = extractEducationSections(text);
  if (educationSections.length > 0) {
    parsedData.education = educationSections;
  } else {
    // Fallback: create basic education entry
    const educationMatch = text.match(/(bachelor|master|phd|associate|diploma|degree)/i);
    if (educationMatch) {
      parsedData.education = [{
        institution: 'Extracted from resume',
        degree: educationMatch[0],
        major: 'Field of study to be specified',
        graduationDate: '',
        achievements: ['Education details extracted from resume. Please review and update.']
      }];
    }
  }

  return parsedData;
}

function extractExperienceSections(text: string): WorkExperience[] {
  const experiences: WorkExperience[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Enhanced job title patterns
  const jobTitlePatterns = [
    /(Senior|Junior|Lead|Principal|Staff|Chief|Head of|Director of|Vice President|VP|Manager|Assistant|Associate)?\s*(Software Engineer|Developer|Programmer|Analyst|Manager|Director|Consultant|Designer|Architect|Cook|Server|Cashier|Assistant|Coordinator|Specialist|Administrator|Technician|Representative|Sales|Marketing|Engineer|Accountant|Teacher|Nurse|Doctor|Lawyer|Writer|Editor|Artist|Photographer|Chef|Waiter|Bartender|Cleaner|Security|Guard)/i,
    /^[A-Z][a-zA-Z\s]+(Engineer|Developer|Manager|Director|Analyst|Consultant|Specialist|Coordinator|Assistant|Representative|Technician|Administrator)$/,
  ];
  
  // Enhanced company patterns
  const companyPatterns = [
    /([A-Z][a-zA-Z0-9\s&\-']+(?:Inc|Corp|LLC|Ltd|Limited|Company|Co\.|Technologies|Tech|Solutions|Services|Group|Associates|Partners|Consulting|Restaurant|Store|Hospital|Medical|School|University|College|Cinema|Theater|Bank|Financial|Insurance))/i,
    /(American Multi-Cinema|AMC|McDonald's|Starbucks|Walmart|Target|Amazon|Google|Microsoft|Apple|Facebook|Meta)/i,
  ];
  
  // Enhanced date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{4}|\d{4})\s*[-–—]\s*(present|current|\d{1,2}\/\d{4}|\d{4})/i,
    /(\w+\s+\d{4})\s*[-–—]\s*(present|current|\w+\s+\d{4})/i,
  ];
  
  let currentExperience: Partial<WorkExperience> | null = null;
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering an experience section
    if (/^(professional\s+)?experience|work\s+history|employment|career/i.test(line)) {
      inExperienceSection = true;
      continue;
    }
    
    // Check if we're leaving experience section
    if (inExperienceSection && /^(education|skills|certifications|projects)/i.test(line)) {
      inExperienceSection = false;
      if (currentExperience && currentExperience.companyName && currentExperience.jobTitle) {
        experiences.push(currentExperience as WorkExperience);
      }
      break;
    }
    
    // Try to match job titles
    for (const pattern of jobTitlePatterns) {
      const jobMatch = line.match(pattern);
      if (jobMatch) {
        // If we have a previous experience, save it
        if (currentExperience && currentExperience.companyName && currentExperience.jobTitle) {
          experiences.push(currentExperience as WorkExperience);
        }
        
        currentExperience = {
          jobTitle: jobMatch[0].trim(),
          companyName: '',
          startDate: '',
          jobDescription: '',
          achievements: []
        };
        
        // Look for company and dates in nearby lines
        for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 3); j++) {
          if (j === i) continue;
          
          const nearbyLine = lines[j];
          
          // Try to find company
          if (!currentExperience.companyName) {
            for (const companyPattern of companyPatterns) {
              const companyMatch = nearbyLine.match(companyPattern);
              if (companyMatch) {
                currentExperience.companyName = companyMatch[1].trim();
                break;
              }
            }
          }
          
          // Try to find dates
          if (!currentExperience.startDate) {
            for (const datePattern of datePatterns) {
              const dateMatch = nearbyLine.match(datePattern);
              if (dateMatch) {
                currentExperience.startDate = dateMatch[1];
                currentExperience.endDate = dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current' ? 'Present' : dateMatch[2];
                break;
              }
            }
          }
        }
        break;
      }
    }
    
    // If we're in an experience and this line looks like an achievement/responsibility
    if (currentExperience && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
        /^(responsible for|managed|led|developed|created|implemented|achieved|increased|decreased|improved)/i.test(line))) {
      const achievement = line.replace(/^[•\-*]\s*/, '').trim();
      if (achievement && !currentExperience.achievements?.includes(achievement)) {
        currentExperience.achievements = currentExperience.achievements || [];
        currentExperience.achievements.push(achievement);
      }
    }
  }
  
  // Add the last experience if exists
  if (currentExperience && currentExperience.companyName && currentExperience.jobTitle) {
    experiences.push(currentExperience as WorkExperience);
  }
  
  // Fill in missing data with defaults
  return experiences.map(exp => ({
    ...exp,
    jobDescription: exp.jobDescription || 'Please add job description and responsibilities',
    achievements: exp.achievements && exp.achievements.length > 0 ? exp.achievements : ['Please add specific achievements and responsibilities']
  }));
}

function extractEducationSections(text: string): any[] {
  const education: any[] = [];
  
  // Split text into sections
  const sections = text.split(/\n\s*\n/);
  
  // Look for education-related sections
  const educationKeywords = ['education', 'academic', 'degree', 'university', 'college', 'school'];
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    // Check if this section contains education-related keywords
    const isEducationSection = educationKeywords.some(keyword => 
      lowerSection.includes(keyword)
    );
    
    if (isEducationSection) {
      // Try to extract education information
      const degreeMatch = section.match(/(bachelor|master|phd|associate|diploma|degree)/i);
      const institutionMatch = section.match(/(university|college|institute|school|academy)/i);
      const yearMatch = section.match(/(\d{4})/);
      
      if (degreeMatch || institutionMatch) {
        const educationEntry = {
          institution: institutionMatch ? institutionMatch[0] : 'Institution to be specified',
          degree: degreeMatch ? degreeMatch[0] : 'Degree to be specified',
          major: 'Field of study to be specified',
          graduationDate: yearMatch ? yearMatch[1] : '',
          achievements: ['Education details extracted from resume. Please review and update.']
        };
        
        education.push(educationEntry);
      }
    }
  }
  
  return education;
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    // Use file extension as primary detection method since MIME types can be unreliable
    if (fileExtension === '.txt' || file.type === 'text/plain') {
      return await file.text();
    } else if (fileExtension === '.pdf' || file.type === 'application/pdf') {
      if (pdfParse) {
        console.log('Processing PDF document with pdf-parse...');
        const pdfData = await pdfParse(buffer);
        console.log('PDF extraction result:', pdfData.text.substring(0, 200) + '...');
        return pdfData.text;
      } else {
        console.log('PDF parsing not available, returning placeholder text');
        return `PDF file uploaded: ${file.name}. PDF parsing is not available in this environment.`;
      }
    } else if (fileExtension === '.docx' || fileExtension === '.doc' || 
               file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      console.log('Processing Word document with mammoth...');
      const result = await mammoth.extractRawText({ buffer });
      console.log('Mammoth extraction result:', result.value.substring(0, 200) + '...');
      return result.value;
    } else {
      // Fallback for unknown file types
      return `Unable to extract text from ${file.name}. File type: ${file.type}, Extension: ${fileExtension}`;
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Error extracting text from ${file.name}: ${error}`;
  }
}
