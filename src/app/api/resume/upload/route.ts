import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import { ResumeData, WorkExperience } from '@/types/resume';
import mammoth from 'mammoth';

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
    
    // Parse the extracted text
    const parsedData = parseResumeText(text);
    Object.assign(resumeData, parsedData);

    // Save the uploaded file info and parsed data to database
    const result = await executeQuery(
      'INSERT INTO resume_uploads (user_id, original_filename, file_type, extracted_text, parsed_data) VALUES (?, ?, ?, ?, ?)',
      [userId, fileName, fileType, text, JSON.stringify(resumeData)]
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
      message: 'Resume uploaded and parsed successfully'
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

  // Extract name (usually the first prominent line)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if it looks like a name (contains letters, not too long, no special chars)
    if (firstLine.length > 2 && firstLine.length < 50 && /^[a-zA-Z\s]+$/.test(firstLine)) {
      parsedData.personal!.fullName = firstLine;
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

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    parsedData.personal!.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  } else {
    // Try alternative LinkedIn patterns
    const altLinkedinMatch = text.match(/linkedin:?\s*(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    if (altLinkedinMatch) {
      parsedData.personal!.linkedin = `https://linkedin.com/in/${altLinkedinMatch[1]}`;
    } else {
      // Try simple LinkedIn: username format
      const simpleLinkedinMatch = text.match(/linkedin:\s*([a-zA-Z0-9-]+)/i);
      if (simpleLinkedinMatch) {
        parsedData.personal!.linkedin = `https://linkedin.com/in/${simpleLinkedinMatch[1]}`;
      } else {
        // Try to extract from the specific format in the test file
        const testLinkedinMatch = text.match(/linkedin:\s*linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
        if (testLinkedinMatch) {
          parsedData.personal!.linkedin = `https://linkedin.com/in/${testLinkedinMatch[1]}`;
        }
      }
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
  
  // Split text into sections
  const sections = text.split(/\n\s*\n/);
  
  // Look for experience-related sections
  const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience', 'career'];
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    // Check if this section contains experience-related keywords
    const isExperienceSection = experienceKeywords.some(keyword => 
      lowerSection.includes(keyword)
    );
    
    if (isExperienceSection || lowerSection.includes('at ') || lowerSection.includes('company')) {
      // Try to extract job information
      const jobTitleMatch = section.match(/(senior|junior|lead|principal|staff)?\s*(software engineer|developer|programmer|analyst|manager|director|consultant|designer|architect|cook|server|cashier|assistant|coordinator|specialist)/i);
      const companyMatch = section.match(/(?:at|with|for)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Solutions|Restaurant|Store|Hospital|School))/i);
      const dateMatch = section.match(/(\d{4})\s*[-–]\s*(present|current|\d{4})/i);
      
      // Also try to extract company name from bullet points or job titles
      const bulletCompanyMatch = section.match(/([A-Z][a-zA-Z0-9\s&]+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Solutions|Restaurant|Store|Hospital|School|AMC|Cinema|Multi-Cinema))/i);
      
      if (jobTitleMatch || companyMatch || bulletCompanyMatch) {
        const companyName = companyMatch ? companyMatch[1].trim() : 
                           bulletCompanyMatch ? bulletCompanyMatch[1].trim() : 
                           'Company name to be specified';
        
        const experience: WorkExperience = {
          companyName: companyName,
          jobTitle: jobTitleMatch ? jobTitleMatch[0].trim() : 'Job title to be specified',
          startDate: dateMatch ? dateMatch[1] : '',
          jobDescription: 'Job description extracted from resume. Please review and update with specific details.',
          achievements: ['Please add specific achievements and responsibilities']
        };
        
        experiences.push(experience);
      }
    }
  }
  
  return experiences;
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

    if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type === 'application/pdf') {
      // For PDF files, we'll provide a helpful message
      return `PDF file detected: ${file.name}. Please convert your PDF to a Word document (.docx) or text file (.txt) for better parsing, or manually enter the information in the builder.`;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      // Fallback for unknown file types
      return `Unable to extract text from ${file.name}. File type: ${file.type}`;
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Error extracting text from ${file.name}: ${error}`;
  }
}
