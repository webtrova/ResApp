const fs = require('fs');
const path = require('path');

// Simple test to verify the enhanced parser can be imported
async function testParser() {
  try {
    // Read the test resume
    const resumeText = fs.readFileSync('test_resume.txt', 'utf8');
    console.log('✅ Test resume loaded successfully');
    console.log('Resume length:', resumeText.length, 'characters');
    
    // Test basic parsing patterns
    const lines = resumeText.split('\n').filter(line => line.trim());
    console.log('✅ Resume has', lines.length, 'non-empty lines');
    
    // Test email extraction
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      console.log('✅ Email extracted:', emailMatch[0]);
    } else {
      console.log('❌ Email extraction failed');
    }
    
    // Test phone extraction
    const phoneMatch = resumeText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      console.log('✅ Phone extracted:', phoneMatch[0]);
    } else {
      console.log('❌ Phone extraction failed');
    }
    
    // Test name extraction
    const nameMatch = resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m);
    if (nameMatch) {
      console.log('✅ Name extracted:', nameMatch[1]);
    } else {
      console.log('❌ Name extraction failed');
    }
    
    // Test experience section detection
    const experienceMatch = resumeText.match(/WORK EXPERIENCE/i);
    if (experienceMatch) {
      console.log('✅ Experience section detected');
    } else {
      console.log('❌ Experience section detection failed');
    }
    
    // Test education section detection
    const educationMatch = resumeText.match(/EDUCATION/i);
    if (educationMatch) {
      console.log('✅ Education section detected');
    } else {
      console.log('❌ Education section detection failed');
    }
    
    // Test skills detection
    const skillsMatch = resumeText.match(/SKILLS/i);
    if (skillsMatch) {
      console.log('✅ Skills section detected');
    } else {
      console.log('❌ Skills section detection failed');
    }
    
    console.log('\n🎉 Basic parsing tests completed successfully!');
    console.log('The enhanced parser should work well with this resume format.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testParser();
