const fs = require('fs');
const mammoth = require('mammoth');

// Test the parsing with Jeremy's resume
async function testJeremyResumeParsing() {
  try {
    console.log('🔍 TESTING RESUME PARSING WITH JEREMY MARTINEZ RESUME');
    console.log('='.repeat(50));
    
    // Read the Jeremy resume file
    const filePath = './Jeremy_Martinez_Resume Nov2023.docx';
    const buffer = fs.readFileSync(filePath);
    
    // Extract text using mammoth
    console.log('📄 Extracting text from DOCX...');
    const result = await mammoth.extractRawText({ buffer });
    const extractedText = result.value;
    
    console.log('📋 EXTRACTED TEXT:');
    console.log('-'.repeat(50));
    console.log(extractedText);
    console.log('-'.repeat(50));
    
    // Test basic parsing logic (simplified version of what's in upload route)
    console.log('\n🔍 PARSING ANALYSIS:');
    console.log('='.repeat(50));
    
    // Name extraction test
    const lines = extractedText.split('\n').filter(line => line.trim());
    console.log('\n👤 NAME EXTRACTION TEST:');
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      console.log(`Line ${i}: "${line}"`);
      
      if (line.length >= 3 && line.length <= 50 && 
          /^[A-Za-z][A-Za-z\s\-\'\.]+[A-Za-z]$/.test(line) &&
          !line.toLowerCase().includes('resume') && 
          !line.toLowerCase().includes('cv') &&
          !line.toLowerCase().includes('curriculum') &&
          !line.includes('@') && !line.includes('phone') && !line.includes('email')) {
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          console.log(`✅ FOUND NAME: "${line}"`);
          break;
        }
      }
    }
    
    // Email extraction test
    console.log('\n📧 EMAIL EXTRACTION TEST:');
    const emailMatch = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      console.log(`✅ FOUND EMAIL: ${emailMatch[0]}`);
    } else {
      console.log('❌ NO EMAIL FOUND');
    }
    
    // Phone extraction test
    console.log('\n📱 PHONE EXTRACTION TEST:');
    const phonePatterns = [
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/
    ];
    
    let phoneFound = false;
    for (const pattern of phonePatterns) {
      const phoneMatch = extractedText.match(pattern);
      if (phoneMatch) {
        console.log(`✅ FOUND PHONE: ${phoneMatch[0]}`);
        phoneFound = true;
        break;
      }
    }
    if (!phoneFound) {
      console.log('❌ NO PHONE FOUND');
    }
    
    // LinkedIn extraction test
    console.log('\n🔗 LINKEDIN EXTRACTION TEST:');
    const linkedinPatterns = [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
      /linkedin:\s*(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
      /linkedin:\s*linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
      /linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
      /linkedin:\s*([a-zA-Z0-9-_]+)(?!\@)/i
    ];
    
    let linkedinFound = false;
    for (const pattern of linkedinPatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        const username = match[1];
        if (username.length >= 3 && !username.includes('@') && !username.includes('.com')) {
          console.log(`✅ FOUND LINKEDIN: https://linkedin.com/in/${username}`);
          linkedinFound = true;
          break;
        }
      }
    }
    if (!linkedinFound) {
      console.log('❌ NO LINKEDIN FOUND');
    }
    
    // Experience extraction test
    console.log('\n💼 EXPERIENCE EXTRACTION TEST:');
    const jobTitlePatterns = [
      /(Senior|Junior|Lead|Principal|Staff|Chief|Head of|Director of|Vice President|VP|Manager|Assistant|Associate)?\s*(Software Engineer|Developer|Programmer|Analyst|Manager|Director|Consultant|Designer|Architect|Cook|Server|Cashier|Assistant|Coordinator|Specialist|Administrator|Technician|Representative|Sales|Marketing|Engineer|Accountant|Teacher|Nurse|Doctor|Lawyer|Writer|Editor|Artist|Photographer|Chef|Waiter|Bartender|Cleaner|Security|Guard)/i,
      /^[A-Z][a-zA-Z\s]+(Engineer|Developer|Manager|Director|Analyst|Consultant|Specialist|Coordinator|Assistant|Representative|Technician|Administrator)$/,
    ];
    
    const companyPatterns = [
      /([A-Z][a-zA-Z0-9\s&\-']+(?:Inc|Corp|LLC|Ltd|Limited|Company|Co\.|Technologies|Tech|Solutions|Services|Group|Associates|Partners|Consulting|Restaurant|Store|Hospital|Medical|School|University|College|Cinema|Theater|Bank|Financial|Insurance))/i,
      /(American Multi-Cinema|AMC|McDonald's|Starbucks|Walmart|Target|Amazon|Google|Microsoft|Apple|Facebook|Meta)/i,
    ];
    
    let experienceFound = false;
    for (const line of lines) {
      for (const pattern of jobTitlePatterns) {
        const jobMatch = line.match(pattern);
        if (jobMatch) {
          console.log(`✅ FOUND JOB TITLE: "${jobMatch[0].trim()}"`);
          experienceFound = true;
        }
      }
      
      for (const pattern of companyPatterns) {
        const companyMatch = line.match(pattern);
        if (companyMatch) {
          console.log(`✅ FOUND COMPANY: "${companyMatch[1].trim()}"`);
          experienceFound = true;
        }
      }
    }
    
    if (!experienceFound) {
      console.log('❌ NO CLEAR EXPERIENCE PATTERNS FOUND');
    }
    
    // Skills extraction test
    console.log('\n🛠️ SKILLS EXTRACTION TEST:');
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Laravel', 'Spring', 'ASP.NET',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'GitHub', 'CI/CD',
      'Git', 'HTML', 'CSS', 'Sass', 'Less', 'Webpack', 'Babel', 'npm', 'yarn',
      'Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Agile', 'Scrum', 'Project Management',
      'REST', 'GraphQL', 'API', 'Microservices', 'Machine Learning', 'AI', 'Data Analysis', 'Testing', 'JUnit', 'Jest',
      'Customer Service', 'Food Safety', 'Kitchen Operations', 'Teamwork', 'Microsoft Office', 'Excel', 'Word', 'PowerPoint'
    ];
    
    const lowerText = extractedText.toLowerCase();
    const foundSkills = skillKeywords.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
    
    if (foundSkills.length > 0) {
      console.log(`✅ FOUND ${foundSkills.length} SKILLS:`);
      foundSkills.forEach(skill => console.log(`   - ${skill}`));
    } else {
      console.log('❌ NO RECOGNIZED SKILLS FOUND');
    }
    
    console.log('\n📊 PARSING SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total text length: ${extractedText.length} characters`);
    console.log(`Total lines: ${lines.length}`);
    console.log(`Skills found: ${foundSkills.length}`);
    
    // Identify potential issues
    console.log('\n⚠️ POTENTIAL ISSUES:');
    if (extractedText.length < 100) {
      console.log('- Text extraction may have failed (too short)');
    }
    if (lines.length < 10) {
      console.log('- Document structure may be problematic (too few lines)');
    }
    if (foundSkills.length === 0) {
      console.log('- Skills extraction patterns may need improvement');
    }
    if (!extractedText.includes('@')) {
      console.log('- Email extraction patterns may need improvement');
    }
    
  } catch (error) {
    console.error('❌ ERROR TESTING RESUME PARSING:', error);
  }
}

// Run the test
testJeremyResumeParsing();