const fs = require('fs');
const mammoth = require('mammoth');

// Simplified version of the SmartResumeParser for testing
class TestSmartResumeParser {
  async parseResume(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const sections = this.identifySections(text);
    
    console.log('📊 Smart parser sections identified:', Object.keys(sections));
    
    const extractedData = {
      personal: this.extractPersonalInfo(text, lines),
      summary: this.extractSummary(text, sections),
      experience: this.extractExperience(text, sections),
      education: this.extractEducation(text, sections),
      skills: this.extractSkills(text, sections)
    };

    const suggestions = this.generateSuggestions(extractedData, text);
    const confidence = this.calculateConfidence(extractedData, text);

    return {
      extractedData,
      confidence,
      suggestions
    };
  }

  identifySections(text) {
    const sections = {};
    const lines = text.split('\n');
    
    // Common section headers
    const sectionKeywords = {
      objective: /^(objective|summary|profile|about|career\s+objective|professional\s+summary)\s*$/i,
      experience: /^(experience|employment|work\s+history|professional\s+experience|career\s+history)\s*$/i,
      education: /^(education|academic|academic\s+background|qualifications)\s*$/i,
      skills: /^(skills|technical\s+skills|core\s+competencies|competencies|abilities)\s*$/i,
      contact: /^(contact|contact\s+information|personal\s+information)\s*$/i
    };

    let currentSection = '';
    let sectionStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a section header
      for (const [sectionName, pattern] of Object.entries(sectionKeywords)) {
        if (pattern.test(line)) {
          // Save previous section if exists
          if (currentSection && sectionStart < i) {
            sections[currentSection] = {
              start: sectionStart,
              end: i - 1,
              content: lines.slice(sectionStart, i).join('\n')
            };
          }
          
          currentSection = sectionName;
          sectionStart = i + 1;
          break;
        }
      }
    }

    // Save the last section
    if (currentSection && sectionStart < lines.length) {
      sections[currentSection] = {
        start: sectionStart,
        end: lines.length - 1,
        content: lines.slice(sectionStart).join('\n')
      };
    }

    return sections;
  }

  extractPersonalInfo(text, lines) {
    const personal = {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      portfolio: '',
      location: ''
    };

    // Extract name from first few lines, but be more selective
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i].trim();
      
      // Must be a proper name: 2-4 words, starts with capital, no special chars except spaces/hyphens
      if (this.isValidName(line)) {
        personal.fullName = line;
        break;
      }
    }

    // Extract email with better validation
    const emailMatch = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
    if (emailMatch) {
      personal.email = emailMatch[0];
    }

    // Extract phone with better patterns
    const phonePatterns = [
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch) {
        personal.phone = phoneMatch[0].trim();
        break;
      }
    }

    // Extract location - look for address patterns
    const locationPatterns = [
      /\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd),?\s+[A-Z][a-z]+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/i,
      /\b[A-Z][a-z]+,\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/,
      /\b[A-Z][a-z]+,\s+[A-Z][a-z]+\b/
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = text.match(pattern);
      if (locationMatch) {
        personal.location = locationMatch[0];
        break;
      }
    }

    return personal;
  }

  isValidName(text) {
    // Must be 2-4 words
    const words = text.split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    
    // Each word should start with capital letter
    if (!words.every(word => /^[A-Z][a-z]+$/.test(word))) return false;
    
    // Shouldn't contain common non-name words
    const nonNameWords = ['resume', 'cv', 'curriculum', 'vitae', 'objective', 'experience', 'education', 'skills', 'contact', 'phone', 'email'];
    if (words.some(word => nonNameWords.includes(word.toLowerCase()))) return false;
    
    // Total length check
    if (text.length < 4 || text.length > 50) return false;
    
    return true;
  }

  extractSummary(text, sections) {
    const summary = {
      currentTitle: '',
      yearsExperience: 0,
      keySkills: [],
      careerObjective: ''
    };

    // Get objective/summary from identified sections
    if (sections.objective) {
      summary.careerObjective = sections.objective.content.trim();
    }

    return summary;
  }

  extractExperience(text, sections) {
    const experiences = [];
    
    // Use experience section if available, otherwise scan whole text
    const experienceText = sections.experience?.content || text;
    const lines = experienceText.split('\n').map(line => line.trim()).filter(Boolean);

    let currentExperience = null;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Try to parse date range pattern
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})\s*[-–—]\s*(current|present|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})/i);
      
      if (dateMatch) {
        // This line contains dates, next line might have job title and company
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const jobCompanyMatch = nextLine.match(/^(.+?)\s*[•·]\s*(.+)$/);
          
          if (jobCompanyMatch) {
            // Save previous experience if exists
            if (currentExperience && this.isValidExperience(currentExperience)) {
              experiences.push(currentExperience);
            }
            
            currentExperience = {
              jobTitle: jobCompanyMatch[1].trim(),
              companyName: jobCompanyMatch[2].trim(),
              startDate: dateMatch[1],
              endDate: dateMatch[2].toLowerCase() === 'current' || dateMatch[2].toLowerCase() === 'present' ? 'Present' : dateMatch[2],
              jobDescription: '',
              achievements: []
            };
            
            i += 2; // Skip both date and job/company lines
            continue;
          }
        }
      }
      
      // If we're in an experience, collect achievements/responsibilities
      if (currentExperience && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
          /^(responsible for|managed|led|developed|created|implemented|achieved|increased|decreased|improved|assisted|provided|worked|used|cleaned|organized|certified|operates|safely)/i.test(line))) {
        const achievement = line.replace(/^[•\-*]\s*/, '').trim();
        if (achievement && achievement.length > 10) { // Avoid very short achievements
          currentExperience.achievements = currentExperience.achievements || [];
          currentExperience.achievements.push(achievement);
        }
      }
      
      i++;
    }

    // Add the last experience if valid
    if (currentExperience && this.isValidExperience(currentExperience)) {
      experiences.push(currentExperience);
    }

    return experiences;
  }

  isValidExperience(exp) {
    return !!(exp.jobTitle && exp.companyName && exp.jobTitle.length > 2 && exp.companyName.length > 2);
  }

  extractEducation(text, sections) {
    const education = [];
    
    // Use education section if available
    const educationText = sections.education?.content || text;
    
    // Look for university/college patterns
    const institutionPatterns = [
      /\b([A-Z][a-zA-Z\s]+(?:University|College|Institute|School|Academy))\b/g,
      /\b(University of [A-Z][a-zA-Z\s]+)\b/g,
      /\b([A-Z][a-zA-Z\s]+State University)\b/g
    ];
    
    // Find institutions
    for (const pattern of institutionPatterns) {
      let match;
      while ((match = pattern.exec(educationText)) !== null) {
        const institution = match[1].trim();
        
        // Avoid false positives
        if (!this.isValidInstitution(institution)) continue;
        
        education.push({
          institution,
          degree: 'Degree to be specified',
          major: 'Field of study to be specified',
          graduationDate: '',
          achievements: ['Please add relevant coursework, honors, or achievements']
        });
      }
    }
    
    return education;
  }

  isValidInstitution(name) {
    // Avoid false positives
    const invalidWords = ['current', 'college student', 'experience', 'just', 'american multi-cinema'];
    return !invalidWords.some(word => name.toLowerCase().includes(word));
  }

  extractSkills(text, sections) {
    const skills = [];
    
    // Use skills section if available, otherwise scan whole text
    const skillsText = sections.skills?.content || text;
    
    // Extract explicitly mentioned skills from skills section
    if (sections.skills) {
      const skillsLine = sections.skills.content.toLowerCase();
      const mentionedSkills = skillsLine.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 2);
      
      mentionedSkills.forEach(skill => {
        const cleanSkill = skill.replace(/[^\w\s]/g, '').trim();
        if (cleanSkill.length > 2) {
          skills.push({
            name: this.capitalizeWords(cleanSkill),
            category: 'soft',
            level: 'intermediate'
          });
        }
      });
    }

    return skills;
  }

  capitalizeWords(str) {
    return str.replace(/\b\w+/g, word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  }

  generateSuggestions(data, text) {
    const suggestions = [];

    if (!data.personal.fullName) {
      suggestions.push('Add your full name to the top of the resume');
    }
    if (!data.personal.email) {
      suggestions.push('Include a professional email address');
    }
    if (!data.personal.phone) {
      suggestions.push('Add your phone number for contact');
    }
    if (!data.personal.location) {
      suggestions.push('Consider adding your location (city, state)');
    }
    if (data.experience.length === 0) {
      suggestions.push('Add your work experience with specific achievements');
    }
    if (data.education.length === 0) {
      suggestions.push('Include your educational background');
    }
    if (data.skills.length < 5) {
      suggestions.push('Add more relevant skills to showcase your abilities');
    }

    return suggestions;
  }

  calculateConfidence(data, text) {
    let score = 0;
    let maxScore = 0;

    // Personal information (30 points max)
    maxScore += 30;
    if (data.personal.fullName) score += 10;
    if (data.personal.email) score += 10;
    if (data.personal.phone) score += 10;

    // Experience (40 points max)
    maxScore += 40;
    if (data.experience.length > 0) {
      score += 20;
      if (data.experience.every(exp => exp.achievements && exp.achievements.length > 0)) {
        score += 20;
      }
    }

    // Education (15 points max)
    maxScore += 15;
    if (data.education.length > 0) score += 15;

    // Skills (15 points max)
    maxScore += 15;
    if (data.skills.length >= 5) score += 15;
    else if (data.skills.length > 0) score += data.skills.length * 3;

    return maxScore > 0 ? Math.round((score / maxScore) * 100) / 100 : 0;
  }
}

// Test the new smart parser with Jeremy's resume
async function testSmartParser() {
  try {
    console.log('🚀 TESTING NEW SMART RESUME PARSER WITH JEREMY MARTINEZ RESUME');
    console.log('='.repeat(70));
    
    // Read the Jeremy resume file
    const filePath = './Jeremy_Martinez_Resume Nov2023.docx';
    const buffer = fs.readFileSync(filePath);
    
    // Extract text using mammoth
    console.log('📄 Extracting text from DOCX...');
    const result = await mammoth.extractRawText({ buffer });
    const extractedText = result.value;
    
    // Test smart parser
    const smartParser = new TestSmartResumeParser();
    const parseResult = await smartParser.parseResume(extractedText);
    
    console.log('\n📊 SMART PARSER RESULTS:');
    console.log('='.repeat(50));
    console.log(`Overall Confidence: ${Math.round(parseResult.confidence * 100)}%`);
    
    console.log('\n👤 PERSONAL INFORMATION:');
    console.log('  Name:', parseResult.extractedData.personal.fullName || 'Not found');
    console.log('  Email:', parseResult.extractedData.personal.email || 'Not found');
    console.log('  Phone:', parseResult.extractedData.personal.phone || 'Not found');
    console.log('  Location:', parseResult.extractedData.personal.location || 'Not found');
    
    console.log('\n📝 SUMMARY:');
    console.log('  Objective:', parseResult.extractedData.summary.careerObjective || 'Not found');
    
    console.log('\n💼 WORK EXPERIENCE:');
    if (parseResult.extractedData.experience.length > 0) {
      parseResult.extractedData.experience.forEach((exp, index) => {
        console.log(`  ${index + 1}. ${exp.jobTitle} at ${exp.companyName}`);
        console.log(`     Dates: ${exp.startDate} - ${exp.endDate || 'Present'}`);
        console.log(`     Achievements: ${exp.achievements?.length || 0} items`);
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.slice(0, 2).forEach(achievement => {
            console.log(`       - ${achievement.substring(0, 80)}...`);
          });
        }
      });
    } else {
      console.log('  No work experience extracted');
    }
    
    console.log('\n🎓 EDUCATION:');
    if (parseResult.extractedData.education.length > 0) {
      parseResult.extractedData.education.forEach((edu, index) => {
        console.log(`  ${index + 1}. ${edu.institution}`);
        console.log(`     Degree: ${edu.degree}`);
      });
    } else {
      console.log('  No education extracted');
    }
    
    console.log('\n🛠️ SKILLS:');
    if (parseResult.extractedData.skills.length > 0) {
      console.log(`  Found ${parseResult.extractedData.skills.length} skills:`);
      parseResult.extractedData.skills.forEach(skill => {
        console.log(`    - ${skill.name} (${skill.category})`);
      });
    } else {
      console.log('  No skills extracted');
    }
    
    console.log('\n💡 SUGGESTIONS:');
    if (parseResult.suggestions.length > 0) {
      parseResult.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('  No suggestions generated');
    }
    
    console.log('\n✅ PARSING SUMMARY:');
    console.log('='.repeat(50));
    console.log(`📊 Confidence Score: ${Math.round(parseResult.confidence * 100)}%`);
    console.log(`👤 Personal Info: ${Object.values(parseResult.extractedData.personal).filter(v => v).length}/6 fields`);
    console.log(`💼 Experience: ${parseResult.extractedData.experience.length} jobs`);
    console.log(`🎓 Education: ${parseResult.extractedData.education.length} institutions`);
    console.log(`🛠️ Skills: ${parseResult.extractedData.skills.length} skills`);
    console.log(`💡 Suggestions: ${parseResult.suggestions.length} recommendations`);
    
  } catch (error) {
    console.error('❌ ERROR TESTING SMART PARSER:', error);
  }
}

// Run the test
testSmartParser();