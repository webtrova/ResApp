const fs = require('fs');
const path = require('path');

// Read the test resume
const testResumePath = path.join(__dirname, 'test_resume.txt');
const testResumeText = fs.readFileSync(testResumePath, 'utf8');

console.log('=== TESTING ENHANCED PARSER DIRECTLY ===');
console.log('Test Resume Content:');
console.log('='.repeat(50));
console.log(testResumeText);
console.log('='.repeat(50));

// Test the parsing logic directly
async function testParsingDirectly() {
  try {
    // Import the enhanced parser
    const { EnhancedResumeParser } = require('./src/lib/ai/enhanced-parser.ts');
    
    const parser = EnhancedResumeParser.getInstance();
    const result = await parser.parseResume(testResumeText, 'text/plain', 'test_resume.txt');
    
    console.log('\n=== PARSING RESULTS ===');
    console.log('Confidence:', result.confidence);
    console.log('Sections found:', Object.keys(result.sections));
    
    console.log('\n=== EXTRACTED DATA ===');
    console.log('Personal Info:');
    console.log('- Name:', result.extractedData.personal.fullName);
    console.log('- Email:', result.extractedData.personal.email);
    console.log('- Phone:', result.extractedData.personal.phone);
    console.log('- LinkedIn:', result.extractedData.personal.linkedin);
    console.log('- Portfolio:', result.extractedData.personal.portfolio);
    console.log('- Location:', result.extractedData.personal.location);
    
    console.log('\nSummary:');
    console.log('- Current Title:', result.extractedData.summary.currentTitle);
    console.log('- Years Experience:', result.extractedData.summary.yearsExperience);
    console.log('- Career Objective:', result.extractedData.summary.careerObjective?.substring(0, 100) + '...');
    
    console.log('\nExperience (', result.extractedData.experience.length, 'entries):');
    result.extractedData.experience.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.jobTitle} at ${exp.companyName}`);
      console.log(`   Date: ${exp.startDate}`);
      console.log(`   Description: ${exp.jobDescription}`);
      console.log(`   Achievements: ${exp.achievements.length} items`);
    });
    
    console.log('\nEducation (', result.extractedData.education.length, 'entries):');
    result.extractedData.education.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.degree} in ${edu.major} at ${edu.institution}`);
      console.log(`   Graduation: ${edu.graduationDate}`);
    });
    
    console.log('\nSkills (', result.extractedData.skills.length, 'items):');
    result.extractedData.skills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name} (${skill.category} - ${skill.level})`);
    });
    
    console.log('\n=== SUGGESTIONS ===');
    result.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
    
  } catch (error) {
    console.error('Error testing parsing directly:', error);
  }
}

testParsingDirectly();
